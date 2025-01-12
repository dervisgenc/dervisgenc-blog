package image

import (
	"fmt"
	"os"
	"path/filepath"
)

// Storage defines the interface for image storage operations
type Storage interface {
	Save(data []byte, filename string) error
	Delete(filename string) error
	GetURL(filename string) string
}

// LocalStorage implements Storage interface for local filesystem
type LocalStorage struct {
	basePath string
	baseURL  string
}

func NewLocalStorage(basePath, baseURL string) *LocalStorage {
	return &LocalStorage{
		basePath: basePath,
		baseURL:  baseURL,
	}
}

func (s *LocalStorage) Save(data []byte, filename string) error {
	if err := os.MkdirAll(s.basePath, 0755); err != nil {
		return fmt.Errorf("create directory: %w", err)
	}

	path := filepath.Join(s.basePath, filename)
	return os.WriteFile(path, data, 0644)
}

func (s *LocalStorage) Delete(filename string) error {
	if filename == "" {
		return nil
	}
	path := filepath.Join(s.basePath, filename)
	return os.Remove(path)
}

func (s *LocalStorage) GetURL(filename string) string {
	if filename == "" {
		return ""
	}
	return fmt.Sprintf("%s/%s", s.baseURL, filename)
}
