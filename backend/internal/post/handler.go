package post

import (
	"errors"
	"log/slog"
	"net/http"
	"strings"

	"github.com/dervisgenc/dervisgenc-blog/backend/internal/httpx"
	"github.com/gin-gonic/gin"
)

const maxQueryLength = 100

// Handler serves the post endpoints of the public site and the admin panel.
type Handler struct {
	service *Service
	log     *slog.Logger
}

func NewHandler(service *Service, log *slog.Logger) *Handler {
	return &Handler{service: service, log: log}
}

// List serves GET /api/posts.
func (h *Handler) List(c *gin.Context) {
	page := httpx.ParsePage(c)
	posts, total, err := h.service.ListPublished(c.Request.Context(), queryParam(c, "q"), queryParam(c, "tag"), page)
	if err != nil {
		httpx.InternalError(c, h.log, "list posts", err)
		return
	}
	c.JSON(http.StatusOK, httpx.NewPage(mapPosts(posts, toSummary), page, total))
}

// Get serves GET /api/posts/:slug.
func (h *Handler) Get(c *gin.Context) {
	p, err := h.service.GetPublished(c.Request.Context(), c.Param("slug"))
	if err != nil {
		h.fail(c, "get post", err)
		return
	}
	c.JSON(http.StatusOK, Detail{Summary: toSummary(p), Content: p.Content})
}

// Related serves GET /api/posts/:slug/related.
func (h *Handler) Related(c *gin.Context) {
	limit := httpx.QueryInt(c, "limit", 3, 1, maxRelated)
	posts, err := h.service.Related(c.Request.Context(), c.Param("slug"), limit)
	if err != nil {
		h.fail(c, "related posts", err)
		return
	}
	c.JSON(http.StatusOK, mapPosts(posts, toSummary))
}

// Tags serves GET /api/tags.
func (h *Handler) Tags(c *gin.Context) {
	tags, err := h.service.Tags(c.Request.Context())
	if err != nil {
		httpx.InternalError(c, h.log, "list tags", err)
		return
	}
	c.JSON(http.StatusOK, tags)
}

// AdminList serves GET /api/admin/posts.
func (h *Handler) AdminList(c *gin.Context) {
	page := httpx.ParsePage(c)
	status := Status(c.Query("status"))
	posts, total, err := h.service.ListAll(c.Request.Context(), status, queryParam(c, "q"), page)
	if err != nil {
		httpx.InternalError(c, h.log, "list admin posts", err)
		return
	}
	c.JSON(http.StatusOK, httpx.NewPage(mapPosts(posts, toAdminSummary), page, total))
}

// AdminGet serves GET /api/admin/posts/:id.
func (h *Handler) AdminGet(c *gin.Context) {
	id, ok := httpx.ParamID(c, "id")
	if !ok {
		return
	}
	p, err := h.service.Get(c.Request.Context(), id)
	if err != nil {
		h.fail(c, "get admin post", err)
		return
	}
	c.JSON(http.StatusOK, toAdminDetail(p))
}

// Create serves POST /api/admin/posts.
func (h *Handler) Create(c *gin.Context) {
	var in Input
	if err := c.ShouldBindJSON(&in); err != nil {
		httpx.Error(c, http.StatusBadRequest, "invalid JSON body")
		return
	}
	p, err := h.service.Create(c.Request.Context(), in)
	if err != nil {
		h.fail(c, "create post", err)
		return
	}
	h.log.Info("post created", "id", p.ID, "slug", p.Slug, "status", p.Status)
	c.JSON(http.StatusCreated, toAdminDetail(p))
}

// Update serves PUT /api/admin/posts/:id.
func (h *Handler) Update(c *gin.Context) {
	id, ok := httpx.ParamID(c, "id")
	if !ok {
		return
	}
	var in Input
	if err := c.ShouldBindJSON(&in); err != nil {
		httpx.Error(c, http.StatusBadRequest, "invalid JSON body")
		return
	}
	p, err := h.service.Update(c.Request.Context(), id, in)
	if err != nil {
		h.fail(c, "update post", err)
		return
	}
	h.log.Info("post updated", "id", p.ID, "slug", p.Slug, "status", p.Status)
	c.JSON(http.StatusOK, toAdminDetail(p))
}

// Delete serves DELETE /api/admin/posts/:id.
func (h *Handler) Delete(c *gin.Context) {
	id, ok := httpx.ParamID(c, "id")
	if !ok {
		return
	}
	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		h.fail(c, "delete post", err)
		return
	}
	h.log.Info("post deleted", "id", id)
	c.Status(http.StatusNoContent)
}

// fail maps service errors to responses.
func (h *Handler) fail(c *gin.Context, msg string, err error) {
	var invalid *ValidationError
	switch {
	case errors.As(err, &invalid):
		httpx.Error(c, http.StatusBadRequest, invalid.Message)
	case errors.Is(err, ErrNotFound):
		httpx.Error(c, http.StatusNotFound, "post not found")
	case errors.Is(err, ErrSlugTaken):
		httpx.Error(c, http.StatusConflict, ErrSlugTaken.Error())
	default:
		httpx.InternalError(c, h.log, msg, err)
	}
}

func toAdminDetail(p *Post) AdminDetail {
	return AdminDetail{AdminSummary: toAdminSummary(p), Content: p.Content}
}

// queryParam reads a free-text query parameter, trimmed and length-capped.
func queryParam(c *gin.Context, key string) string {
	value := strings.ToValidUTF8(strings.TrimSpace(c.Query(key)), "")
	if runes := []rune(value); len(runes) > maxQueryLength {
		value = string(runes[:maxQueryLength])
	}
	return value
}
