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

func (h *PostHandler) GetAllPosts(c *gin.Context) {

	posts, err := h.service.GetAllPosts()
	if err != nil {
		c.Error(myerr.WithHTTPStatus(errors.New("internal Server Error"), http.StatusInternalServerError))
		return
	}

	c.JSON(http.StatusOK, posts)
}

func (h *PostHandler) GetPostByID(c *gin.Context) {
	var id uint = c.GetUint("id")

	post, err := h.service.GetPostByID(id)
	if err != nil {
		c.Error(myerr.WithHTTPStatus(err, http.StatusInternalServerError))
		return
	}
	c.JSON(http.StatusOK, post)
}

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

func (h *PostHandler) DeletePost(c *gin.Context) {
	var id uint = c.GetUint("id")

	err := h.service.DeletePost(id)
	if err != nil {
		c.Error(myerr.WithHTTPStatus(err, http.StatusInternalServerError))
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{Message: "Post deleted"})
}

func (h *PostHandler) DeletePostPermanently(c *gin.Context) {
	var id uint = c.GetUint("id")

	err := h.service.DeletePostPermanently(id)
	if err != nil {
		c.Error(myerr.WithHTTPStatus(err, http.StatusInternalServerError))
		return
	}
	c.JSON(http.StatusOK, models.SuccessResponse{Message: "Post deleted permanently"})
}
