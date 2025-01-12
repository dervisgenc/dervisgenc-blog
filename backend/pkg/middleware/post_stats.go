package middleware

import (
	"strconv"
	"strings"
	"time"

	"github.com/dervisgenc/dervisgenc-blog/backend/internal/stat"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
	"github.com/gin-gonic/gin"
)

func PostViewMiddleware(worker *stat.StatsWorker) gin.HandlerFunc {
	return func(c *gin.Context) {
		if strings.HasPrefix(c.Request.URL.Path, "/posts/") && c.Request.Method == "GET" {
			postID := c.Param("id")
			if postID != "" {
				postIDUint, err := strconv.ParseUint(postID, 10, 64)
				if err == nil {
					view := &models.PostView{
						PostID:    uint(postIDUint),
						IPAddress: c.ClientIP(),
						UserAgent: c.Request.UserAgent(),
						ViewTime:  time.Now(),
					}
					worker.QueueView(view)
				}
			}
		}
		c.Next()
	}
}
