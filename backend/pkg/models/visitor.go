package models

import "time"

type Visitor struct {
	ID        uint      `json:"id" gorm:"primarykey"`
	IPAddress string    `json:"ip_address" gorm:"type:inet;not null;index"`
	UserAgent string    `json:"user_agent" gorm:"type:varchar(255);index"`
	Referrer  string    `json:"referrer" gorm:"type:varchar(255);index"`
	VisitTime time.Time `json:"visit_time" gorm:"index"`
	Path      string    `json:"path" gorm:"type:varchar(255);index"`
}

type PostView struct {
	ID        uint      `json:"id" gorm:"primarykey"`
	PostID    uint      `json:"post_id" gorm:"not null;index;constraint:OnDelete:CASCADE"`
	Post      Post      `json:"post" gorm:"foreignKey:PostID;references:ID"`
	IPAddress string    `json:"ip_address" gorm:"type:inet;not null;index"`
	UserAgent string    `json:"user_agent" gorm:"type:varchar(255)"`
	ViewTime  time.Time `json:"view_time" gorm:"index"`
}

type PostShare struct {
	ID        uint      `json:"id" gorm:"primarykey"`
	PostID    uint      `json:"post_id" gorm:"not null;index;constraint:OnDelete:CASCADE"`
	Post      Post      `json:"post" gorm:"foreignKey:PostID;references:ID"`
	IPAddress string    `json:"ip_address" gorm:"type:inet;not null;index"`
	CreatedAt time.Time `json:"created_at"`
}

type DailyStat struct {
	ID             uint      `json:"id"`
	Date           time.Time `json:"date" gorm:"type:date;unique"`
	TotalVisits    int       `json:"total_visits"`
	UniqueVisitors int       `json:"unique_visitors"`
	TotalPostViews int       `json:"total_post_views"`
	TotalLikes     int       `json:"total_likes"`
	TotalShares    int       `json:"total_shares"`
}

type StatsResponse struct {
	TotalVisits    int64            `json:"total_visits"`
	UniqueVisitors int64            `json:"unique_visitors"`
	TotalPostViews int64            `json:"total_post_views"`
	TotalLikes     int64            `json:"total_likes"`
	TotalShares    int64            `json:"total_shares"`
	DailyStats     []DailyStat      `json:"daily_stats"`
	PopularPosts   []PostStats      `json:"popular_posts"`
	VisitorsByHour map[int]int64    `json:"visitors_by_hour"`
	TopReferrers   map[string]int64 `json:"top_referrers"`
	BrowserStats   map[string]int64 `json:"browser_stats"`
}
