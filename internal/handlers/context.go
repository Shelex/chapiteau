package handlers

import (
	"chapiteau/internal/auth"

	"github.com/gin-gonic/gin"
)

func getUserIDFromContext(c *gin.Context) string {
	return c.GetString(auth.UserID)
}

func getCreatedByFromContext(c *gin.Context) string {
	username := c.GetString(auth.UserName)
	if username != "" {
		return username
	}

	return c.GetString(auth.ApiKeyName)
}

func isApiKey(c *gin.Context) bool {
	return c.GetString(auth.ApiKeyID) != ""
}
