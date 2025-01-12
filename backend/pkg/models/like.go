package models

import "time"

type PostLike struct {
	ID               uint      `json:"id" gorm:"primarykey"`
	PostID           uint      `json:"post_id" gorm:"not null;index;constraint:OnDelete:CASCADE"`
	Post             Post      `json:"post" gorm:"foreignKey:PostID;references:ID"`
	IPAddress        string    `json:"ip_address" gorm:"type:inet;not null;index"`
	CreatedAt        time.Time `json:"created_at" gorm:"index"`
	UpdatedAt        time.Time `json:"updated_at"`
	UniqueConstraint string    `gorm:"uniqueIndex:idx_post_ip;type:varchar(255)"`
}

type LikeResponse struct {
	Success bool `json:"success"`
	Likes   int  `json:"likes"`
}
