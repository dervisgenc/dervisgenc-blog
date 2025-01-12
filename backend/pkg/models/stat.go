package models

import "time"

// Stat struct
type Stat struct {
	ID        uint       `json:"id" gorm:"primarykey"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty" gorm:"index"`

	PostID     int       `json:"post_id" gorm:"not null;uniqueIndex"`
	Views      int       `json:"views" gorm:"default:0"`
	Likes      int       `json:"likes" gorm:"default:0"`
	Shares     int       `json:"shares" gorm:"default:0"`
	LastViewed time.Time `json:"last_viewed"`
	Post       Post      `json:"post" gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE"`
}
