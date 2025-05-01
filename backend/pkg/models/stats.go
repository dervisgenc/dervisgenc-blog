package models

import "time"

// OverallStatsResponse holds the aggregated stats for the dashboard cards.
type OverallStatsResponse struct {
	TotalPosts  int64 `json:"total_posts"`
	TotalViews  int64 `json:"total_views"`
	TotalLikes  int64 `json:"total_likes"`
	TotalShares int64 `json:"total_shares"`
	// Add other overall stats if needed, e.g., TotalComments
}

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
	CreatedAt string `json:"created_at"` // Use string for frontend compatibility
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

// DailyTrafficStat holds aggregated views and unique visitors for a specific day.
type DailyTrafficStat struct {
	Date           string `json:"date"` // Format YYYY-MM-DD
	Views          int    `json:"views"`
	UniqueVisitors int    `json:"unique_visitors"`
}
