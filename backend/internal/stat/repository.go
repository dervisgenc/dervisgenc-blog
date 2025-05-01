package stat

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	myerr "github.com/dervisgenc/dervisgenc-blog/backend/pkg"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
	"github.com/sirupsen/logrus" // Import logrus
	"gorm.io/gorm"
	"gorm.io/gorm/clause" // Import clause for ON CONFLICT
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
	GetOverallStats() (*models.OverallStatsResponse, error)
	GetDailyTrafficStats(startDate, endDate time.Time) ([]models.DailyTrafficStat, error) // Add new method signature
}

type statRepository struct {
	db     *gorm.DB
	logger *logrus.Logger // Add logger field
}

// Modify NewStatRepository to accept and store the logger
func NewStatRepository(db *gorm.DB, logger *logrus.Logger) StatRepository {
	return &statRepository{db: db, logger: logger}
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
		return 0, fmt.Errorf("error while counting posts: %w", err)
	}
	return count, nil
}

func (r *statRepository) GetPostsCreatedInLastDays(days int) ([]*models.Post, error) {

	var posts []*models.Post

	startDate := time.Now().AddDate(0, 0, -days)

	if err := r.db.Where("created_at > ?", startDate).Find(&posts).Error; err != nil {
		return nil, fmt.Errorf("error while fetching posts: %w", err)
	}

	return posts, nil
}

func (r *statRepository) RecordVisit(visitor *models.Visitor) error {
	return r.db.Create(visitor).Error
}

func (r *statRepository) RecordPostView(view *models.PostView) error {
	log := r.logger.WithFields(logrus.Fields{
		"post_id":    view.PostID,
		"ip_address": view.IPAddress,
	})
	log.Info("RecordPostView: Starting transaction")

	return r.db.Transaction(func(tx *gorm.DB) error {
		// 1. Insert the individual view record
		log.Info("RecordPostView: Attempting to insert into post_views")
		if err := tx.Create(view).Error; err != nil {
			log.WithError(err).Error("RecordPostView: Failed to insert into post_views")
			// Don't wrap here, let the worker log the specific error
			return fmt.Errorf("failed to insert into post_views: %w", err)
		}
		log.Info("RecordPostView: Successfully inserted into post_views")

		// 2. Increment the views count in the stats table
		log.Info("RecordPostView: Attempting to upsert into stats")
		// Use ON CONFLICT to handle insertion or update
		result := tx.Clauses(clause.OnConflict{
			Columns: []clause.Column{{Name: "post_id"}}, // Conflict on post_id
			DoUpdates: clause.Assignments(map[string]interface{}{ // Update views and updated_at
				"views":       gorm.Expr("stats.views + 1"),
				"updated_at":  time.Now(),
				"last_viewed": time.Now(), // Also update last_viewed time
			}),
		}).Create(&models.Stat{ // Attempt to create with initial values
			PostID:     int(view.PostID),
			Views:      1, // Initial view count if inserting
			Likes:      0, // Default likes
			Shares:     0, // Default shares
			LastViewed: time.Now(),
			// CreatedAt and UpdatedAt are handled by GORM defaults/hooks if set up,
			// or manually set NOW() in the ON CONFLICT clause if needed.
		})

		if result.Error != nil {
			log.WithError(result.Error).Error("RecordPostView: Failed to upsert into stats")
			// Don't wrap here, let the worker log the specific error
			return fmt.Errorf("failed to upsert into stats: %w", result.Error)
		}
		log.WithField("rows_affected", result.RowsAffected).Info("RecordPostView: Successfully upserted into stats")

		log.Info("RecordPostView: Transaction successful")
		return nil // Transaction successful
	})
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
	// Check if post exists first
	var postExists int64
	if err := r.db.Model(&models.Post{}).Where("id = ?", postID).Count(&postExists).Error; err != nil {
		return fmt.Errorf("failed to check post existence: %w", err)
	}
	if postExists == 0 {
		return myerr.WithHTTPStatus(errors.New("post not found"), http.StatusNotFound)
	}

	// Use transaction for upsert logic
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Attempt to insert or update the stats row
		result := tx.Exec(`
            INSERT INTO stats (post_id, shares, created_at, updated_at, views, likes)
            VALUES (?, 1, NOW(), NOW(), 0, 0)
            ON CONFLICT (post_id)
            DO UPDATE SET
                shares = stats.shares + 1,
                updated_at = NOW()
            WHERE stats.post_id = ?
        `, postID, postID) // Pass postID twice for INSERT and WHERE clause

		if result.Error != nil {
			return fmt.Errorf("failed to increment share count: %w", result.Error)
		}
		// No need to check RowsAffected for ON CONFLICT DO UPDATE in this manner usually
		return nil
	})
}

func (r *statRepository) GetDetailedPostStats() (*models.DetailedStatsResponse, error) {
	response := &models.DetailedStatsResponse{}

	// Get total stats from the stats table directly
	err := r.db.Model(&models.Stat{}).Select(
		"COALESCE(SUM(views), 0) as total_views, " +
			"COALESCE(SUM(likes), 0) as total_likes, " +
			"COALESCE(SUM(shares), 0) as total_shares").
		Scan(&response.TotalStats).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get total stats: %v", err)
	}

	// Get individual post stats, joining posts and stats
	// Format created_at directly in the query
	err = r.db.Table("posts").
		Select(
			"posts.id as post_id, " +
				"posts.title, " +
				"COALESCE(stats.views, 0) as views, " +
				"COALESCE(stats.likes, 0) as likes, " +
				"COALESCE(stats.shares, 0) as shares, " +
				"to_char(posts.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at"). // Format date here
		Joins("LEFT JOIN stats ON posts.id = stats.post_id").
		Where("posts.deleted_at IS NULL"). // Fetch all posts, not just active, for admin view
		Order("posts.created_at DESC").
		Scan(&response.PostStats).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get post stats: %v", err)
	}

	return response, nil
}

// GetOverallStats calculates total posts, views, likes, and shares.
func (r *statRepository) GetOverallStats() (*models.OverallStatsResponse, error) {
	var stats models.OverallStatsResponse

	// Get total active posts
	err := r.db.Model(&models.Post{}).Where("deleted_at IS NULL").Count(&stats.TotalPosts).Error
	if err != nil {
		return nil, fmt.Errorf("failed to count posts: %w", err)
	}

	// Get total views, likes, shares from stats table
	// Assuming 'stats' table holds the aggregated counts per post
	var totals struct {
		TotalViews  int64
		TotalLikes  int64
		TotalShares int64
	}
	err = r.db.Model(&models.Stat{}).Select(
		"COALESCE(SUM(views), 0) as total_views, " +
			"COALESCE(SUM(likes), 0) as total_likes, " +
			"COALESCE(SUM(shares), 0) as total_shares").
		Scan(&totals).Error
	if err != nil {
		return nil, fmt.Errorf("failed to sum stats: %w", err)
	}

	stats.TotalViews = totals.TotalViews
	stats.TotalLikes = totals.TotalLikes
	stats.TotalShares = totals.TotalShares

	// Add calculation for other stats like comments if needed

	return &stats, nil
}

// GetDailyTrafficStats retrieves daily views and unique visitors within a date range.
func (r *statRepository) GetDailyTrafficStats(startDate, endDate time.Time) ([]models.DailyTrafficStat, error) {
	var results []models.DailyTrafficStat

	// Query to get daily views and unique visitors
	// Ensure post_views and visitors tables have appropriate timestamp columns (e.g., view_time, visit_time)
	// Adjust column names if they are different in your schema.
	err := r.db.Raw(`
        WITH date_series AS (
            SELECT generate_series(?, ?, '1 day'::interval)::date AS day
        ), daily_views AS (
            SELECT
                date_trunc('day', view_time)::date AS day,
                COUNT(*) AS views
            FROM post_views
            WHERE view_time BETWEEN ? AND ?
            GROUP BY day
        ), daily_visitors AS (
            SELECT
                date_trunc('day', visit_time)::date AS day,
                COUNT(DISTINCT ip_address) AS unique_visitors
            FROM visitors
            WHERE visit_time BETWEEN ? AND ?
            GROUP BY day
        )
        SELECT
            to_char(ds.day, 'YYYY-MM-DD') AS date,
            COALESCE(dv.views, 0) AS views,
            COALESCE(dvis.unique_visitors, 0) AS unique_visitors
        FROM date_series ds
        LEFT JOIN daily_views dv ON ds.day = dv.day
        LEFT JOIN daily_visitors dvis ON ds.day = dvis.day
        ORDER BY ds.day ASC;
    `, startDate, endDate, startDate, endDate, startDate, endDate).Scan(&results).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get daily traffic stats: %w", err)
	}

	return results, nil
}
