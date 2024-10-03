package models

import "time"

// Stat struct
type Stat struct {
	ID        uint       `json:"id" example:"1"`                            // gorm.Model'den
	CreatedAt time.Time  `json:"created_at" example:"2024-10-01T00:00:00Z"` // gorm.Model'den
	UpdatedAt time.Time  `json:"updated_at" example:"2024-10-01T01:00:00Z"` // gorm.Model'den
	DeletedAt *time.Time `json:"deleted_at,omitempty"`                      // gorm.Model'den

	PostID     int  `gorm:"type:integer;not null" json:"post_id" example:"1"`
	Views      int  `gorm:"type:integer" json:"views" example:"100"`
	Likes      int  `gorm:"type:integer" json:"likes" example:"25"`
	Shares     int  `gorm:"type:integer" json:"shares" example:"10"`
	LastViewed int  `gorm:"type:integer" json:"last_viewed" example:"5"`
	Post       Post `gorm:"foreignKey:PostID" json:"post"`
}
