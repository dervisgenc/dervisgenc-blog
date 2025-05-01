package models

import (
	"time"

	"gorm.io/gorm"
)

// Comment struct represents a comment on a post.
type Comment struct {
	ID              uint           `json:"id" gorm:"primarykey"`
	CreatedAt       time.Time      `json:"created_at" gorm:"index"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"` // Use json:"-" to hide in default responses
	PostID          uint           `json:"post_id" gorm:"not null;index"`
	AuthorName      string         `json:"author_name" gorm:"type:varchar(100);not null"`
	AuthorEmail     string         `json:"-" gorm:"type:varchar(100);not null"` // Hide email by default
	Content         string         `json:"content" gorm:"type:text;not null"`
	IsApproved      bool           `json:"is_approved" gorm:"default:false;index"`
	ApprovedAt      *time.Time     `json:"approved_at,omitempty"`
	ParentCommentID *uint          `json:"parent_comment_id,omitempty" gorm:"index"` // For nested comments

	// Relations (optional but recommended)
	Post Post `json:"-" gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE"` // Ensures comment deletion if post is deleted
	// ParentComment *Comment `json:"-" gorm:"foreignKey:ParentCommentID"`
	// Replies     []Comment `json:"replies,omitempty" gorm:"foreignKey:ParentCommentID"` // For eager loading replies
}

// AdminComment includes fields hidden in the default Comment struct.
type AdminComment struct {
	Comment
	AuthorEmail string `json:"author_email"` // Expose email for admin
}
