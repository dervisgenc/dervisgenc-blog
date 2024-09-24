package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func LoggingMiddleware(logger *logrus.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get start time
		startTime := time.Now()

		// Next middleware
		c.Next()

		// Calculate latency
		latency := time.Since(startTime)
		statusCode := c.Writer.Status()

		// Log request for successful requests
		logger.WithFields(logrus.Fields{
			"status":   statusCode,
			"method":   c.Request.Method,
			"path":     c.Request.URL.Path,
			"latency":  latency,
			"clientIP": c.ClientIP(),
		}).Info("Request completed")

		// Log request for failed requests
		if len(c.Errors) > 0 {
			logger.WithFields(logrus.Fields{
				"status":   statusCode,
				"method":   c.Request.Method,
				"path":     c.Request.URL.Path,
				"latency":  latency,
				"clientIP": c.ClientIP(),
				"error":    c.Errors.String(),
			}).Error("Request failed with error")
		}
	}
}
