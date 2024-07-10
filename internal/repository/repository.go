package repository

import "gorm.io/gorm"

type Repository struct {
	User    UserRepository
	Project ProjectRepository
	ApiKey  ApiKeyRepository
	Run     RunRepository
	File    FileRepository
	Test    TestRepository
	DB      *gorm.DB
	Reports ReportsStorage
}

func NewRepository(db *gorm.DB) Repository {
	return Repository{
		User:    NewUserRepository(db),
		Project: NewProjectRepository(db),
		ApiKey:  NewApiKeyRepository(db),
		Run:     NewRunRepository(db),
		File:    NewFileRepository(db),
		Test:    NewTestRepository(db),
		Reports: NewReportsStorage(),
		DB:      db,
	}
}
