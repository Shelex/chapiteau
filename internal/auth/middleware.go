package auth

import (
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
)

type ValidateApiKey func(tokenID string) bool

const UserID string = "user_id"
const UserName string = "user_name"
const ExpireAt string = "exp"
const ApiKeyID string = "api_key_id"
const ApiKeyName string = "api_key_name"

func AuthMiddleware(secret string, validateApiKey ValidateApiKey) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing authorization header"})
			c.Abort()
			return
		}

		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header format must be Bearer {token}"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token: " + err.Error()})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse claims"})
			c.Abort()
			return
		}

		apiKeyId := claims[ApiKeyID]
		log.Printf("api key id : %s", apiKeyId)

		if apiKeyId != nil {
			isValid := validateApiKey(apiKeyId.(string))
			if !isValid {
				c.JSON(http.StatusForbidden, gin.H{"error": "Api key is not valid"})
				c.Abort()
				return
			}
		}

		SetContext(c, claims)
		c.Next()
	}
}

func SetContext(c *gin.Context, claims jwt.MapClaims) {
	c.Set(UserID, claims[UserID])
	c.Set(UserName, claims[UserName])
	c.Set(ApiKeyID, claims[ApiKeyID])
	c.Set(ApiKeyName, claims[ApiKeyName])
}
