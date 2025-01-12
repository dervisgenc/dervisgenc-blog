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
// @Success 200 {object} LikeResponse
// @Failure 400 {object} ErrorResponse
// @Router /posts/{id}/like [post]
func (h *LikeHandler) ToggleLike(c *gin.Context) {
	postID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	ipAddress := c.ClientIP()
	response, err := h.service.ToggleLike(uint(postID), ipAddress)
	if err != nil {
		status := http.StatusInternalServerError
		if strings.Contains(err.Error(), "already liked") {
			status = http.StatusConflict
		} else if strings.Contains(err.Error(), "like not found") {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
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
