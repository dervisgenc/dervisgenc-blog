// Package auth authenticates the blog's admins and protects the admin API.
package auth

import "time"

// Admin is a user allowed to access the admin panel.
type Admin struct {
	ID           uint   `gorm:"primaryKey"`
	Username     string `gorm:"size:64;not null;uniqueIndex"`
	PasswordHash string `gorm:"size:255;not null"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
