package repository

import (
	"chapiteau/internal/models"

	"gorm.io/gorm"
)

type TestRepository struct {
	db *gorm.DB
}

func NewTestRepository(db *gorm.DB) TestRepository {
	return TestRepository{
		db: db,
	}
}

func (r *TestRepository) CreateTest(test *models.Test, trx *gorm.DB) error {
	if trx != nil {
		return trx.Create(test).Error
	}
	return r.db.Create(test).Error
}

func (r *TestRepository) GetTests(fileID string) ([]models.Test, error) {
	var tests []models.Test
	err := r.db.Find(&tests, "file_id = ?", fileID).Error
	return tests, err
}

func (r *TestRepository) DeleteTests(runID string, trx *gorm.DB) error {
	client := r.db
	if trx != nil {
		client = trx
	}
	return client.Delete(&models.Test{}, "run_id = ?", runID).Error
}

func (r *TestRepository) CreateTestAttachment(attachment *models.TestAttachment, trx *gorm.DB) error {
	if trx != nil {
		return trx.Create(attachment).Error
	}
	return r.db.Create(attachment).Error
}

func (r *TestRepository) GetTestAttachments(testID string) ([]models.TestAttachment, error) {
	var testAttachments []models.TestAttachment
	err := r.db.Find(&testAttachments, "test_id = ?", testID).Error
	return testAttachments, err
}

func (r *TestRepository) DeleteTestAttachments(runID string, trx *gorm.DB) error {
	client := r.db
	if trx != nil {
		client = trx
	}
	return client.Delete(&models.TestAttachment{}, "run_id = ?", runID).Error
}
