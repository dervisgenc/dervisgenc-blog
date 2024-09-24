package models

import "gorm.io/gorm"

type Stat struct {
	gorm.Model
	PostID     int  `gorm:"type:integer;not null"`
	Views      int  `gorm:"type:integer"`
	Likes      int  `gorm:"type:integer"`
	Shares     int  `gorm:"type:integer"`
	LastViewed int  `gorm:"type:integer"`
	Post       Post `gorm:"foreignKey:PostID"`
}
