package engagement

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/dervisgenc/dervisgenc-blog/backend/internal/httpx"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/post"
	"github.com/gin-gonic/gin"
)

// Handler serves the public view, like and share endpoints.
type Handler struct {
	service *Service
	log     *slog.Logger
}

func NewHandler(service *Service, log *slog.Logger) *Handler {
	return &Handler{service: service, log: log}
}

// View serves POST /api/posts/:slug/views.
func (h *Handler) View(c *gin.Context) {
	if err := h.service.View(c.Request.Context(), c.Param("slug"), client(c)); err != nil {
		h.fail(c, "record view", err)
		return
	}
	c.Status(http.StatusNoContent)
}

// LikeStatus serves GET /api/posts/:slug/like.
func (h *Handler) LikeStatus(c *gin.Context) {
	state, err := h.service.LikeStatus(c.Request.Context(), c.Param("slug"), client(c))
	if err != nil {
		h.fail(c, "like status", err)
		return
	}
	c.JSON(http.StatusOK, state)
}

// Like serves PUT /api/posts/:slug/like.
func (h *Handler) Like(c *gin.Context) {
	h.setLike(c, true)
}

// Unlike serves DELETE /api/posts/:slug/like.
func (h *Handler) Unlike(c *gin.Context) {
	h.setLike(c, false)
}

type shareRequest struct {
	Channel string `json:"channel" binding:"required"`
}

// Share serves POST /api/posts/:slug/shares.
func (h *Handler) Share(c *gin.Context) {
	var req shareRequest
	if err := c.ShouldBindJSON(&req); err != nil || !Channels[req.Channel] {
		httpx.Error(c, http.StatusBadRequest, "unknown share channel")
		return
	}
	if err := h.service.Share(c.Request.Context(), c.Param("slug")); err != nil {
		h.fail(c, "record share", err)
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *Handler) setLike(c *gin.Context, liked bool) {
	state, err := h.service.SetLike(c.Request.Context(), c.Param("slug"), client(c), liked)
	if err != nil {
		h.fail(c, "set like", err)
		return
	}
	c.JSON(http.StatusOK, state)
}

func (h *Handler) fail(c *gin.Context, msg string, err error) {
	if errors.Is(err, post.ErrNotFound) {
		httpx.Error(c, http.StatusNotFound, "post not found")
		return
	}
	httpx.InternalError(c, h.log, msg, err)
}

func client(c *gin.Context) Client {
	return Client{IP: c.ClientIP(), UserAgent: c.Request.UserAgent()}
}
