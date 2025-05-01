package middleware

import (
	"regexp"
	"strconv"
	"time"

	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus" // Import logrus
)

// PostViewMiddleware captures post views.
func PostViewMiddleware(worker StatsCollector) gin.HandlerFunc {
	// Regex to match post detail paths like /api/posts/123
	postPathRegex := regexp.MustCompile(`^/api/posts/(\d+)$`)

	return func(c *gin.Context) {
		// --- Add Logging ---
		logger, exists := c.Get("logger")
		var log *logrus.Logger
		if !exists {
			// Fallback or handle error if logger is not set
			log = logrus.New() // Create a default logger if needed
			log.Warn("Logger not found in context, using default logger for PostViewMiddleware")
		} else {
			var ok bool
			log, ok = logger.(*logrus.Logger)
			if !ok {
				log = logrus.New()
				log.Warn("Logger in context is not *logrus.Logger, using default logger for PostViewMiddleware")
			}
		}
		// --- End Logging ---

		// Let the request proceed first
		c.Next()

		// Check status code - only count views for successful requests (e.g., 2xx)
		if c.Writer.Status() < 200 || c.Writer.Status() >= 300 {
			log.WithFields(logrus.Fields{
				"path":   c.Request.URL.Path,
				"status": c.Writer.Status(),
			}).Debug("PostViewMiddleware: Request status not 2xx, skipping view count.")
			return
		}

		// Check if the path matches the post detail pattern
		matches := postPathRegex.FindStringSubmatch(c.Request.URL.Path)

		log.WithFields(logrus.Fields{
			"path":    c.Request.URL.Path,
			"method":  c.Request.Method,
			"matches": len(matches),
		}).Debug("PostViewMiddleware: Checking path for post view")

		if len(matches) == 2 && c.Request.Method == "GET" { // Ensure it's a GET request
			postIDStr := matches[1]
			postID, err := strconv.ParseUint(postIDStr, 10, 32)
			if err != nil {
				log.WithFields(logrus.Fields{
					"path":  c.Request.URL.Path,
					"error": err.Error(),
				}).Warn("PostViewMiddleware: Failed to parse post ID")
				return // Don't queue if ID is invalid
			}

			ipAddress := c.ClientIP()
			userAgent := c.Request.UserAgent()

			view := &models.PostView{
				PostID:    uint(postID),
				IPAddress: ipAddress,
				UserAgent: userAgent,
				ViewTime:  time.Now(),
			}

			log.WithFields(logrus.Fields{
				"post_id":    postID,
				"ip_address": ipAddress,
				"path":       c.Request.URL.Path,
			}).Info("PostViewMiddleware: Queueing post view") // Log before queueing

			worker.QueueView(view)

		} else {
			log.WithField("path", c.Request.URL.Path).Trace("PostViewMiddleware: Path did not match post detail regex or method was not GET")
		}
	}
}

// StatsCollector interface defines methods for collecting stats.
type StatsCollector interface {
	QueueVisit(visitor *models.Visitor)
	QueueView(view *models.PostView)
}
