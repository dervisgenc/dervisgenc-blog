package dto

import (
	"time"

	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
)

// PostResponse represents the API response for a post
type PostResponse struct {
	ID        uint      `json:"id"`
	Title     string    `json:"title"`
	Summary   string    `json:"summary"`
	Content   string    `json:"content,omitempty"`
	ImageURL  string    `json:"image_url"`
	ReadTime  int       `json:"read_time"`
	LikeCount int       `json:"like_count"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	Category  string    `json:"category,omitempty"` // Added Category
	Tags      string    `json:"tags,omitempty"`     // Added Tags
}

// PostCreateRequest represents the request to create a post
type PostCreateRequest struct {
	Title       string `json:"title" binding:"required"`
	Content     string `json:"content" binding:"required"`
	Description string `json:"description"` // Frontend sends 'description', maps to 'Summary'
	ReadTime    int    `json:"readTime"`    // Frontend sends 'readTime', maps to 'ReadTime'
	IsActive    bool   `json:"isActive"`    // Frontend sends 'isActive', maps to 'IsActive'
	ImageURL    string `json:"imageUrl"`    // Frontend sends 'imageUrl', maps to 'ImageURL'
	Category    string `json:"category"`    // Added Category
	Tags        string `json:"tags"`        // Added Tags (comma-separated string)
}

// PostUpdateRequest represents the request to update a post
type PostUpdateRequest struct {
	Title       string `json:"title" binding:"required"`
	Content     string `json:"content" binding:"required"`
	Description string `json:"description"` // Frontend sends 'description', maps to 'Summary'
	ReadTime    int    `json:"readTime"`    // Frontend sends 'readTime', maps to 'ReadTime'
	IsActive    bool   `json:"isActive"`    // Frontend sends 'isActive', maps to 'IsActive'
	ImageURL    string `json:"imageUrl"`    // Frontend sends 'imageUrl', maps to 'ImageURL'
	Category    string `json:"category"`    // Added Category
	Tags        string `json:"tags"`        // Added Tags (comma-separated string)
}

type PostListResponse struct {
	ID        uint      `json:"id"`
	Title     string    `json:"title"`
	Summary   string    `json:"summary"`
	ImageURL  string    `json:"image_url"`
	ReadTime  int       `json:"read_time"`
	LikeCount int       `json:"like_count"`
	IsActive  bool      `json:"is_active"` // Added IsActive
	CreatedAt time.Time `json:"created_at"`
	Category  string    `json:"category,omitempty"` // Added Category
	Tags      string    `json:"tags,omitempty"`     // Added Tags
}

type PostDetailResponse struct {
	ID        uint      `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Summary   string    `json:"summary"`
	ImageURL  string    `json:"image_url"`
	ReadTime  int       `json:"read_time"`
	LikeCount int       `json:"like_count"`
	IsActive  bool      `json:"is_active"` // Added IsActive
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`         // Added UpdatedAt
	Category  string    `json:"category,omitempty"` // Added Category
	Tags      string    `json:"tags,omitempty"`     // Added Tags
}

type PaginatedPostResponse struct {
	Posts      []PostListResponse `json:"posts"`
	TotalPosts int64              `json:"total_posts"`
	Page       int                `json:"current_page"`
	PageSize   int                `json:"page_size"`
	TotalPages int                `json:"total_pages"`
}

// Converter functions
func ToPostListResponse(post *models.Post) PostListResponse {
	return PostListResponse{
		ID:        post.ID,
		Title:     post.Title,
		Summary:   post.Summary,
		ImageURL:  post.ImageURL,
		ReadTime:  post.ReadTime,
		LikeCount: post.LikeCount,
		IsActive:  post.IsActive, // Added IsActive
		CreatedAt: post.CreatedAt,
		Category:  post.Category, // Added Category
		Tags:      post.Tags,     // Added Tags
	}
}

func ToPostDetailResponse(post *models.Post) PostDetailResponse {
	return PostDetailResponse{
		ID:        post.ID,
		Title:     post.Title,
		Content:   post.Content,
		Summary:   post.Summary,
		ImageURL:  post.ImageURL,
		ReadTime:  post.ReadTime,
		LikeCount: post.LikeCount,
		IsActive:  post.IsActive, // Added IsActive
		CreatedAt: post.CreatedAt,
		UpdatedAt: post.UpdatedAt, // Added UpdatedAt
		Category:  post.Category,  // Added Category
		Tags:      post.Tags,      // Added Tags
	}
}

func ToPostListResponses(posts []*models.Post) []PostListResponse {
	responses := make([]PostListResponse, len(posts))
	for i, post := range posts {
		responses[i] = ToPostListResponse(post)
	}
	return responses
}
