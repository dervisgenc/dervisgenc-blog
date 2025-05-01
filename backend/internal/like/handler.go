package like

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type LikeHandler struct {
	service *LikeService
}

func NewLikeHandler(service *LikeService) *LikeHandler {
	return &LikeHandler{service: service}
}

// ToggleLike godoc
// @Summary Toggle like status for a post
// @Description Like or unlike a post based on the user's IP address
// @Tags Likes
// @Accept json
// @Produce json
// @Param id path int true "Post ID"
// @Success 200 {object} models.LikeResponse "Includes has_liked and likes count"
// @Failure 400 {object} models.ErrorResponse "Invalid post ID"
// @Failure 404 {object} models.ErrorResponse "Post not found"
// @Failure 409 {object} models.ErrorResponse "Conflict (e.g., already liked/unliked)"
// @Failure 500 {object} models.ErrorResponse "Internal Server Error"
// @Router /posts/{id}/like [post]
func (h *LikeHandler) ToggleLike(c *gin.Context) {
	postID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	ipAddress := c.ClientIP()
	// Call service which now returns new liked status and count
	newLikedStatus, newCount, err := h.service.ToggleLike(uint(postID), ipAddress)
	if err != nil {
		// Use the error handling middleware's status code if available
		// Otherwise, determine status based on error type
		status := http.StatusInternalServerError // Default
		errMsg := "Failed to toggle like status"
		if httpErr, ok := err.(interface{ HTTPStatus() int }); ok {
			status = httpErr.HTTPStatus()
		} else if strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "already liked") {
			status = http.StatusConflict
			errMsg = "Conflict toggling like status." // More generic conflict message
		} else if strings.Contains(err.Error(), "not found") {
			status = http.StatusNotFound
			errMsg = "Post or like not found."
		}
		c.JSON(status, gin.H{"error": errMsg})
		return
	}

	// Return the new status and count
	c.JSON(http.StatusOK, gin.H{
		"has_liked": newLikedStatus,
		"likes":     newCount,
	})
}

// GetLikeStatus godoc
// @Summary Get like status and count for a post
// @Description Get whether the current user has liked the post and the total like count
// @Tags Likes
// @Accept json
// @Produce json
// @Param id path int true "Post ID"
// @Success 200 {object} LikeResponse
// @Failure 400 {object} ErrorResponse
// @Router /posts/{id}/like [get]
func (h *LikeHandler) GetLikeStatus(c *gin.Context) {
	postID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	ipAddress := c.ClientIP()
	hasLiked, count, err := h.service.GetLikeStatus(uint(postID), ipAddress)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"has_liked": hasLiked,
		"likes":     count,
	})
}
