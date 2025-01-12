package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

func LoggingMiddleware(logger *logrus.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Generate request ID
		requestID := uuid.New().String()
		c.Set("request_id", requestID)

		// Create logger entry with request context
		contextLogger := logger.WithFields(logrus.Fields{
			"request_id": requestID,
			"path":       c.Request.URL.Path,
			"method":     c.Request.Method,
			"client_ip":  c.ClientIP(),
		})

		c.Set("logger", contextLogger)

		// Start timer
		start := time.Now()

		// Process request
		c.Next()

		// Log request completion
		contextLogger.WithFields(logrus.Fields{
			"status":     c.Writer.Status(),
			"latency_ms": time.Since(start).Milliseconds(),
		}).Info("Request completed")
	}
}
