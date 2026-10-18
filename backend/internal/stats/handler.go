package stats

import (
	"log/slog"
	"net/http"

	"github.com/dervisgenc/dervisgenc-blog/backend/internal/httpx"
	"github.com/gin-gonic/gin"
)

const maxDays = 365

// Handler serves the admin statistics endpoints.
type Handler struct {
	service *Service
	log     *slog.Logger
}

func NewHandler(service *Service, log *slog.Logger) *Handler {
	return &Handler{service: service, log: log}
}

// Summary serves GET /api/admin/stats/summary.
func (h *Handler) Summary(c *gin.Context) {
	sum, err := h.service.Summary(c.Request.Context())
	if err != nil {
		httpx.InternalError(c, h.log, "stats summary", err)
		return
	}
	c.JSON(http.StatusOK, sum)
}

// Daily serves GET /api/admin/stats/daily.
func (h *Handler) Daily(c *gin.Context) {
	days, err := h.service.Daily(c.Request.Context(), daysParam(c))
	if err != nil {
		httpx.InternalError(c, h.log, "daily stats", err)
		return
	}
	c.JSON(http.StatusOK, days)
}

// TopPosts serves GET /api/admin/stats/top-posts.
func (h *Handler) TopPosts(c *gin.Context) {
	limit := httpx.QueryInt(c, "limit", 10, 1, 50)
	top, err := h.service.TopPosts(c.Request.Context(), daysParam(c), limit)
	if err != nil {
		httpx.InternalError(c, h.log, "top posts", err)
		return
	}
	c.JSON(http.StatusOK, top)
}

// PostDaily serves GET /api/admin/stats/posts/:id/daily.
func (h *Handler) PostDaily(c *gin.Context) {
	id, ok := httpx.ParamID(c, "id")
	if !ok {
		return
	}
	ctx := c.Request.Context()
	exists, err := h.service.PostExists(ctx, id)
	if err != nil {
		httpx.InternalError(c, h.log, "post daily stats", err)
		return
	}
	if !exists {
		httpx.Error(c, http.StatusNotFound, "post not found")
		return
	}

	days, err := h.service.PostDaily(ctx, id, daysParam(c))
	if err != nil {
		httpx.InternalError(c, h.log, "post daily stats", err)
		return
	}
	c.JSON(http.StatusOK, days)
}

func daysParam(c *gin.Context) int {
	return httpx.QueryInt(c, "days", 30, 1, maxDays)
}
