package post

import (
	"errors"

	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
	"gorm.io/gorm"
)

type PostRepository interface {
	FindAll() ([]*models.Post, error)
	FindByID(id uint) (*models.Post, error)
	Create(post *models.Post) error
	Update(post *models.Post) error
	Delete(post_id uint) error
	FindAllAdmin() ([]*models.Post, error)
	FindByIDAdmin(id uint) (*models.Post, error)
}

type postRepository struct {
	db *gorm.DB
}

func NewPostRepository(db *gorm.DB) PostRepository {
	return &postRepository{db: db}
}

func (r *postRepository) Create(post *models.Post) error {
	if err := r.db.Create(post).Error; err != nil {
		return errors.New("error while creating post")
	}
	return nil
}

func (r *postRepository) Delete(post_id uint) error {
	if err := r.db.Delete(&models.Post{}, post_id).Error; err != nil {
		return errors.New("error while deleting post")
	}
	return nil
}

func (r *postRepository) FindByID(id uint) (*models.Post, error) {
	var post models.Post

	if err := r.db.First(&post, id).Error; err != nil || !post.IsActive {
		return nil, errors.New("error while fetching post")
	}

	return &post, nil
}
func (r *postRepository) FindByIDAdmin(id uint) (*models.Post, error) {
	var post models.Post
	if err := r.db.First(&post, id).Error; err != nil {
		return nil, errors.New("error while fetching post")
	}
	return &post, nil
}

func (r *postRepository) Update(post *models.Post) error {
	if err := r.db.Save(post).Error; err != nil {
		return errors.New("error while updating post")
	}
	return nil
}

func (r *postRepository) FindAll() ([]*models.Post, error) {
	var posts []*models.Post
	if err := r.db.Where("is_active = ?", "true").Order("created_at desc").Find(&posts).Error; err != nil {
		return nil, errors.New("error while fetching posts")
	}
	return posts, nil
}

func (r *postRepository) FindAllAdmin() ([]*models.Post, error) {
	var posts []*models.Post
	if err := r.db.Order("created_at desc").Find(&posts).Error; err != nil {
		return nil, errors.New("error while fetching posts")
	}
	return posts, nil
}
