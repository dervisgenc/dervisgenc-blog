package models

import "time"

// User struct
type User struct {
	ID           uint       `json:"id" example:"1"`                            // gorm.Model'den
	CreatedAt    time.Time  `json:"created_at" example:"2024-10-01T00:00:00Z"` // gorm.Model'den
	UpdatedAt    time.Time  `json:"updated_at" example:"2024-10-01T01:00:00Z"` // gorm.Model'den
	DeletedAt    *time.Time `json:"deleted_at,omitempty"`                      // gorm.Model'den
	Username     string     `gorm:"type:varchar(50)" json:"username" example:"john_doe"`
	Email        string     `gorm:"type:varchar(100)" json:"email" example:"john@example.com"`
	PasswordHash string     `gorm:"type:varchar(255);not null" json:"password_hash"`
}
