package post

import (
	"errors"
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"

	myerr "github.com/dervisgenc/dervisgenc-blog/backend/pkg"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
	"github.com/gin-gonic/gin"
)

type PostHandler struct {
	service *PostService
}

func NewPostHandler(service *PostService) *PostHandler {
	return &PostHandler{service: service}
}

// GetAllPosts godoc
// @Summary Get all posts
// @Description Fetch all posts in the system
// @Tags Posts
// @Accept json
// @Produce json
// @Success 200 {array} models.Post
// @Failure 500 {object} models.ErrorResponse "Internal Server Error"
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
// @Success 200 {object} models.Post
// @Failure 404 {object} models.ErrorResponse "Post not found"
// @Failure 500 {object} models.ErrorResponse "Internal Server Error"
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

	// Form verilerini tek tek çekiyoruz
	post.Title = c.PostForm("title")
	post.Summary = c.PostForm("description")
	post.Content = c.PostForm("content")
	readTime, err := strconv.Atoi(c.PostForm("readTime"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid read time"})
		return
	}
	post.ReadTime = readTime
	hidden, _ := strconv.ParseBool(c.PostForm("hidden"))
	post.IsActive = hidden

	// Eğer bir görsel gönderildiyse işle
	file, err := c.FormFile("image")
	if err == nil {
		filename := filepath.Base(file.Filename)
		savePath := fmt.Sprintf("uploads/%s", filename)
		if err := c.SaveUploadedFile(file, savePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to save file"})
			return
		}
		post.ImageURL = fmt.Sprintf("http://localhost:8080/uploads/%s", filename)
		fmt.Println(post.ImageURL)
	}

	// Post kaydetme işlemi
	err = h.service.CreatePost(&post)
	if err != nil {
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
	var post models.Post
	if err := c.ShouldBindJSON(&post); err != nil {
		c.Error(myerr.WithHTTPStatus(errors.New("invalid request"), http.StatusBadRequest))
		return
	}
	err := h.service.UpdatePost(&post)
	if err != nil {
		c.Error(myerr.WithHTTPStatus(err, http.StatusInternalServerError))
		return
	}
	c.JSON(http.StatusOK, post)
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
	var id uint = c.GetUint("id")
	err := h.service.DeletePost(id)
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
	var id uint = c.GetUint("id")
	err := h.service.DeletePostPermanently(id)
	if err != nil {
		c.Error(myerr.WithHTTPStatus(err, http.StatusInternalServerError))
		return
	}
	c.JSON(http.StatusOK, models.SuccessResponse{Message: "Post deleted permanently"})
}

// UploadImage handles the uploading of post images
func (h *PostHandler) UploadImage(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file found"})
		return
	}

	// Save file to the server or upload to cloud storage
	filename := filepath.Base(file.Filename)
	savePath := fmt.Sprintf("uploads/%s", filename)
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to save file"})
		return
	}

	// URL to be returned
	imageUrl := fmt.Sprintf("http://localhost:8080/%s", savePath)

	// Return the URL to the frontend
	c.JSON(http.StatusOK, gin.H{"imageUrl": imageUrl})
}

// GetAllPosts godoc
// @Summary Get all posts
// @Description Fetch all posts in the system
// @Tags Posts
// @Accept json
// @Produce json
// @Success 200 {array} models.Post
// @Failure 500 {object} models.ErrorResponse "Internal Server Error"
// @Router /posts [get]
func (h *PostHandler) GetAllAdmin(c *gin.Context) {
	posts, err := h.service.GetAllAdmin()
	if err != nil {
		c.Error(myerr.WithHTTPStatus(errors.New("internal Server Error"), http.StatusInternalServerError))
		return
	}
	c.JSON(http.StatusOK, posts)
}
