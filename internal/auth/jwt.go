package auth

import (
	"chapiteau/internal/models"
	"time"

	"github.com/golang-jwt/jwt"
)

func GenerateToken(userID string, username string, secret string) (string, error) {
	claims := jwt.MapClaims{
		(UserID):   userID,
		(UserName): username,
		(ExpireAt): time.Now().Add(time.Hour * 24).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func GenerateApiToken(apiKey models.ApiKey, secret string) (string, error) {
	claims := jwt.MapClaims{
		(UserID):     apiKey.UserID,
		(ExpireAt):   apiKey.ExpireAt,
		(ApiKeyID):   apiKey.ID,
		(ApiKeyName): apiKey.Name,
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}
