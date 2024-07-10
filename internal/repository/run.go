package repository

import (
	"chapiteau/internal/models"

	"gorm.io/gorm"
)

type RunRepository struct {
	db *gorm.DB
}

func NewRunRepository(db *gorm.DB) RunRepository {
	return RunRepository{
		db: db,
	}
}

func (r *RunRepository) CreateRun(run *models.Run, trx *gorm.DB) error {
	if trx != nil {
		return trx.Create(run).Error
	}
	return r.db.Create(run).Error
}

func (r *RunRepository) DeleteRun(id string, trx *gorm.DB) error {
	if trx != nil {
		return trx.Delete(&models.Run{}, "id = ?", id).Error
	}
	return r.db.Delete(&models.Run{}, "id = ?", id).Error
}

func (r *RunRepository) GetRun(runID string) (models.Run, error) {
	var run models.Run
	err := r.db.First(&run, "id = ?", runID).Error
	return run, err
}

func (r *RunRepository) GetRuns(projectID string, pagination models.Pagination) ([]models.Run, error) {
	var runs []models.Run
	err := r.db.Offset(pagination.Offset).Limit(pagination.Limit).Order("started_at DESC").Find(&runs, "project_id = ?", projectID).Error
	return runs, err
}

func (r *RunRepository) UpdateRun(run *models.Run) error {
	return r.db.Save(run).Error
}

func (r *RunRepository) FindFileRuns(fileID string) ([]models.File, error) {
	var files []models.File
	err := r.db.Find(&files, "file_id = ?", fileID).Error
	return files, err
}

func (r *RunRepository) FindTestRuns(testID string) ([]models.Test, error) {
	var tests []models.Test
	err := r.db.Find(&tests, "test_id = ?", testID).Error
	return tests, err
}

func (r *RunRepository) DeleteRunsByProject(ID string, trx *gorm.DB) error {
	client := r.db
	if trx != nil {
		client = trx
	}
	return client.Delete(&models.Run{}, "project_id = ?", ID).Error
}
