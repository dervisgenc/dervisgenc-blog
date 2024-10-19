package middleware

import (
	// Add this import
	"fmt"

	myerr "github.com/dervisgenc/dervisgenc-blog/backend/pkg"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
	"github.com/gin-gonic/gin"
)

func ErrorMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next() // Start next middleware

		// Catch errors
		err := c.Errors.Last()
		fmt.Println(c.Errors)
		if err != nil {
			// Get HTTP status code from error
			status := myerr.HTTPStatus(err.Err)

			// Return error response
			c.JSON(status, models.ErrorResponse{
				Error: err.Err.Error(),
			})
			c.Abort()
		}
	}
}
