package auth

import (
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type CheckProjectAccess func(userID string, projectID string) (isAvailable bool, isOwner bool, err error)

func ProjectAccessMiddleware(check CheckProjectAccess) gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path
		parts := strings.Split(path, "/")
		projectID := parts[5]

		if projectID == "" {
			log.Printf("failed to parse project %s id for url %s", projectID, path)
			c.AbortWithStatus(http.StatusForbidden)
			return
		}

		userID := c.GetString(UserID)

		isAvailable, _, err := check(userID, projectID)
		if err != nil {
			log.Printf("failed to check project %s access for user %s", projectID, userID)
			c.AbortWithStatus(http.StatusForbidden)
			return
		}

		if !isAvailable {
			c.AbortWithStatus(http.StatusForbidden)
			return
		}

		c.Next()
	}
}
