// Package media stores images uploaded from the admin panel and serves them.
//
// Every upload is decoded and re-encoded: this strips metadata such as GPS
// coordinates, bounds the stored size and guarantees that only real JPEG or
// PNG images are ever served, whatever the client claimed to send.
package media

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"net/http"
	"os"
	"path/filepath"

	// Register the decoders for the accepted formats.
	_ "image/gif"

	"golang.org/x/image/draw"
	_ "golang.org/x/image/webp"
)

const (
	// MaxWidth is the widest image stored; larger uploads are scaled down.
	MaxWidth = 2000
	// maxPixels rejects decompression bombs before decoding them.
	maxPixels   = 50_000_000
	jpegQuality = 85
)

// ErrUnsupported is returned for files that are not an accepted image.
var ErrUnsupported = errors.New("file must be a JPEG, PNG, GIF or WebP image")

var acceptedTypes = map[string]bool{
	"image/jpeg": true, "image/png": true, "image/gif": true, "image/webp": true,
}

// Image is a stored image.
type Image struct {
	Name   string
	Width  int
	Height int
}

// Store keeps images on the local filesystem.
type Store struct {
	dir string
}

// NewStore creates dir if needed and returns a store writing into it.
func NewStore(dir string) (*Store, error) {
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, fmt.Errorf("create upload directory: %w", err)
	}
	return &Store{dir: dir}, nil
}

// Save validates and normalises the image read from r and stores it under
// a random name.
func (s *Store) Save(r io.Reader) (Image, error) {
	data, err := io.ReadAll(r)
	if err != nil {
		return Image{}, err
	}
	if !acceptedTypes[http.DetectContentType(data)] {
		return Image{}, ErrUnsupported
	}

	cfg, _, err := image.DecodeConfig(bytes.NewReader(data))
	if err != nil || cfg.Width <= 0 || cfg.Height <= 0 {
		return Image{}, ErrUnsupported
	}
	if cfg.Width*cfg.Height > maxPixels {
		return Image{}, fmt.Errorf("image is larger than %d megapixels", maxPixels/1_000_000)
	}
	img, _, err := image.Decode(bytes.NewReader(data))
	if err != nil {
		return Image{}, ErrUnsupported
	}

	img = fit(img, MaxWidth)
	encoded, ext, err := encode(img)
	if err != nil {
		return Image{}, err
	}

	name, err := randomName(ext)
	if err != nil {
		return Image{}, err
	}
	if err := s.write(name, encoded); err != nil {
		return Image{}, err
	}
	b := img.Bounds()
	return Image{Name: name, Width: b.Dx(), Height: b.Dy()}, nil
}

// Path returns the file path of a stored image.
func (s *Store) Path(name string) string {
	return filepath.Join(s.dir, filepath.Base(name))
}

// write stores data atomically, so readers never see a partial file.
func (s *Store) write(name string, data []byte) error {
	tmp, err := os.CreateTemp(s.dir, ".upload-*")
	if err != nil {
		return fmt.Errorf("create temp file: %w", err)
	}
	defer os.Remove(tmp.Name())

	if _, err := tmp.Write(data); err != nil {
		tmp.Close()
		return fmt.Errorf("write image: %w", err)
	}
	if err := tmp.Chmod(0o644); err != nil {
		tmp.Close()
		return err
	}
	if err := tmp.Close(); err != nil {
		return err
	}
	return os.Rename(tmp.Name(), s.Path(name))
}

// fit scales img down to maxWidth, keeping its aspect ratio.
func fit(img image.Image, maxWidth int) image.Image {
	b := img.Bounds()
	if b.Dx() <= maxWidth {
		return img
	}
	height := max(1, b.Dy()*maxWidth/b.Dx())
	dst := image.NewRGBA(image.Rect(0, 0, maxWidth, height))
	draw.CatmullRom.Scale(dst, dst.Bounds(), img, b, draw.Over, nil)
	return dst
}

// encode writes opaque images as JPEG and images with transparency as PNG.
func encode(img image.Image) ([]byte, string, error) {
	var buf bytes.Buffer
	if opaque, ok := img.(interface{ Opaque() bool }); ok && !opaque.Opaque() {
		if err := png.Encode(&buf, img); err != nil {
			return nil, "", fmt.Errorf("encode png: %w", err)
		}
		return buf.Bytes(), ".png", nil
	}
	if err := jpeg.Encode(&buf, img, &jpeg.Options{Quality: jpegQuality}); err != nil {
		return nil, "", fmt.Errorf("encode jpeg: %w", err)
	}
	return buf.Bytes(), ".jpg", nil
}

func randomName(ext string) (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b) + ext, nil
}
