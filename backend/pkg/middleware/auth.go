package middleware

import (
	"errors"
	"net/http"
	"strings"

	auth "github.com/dervisgenc/dervisgenc-blog/backend/internal/auth"
	myerr "github.com/dervisgenc/dervisgenc-blog/backend/pkg"
	"github.com/gin-gonic/gin"
)

func AuthMiddleware(jwtSecret []byte) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Error(myerr.WithHTTPStatus(errors.New("authorization header is missing"), http.StatusBadRequest))

			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if len(tokenString) < 2 {
			c.Error(myerr.WithHTTPStatus(errors.New("invalid token format"), http.StatusBadRequest))
			c.Abort()
			return
		}

		claims, err := auth.ValidateToken(tokenString, jwtSecret)
		if err != nil {
			c.Error(myerr.WithHTTPStatus(errors.New("invalid token"), http.StatusUnauthorized))
			c.Abort()
			return
		}

		c.Set("user", claims)
		c.Next()
	}
}
