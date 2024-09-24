package middleware

import (
	apperr "github.com/dervisgenc/dervisgenc-blog/backend/pkg"
	"github.com/gin-gonic/gin"
)

func ErrorMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next() // start next middleware

		//catch errors
		err := c.Errors.Last()
		if err != nil {
			// Get HTTP status code from error
			status := apperr.HTTPStatus(err.Err)
			// Return error response
			c.JSON(status, gin.H{"error": err.Err.Error()})
			c.Abort()
		}
	}
}
