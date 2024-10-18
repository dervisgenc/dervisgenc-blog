package models

import "time"

// Post struct
type Post struct {
	ID        uint       `json:"id" example:"1"`                            // gorm.Model'den
	CreatedAt time.Time  `json:"created_at" example:"2024-10-01T00:00:00Z"` // gorm.Model'den
	UpdatedAt time.Time  `json:"updated_at" example:"2024-10-01T01:00:00Z"` // gorm.Model'den
	DeletedAt *time.Time `json:"deleted_at,omitempty"`                      // gorm.Model'den
	Title     string     `gorm:"type:varchar(200);not null" json:"title" example:"Sample Post"`
	Content   string     `gorm:"type:text;not null" json:"content" example:"This is the content of the post"`
	Summary   string     `gorm:"type:text" json:"summary" example:"This is a summary"`
	ImageURL  string     `gorm:"type:varchar(255)" json:"image_url" example:"http://example.com/image.jpg"`
	ReadTime  int        `gorm:"type:integer" json:"read_time" example:"5"`
	IsActive  bool       `gorm:"type:boolean;default:true" json:"is_active" example:"true"`
}
