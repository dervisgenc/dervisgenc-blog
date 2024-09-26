package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Username     string `gorm:"type:char[]"`
	Email        string `gorm:"type:char[]"`
	PasswordHash string `gorm:"type:char[];not null"`
}
