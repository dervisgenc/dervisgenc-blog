package comment

import (
	"errors"
	"net/http"
	"strconv"

	myerr "github.com/dervisgenc/dervisgenc-blog/backend/pkg"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/dto"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type CommentHandler struct {
	service *CommentService
	logger  *logrus.Logger
}

func NewCommentHandler(service *CommentService, logger *logrus.Logger) *CommentHandler {
	return &CommentHandler{service: service, logger: logger}
}

// HandleCreateComment godoc
// @Summary Create a new comment on a post
// @Description Adds a new comment to a specific post. Comments require moderation.
// @Tags Comments
// @Accept json
// @Produce json
// @Param id path int true "Post ID"
// @Param comment body dto.CommentCreateRequest true "Comment Data"
// @Success 201 {object} models.SuccessResponse "Comment submitted successfully"
// @Failure 400 {object} models.ErrorResponse "Invalid input"
// @Failure 404 {object} models.ErrorResponse "Post not found"
// @Failure 500 {object} models.ErrorResponse "Internal Server Error"
// @Router /posts/{id}/comments [post]
func (h *CommentHandler) HandleCreateComment(c *gin.Context) {
	postIDStr := c.Param("id")
	postID, err := strconv.ParseUint(postIDStr, 10, 32)
	if err != nil {
		h.logger.WithError(err).Warn("Handler: Invalid post ID format")
		c.Error(myerr.WithHTTPStatus(errors.New("invalid post ID"), http.StatusBadRequest))
		return
	}

	var req dto.CommentCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.WithError(err).Warn("Handler: Invalid comment request body")
		// Gin's binding errors are often user-friendly enough
		c.Error(myerr.WithHTTPStatus(err, http.StatusBadRequest))
		return
	}

	log := h.logger.WithFields(logrus.Fields{"post_id": postID, "author": req.AuthorName})
	log.Info("Handler: Received request to create comment")

	_, err = h.service.CreateComment(uint(postID), req)
	if err != nil {
		log.WithError(err).Error("Handler: Failed to create comment")
		// Handle specific errors if needed, e.g., post not found if service checks it
		c.Error(myerr.WithHTTPStatus(err, http.StatusInternalServerError)) // Default to 500
		return
	}

	log.Info("Handler: Comment created successfully (pending approval)")
	c.JSON(http.StatusCreated, models.SuccessResponse{Message: "Comment submitted successfully and is awaiting moderation."})
}

// HandleGetCommentsByPost godoc
// @Summary Get comments for a specific post
// @Description Retrieves all approved comments for a given post ID.
// @Tags Comments
// @Accept json
// @Produce json
// @Param id path int true "Post ID"
// @Success 200 {array} dto.CommentResponse
// @Failure 400 {object} models.ErrorResponse "Invalid post ID"
// @Failure 500 {object} models.ErrorResponse "Internal Server Error"
// @Router /posts/{id}/comments [get]
func (h *CommentHandler) HandleGetCommentsByPost(c *gin.Context) {
	postIDStr := c.Param("id")
	postID, err := strconv.ParseUint(postIDStr, 10, 32)
	if err != nil {
		h.logger.WithError(err).Warn("Handler: Invalid post ID format")
		c.Error(myerr.WithHTTPStatus(errors.New("invalid post ID"), http.StatusBadRequest))
		return
	}

	log := h.logger.WithField("post_id", postID)
	log.Info("Handler: Received request to get comments by post")

	comments, err := h.service.GetCommentsByPostID(uint(postID))
	if err != nil {
		log.WithError(err).Error("Handler: Failed to get comments")
		c.Error(myerr.WithHTTPStatus(err, http.StatusInternalServerError))
		return
	}

	log.WithField("count", len(comments)).Info("Handler: Successfully fetched comments")
	c.JSON(http.StatusOK, comments)
}

// HandleGetAllCommentsAdmin godoc
// @Summary Get all comments (Admin)
// @Description Retrieves all comments with pagination and filtering for moderation.
// @Tags Admin Comments
// @Accept json
// @Produce json
// @Param page query int false "Page number (default: 1)"
// @Param size query int false "Page size (default: 10)"
// @Param filter query string false "Filter comments (all, pending, approved - default: pending)" Enums(all, pending, approved)
// @Success 200 {object} map[string]interface{} "comments: []dto.AdminCommentResponse, total_count: int64"
// @Failure 400 {object} models.ErrorResponse "Invalid parameters"
// @Failure 500 {object} models.ErrorResponse "Internal Server Error"
// @Router /admin/comments [get]
func (h *CommentHandler) HandleGetAllCommentsAdmin(c *gin.Context) {
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		c.Error(myerr.WithHTTPStatus(errors.New("invalid page number"), http.StatusBadRequest))
		return
	}

	pageSize, err := strconv.Atoi(c.DefaultQuery("size", "10"))
	if err != nil || pageSize < 1 {
		c.Error(myerr.WithHTTPStatus(errors.New("invalid page size"), http.StatusBadRequest))
		return
	}

	filter := c.DefaultQuery("filter", "pending") // Default to pending comments

	log := h.logger.WithFields(logrus.Fields{"page": page, "pageSize": pageSize, "filter": filter})
	log.Info("Handler: Received request to get all comments for admin")

	comments, totalCount, err := h.service.GetAllCommentsAdmin(page, pageSize, filter)
	if err != nil {
		log.WithError(err).Error("Handler: Failed to get comments for admin")
		c.Error(myerr.WithHTTPStatus(err, http.StatusInternalServerError))
		return
	}

	log.WithFields(logrus.Fields{"count": len(comments), "total": totalCount}).Info("Handler: Successfully fetched comments for admin")
	c.JSON(http.StatusOK, gin.H{
		"comments":    comments,
		"total_count": totalCount,
		"page":        page,
		"page_size":   pageSize,
	})
}

// HandleApproveComment godoc
// @Summary Approve a comment (Admin)
// @Description Marks a specific comment as approved.
// @Tags Admin Comments
// @Accept json
// @Produce json
// @Param comment_id path int true "Comment ID"
// @Success 200 {object} models.SuccessResponse "Comment approved successfully"
// @Failure 400 {object} models.ErrorResponse "Invalid comment ID"
// @Failure 404 {object} models.ErrorResponse "Comment not found"
// @Failure 500 {object} models.ErrorResponse "Internal Server Error"
// @Router /admin/comments/{comment_id}/approve [patch]
func (h *CommentHandler) HandleApproveComment(c *gin.Context) {
	commentIDStr := c.Param("comment_id")
	commentID, err := strconv.ParseUint(commentIDStr, 10, 32)
	if err != nil {
		h.logger.WithError(err).Warn("Handler: Invalid comment ID format for approval")
		c.Error(myerr.WithHTTPStatus(errors.New("invalid comment ID"), http.StatusBadRequest))
		return
	}

	log := h.logger.WithField("comment_id", commentID)
	log.Info("Handler: Received request to approve comment")

	err = h.service.ApproveComment(uint(commentID))
	if err != nil {
		log.WithError(err).Error("Handler: Failed to approve comment")
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.Error(myerr.WithHTTPStatus(errors.New("comment not found"), http.StatusNotFound))
		} else {
			c.Error(myerr.WithHTTPStatus(err, http.StatusInternalServerError))
		}
		return
	}

	log.Info("Handler: Comment approved successfully")
	c.JSON(http.StatusOK, models.SuccessResponse{Message: "Comment approved successfully"})
}

// HandleDeleteComment godoc
// @Summary Delete a comment (Admin)
// @Description Permanently deletes a specific comment.
// @Tags Admin Comments
// @Accept json
// @Produce json
// @Param comment_id path int true "Comment ID"
// @Success 200 {object} models.SuccessResponse "Comment deleted successfully"
// @Failure 400 {object} models.ErrorResponse "Invalid comment ID"
// @Failure 500 {object} models.ErrorResponse "Internal Server Error"
// @Router /admin/comments/{comment_id} [delete]
func (h *CommentHandler) HandleDeleteComment(c *gin.Context) {
	commentIDStr := c.Param("comment_id")
	commentID, err := strconv.ParseUint(commentIDStr, 10, 32)
	if err != nil {
		h.logger.WithError(err).Warn("Handler: Invalid comment ID format for deletion")
		c.Error(myerr.WithHTTPStatus(errors.New("invalid comment ID"), http.StatusBadRequest))
		return
	}

	log := h.logger.WithField("comment_id", commentID)
	log.Info("Handler: Received request to delete comment")

	err = h.service.DeleteComment(uint(commentID))
	if err != nil {
		log.WithError(err).Error("Handler: Failed to delete comment")
		// Don't expose gorm.ErrRecordNotFound as 404, DELETE should be idempotent
		c.Error(myerr.WithHTTPStatus(err, http.StatusInternalServerError))
		return
	}

	log.Info("Handler: Comment deleted successfully")
	c.JSON(http.StatusOK, models.SuccessResponse{Message: "Comment deleted successfully"})
}
