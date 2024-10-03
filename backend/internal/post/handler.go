package post

import (
	"errors"
	"net/http"

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
	var id uint = c.GetUint("id")
	post, err := h.service.GetPostByID(id)
	if err != nil {
		c.Error(myerr.WithHTTPStatus(err, http.StatusInternalServerError))
		return
	}
	c.JSON(http.StatusOK, post)
}

// CreatePost godoc
// @Summary Create a new post
// @Description Create a new post with the provided data
// @Tags Posts
// @Accept json
// @Produce json
// @Param post body models.Post true "Post Data"
// @Success 201 {object} models.Post
// @Failure 400 {object} models.ErrorResponse "Invalid request"
// @Failure 500 {object} models.ErrorResponse "Internal Server Error"
// @Router /posts [post]
func (h *PostHandler) CreatePost(c *gin.Context) {
	var post models.Post
	if err := c.ShouldBindJSON(&post); err != nil {
		c.Error(myerr.WithHTTPStatus(errors.New("invalid request"), http.StatusBadRequest))
		return
	}
	err := h.service.CreatePost(&post)
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
