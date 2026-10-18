// Package httpx holds HTTP helpers shared by the API handlers.
package httpx

import (
	"log/slog"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// ErrorResponse is the body of every non-2xx API response.
type ErrorResponse struct {
	Error string `json:"error"`
}

// Error aborts the request with the given status and message.
func Error(c *gin.Context, status int, message string) {
	c.AbortWithStatusJSON(status, ErrorResponse{Error: message})
}

// InternalError logs err and aborts the request with a generic 500, so
// internal details never reach the client.
func InternalError(c *gin.Context, log *slog.Logger, msg string, err error) {
	log.Error(msg, "error", err, "method", c.Request.Method, "path", c.Request.URL.Path)
	Error(c, http.StatusInternalServerError, "internal error")
}

const (
	DefaultPageSize = 9
	MaxPageSize     = 50
)

// PageRequest selects one page of a list.
type PageRequest struct {
	Page     int
	PageSize int
}

// Offset is the number of items before the page.
func (p PageRequest) Offset() int {
	return (p.Page - 1) * p.PageSize
}

// Page is one page of a list.
type Page[T any] struct {
	Items      []T   `json:"items"`
	Page       int   `json:"page"`
	PageSize   int   `json:"page_size"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

// NewPage wraps items with the pagination metadata of req.
func NewPage[T any](items []T, req PageRequest, total int64) Page[T] {
	if items == nil {
		items = []T{}
	}
	pages := int((total + int64(req.PageSize) - 1) / int64(req.PageSize))
	return Page[T]{Items: items, Page: req.Page, PageSize: req.PageSize, Total: total, TotalPages: pages}
}

// ParsePage reads the page and page_size query parameters, falling back to
// the defaults for missing or invalid values.
func ParsePage(c *gin.Context) PageRequest {
	return PageRequest{
		Page:     QueryInt(c, "page", 1, 1, 1<<20),
		PageSize: QueryInt(c, "page_size", DefaultPageSize, 1, MaxPageSize),
	}
}

// QueryInt reads an integer query parameter clamped to [min, max].
func QueryInt(c *gin.Context, key string, fallback, min, max int) int {
	value, err := strconv.Atoi(c.Query(key))
	if err != nil {
		return fallback
	}
	return clamp(value, min, max)
}

// ParamID reads a positive integer path parameter. It responds with 404 and
// returns false when the parameter is not one.
func ParamID(c *gin.Context, key string) (uint, bool) {
	id, err := strconv.ParseUint(c.Param(key), 10, 32)
	if err != nil || id == 0 {
		Error(c, http.StatusNotFound, "not found")
		return 0, false
	}
	return uint(id), true
}

func clamp(value, min, max int) int {
	if value < min {
		return min
	}
	if value > max {
		return max
	}
	return value
}
