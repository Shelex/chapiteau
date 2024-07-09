package handlers

import (
	"chapiteau/config"
	"chapiteau/internal/models"
	reportparser "chapiteau/internal/reportParser"
	"chapiteau/internal/repository"
	"errors"
	"fmt"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type RunHandler struct {
	Repo   repository.Repository
	Config config.Config
}

func NewRunHandler(repo repository.Repository, cfg config.Config) RunHandler {
	return RunHandler{Repo: repo, Config: cfg}
}

func (h *RunHandler) currentUserHasProject(c *gin.Context, projectID string, shouldBeAdmin bool) error {
	hasProject, isAdmin, err := h.Repo.Project.AvailableForUser(getUserIDFromContext(c), projectID)
	if err != nil {
		return err
	}

	if shouldBeAdmin && !isAdmin {
		return errors.New("user is not an admin")
	}

	if !hasProject {
		return errors.New("not found project")
	}

	return nil
}

func (h *RunHandler) processUpload(c *gin.Context, report *models.Report, withReport bool) (*models.Run, error) {
	buildName := c.Query("buildName")
	buildUrl := c.Query("buildUrl")
	reportUrl := c.Query("reportUrl")

	runInput := models.RunInput{
		Report: *report,
		Build: models.BuildInput{
			Name:      buildName,
			Url:       buildUrl,
			ReportURL: reportUrl,
		},
	}

	projectID := c.Param("id")

	if err := h.currentUserHasProject(c, projectID, false); err != nil {
		return nil, err
	}

	run, err := h.createRun(runInput, projectID, getCreatedByFromContext(c), withReport)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error})
		return nil, err
	}

	return run, nil
}

func (h *RunHandler) UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.String(http.StatusBadRequest, "Error getting file: %v", err)
		return
	}

	if !strings.EqualFold(file.Filename, "index.html") {
		c.String(http.StatusBadRequest, "Uploaded file must be index.html")
		return
	}

	f, err := file.Open()
	if err != nil {
		c.String(http.StatusInternalServerError, "Error opening file: %v", err)
		return
	}
	defer f.Close()

	report, err := reportparser.ParseIndexHTML(f)
	if err != nil {
		c.String(http.StatusBadRequest, "Failed to parse index.html: %v", err)
		return
	}

	run, err := h.processUpload(c, report, false)
	if err != nil {
		c.String(http.StatusBadRequest, "Failed to process upload: %v", err)
		return
	}

	c.String(http.StatusOK, "Run %s uploaded and parsed successfully", run.ID)
}

func (h *RunHandler) UploadReport(c *gin.Context) {
	form, err := c.MultipartForm()
	if err != nil {
		c.String(http.StatusBadRequest, "Error parsing form: %v", err)
		return
	}

	files := form.File["files"]
	if len(files) == 0 {
		c.String(http.StatusBadRequest, "No files uploaded")
		return
	}

	hasIndexHtml := false
	var run *models.Run

	for _, file := range files {
		if file.Filename != "index.html" {
			continue
		}
		hasIndexHtml = true
		f, err := file.Open()
		if err != nil {
			c.String(http.StatusInternalServerError, "Error opening index.html: %v", err)
			return
		}
		defer f.Close()
		report, err := reportparser.ParseIndexHTML(f)
		if err != nil {
			c.String(http.StatusBadRequest, "Failed to parse index.html: %v", err)
			return
		}

		created, err := h.processUpload(c, report, true)
		if err != nil {
			c.String(http.StatusBadRequest, "Failed to process upload: %v", err)
			return
		}

		run = created
		break
	}

	if !hasIndexHtml {
		c.String(http.StatusBadRequest, "Folder must contain index.html")
		return
	}

	if run == nil {
		c.String(http.StatusInternalServerError, "Failed to record run")
		return
	}

	uploadPath := fmt.Sprintf("reports/%s/%s", run.ProjectID, run.ID)
	for _, file := range files {
		dst := filepath.Join(uploadPath, file.Filename)
		if err := c.SaveUploadedFile(file, dst); err != nil {
			c.String(http.StatusInternalServerError, "Error saving file: %v", err)
			return
		}
	}

	c.String(http.StatusOK, "Folder uploaded successfully")
}

func (h *RunHandler) createRun(input models.RunInput, projectID string, author string, withLocalReport bool) (*models.Run, error) {
	duration := time.Duration(input.Report.Duration * float64(time.Millisecond))
	startedAt := time.UnixMilli(input.Report.StartTime)
	finishedAt := startedAt.Add(duration)

	var complete struct {
		Run         models.Run              `json:"run"`
		Files       []models.File           `json:"files"`
		Tests       []models.Test           `json:"tests"`
		Attachments []models.TestAttachment `json:"attachments"`
	}

	trx := h.Repo.DB.Begin()

	run := models.Run{
		ID:         generateUUID(),
		ProjectID:  projectID,
		Workers:    int64(input.Report.Metadata.ActualWorkers),
		StartedAt:  startedAt,
		FinishedAt: finishedAt,
		Duration:   int64(duration),
		CreatedAt:  time.Now(),
		CreatedBy:  author,
		Total:      int64(input.Report.Stats.Total),
		Expected:   int64(input.Report.Stats.Expected),
		Unexpected: int64(input.Report.Stats.Unexpected),
		Flaky:      int64(input.Report.Stats.Flaky),
		Skipped:    int64(input.Report.Stats.Skipped),
		Ok:         input.Report.Stats.Ok,
		ReportURL:  input.Build.ReportURL,
		BuildName:  input.Build.Name,
		BuildURL:   input.Build.Url,
	}

	if withLocalReport {
		run.ReportURL = fmt.Sprintf("%s/api/reports/%s/%s", h.Config.FQDN, run.ProjectID, run.ID)
	}

	complete.Run = run

	if err := h.Repo.Run.CreateRun(&run, trx); err != nil {
		trx.Rollback()
		return nil, fmt.Errorf("failed to create run record: %w", err)
	}

	for _, file := range input.Report.Files {
		f := models.File{
			ID:         generateUUID(),
			RunID:      run.ID,
			ProjectID:  projectID,
			Name:       file.FileName,
			FileID:     file.FileID,
			Total:      int64(file.Stats.Total),
			Expected:   int64(file.Stats.Expected),
			Unexpected: int64(file.Stats.Unexpected),
			Flaky:      int64(file.Stats.Flaky),
			Skipped:    int64(file.Stats.Skipped),
			Ok:         file.Stats.Ok,
		}

		if err := h.Repo.File.CreateFile(&f, trx); err != nil {
			trx.Rollback()
			return nil, fmt.Errorf("failed to create file record: %w", err)
		}

		complete.Files = append(complete.Files, f)

		for _, test := range file.Tests {
			t := models.Test{
				ID:            generateUUID(),
				RunID:         f.RunID,
				FileID:        f.ID,
				ProjectID:     f.ProjectID,
				Location:      fmt.Sprintf("%s %d:%d", test.Location.File, test.Location.Line, test.Location.Column),
				TestID:        test.TestID,
				Title:         test.Title,
				PwProjectName: test.ProjectName,
				Duration:      int64(test.Duration),
				Outcome:       test.Outcome,
				Path:          strings.Join(test.Path, " / "),
			}

			if err := h.Repo.Test.CreateTest(&t, trx); err != nil {
				trx.Rollback()
				return nil, fmt.Errorf("failed to create test record: %w", err)
			}

			complete.Tests = append(complete.Tests, t)

			for index, result := range test.Results {
				for _, attachment := range result.Attachments {
					a := models.TestAttachment{
						Attempt:     int64(index + 1),
						ID:          generateUUID(),
						TestID:      t.ID,
						RunID:       f.RunID,
						Name:        attachment.Name,
						ContentType: attachment.ContentType,
						Path:        attachment.Path,
					}

					if err := h.Repo.Test.CreateTestAttachment(&a, trx); err != nil {
						trx.Rollback()
						return nil, fmt.Errorf("failed to create attachment record: %w", err)
					}
					complete.Attachments = append(complete.Attachments, a)
				}
			}
		}
	}

	trx.Commit()
	return &run, nil
}

func (h *RunHandler) GetRuns(c *gin.Context) {
	projectID := c.Param("id")

	if err := h.currentUserHasProject(c, projectID, false); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	runs, err := h.Repo.Run.GetRuns(projectID, models.Pagination{
		Limit:  10,
		Offset: 0,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to fetch run"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"runs": runs})
}

func (h *RunHandler) UpdateRun(c *gin.Context) {
	runID := c.Param("id")
	var input models.BuildInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	run, err := h.Repo.Run.GetRun(runID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	if err := h.currentUserHasProject(c, run.ProjectID, false); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	if input.Name != "" {
		run.BuildName = input.Name
	}

	if input.Url != "" {
		run.BuildURL = input.Url
	}

	if input.ReportURL != "" {
		run.ReportURL = input.ReportURL
	}

	if err := h.Repo.Run.UpdateRun(&run); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update run"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Run updated successfully"})
}

func (h *RunHandler) DeleteRun(c *gin.Context) {
	runID := c.Param("runId")

	run, err := h.Repo.Run.GetRun(runID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Run not found"})
		return
	}

	if err := h.currentUserHasProject(c, run.ProjectID, true); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	trx := h.Repo.DB.Begin()

	if err := h.Repo.Test.DeleteTestAttachments(runID, trx); err != nil {
		trx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to delete run"})
		return
	}

	if err := h.Repo.Test.DeleteTests(runID, trx); err != nil {
		trx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to delete run"})
		return
	}

	if err := h.Repo.File.DeleteFiles(runID, trx); err != nil {
		trx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to delete run"})
		return
	}

	if err := h.Repo.Run.DeleteRun(runID, trx); err != nil {
		trx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to delete run"})
		return
	}

	if len(c.Errors) == 0 {
		trx.Commit()
	}

	c.JSON(http.StatusOK, gin.H{"message": "Run deleted successfully"})
}

func (h *RunHandler) GetFileRuns(c *gin.Context) {
	projectID := c.Param("id")
	if err := h.currentUserHasProject(c, projectID, false); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	fileID := c.Param("fileId")
	runs, err := h.Repo.Run.FindFileRuns(fileID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to fetch file runs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"runs": runs})
}

func (h *RunHandler) GetTestRuns(c *gin.Context) {
	projectID := c.Param("id")
	if err := h.currentUserHasProject(c, projectID, false); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	testID := c.Param("testId")
	runs, err := h.Repo.Run.FindTestRuns(testID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to fetch test runs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"runs": runs})
}
