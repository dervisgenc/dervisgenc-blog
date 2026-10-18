package stats

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/dervisgenc/dervisgenc-blog/backend/internal/post"
	"gorm.io/gorm"
)

// markRetention is how long dedup marks are kept. One extra day covers
// requests that straddle midnight.
const markRetention = 2

// Summary holds the headline numbers of the dashboard.
type Summary struct {
	PostsPublished int64 `json:"posts_published"`
	PostsDraft     int64 `json:"posts_draft"`
	TotalViews     int64 `json:"total_views"`
	TotalLikes     int64 `json:"total_likes"`
	TotalShares    int64 `json:"total_shares"`
	ViewsToday     int64 `json:"views_today"`
	VisitorsToday  int64 `json:"visitors_today"`
	Views30d       int64 `json:"views_30d"`
	Visitors30d    int64 `json:"visitors_30d"`
}

// SiteDay is one day of site-wide traffic.
type SiteDay struct {
	Day      string `json:"day"`
	Views    int64  `json:"views"`
	Visitors int64  `json:"visitors"`
	Likes    int64  `json:"likes"`
	Shares   int64  `json:"shares"`
}

// PostDay is one day of a post's traffic.
type PostDay struct {
	Day    string `json:"day"`
	Views  int64  `json:"views"`
	Likes  int64  `json:"likes"`
	Shares int64  `json:"shares"`
}

// TopPost is a post with its counters over a period.
type TopPost struct {
	ID     uint   `json:"id"`
	Slug   string `json:"slug"`
	Title  string `json:"title"`
	Views  int64  `json:"views"`
	Likes  int64  `json:"likes"`
	Shares int64  `json:"shares"`
}

type statusCount struct {
	Status post.Status
	Count  int64
}

// Service reports statistics and prunes expired dedup marks.
type Service struct {
	db  *gorm.DB
	loc *time.Location
	now func() time.Time
	log *slog.Logger
}

func NewService(db *gorm.DB, loc *time.Location, log *slog.Logger) *Service {
	return &Service{db: db, loc: loc, now: time.Now, log: log}
}

// Summary returns the dashboard totals.
func (s *Service) Summary(ctx context.Context) (Summary, error) {
	db := s.db.WithContext(ctx)
	var sum Summary

	var byStatus []statusCount
	if err := db.Model(&post.Post{}).Select("status, COUNT(*) AS count").Group("status").Scan(&byStatus).Error; err != nil {
		return Summary{}, fmt.Errorf("count posts: %w", err)
	}
	for _, row := range byStatus {
		switch row.Status {
		case post.StatusPublished:
			sum.PostsPublished = row.Count
		case post.StatusDraft:
			sum.PostsDraft = row.Count
		}
	}

	err := db.Model(&post.Post{}).
		Select("COALESCE(SUM(view_count), 0), COALESCE(SUM(like_count), 0), COALESCE(SUM(share_count), 0)").
		Row().Scan(&sum.TotalViews, &sum.TotalLikes, &sum.TotalShares)
	if err != nil {
		return Summary{}, fmt.Errorf("sum post counters: %w", err)
	}

	today := s.today()
	var todayRow DailyStat
	if err := db.Where("day = ?", today).Limit(1).Find(&todayRow).Error; err != nil {
		return Summary{}, fmt.Errorf("load today: %w", err)
	}
	sum.ViewsToday, sum.VisitorsToday = todayRow.Views, todayRow.Visitors

	err = db.Model(&DailyStat{}).
		Select("COALESCE(SUM(views), 0), COALESCE(SUM(visitors), 0)").
		Where("day > ?", today.AddDate(0, 0, -30)).
		Row().Scan(&sum.Views30d, &sum.Visitors30d)
	if err != nil {
		return Summary{}, fmt.Errorf("sum last 30 days: %w", err)
	}
	return sum, nil
}

// Daily returns the site-wide counters of the last `days` days, oldest
// first, with a zero entry for days without traffic.
func (s *Service) Daily(ctx context.Context, days int) ([]SiteDay, error) {
	start := s.today().AddDate(0, 0, 1-days)
	var rows []DailyStat
	if err := s.db.WithContext(ctx).Where("day >= ?", start).Find(&rows).Error; err != nil {
		return nil, fmt.Errorf("load daily stats: %w", err)
	}

	byDay := make(map[time.Time]DailyStat, len(rows))
	for _, r := range rows {
		byDay[r.Day.UTC()] = r
	}
	out := make([]SiteDay, days)
	for i := range out {
		day := start.AddDate(0, 0, i)
		r := byDay[day]
		out[i] = SiteDay{Day: day.Format(time.DateOnly), Views: r.Views, Visitors: r.Visitors, Likes: r.Likes, Shares: r.Shares}
	}
	return out, nil
}

// PostDaily returns one post's counters of the last `days` days, oldest
// first, with a zero entry for days without traffic.
func (s *Service) PostDaily(ctx context.Context, postID uint, days int) ([]PostDay, error) {
	start := s.today().AddDate(0, 0, 1-days)
	var rows []PostDailyStat
	err := s.db.WithContext(ctx).Where("post_id = ? AND day >= ?", postID, start).Find(&rows).Error
	if err != nil {
		return nil, fmt.Errorf("load post daily stats: %w", err)
	}

	byDay := make(map[time.Time]PostDailyStat, len(rows))
	for _, r := range rows {
		byDay[r.Day.UTC()] = r
	}
	out := make([]PostDay, days)
	for i := range out {
		day := start.AddDate(0, 0, i)
		r := byDay[day]
		out[i] = PostDay{Day: day.Format(time.DateOnly), Views: r.Views, Likes: r.Likes, Shares: r.Shares}
	}
	return out, nil
}

// TopPosts returns the most viewed posts of the last `days` days.
func (s *Service) TopPosts(ctx context.Context, days, limit int) ([]TopPost, error) {
	start := s.today().AddDate(0, 0, 1-days)
	top := []TopPost{}
	err := s.db.WithContext(ctx).Model(&PostDailyStat{}).
		Select("posts.id, posts.slug, posts.title, SUM(post_daily_stats.views) AS views, SUM(post_daily_stats.likes) AS likes, SUM(post_daily_stats.shares) AS shares").
		Joins("JOIN posts ON posts.id = post_daily_stats.post_id").
		Where("post_daily_stats.day >= ?", start).
		Group("posts.id").
		Order("views DESC, likes DESC, posts.id DESC").
		Limit(limit).
		Scan(&top).Error
	if err != nil {
		return nil, fmt.Errorf("load top posts: %w", err)
	}
	return top, nil
}

// PostExists reports whether a post with the given ID exists.
func (s *Service) PostExists(ctx context.Context, id uint) (bool, error) {
	var count int64
	err := s.db.WithContext(ctx).Model(&post.Post{}).Where("id = ?", id).Count(&count).Error
	return count > 0, err
}

// PurgeMarks deletes dedup marks that can no longer affect any count.
func (s *Service) PurgeMarks(ctx context.Context) (int64, error) {
	cutoff := s.today().AddDate(0, 0, -markRetention)
	var deleted int64
	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for _, model := range []any{&VisitorMark{}, &ViewMark{}} {
			res := tx.Where("day < ?", cutoff).Delete(model)
			if res.Error != nil {
				return res.Error
			}
			deleted += res.RowsAffected
		}
		return nil
	})
	return deleted, err
}

// RunMaintenance purges expired marks now and then every interval until ctx
// is cancelled.
func (s *Service) RunMaintenance(ctx context.Context, interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()
	for {
		if n, err := s.PurgeMarks(ctx); err != nil && ctx.Err() == nil {
			s.log.Error("purge stats marks", "error", err)
		} else if n > 0 {
			s.log.Info("purged stats marks", "rows", n)
		}

		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
		}
	}
}

func (s *Service) today() time.Time {
	return Day(s.now(), s.loc)
}
