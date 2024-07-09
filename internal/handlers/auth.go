package handlers

import (
	"chapiteau/config"
	"chapiteau/internal/auth"
	"chapiteau/internal/models"
	"chapiteau/internal/repository"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	Repo   repository.Repository
	Config config.Config
}

func NewAuthHandler(repo repository.Repository, config config.Config) AuthHandler {
	return AuthHandler{Repo: repo, Config: config}
}

func (h *AuthHandler) Register(c *gin.Context) {
	if h.Config.DisabledRegistration {
		c.JSON(http.StatusForbidden, gin.H{"error": "Registration is disabled"})
		return
	}

	var input struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)

	user := &models.User{
		ID:       generateUUID(),
		Username: input.Username,
		Password: string(hashedPassword),
	}

	if err := h.Repo.User.CreateUser(user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create user"})
		return
	}

	user.Password = strings.Repeat("*", len(user.Password))

	c.JSON(http.StatusCreated, gin.H{"user": user})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var input struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.Repo.User.GetUserByUsername(input.Username)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, err := auth.GenerateToken(user.ID, user.Username, h.Config.JWTSecret)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token})
}
