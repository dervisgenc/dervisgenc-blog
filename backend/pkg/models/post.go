package models

import "gorm.io/gorm"

type Post struct {
	gorm.Model
	Title    []string `gorm:"type:char[];not null"`
	Content  string   `gorm:"type:text;not null"`
	Summary  string   `gorm:"type:text"`
	ImageURL []string `gorm:"type:char[]"`
	ReadTime int      `gorm:"type:integer"`
	IsActive bool     `gorm:"type:boolean;default:true"`
}
