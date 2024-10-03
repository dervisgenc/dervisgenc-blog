package stat

import (
	"net/http"

	myerr "github.com/dervisgenc/dervisgenc-blog/backend/pkg"
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
	var postID uint = c.GetUint("id")

	stats, err := h.statService.GetPostStats(postID)
	if err != nil {
		c.Error(myerr.WithHTTPStatus(err, http.StatusInternalServerError))
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
