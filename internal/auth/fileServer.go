package auth

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CheckProjectAccess func(userID string, projectID string) (isAvailable bool, isOwner bool, err error)

func ProjectAccessMiddleware(check CheckProjectAccess) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString(UserID)
		projectID := c.Param("projectId")

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
