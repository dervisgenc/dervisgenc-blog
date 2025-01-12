package middleware

import (
	"time"

	"github.com/dervisgenc/dervisgenc-blog/backend/internal/stat"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
	"github.com/gin-gonic/gin"
)

func StatsMiddleware(worker *stat.StatsWorker) gin.HandlerFunc {
	return func(c *gin.Context) {
		visitor := &models.Visitor{
			IPAddress: c.ClientIP(),
			UserAgent: c.Request.UserAgent(),
			Referrer:  c.Request.Referer(),
			VisitTime: time.Now(),
			Path:      c.Request.URL.Path,
		}

		worker.QueueVisit(visitor)
		c.Next()
	}
}
