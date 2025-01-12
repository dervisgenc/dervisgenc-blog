package stat

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	myerr "github.com/dervisgenc/dervisgenc-blog/backend/pkg"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
	"gorm.io/gorm"
)

type StatRepository interface {
	GetPostStats(uint) (*models.PostDetailedResponse, error)
	GetAllPostsStats() ([]*models.PostStats, error)
	CountPosts() (int64, error)
	GetPostsCreatedInLastDays(days int) ([]*models.Post, error)
	RecordVisit(visitor *models.Visitor) error
	RecordPostView(view *models.PostView) error
	UpdateDailyStats(stat *models.DailyStat) error
	GetVisitorStats(startDate, endDate time.Time) (*models.StatsResponse, error)
	IncrementShareCount(postID uint) error
	GetDetailedPostStats() (*models.DetailedStatsResponse, error)
}

type statRepository struct {
	db *gorm.DB
}

func NewStatRepository(db *gorm.DB) StatRepository {
	return &statRepository{db: db}
}

// Add this temporary struct for scanning base stats
type postBasicStats struct {
	PostID    uint      `json:"post_id"`
	Title     string    `json:"title"`
	CreatedAt time.Time `json:"created_at"`
	ReadTime  int       `json:"read_time"`
	Views     int       `json:"views"`
	Likes     int       `json:"likes"`
	Shares    int       `json:"shares"`
}

func (r *statRepository) GetPostStats(postID uint) (*models.PostDetailedResponse, error) {
	// First get basic post stats
	var basicStats postBasicStats
	err := r.db.Raw(`
        SELECT 
            p.id as post_id,
            p.title,
            p.created_at,
            p.read_time,
            COALESCE(s.views, 0) as views,
            COALESCE(s.likes, 0) as likes,
            COALESCE(s.shares, 0) as shares
        FROM posts p
        LEFT JOIN stats s ON p.id = s.post_id
        WHERE p.id = ?
    `, postID).Scan(&basicStats).Error
	if err != nil {
		return nil, myerr.WithHTTPStatus(
			err,
			http.StatusInternalServerError,
		)
	}

	// Then get monthly stats
	var monthlyStats []models.MonthlyStats
	err = r.db.Raw(`
        WITH months AS (
            SELECT generate_series(
                date_trunc('month', (SELECT created_at FROM posts WHERE id = ?)),
                date_trunc('month', CURRENT_DATE),
                '1 month'::interval
            ) as month
        )
        SELECT 
            to_char(m.month, 'YYYY-MM') as month,
            COUNT(DISTINCT pv.id) as views,
            COUNT(DISTINCT pl.id) as likes,
            COALESCE(COUNT(DISTINCT ps.id), 0) as shares
        FROM months m
        LEFT JOIN post_views pv ON pv.post_id = ? 
            AND date_trunc('month', pv.view_time) = m.month
        LEFT JOIN post_likes pl ON pl.post_id = ? 
            AND date_trunc('month', pl.created_at) = m.month
        LEFT JOIN stats ps ON ps.post_id = ? 
            AND date_trunc('month', ps.created_at) = m.month
        GROUP BY m.month
        ORDER BY m.month
    `, postID, postID, postID, postID).Scan(&monthlyStats).Error

	if err != nil {
		return nil, myerr.WithHTTPStatus(
			err,
			http.StatusInternalServerError,
		)
	}

	// Combine the results
	return &models.PostDetailedResponse{
		PostID:       basicStats.PostID,
		Title:        basicStats.Title,
		CreatedAt:    basicStats.CreatedAt,
		ReadTime:     basicStats.ReadTime,
		Views:        basicStats.Views,
		Likes:        basicStats.Likes,
		Shares:       basicStats.Shares,
		MonthlyStats: monthlyStats,
	}, nil
}

func (r *statRepository) GetAllPostsStats() ([]*models.PostStats, error) {

	var postStats []*models.PostStats

	if err := r.db.Table("posts").Select("posts.id, posts.title, stats.views, stats.likes, stats.shares").
		Joins("LEFT JOIN stats ON posts.id = stats.post_id").Find(&postStats).Error; err != nil {
		return nil, myerr.WithHTTPStatus(
			err,
			http.StatusInternalServerError,
		)
	}
	return postStats, nil
}

func (r *statRepository) CountPosts() (int64, error) {
	var count int64
	if err := r.db.Model(&models.Post{}).Where("is_active = ?", true).Count(&count).Error; err != nil {
		return 0, errors.New("error while counting posts")
	}
	return count, nil
}

func (r *statRepository) GetPostsCreatedInLastDays(days int) ([]*models.Post, error) {

	var posts []*models.Post

	startDate := time.Now().AddDate(0, 0, -days)

	if err := r.db.Where("created_at > ?", startDate).Find(&posts).Error; err != nil {
		return nil, errors.New("error while fetching posts")
	}

	return posts, nil
}

func (r *statRepository) RecordVisit(visitor *models.Visitor) error {
	return r.db.Create(visitor).Error
}

func (r *statRepository) RecordPostView(view *models.PostView) error {
	return r.db.Create(view).Error
}

func (r *statRepository) UpdateDailyStats(stat *models.DailyStat) error {
	return r.db.Save(stat).Error
}

func (r *statRepository) GetVisitorStats(startDate, endDate time.Time) (*models.StatsResponse, error) {
	stats := &models.StatsResponse{
		VisitorsByHour: make(map[int]int64),
		TopReferrers:   make(map[string]int64),
		BrowserStats:   make(map[string]int64),
	}

	var totalVisits, uniqueVisitors int64

	// Get total visits
	if err := r.db.Model(&models.Visitor{}).Count(&totalVisits).Error; err != nil {
		return nil, err
	}
	stats.TotalVisits = totalVisits

	// Get unique visitors
	if err := r.db.Model(&models.Visitor{}).Distinct("ip_address").Count(&uniqueVisitors).Error; err != nil {
		return nil, err
	}
	stats.UniqueVisitors = uniqueVisitors

	// Get daily stats
	if err := r.db.Where("date BETWEEN ? AND ?", startDate, endDate).
		Order("date desc").
		Find(&stats.DailyStats).Error; err != nil {
		return nil, err
	}

	// Get popular posts
	if err := r.db.Table("posts").
		Select("posts.id, posts.title, COUNT(post_views.id) as views, COUNT(post_likes.id) as likes").
		Joins("LEFT JOIN post_views ON posts.id = post_views.post_id").
		Joins("LEFT JOIN post_likes ON posts.id = post_likes.post_id").
		Group("posts.id").
		Order("views DESC").
		Limit(10).
		Find(&stats.PopularPosts).Error; err != nil {
		return nil, err
	}

	return stats, nil
}

func (r *statRepository) IncrementShareCount(postID uint) error {
	return r.db.Exec(`
        INSERT INTO stats (post_id, shares, created_at, updated_at)
        VALUES (?, 1, NOW(), NOW())
        ON CONFLICT (post_id)
        DO UPDATE SET shares = stats.shares + 1, updated_at = NOW()
    `, postID).Error
}

func (r *statRepository) GetDetailedPostStats() (*models.DetailedStatsResponse, error) {
	response := &models.DetailedStatsResponse{}

	// Get total stats
	err := r.db.Model(&models.Stat{}).Select(
		"COALESCE(SUM(views), 0) as total_views, " +
			"COALESCE(SUM(likes), 0) as total_likes, " +
			"COALESCE(SUM(shares), 0) as total_shares").
		Scan(&response.TotalStats).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get total stats: %v", err)
	}

	// Get individual post stats
	err = r.db.Table("posts").
		Select(
			"posts.id as post_id, "+
				"posts.title, "+
				"COALESCE(stats.views, 0) as views, "+
				"COALESCE(stats.likes, 0) as likes, "+
				"COALESCE(stats.shares, 0) as shares, "+
				"posts.created_at").
		Joins("LEFT JOIN stats ON posts.id = stats.post_id").
		Where("posts.is_active = ?", true).
		Order("posts.created_at DESC").
		Scan(&response.PostStats).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get post stats: %v", err)
	}

	return response, nil
}
