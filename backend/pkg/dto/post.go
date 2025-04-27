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
}

// PostCreateRequest represents the request to create a post
type PostCreateRequest struct {
	Title       string `json:"title" binding:"required"`
	Content     string `json:"content" binding:"required"`
	Description string `json:"description"` // Renamed from Summary to match frontend payload
	ReadTime    int    `json:"readTime"`    // Match frontend payload casing
	IsActive    bool   `json:"isActive"`    // Match frontend payload casing
	ImageURL    string `json:"imageUrl"`    // Add ImageUrl field
}

// PostUpdateRequest represents the request to update a post
type PostUpdateRequest struct {
	Title       string `json:"title" binding:"required"`
	Content     string `json:"content" binding:"required"`
	Description string `json:"description"`
	ReadTime    int    `json:"readTime"`
	IsActive    bool   `json:"isActive"`
	ImageURL    string `json:"imageUrl"` // Add ImageUrl field
}

type PostListResponse struct {
	ID        uint      `json:"id"`
	Title     string    `json:"title"`
	Summary   string    `json:"summary"`
	ImageURL  string    `json:"image_url"`
	ReadTime  int       `json:"read_time"`
	LikeCount int       `json:"like_count"`
	CreatedAt time.Time `json:"created_at"`
}

type PostDetailResponse struct {
	ID        uint      `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Summary   string    `json:"summary"`
	ImageURL  string    `json:"image_url"`
	ReadTime  int       `json:"read_time"`
	LikeCount int       `json:"like_count"`
	CreatedAt time.Time `json:"created_at"`
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
		CreatedAt: post.CreatedAt,
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
		CreatedAt: post.CreatedAt,
	}
}

func ToPostListResponses(posts []*models.Post) []PostListResponse {
	responses := make([]PostListResponse, len(posts))
	for i, post := range posts {
		responses[i] = ToPostListResponse(post)
	}
	return responses
}
