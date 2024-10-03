package models

// PostStats struct
type PostStats struct {
	PostID uint   `json:"post_id" example:"1"`
	Title  string `json:"title" example:"Sample Post"`
	Views  int    `json:"views" example:"100"`
	Likes  int    `json:"likes" example:"25"`
	Shares int    `json:"shares" example:"10"`
}
