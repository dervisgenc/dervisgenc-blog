package stat

import (
	"time"

	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
)

type StatService struct {
	statRepo StatRepository
}

func NewStatService(statRepo StatRepository) *StatService {
	return &StatService{statRepo: statRepo}
}

func (s *StatService) GetPostStats(postID uint) (*models.PostDetailedResponse, error) {
	return s.statRepo.GetPostStats(postID)
}

func (s *StatService) GetAllPostsStats() ([]*models.PostStats, error) {
	return s.statRepo.GetAllPostsStats()
}

func (s *StatService) CountPosts() (int64, error) {
	return s.statRepo.CountPosts()
}

func (s *StatService) GetPostsCreatedInLastDays(days int) ([]*models.Post, error) {
	return s.statRepo.GetPostsCreatedInLastDays(days)
}

func (s *StatService) GetVisitorStats(startDate, endDate time.Time) (*models.StatsResponse, error) {
	return s.statRepo.GetVisitorStats(startDate, endDate)
}
func (s *StatService) IncrementShareCount(postID uint) error {
	return s.statRepo.IncrementShareCount(postID)
}

func (s *StatService) GetDetailedPostStats() (*models.DetailedStatsResponse, error) {
	return s.statRepo.GetDetailedPostStats()
}

// GetOverallStats retrieves the overall blog statistics.
func (s *StatService) GetOverallStats() (*models.OverallStatsResponse, error) {
	return s.statRepo.GetOverallStats()
}

// GetDailyTrafficStats retrieves daily views and unique visitors for charting.
func (s *StatService) GetDailyTrafficStats(startDate, endDate time.Time) ([]models.DailyTrafficStat, error) {
	return s.statRepo.GetDailyTrafficStats(startDate, endDate)
}
