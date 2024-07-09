package repository

import (
	"chapiteau/internal/models"

	"gorm.io/gorm"
)

type ApiKeyRepository struct {
	db *gorm.DB
}

func NewApiKeyRepository(db *gorm.DB) ApiKeyRepository {
	return ApiKeyRepository{
		db: db,
	}
}

func (r *ApiKeyRepository) CreateApiKey(apiKey *models.ApiKey) error {
	return r.db.Create(apiKey).Error
}

func (r *ApiKeyRepository) GetApiKey(ID string) (models.ApiKey, error) {
	var apiKey models.ApiKey
	err := r.db.First(&apiKey, "id = ?", ID).Error
	return apiKey, err
}

func (r *ApiKeyRepository) GetUserKeys(userID string) ([]models.ApiKey, error) {
	var apiKey []models.ApiKey
	err := r.db.Find(&apiKey, "user_id = ?", userID).Error
	return apiKey, err
}

func (r *ApiKeyRepository) DeleteApiKey(id string) error {
	return r.db.Delete(&models.ApiKey{}, "id = ?", id).Error
}

func (r *ApiKeyRepository) IsValid(ID string) bool {
	var count int64
	err := r.db.Model(&models.ApiKey{}).Where("id = ?", ID).Count(&count).Error
	return err == nil && count == 1
}
