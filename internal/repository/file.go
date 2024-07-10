package repository

import (
	"chapiteau/internal/models"

	"gorm.io/gorm"
)

type FileRepository struct {
	db *gorm.DB
}

func NewFileRepository(db *gorm.DB) FileRepository {
	return FileRepository{
		db: db,
	}
}

func (r *FileRepository) CreateFile(file *models.File, trx *gorm.DB) error {
	if trx != nil {
		return trx.Create(file).Error
	}
	return r.db.Create(file).Error
}

func (r *FileRepository) GetFiles(runID string) ([]models.File, error) {
	var files []models.File
	err := r.db.First(&files, "run_id = ?", runID).Error
	return files, err
}

func (r *FileRepository) DeleteFiles(runID string, trx *gorm.DB) error {
	client := r.db
	if trx != nil {
		client = trx
	}
	return client.Delete(&models.File{}, "run_id = ?", runID).Error
}

func (r *FileRepository) DeleteFilesByProject(ID string, trx *gorm.DB) error {
	client := r.db
	if trx != nil {
		client = trx
	}
	return client.Delete(&models.File{}, "project_id = ?", ID).Error
}
