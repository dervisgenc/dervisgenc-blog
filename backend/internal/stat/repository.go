package stat

import (
	"errors"
	"time"

	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
	"gorm.io/gorm"
)

type StatRepository interface {
	GetPostStats(uint) (*models.Stat, error)
	GetAllPostsStats() ([]*models.PostStats, error)
	CountPosts() (int64, error)
	GetPostsCreatedInLastDays(days int) ([]*models.Post, error)
}

type statRepository struct {
	db *gorm.DB
}

func NewStatRepository(db *gorm.DB) StatRepository {
	return &statRepository{db: db}
}

func (r *statRepository) GetPostStats(postID uint) (*models.Stat, error) {
	var stats models.Stat
	if err := r.db.Where("post_id = ?", postID).First(&stats).Error; err != nil {
		return nil, errors.New("error while fetching post stats")
	}

	return &stats, nil
}
func (r *statRepository) GetAllPostsStats() ([]*models.PostStats, error) {

	var postStats []*models.PostStats

	if err := r.db.Table("posts").Select("posts.id, posts.title, stats.views, stats.likes, stats.shares").
		Joins("LEFT JOIN stats ON posts.id = stats.post_id").Find(&postStats).Error; err != nil {
		return nil, errors.New("error while fetching posts stats")
	}
	return postStats, nil
}

func (r *statRepository) CountPosts() (int64, error) {
	var count int64
	if err := r.db.Model(&models.Post{}).Where("is_active = ?", true).Count(&count).Error; err != nil {
		return 0, errors.New("error while counting posts")
	}
	return 0, nil
}

func (r *statRepository) GetPostsCreatedInLastDays(days int) ([]*models.Post, error) {

	var posts []*models.Post

	startDate := time.Now().AddDate(0, 0, -days)

	if err := r.db.Where("created_at > ?", startDate).Find(&posts).Error; err != nil {
		return nil, errors.New("error while fetching posts")
	}

	return posts, nil
}
