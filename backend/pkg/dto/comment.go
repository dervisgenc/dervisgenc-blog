package dto

import "time"

// CommentCreateRequest defines the structure for creating a new comment.
type CommentCreateRequest struct {
	AuthorName      string `json:"author_name" binding:"required,min=2,max=100"`
	AuthorEmail     string `json:"author_email" binding:"required,email"`
	Content         string `json:"content" binding:"required,min=1,max=2000"`
	ParentCommentID *uint  `json:"parent_comment_id,omitempty"` // Optional for replies
}

// CommentResponse defines the structure for a comment returned to the public.
type CommentResponse struct {
	ID              uint      `json:"id"`
	CreatedAt       time.Time `json:"created_at"`
	AuthorName      string    `json:"author_name"`
	Content         string    `json:"content"`
	ParentCommentID *uint     `json:"parent_comment_id,omitempty"`
	// Replies    []CommentResponse `json:"replies,omitempty"` // Include if supporting nested replies directly
}

// AdminCommentResponse defines the structure for a comment returned to the admin panel.
type AdminCommentResponse struct {
	ID              uint       `json:"id"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
	PostID          uint       `json:"post_id"`
	AuthorName      string     `json:"author_name"`
	AuthorEmail     string     `json:"author_email"` // Include email
	Content         string     `json:"content"`
	IsApproved      bool       `json:"is_approved"`
	ApprovedAt      *time.Time `json:"approved_at,omitempty"`
	ParentCommentID *uint      `json:"parent_comment_id,omitempty"`
	PostTitle       string     `json:"post_title,omitempty"` // Include post title for context
}
