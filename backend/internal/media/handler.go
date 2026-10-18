package media

import (
	"errors"
	"log/slog"
	"net/http"
	"os"
	"regexp"

	"github.com/dervisgenc/dervisgenc-blog/backend/internal/httpx"
	"github.com/gin-gonic/gin"
)

// URLPrefix is the path stored images are served under.
const URLPrefix = "/api/uploads/"

// fileName matches names of stored images, including those uploaded by the
// previous version of the blog.
var fileName = regexp.MustCompile(`^[A-Za-z0-9_-]+\.(jpg|jpeg|png|gif|webp)$`)

// Handler serves image uploads and downloads.
type Handler struct {
	store    *Store
	maxBytes int64
	log      *slog.Logger
}

func NewHandler(store *Store, maxBytes int64, log *slog.Logger) *Handler {
	return &Handler{store: store, maxBytes: maxBytes, log: log}
}

type uploadResponse struct {
	URL    string `json:"url"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
}

// Upload serves POST /api/admin/uploads.
func (h *Handler) Upload(c *gin.Context) {
	// Leave room for the multipart framing around the file.
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, h.maxBytes+64<<10)

	header, err := c.FormFile("file")
	if err != nil {
		var tooLarge *http.MaxBytesError
		if errors.As(err, &tooLarge) {
			httpx.Error(c, http.StatusRequestEntityTooLarge, "image is too large")
			return
		}
		httpx.Error(c, http.StatusBadRequest, "multipart field \"file\" is required")
		return
	}
	if header.Size > h.maxBytes {
		httpx.Error(c, http.StatusRequestEntityTooLarge, "image is too large")
		return
	}

	file, err := header.Open()
	if err != nil {
		httpx.InternalError(c, h.log, "open upload", err)
		return
	}
	defer file.Close()

	img, err := h.store.Save(file)
	switch {
	case errors.Is(err, ErrUnsupported):
		httpx.Error(c, http.StatusUnsupportedMediaType, err.Error())
		return
	case err != nil:
		h.log.Warn("image rejected", "error", err)
		httpx.Error(c, http.StatusBadRequest, "image could not be processed")
		return
	}

	h.log.Info("image uploaded", "name", img.Name, "width", img.Width, "height", img.Height)
	c.JSON(http.StatusCreated, uploadResponse{URL: URLPrefix + img.Name, Width: img.Width, Height: img.Height})
}

// Serve serves GET /api/uploads/:name. Names are random, so files never
// change and can be cached forever.
func (h *Handler) Serve(c *gin.Context) {
	name := c.Param("name")
	if !fileName.MatchString(name) {
		httpx.Error(c, http.StatusNotFound, "not found")
		return
	}
	path := h.store.Path(name)
	if _, err := os.Stat(path); err != nil {
		httpx.Error(c, http.StatusNotFound, "not found")
		return
	}

	c.Header("Cache-Control", "public, max-age=31536000, immutable")
	c.Header("Content-Security-Policy", "default-src 'none'; sandbox")
	c.File(path)
}
