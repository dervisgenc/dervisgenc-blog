package models

import "time"

type DetailedStatsResponse struct {
	TotalStats struct {
		TotalViews  int64 `json:"total_views"`
		TotalLikes  int64 `json:"total_likes"`
		TotalShares int64 `json:"total_shares"`
	} `json:"total_stats"`
	PostStats []PostDetailedStats `json:"post_stats"`
}

type PostDetailedStats struct {
	PostID    uint   `json:"post_id"`
	Title     string `json:"title"`
	Views     int    `json:"views"`
	Likes     int    `json:"likes"`
	Shares    int    `json:"shares"`
	CreatedAt string `json:"created_at"`
}

type PostDetailedResponse struct {
	PostID       uint           `json:"post_id"`
	Title        string         `json:"title"`
	CreatedAt    time.Time      `json:"created_at"`
	ReadTime     int            `json:"read_time"`
	Views        int            `json:"views"`
	Likes        int            `json:"likes"`
	Shares       int            `json:"shares"`
	MonthlyStats []MonthlyStats `json:"monthly_stats"`
}

type MonthlyStats struct {
	Month  string `json:"month"`
	Views  int    `json:"views"`
	Likes  int    `json:"likes"`
	Shares int    `json:"shares"`
}
