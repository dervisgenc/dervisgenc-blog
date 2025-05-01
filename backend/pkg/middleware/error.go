package middleware

import (
	// Keep errors import if needed elsewhere, or remove if not
	"fmt"

	myerr "github.com/dervisgenc/dervisgenc-blog/backend/pkg"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// ErrorMiddleware handles errors encountered during request processing.
func ErrorMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next() // Process request

		// Check for errors
		if len(c.Errors) > 0 {
			err := c.Errors.Last().Err // Get the last error

			// Log the error with details
			logger, exists := c.Get("logger")
			logEntry := logrus.StandardLogger().WithContext(c) // Default logger
			if exists {
				if l, ok := logger.(*logrus.Logger); ok {
					logEntry = l.WithContext(c)
				}
			}

			detailedErrorMsg := fmt.Sprintf("%+v", err)
			logEntry.Errorf("Error processing request: %s", detailedErrorMsg)

			// --- MODIFICATION START ---
			// Determine HTTP status code using the myerr package function
			statusCode := myerr.HTTPStatus(err) // Use the HTTPStatus function
			// --- MODIFICATION END ---

			// Prepare error response
			response := gin.H{
				"error":   err.Error(),
				"details": detailedErrorMsg, // Consider removing in production
			}

			// Respond with JSON
			c.JSON(statusCode, response)
			c.Abort() // Stop further processing if needed
		}
	}
}
