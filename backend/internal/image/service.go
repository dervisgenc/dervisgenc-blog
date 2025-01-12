package image

import (
	"bytes"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"mime/multipart"
	"time"

	"github.com/google/uuid"
	"github.com/nfnt/resize"
)

type ProcessConfig struct {
	MaxWidth     int
	MaxHeight    int
	Quality      int
	AllowedTypes []string
}

type Service struct {
	storage Storage
	config  ProcessConfig
}

func NewService(storage Storage, config ProcessConfig) *Service {
	return &Service{
		storage: storage,
		config:  config,
	}
}

func (s *Service) SaveImage(file *multipart.FileHeader) (string, error) {
	if !s.isAllowedType(file.Header.Get("Content-Type")) {
		return "", fmt.Errorf("unsupported file type")
	}

	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("open file: %w", err)
	}
	defer src.Close()

	// Process image
	processedImage, format, err := s.processImage(src)
	if err != nil {
		return "", fmt.Errorf("process image: %w", err)
	}

	// Generate filename and save
	filename := s.generateFilename(format)
	if err := s.storage.Save(processedImage, filename); err != nil {
		return "", fmt.Errorf("save image: %w", err)
	}

	return filename, nil
}

func (s *Service) DeleteImage(filename string) error {
	return s.storage.Delete(filename)
}

func (s *Service) GetImageURL(filename string) string {
	return s.storage.GetURL(filename)
}

func (s *Service) processImage(src io.Reader) ([]byte, string, error) {
	// Decode image
	img, format, err := image.Decode(src)
	if err != nil {
		return nil, "", err
	}

	// Resize if needed
	if img.Bounds().Dx() > s.config.MaxWidth || img.Bounds().Dy() > s.config.MaxHeight {
		img = resize.Thumbnail(
			uint(s.config.MaxWidth),
			uint(s.config.MaxHeight),
			img,
			resize.Lanczos3,
		)
	}

	// Encode processed image
	buf := new(bytes.Buffer)
	switch format {
	case "jpeg", "jpg":
		err = jpeg.Encode(buf, img, &jpeg.Options{Quality: s.config.Quality})
		format = "jpg"
	case "png":
		err = png.Encode(buf, img)
	default:
		return nil, "", fmt.Errorf("unsupported format: %s", format)
	}

	if err != nil {
		return nil, "", err
	}

	return buf.Bytes(), format, nil
}

func (s *Service) generateFilename(format string) string {
	timestamp := time.Now().Format("20060102")
	unique := uuid.New().String()
	return fmt.Sprintf("%s-%s.%s", timestamp, unique, format)
}

func (s *Service) isAllowedType(mimeType string) bool {
	for _, allowed := range s.config.AllowedTypes {
		if mimeType == allowed {
			return true
		}
	}
	return false
}
