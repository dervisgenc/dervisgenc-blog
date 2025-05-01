package stat

import (
	"net/http"
	"strconv"
	"time"

	myerr "github.com/dervisgenc/dervisgenc-blog/backend/pkg"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models" // Ensure models is imported
	"github.com/gin-gonic/gin"
)

type StatHandler struct {
	statService *StatService
}

func NewStatHandler(statService *StatService) *StatHandler {
	return &StatHandler{statService: statService}
}

// GetPostStats godoc
// @Summary Get statistics for a specific post
// @Description Fetch statistics such as views, likes, and shares for a given post by its ID
// @Tags Stats
// @Accept json
// @Produce json
// @Param id path int true "Post ID"
// @Success 200 {object} models.Stat
// @Failure 404 {object} models.ErrorResponse "Post not found"
// @Failure 500 {object} models.ErrorResponse "Internal Server Error"
// @Router /posts/{id}/stats [get]
func (h *StatHandler) GetPostStats(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
		return
	}

	stats, err := h.statService.GetPostStats(uint(id))
	if err != nil {
		if err.Error() == "post not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// GetAllPostsStats godoc
// @Summary Get statistics for all posts
// @Description Fetch statistics for all posts, including views, likes, and shares
// @Tags Stats
// @Accept json
// @Produce json
// @Success 200 {array} models.PostStats
// @Failure 500 {object} models.ErrorResponse "Internal Server Error"
// @Router /posts/stats [get]
func (h *StatHandler) GetAllPostsStats(c *gin.Context) {
	postStats, err := h.statService.GetAllPostsStats()

	if err != nil {
		c.Error(myerr.WithHTTPStatus(err, http.StatusInternalServerError))
		return
	}

	c.JSON(http.StatusOK, postStats)
}

// CountPosts godoc
// @Summary Get the total number of posts
// @Description Fetch the total number of active posts
// @Tags Stats
// @Accept json
// @Produce json
// @Success 200 {object} models.CountResponse "count: total number of posts"
// @Failure 500 {object} models.ErrorResponse "Internal Server Error"
// @Router /posts/count [get]
func (h *StatHandler) CountPosts(c *gin.Context) {
	count, err := h.statService.CountPosts()

	if err != nil {
		c.Error(myerr.WithHTTPStatus(err, http.StatusInternalServerError))
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": count})
}

// GetPostsCreatedInLastDays godoc
// @Summary Get posts created in the last X days
// @Description Fetch posts that were created within the last X days
// @Tags Stats
// @Accept json
// @Produce json
// @Param days path int true "Number of days"
// @Success 200 {array} models.Post
// @Failure 400 {object} models.ErrorResponse "Invalid days parameter"
// @Failure 500 {object} models.ErrorResponse "Internal Server Error"
// @Router /posts/recent/{days} [get]
func (h *StatHandler) GetPostsCreatedInLastDays(c *gin.Context) {
	var days int = c.GetInt("days")

	posts, err := h.statService.GetPostsCreatedInLastDays(days)
	if err != nil {
		c.Error(myerr.WithHTTPStatus(err, http.StatusInternalServerError))
		return
	}

	c.JSON(http.StatusOK, posts)
}

// GetDetailedStats godoc
// @Summary Get detailed statistics
// @Description Get comprehensive statistics about website traffic and engagement
// @Tags Stats
// @Accept json
// @Produce json
// @Param start_date query string false "Start date (YYYY-MM-DD)"
// @Param end_date query string false "End date (YYYY-MM-DD)"
// @Success 200 {object} models.StatsResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /admin/stats/detailed [get]
func (h *StatHandler) GetDetailedStats(c *gin.Context) {
	startDate := time.Now().AddDate(0, -1, 0) // Default to last 30 days
	endDate := time.Now()

	if sd := c.Query("start_date"); sd != "" {
		if parsed, err := time.Parse("2006-01-02", sd); err == nil {
			startDate = parsed
		}
	}

	if ed := c.Query("end_date"); ed != "" {
		if parsed, err := time.Parse("2006-01-02", ed); err == nil {
			endDate = parsed
		}
	}

	stats, err := h.statService.GetVisitorStats(startDate, endDate)
	if err != nil {
		c.Error(myerr.WithHTTPStatus(err, http.StatusInternalServerError))
		return
	}

	c.JSON(http.StatusOK, stats)
}

// GetDetailedPostStats godoc
// @Summary Get detailed statistics for all posts
// @Description Get comprehensive statistics for all posts including totals
// @Tags Stats
// @Accept json
// @Produce json
// @Success 200 {object} models.DetailedStatsResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /admin/posts/detailed-stats [get]
func (h *StatHandler) GetDetailedPostStats(c *gin.Context) {
	stats, err := h.statService.GetDetailedPostStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, stats)
}

// GetOverallStats godoc
// @Summary Get overall blog statistics
// @Description Get total posts, views, likes, and shares for the dashboard
// @Tags Stats
// @Accept json
// @Produce json
// @Success 200 {object} models.OverallStatsResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /admin/stats/overall [get]
func (h *StatHandler) GetOverallStats(c *gin.Context) {
	stats, err := h.statService.GetOverallStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, stats)
}

func (h *StatHandler) IncrementShare(c *gin.Context) {
	postID := c.Param("id")
	id, err := strconv.ParseUint(postID, 10, 64)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid post ID"})
		return
	}

	if err := h.statService.IncrementShareCount(uint(id)); err != nil {
		c.JSON(500, gin.H{"error": "Failed to update share count"})
		return
	}

	c.JSON(200, gin.H{"success": true})
}

// GetDailyTrafficStats godoc
// @Summary Get daily traffic statistics for chart
// @Description Get daily views and unique visitors within a date range (default last 30 days)
// @Tags Stats
// @Accept json
// @Produce json
// @Param start_date query string false "Start date (YYYY-MM-DD)" Format(date)
// @Param end_date query string false "End date (YYYY-MM-DD)" Format(date)
// @Success 200 {array} models.DailyTrafficStat
// @Failure 400 {object} models.ErrorResponse "Invalid date format"
// @Failure 500 {object} models.ErrorResponse "Internal Server Error"
// @Router /admin/stats/traffic [get]
func (h *StatHandler) GetDailyTrafficStats(c *gin.Context) {
	// Default date range: last 30 days
	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -30)

	dateFormat := "2006-01-02" // Expected date format

	if sdStr := c.Query("start_date"); sdStr != "" {
		parsedDate, err := time.Parse(dateFormat, sdStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start_date format, use YYYY-MM-DD"})
			return
		}
		startDate = parsedDate
	}

	if edStr := c.Query("end_date"); edStr != "" {
		parsedDate, err := time.Parse(dateFormat, edStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end_date format, use YYYY-MM-DD"})
			return
		}
		endDate = parsedDate
	}

	// Ensure end date is after start date
	if endDate.Before(startDate) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "end_date cannot be before start_date"})
		return
	}

	// Adjust endDate to include the whole day
	endDate = endDate.Add(23*time.Hour + 59*time.Minute + 59*time.Second)

	stats, err := h.statService.GetDailyTrafficStats(startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return empty array instead of null if no stats found
	if stats == nil {
		stats = []models.DailyTrafficStat{}
	}

	c.JSON(http.StatusOK, stats)
}
