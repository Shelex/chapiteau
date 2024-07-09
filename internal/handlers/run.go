package handlers

import (
	"chapiteau/internal/models"
	"chapiteau/internal/repository"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type RunHandler struct {
	Repo repository.Repository
}

func NewRunHandler(repo repository.Repository) RunHandler {
	return RunHandler{Repo: repo}
}

func (h *RunHandler) currentUserHasProject(c *gin.Context, projectID string, shouldBeAdmin bool) error {
	hasProject, isAdmin, err := h.Repo.Project.AvailableFor(getUserIDFromContext(c), projectID)
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

func (h *RunHandler) CreateRun(c *gin.Context) {
	var input models.RunInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	projectID := c.Param("id")

	if err := h.currentUserHasProject(c, projectID, false); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

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
		CreatedBy:  getCreatedByFromContext(c),
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

	complete.Run = run

	if err := h.Repo.Run.CreateRun(&run, trx); err != nil {
		trx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create run record"})
		return
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
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create file record"})
			break
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
				c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create file record"})
				break
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
						c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create file record"})
						break
					}

					complete.Attachments = append(complete.Attachments, a)
				}
			}
		}
	}

	if len(c.Errors) == 0 {
		trx.Commit()
	}

	c.JSON(http.StatusCreated, complete)
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
