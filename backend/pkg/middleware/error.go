package middleware

import (
	apperr "github.com/dervisgenc/dervisgenc-blog/backend/pkg"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
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
			c.JSON(status, models.ErrorResponse{
				Error: err.Err.Error(),
			})
			c.Abort()
		}
	}
}
