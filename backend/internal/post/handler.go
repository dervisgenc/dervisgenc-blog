package post

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/dervisgenc/dervisgenc-blog/backend/internal/image"
	myerr "github.com/dervisgenc/dervisgenc-blog/backend/pkg"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/dto"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type PostHandler struct {
	service      *PostService
	imageService *image.Service
}

func NewPostHandler(service *PostService, imageService *image.Service) *PostHandler {
	return &PostHandler{
		service:      service,
		imageService: imageService,
	}
}

// GetAllPosts godoc
// @Summary Get all posts
// @Description Fetch all posts in the system
// @Tags Posts
// @Accept json
// @Produce json
// @Success 200 {array} dto.PostListResponse
// @Failure 500 {object} dto.ErrorResponse "Internal Server Error"
// @Router /posts [get]
func (h *PostHandler) GetAllPosts(c *gin.Context) {
	posts, err := h.service.GetAllPosts()
	if err != nil {
		c.Error(myerr.WithHTTPStatus(errors.New("internal Server Error"), http.StatusInternalServerError))
		return
	}
	c.JSON(http.StatusOK, posts)
}

// GetPostByID godoc
// @Summary Get a post by ID
// @Description Fetch a single post by its ID
// @Tags Posts
// @Accept json
// @Produce json
// @Param id path int true "Post ID"
// @Success 200 {object} dto.PostDetailResponse
// @Failure 404 {object} dto.ErrorResponse "Post not found"
// @Failure 500 {object} dto.ErrorResponse "Internal Server Error"
// @Router /posts/{id} [get]
func (h *PostHandler) GetPostByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.Error(myerr.WithHTTPStatus(err, http.StatusBadRequest))
		return
	}
	post, err := h.service.GetPostByID(uint(id))
	if err != nil {
		c.Error(myerr.WithHTTPStatus(err, http.StatusInternalServerError))
		return
	}
	c.JSON(http.StatusOK, post)
}

// CreatePost godoc
// @Summary Create a new post
// @Description Create a new post with the provided data including an image URL
// @Tags Posts
// @Accept json
// @Produce json
// @Param post body dto.PostCreateRequest true "Post Data"
// @Success 201 {object} models.Post
// @Failure 400 {object} models.ErrorResponse "Invalid request"
// @Failure 500 {object} models.ErrorResponse "Internal Server Error"
// @Router /admin/posts [post]
func (h *PostHandler) CreatePost(c *gin.Context) {
	var req dto.PostCreateRequest

	// Bind JSON payload
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(myerr.WithHTTPStatus(fmt.Errorf("invalid request body: %w", err), http.StatusBadRequest))
		return
	}

	// --- Add Logging ---
	logger, _ := c.Get("logger") // Assuming logger is set in middleware
	if l, ok := logger.(*logrus.Logger); ok {
		l.Infof("CreatePost Request Received - ImageURL: %s", req.ImageURL)
	} else {
		// Fallback to standard log if logger not found or wrong type
		fmt.Printf("INFO: CreatePost Request Received - ImageURL: %s\n", req.ImageURL)
	}
	// --- End Logging ---

	// Map DTO to model
	post := models.Post{
		Title:    req.Title,
		Summary:  req.Description,
		Content:  req.Content,
		ReadTime: req.ReadTime,
		IsActive: req.IsActive,
		ImageURL: req.ImageURL,
	}

	// Create post using the service
	err := h.service.CreatePost(&post)
	if err != nil {
		c.Error(myerr.WithHTTPStatus(err, http.StatusInternalServerError))
		return
	}

	c.JSON(http.StatusCreated, post)
}

// UpdatePost godoc
// @Summary Update an existing post
// @Description Update a post with the given data including an image URL
// @Tags Posts
// @Accept json
// @Produce json
// @Param id path int true "Post ID"
// @Param post body dto.PostUpdateRequest true "Updated Post Data"
// @Success 200 {object} models.Post
// @Failure 400 {object} models.ErrorResponse "Invalid request"
// @Failure 404 {object} models.ErrorResponse "Post not found"
// @Failure 500 {object} models.ErrorResponse "Internal Server Error"
// @Router /admin/posts/{id} [put]
func (h *PostHandler) UpdatePost(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.Error(myerr.WithHTTPStatus(errors.New("invalid post ID"), http.StatusBadRequest))
		return
	}

	existingPost, err := h.service.GetPostByIDAdmin(uint(id))
	if err != nil {
		c.Error(myerr.WithHTTPStatus(err, http.StatusInternalServerError))
		return
	}

	var req dto.PostUpdateRequest

	// Bind JSON payload
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(myerr.WithHTTPStatus(fmt.Errorf("invalid request body: %w", err), http.StatusBadRequest))
		return
	}

	// Map DTO to the existing post model, updating fields
	updatedPost := &models.Post{
		ID:        uint(id),
		CreatedAt: existingPost.CreatedAt,
		Title:     req.Title,
		Summary:   req.Description,
		Content:   req.Content,
		ReadTime:  req.ReadTime,
		IsActive:  req.IsActive,
		ImageURL:  req.ImageURL,
		UpdatedAt: time.Now(),
		LikeCount: existingPost.LikeCount,
	}

	// Update the post using the service
	err = h.service.UpdatePost(updatedPost)
	if err != nil {
		c.Error(myerr.WithHTTPStatus(fmt.Errorf("failed to update post: %w", err), http.StatusInternalServerError))
		return
	}

	c.JSON(http.StatusOK, updatedPost)
}

// DeletePost godoc
// @Summary Soft delete a post
// @Description Soft delete a post by its ID
// @Tags Posts
// @Accept json
// @Produce json
// @Param id path int true "Post ID"
// @Success 200 {object} models.SuccessResponse "Post deleted"
// @Failure 404 {object} models.ErrorResponse "Post not found"
// @Failure 500 {object} models.ErrorResponse "Internal Server Error"
// @Router /posts/{id} [delete]
func (h *PostHandler) DeletePost(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.Error(myerr.WithHTTPStatus(err, http.StatusBadRequest))
		return
	}
	err = h.service.DeletePost(uint(id))
	if err != nil {
		c.Error(myerr.WithHTTPStatus(err, http.StatusInternalServerError))
		return
	}
	c.JSON(http.StatusOK, models.SuccessResponse{Message: "Post deleted"})
}

// DeletePostPermanently godoc
// @Summary Permanently delete a post
// @Description Permanently delete a post by its ID
// @Tags Posts
// @Accept json
// @Produce json
// @Param id path int true "Post ID"
// @Success 200 {object} models.SuccessResponse "Post deleted permanently"
// @Failure 404 {object} models.ErrorResponse "Post not found"
// @Failure 500 {object} models.ErrorResponse "Internal Server Error"
// @Router /posts/{id}/permanent [delete]
func (h *PostHandler) DeletePostPermanently(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.Error(myerr.WithHTTPStatus(err, http.StatusBadRequest))
		return
	}
	err = h.service.DeletePostPermanently(uint(id))
	if err != nil {
		c.Error(myerr.WithHTTPStatus(err, http.StatusInternalServerError))
		return
	}
	c.JSON(http.StatusOK, models.SuccessResponse{Message: "Post deleted permanently"})
}

// GetAllPosts godoc
// @Summary Get all posts
// @Description Fetch all posts in the system
// @Tags Posts
// @Accept json
// @Produce json
// @Success 200 {array} dto.PostListResponse
// @Failure 500 {object} dto.ErrorResponse "Internal Server Error"
// @Router /admin/posts [get]
func (h *PostHandler) GetAllAdmin(c *gin.Context) {
	posts, err := h.service.GetAllAdmin()
	if err != nil {
		c.Error(myerr.WithHTTPStatus(errors.New("internal Server Error"), http.StatusInternalServerError))
		return
	}
	c.JSON(http.StatusOK, posts)
}

func (h *PostHandler) GetPostByIDAdmin(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.Error(myerr.WithHTTPStatus(err, http.StatusBadRequest))
		return
	}
	post, err := h.service.GetPostByIDAdmin(uint(id))
	if err != nil {
		c.Error(myerr.WithHTTPStatus(err, http.StatusInternalServerError))
		return
	}
	c.JSON(http.StatusOK, post)
}

// GetPaginatedPosts godoc
// @Summary Get paginated posts
// @Description Fetch posts with pagination
// @Tags Posts
// @Accept json
// @Produce json
// @Param page query int false "Page number (default: 1)"
// @Param size query int false "Page size (default: 9)"
// @Success 200 {object} models.PaginatedPosts
// @Failure 400 {object} models.ErrorResponse "Invalid parameters"
// @Failure 500 {object} models.ErrorResponse "Internal Server Error"
// @Router /posts/paginated [get]
func (h *PostHandler) GetPaginatedPosts(c *gin.Context) {
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		c.Error(myerr.WithHTTPStatus(errors.New("invalid page number"), http.StatusBadRequest))
		return
	}

	pageSize, err := strconv.Atoi(c.DefaultQuery("size", "9"))
	if err != nil || pageSize < 1 {
		c.Error(myerr.WithHTTPStatus(errors.New("invalid page size"), http.StatusBadRequest))
		return
	}

	result, err := h.service.GetPaginatedPosts(page, pageSize)
	if err != nil {
		c.Error(myerr.WithHTTPStatus(err, http.StatusInternalServerError))
		return
	}

	c.JSON(http.StatusOK, result)
}

// SearchPosts godoc
// @Summary Search posts with pagination
// @Description Search posts by query string with pagination
// @Tags Posts
// @Accept json
// @Produce json
// @Param q query string true "Search query"
// @Param page query int false "Page number (default: 1)"
// @Param size query int false "Page size (default: 9)"
// @Success 200 {object} models.PaginatedPosts
// @Failure 400 {object} models.ErrorResponse "Invalid parameters"
// @Failure 500 {object} models.ErrorResponse "Internal Server Error"
// @Router /posts/search [get]
func (h *PostHandler) SearchPosts(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "search query is required"})
		return
	}

	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid page number"})
		return
	}

	pageSize, err := strconv.Atoi(c.DefaultQuery("size", "9"))
	if err != nil || pageSize < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid page size"})
		return
	}

	result, err := h.service.SearchPosts(query, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}
