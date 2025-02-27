package post

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/dervisgenc/dervisgenc-blog/backend/internal/image"
	myerr "github.com/dervisgenc/dervisgenc-blog/backend/pkg"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
	"github.com/gin-gonic/gin"
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
// @Description Create a new post with the provided data and an optional image
// @Tags Posts
// @Accept multipart/form-data
// @Produce json
// @Param title formData string true "Post Title"
// @Param content formData string true "Post Content"
// @Param description formData string false "Post Description"
// @Param readTime formData string false "Estimated Read Time"
// @Param image formData file false "Cover Image"
// @Success 201 {object} models.Post
// @Failure 400 {object} models.ErrorResponse "Invalid request"
// @Failure 500 {object} models.ErrorResponse "Internal Server Error"
// @Router /posts [post]
func (h *PostHandler) CreatePost(c *gin.Context) {
	var post models.Post

	// Get form data
	post.Title = c.PostForm("title")
	post.Summary = c.PostForm("description")
	post.Content = c.PostForm("content")
	readTime, err := strconv.Atoi(c.PostForm("readTime"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid read time"})
		return
	}
	post.ReadTime = readTime
	post.IsActive, _ = strconv.ParseBool(c.PostForm("isActive"))

	// Handle image upload
	file, err := c.FormFile("image")
	if err == nil {
		// Save image using image service
		filename, err := h.imageService.SaveImage(file)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Unable to save image: %v", err)})
			return
		}

		// Set both image path and URL
		post.ImagePath = filename
		post.ImageURL = h.imageService.GetImageURL(filename)

		fmt.Printf("Saved image - Path: %s, URL: %s\n", post.ImagePath, post.ImageURL)
	}

	// Create post
	err = h.service.CreatePost(&post)
	if err != nil {
		// Cleanup the uploaded image if post creation fails
		if post.ImagePath != "" {
			_ = h.imageService.DeleteImage(post.ImagePath)
		}
		c.Error(myerr.WithHTTPStatus(err, http.StatusInternalServerError))
		return
	}

	c.JSON(http.StatusCreated, post)
}

// UpdatePost godoc
// @Summary Update an existing post
// @Description Update a post with the given data
// @Tags Posts
// @Accept json
// @Produce json
// @Param post body models.Post true "Updated Post Data"
// @Success 200 {object} models.Post
// @Failure 400 {object} models.ErrorResponse "Invalid request"
// @Failure 500 {object} models.ErrorResponse "Internal Server Error"
// @Router /posts/{id} [put]
func (h *PostHandler) UpdatePost(c *gin.Context) {
	// Get post ID from URL parameter
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	// Get existing post
	existingPost, err := h.service.GetPostByIDAdmin(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// Create updated post with existing data, including timestamps
	updatedPost := &models.Post{
		ID:        uint(id),
		CreatedAt: existingPost.CreatedAt, // Preserve original creation date
		Title:     existingPost.Title,
		Summary:   existingPost.Summary,
		Content:   existingPost.Content,
		ReadTime:  existingPost.ReadTime,
		ImagePath: existingPost.ImagePath,
		ImageURL:  existingPost.ImageURL,
		IsActive:  existingPost.IsActive,
	}

	// Update fields if provided in form data
	if title := c.PostForm("title"); title != "" {
		updatedPost.Title = title
	}
	if description := c.PostForm("description"); description != "" {
		updatedPost.Summary = description
	}
	if content := c.PostForm("content"); content != "" {
		updatedPost.Content = content
	}
	if readTime := c.PostForm("readTime"); readTime != "" {
		if rt, err := strconv.Atoi(readTime); err == nil {
			updatedPost.ReadTime = rt
		}
	}
	if isActive := c.PostForm("isActive"); isActive != "" {
		active, err := strconv.ParseBool(isActive)
		if err == nil {
			updatedPost.IsActive = active
		}
	}

	// Handle new image if provided
	file, err := c.FormFile("image")
	if err == nil {
		// Delete old image if exists
		if existingPost.ImagePath != "" {
			_ = h.imageService.DeleteImage(existingPost.ImagePath)
		}

		// Save new image
		filename, err := h.imageService.SaveImage(file)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to save image"})
			return
		}
		updatedPost.ImagePath = filename
		updatedPost.ImageURL = h.imageService.GetImageURL(filename)
	}

	// Set UpdatedAt to current time
	updatedPost.UpdatedAt = time.Now()

	// Update the post
	err = h.service.UpdatePost(updatedPost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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
	// Parse query parameters
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

	// Get paginated posts
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
