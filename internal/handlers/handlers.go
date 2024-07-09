package handlers

import (
	"chapiteau/config"
	"chapiteau/internal/repository"

	"github.com/google/uuid"
)

type Handlers struct {
	Auth    AuthHandler
	ApiKey  ApiKeyHandler
	Project ProjectHandler
	Run     RunHandler
}

func NewHandlers(repo repository.Repository, config config.Config) Handlers {
	return Handlers{
		Auth:    NewAuthHandler(repo, config),
		ApiKey:  NewApiKeyHandler(repo, config),
		Project: NewProjectHandler(repo),
		Run:     NewRunHandler(repo, config),
	}
}

func generateUUID() string {
	return uuid.New().String()
}
