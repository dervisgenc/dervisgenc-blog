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

		// Start timer
		start := time.Now()

		// Create logger entry with initial request context
		contextLogger := logger.WithFields(logrus.Fields{
			"request_id": requestID,
			"path":       c.Request.URL.Path,
			"query":      c.Request.URL.RawQuery,
			"method":     c.Request.Method,
			"client_ip":  c.ClientIP(),
			"user_agent": c.Request.UserAgent(),
			"referer":    c.Request.Referer(),
		})

		// Log incoming request details
		contextLogger.Info("Incoming request")

		c.Set("logger", contextLogger)

		// Process request
		c.Next()

		// Stop timer
		latency := time.Since(start)
		status := c.Writer.Status()

		// Log request completion details
		logFields := logrus.Fields{
			"status":     status,
			"latency_ms": latency.Milliseconds(),
			"size":       c.Writer.Size(),
		}

		// Add error message if any occurred during request processing
		if len(c.Errors) > 0 {
			// Log all errors
			logFields["errors"] = c.Errors.String()
		}

		entry := contextLogger.WithFields(logFields)

		if status >= 500 {
			// Log with Error level for server errors (5xx)
			if len(c.Errors) > 0 {
				// Include the error string directly in the message
				entry.Errorf("Request completed with server error: %s", c.Errors.String())
			} else {
				entry.Error("Request completed with server error")
			}
		} else if status >= 400 {
			// Log with Warn level for client errors (4xx)
			if len(c.Errors) > 0 {
				// Include the error string directly in the message
				entry.Warnf("Request completed with client error: %s", c.Errors.String())
			} else {
				entry.Warn("Request completed with client error")
			}
		} else {
			entry.Info("Request completed successfully")
		}
	}
}
