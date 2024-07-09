package handlers

import (
	"chapiteau/config"
	"chapiteau/internal/auth"
	"chapiteau/internal/models"
	"chapiteau/internal/repository"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ApiKeyHandler struct {
	Repo   repository.Repository
	Config config.Config
}

func NewApiKeyHandler(repo repository.Repository, cfg config.Config) ApiKeyHandler {
	return ApiKeyHandler{Repo: repo, Config: cfg}
}

func (h *ApiKeyHandler) CreateToken(c *gin.Context) {
	userID := getUserIDFromContext(c)

	var input struct {
		Name     string `json:"name" binding:"required"`
		ExpireAt int64  `json:"expire_at" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	apiKey := models.ApiKey{
		ID:       generateUUID(),
		UserID:   userID,
		Name:     input.Name,
		ExpireAt: input.ExpireAt,
	}

	token, err := auth.GenerateApiToken(apiKey, h.Config.JWTSecret)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to generate token"})
		return
	}

	if err := h.Repo.ApiKey.CreateApiKey(&apiKey); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"token": token})
}

func (h *ApiKeyHandler) GetTokens(c *gin.Context) {
	userID := getUserIDFromContext(c)

	tokens, err := h.Repo.ApiKey.GetUserKeys(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tokens not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"tokens": tokens})
}

func (h *ApiKeyHandler) DeleteToken(c *gin.Context) {
	tokenID := c.Param("id")

	apiKey, err := h.Repo.ApiKey.GetApiKey(tokenID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Token not found"})
		return
	}

	if apiKey.UserID != getUserIDFromContext(c) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
	}

	if err := h.Repo.ApiKey.DeleteApiKey(tokenID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to delete token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Token deleted successfully"})
}
