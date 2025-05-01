package models

import "time"

// Post struct
type Post struct {
	ID        uint       `json:"id" example:"1"`
	CreatedAt time.Time  `json:"created_at" example:"2024-10-01T00:00:00Z"`
	UpdatedAt time.Time  `json:"updated_at" example:"2024-10-01T01:00:00Z"`
	DeletedAt *time.Time `gorm:"index" json:"deleted_at,omitempty"` // Added gorm index tag
	Title     string     `gorm:"type:varchar(200);not null;index" json:"title" example:"Sample Post"`
	Content   string     `gorm:"type:text;not null" json:"content" example:"This is the content of the post"`
	Summary   string     `gorm:"type:text" json:"summary" example:"This is a summary"`
	ImagePath string     `gorm:"type:varchar(255)" json:"image_path"`
	ImageURL  string     `gorm:"type:varchar(255)" json:"image_url"`
	ReadTime  int        `gorm:"type:integer" json:"read_time" example:"5"`
	IsActive  bool       `gorm:"type:boolean;index" json:"is_active" example:"false"`
	LikeCount int        `gorm:"type:integer;default:0;index" json:"like_count"`
	Category  string     `gorm:"type:varchar(100);index" json:"category" example:"Technology"` // Added Category
	Tags      string     `gorm:"type:varchar(255);index" json:"tags" example:"go,backend,api"` // Added Tags (comma-separated)
}

// PaginatedPosts represents a paginated response for posts
type PaginatedPosts struct {
	Posts      []*Post `json:"posts"`
	TotalPosts int64   `json:"total_posts"`
	Page       int     `json:"current_page"`
	PageSize   int     `json:"page_size"`
	TotalPages int     `json:"total_pages"`
}
