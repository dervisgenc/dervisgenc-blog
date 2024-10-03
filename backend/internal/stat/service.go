package stat

import "github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"

type StatService struct {
	statRepo StatRepository
}

func NewStatService(statRepo StatRepository) *StatService {
	return &StatService{statRepo: statRepo}
}

func (s *StatService) GetPostStats(postID uint) (*models.Stat, error) {
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
