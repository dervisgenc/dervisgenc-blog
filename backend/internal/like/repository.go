package like

import (
	"net/http"

	myerr "github.com/dervisgenc/dervisgenc-blog/backend/pkg"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
	"gorm.io/gorm"
)

type LikeRepository interface {
	AddLike(postID uint, ipAddress string) error
	RemoveLike(postID uint, ipAddress string) error
	HasLiked(postID uint, ipAddress string) (bool, error)
	GetLikeCount(postID uint) (int, error)
}

type likeRepository struct {
	db *gorm.DB
}

func NewLikeRepository(db *gorm.DB) LikeRepository {
	return &likeRepository{db: db}
}

func (r *likeRepository) AddLike(postID uint, ipAddress string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Check if post exists
		var exists bool
		if err := tx.Model(&models.Post{}).Select("1").Where("id = ?", postID).Scan(&exists).Error; err != nil {
			return myerr.WithHTTPStatus(err, http.StatusInternalServerError)
		}
		if !exists {
			return myerr.WithHTTPStatus(nil, http.StatusNotFound)
		}

		// Create like
		like := models.PostLike{
			PostID:    postID,
			IPAddress: ipAddress,
		}

		if err := tx.Create(&like).Error; err != nil {
			if err.Error() == "duplicate key value violates unique constraint" {
				return myerr.WithHTTPStatus(err, http.StatusConflict)
			}
			return myerr.WithHTTPStatus(err, http.StatusInternalServerError)
		}

		return nil
	})
}

func (r *likeRepository) RemoveLike(postID uint, ipAddress string) error {
	result := r.db.Where("post_id = ? AND ip_address = ?", postID, ipAddress).Delete(&models.PostLike{})
	if result.Error != nil {
		return myerr.WithHTTPStatus(result.Error, http.StatusInternalServerError)
	}
	if result.RowsAffected == 0 {
		return myerr.WithHTTPStatus(result.Error, http.StatusNotFound)
	}
	return nil
}

func (r *likeRepository) HasLiked(postID uint, ipAddress string) (bool, error) {
	var count int64
	err := r.db.Model(&models.PostLike{}).Where("post_id = ? AND ip_address = ?", postID, ipAddress).Count(&count).Error
	if err != nil {
		return false, myerr.WithHTTPStatus(err, http.StatusInternalServerError)
	}
	return count > 0, nil
}

func (r *likeRepository) GetLikeCount(postID uint) (int, error) {
	var post models.Post
	if err := r.db.Select("like_count").First(&post, postID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return 0, myerr.WithHTTPStatus(err, http.StatusNotFound)
		}
		return 0, myerr.WithHTTPStatus(err, http.StatusInternalServerError)
	}
	return int(post.LikeCount), nil
}
