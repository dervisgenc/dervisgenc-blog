package image

import (
	"fmt"
	"net/http"

	myerr "github.com/dervisgenc/dervisgenc-blog/backend/pkg"
	"github.com/gin-gonic/gin"
)

type ImageHandler struct {
	service *Service
}

func NewImageHandler(service *Service) *ImageHandler {
	return &ImageHandler{
		service: service,
	}
}

// UploadImage godoc
// @Summary Upload an image
// @Description Uploads and processes an image, returning its URL
// @Tags Images
// @Accept multipart/form-data
// @Produce json
// @Param image formData file true "Image file to upload"
// @Success 200 {object} map[string]string "url"
// @Failure 400 {object} myerr.ErrorResponse "Bad Request (e.g., no file, invalid file type)"
// @Failure 500 {object} myerr.ErrorResponse "Internal Server Error"
// @Router /admin/images/upload [post]
func (h *ImageHandler) UploadImage(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.Error(myerr.WithHTTPStatus(fmt.Errorf("failed to get image from form: %w", err), http.StatusBadRequest))
		return
	}

	filename, err := h.service.SaveImage(file)
	if err != nil {
		// Handle specific errors if needed, e.g., unsupported type
		c.Error(myerr.WithHTTPStatus(fmt.Errorf("failed to save image: %w", err), http.StatusInternalServerError))
		return
	}

	imageURL := h.service.GetImageURL(filename)

	c.JSON(http.StatusOK, gin.H{"url": imageURL, "filename": filename})
}
