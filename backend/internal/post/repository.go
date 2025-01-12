package post

import (
	"errors"
	"fmt"

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
	FindPaginated(page, pageSize int) ([]*models.Post, int64, error)
	SearchPosts(query string, page, pageSize int) ([]*models.Post, int64, error)
}

type postRepository struct {
	db *gorm.DB
}

func NewPostRepository(db *gorm.DB) PostRepository {
	return &postRepository{db: db}
}

func (r *postRepository) Create(post *models.Post) error {
	result := r.db.Create(post)
	if result.Error != nil {
		return fmt.Errorf("failed to create post: %w", result.Error)
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
	// Use Select to specify which fields to update
	if err := r.db.Model(post).Select("title", "content", "summary", "image_path",
		"image_url", "read_time", "is_active", "updated_at").Updates(post).Error; err != nil {
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

func (r *postRepository) FindPaginated(page, pageSize int) ([]*models.Post, int64, error) {
	var posts []*models.Post
	var totalPosts int64

	// Count total active posts
	if err := r.db.Model(&models.Post{}).Where("is_active = ?", true).Count(&totalPosts).Error; err != nil {
		return nil, 0, fmt.Errorf("error counting posts: %w", err)
	}

	// Calculate offset
	offset := (page - 1) * pageSize

	// Get paginated posts
	if err := r.db.Where("is_active = ?", true).
		Order("created_at desc").
		Limit(pageSize).
		Offset(offset).
		Find(&posts).Error; err != nil {
		return nil, 0, fmt.Errorf("error fetching paginated posts: %w", err)
	}

	return posts, totalPosts, nil
}

func (r *postRepository) SearchPosts(query string, page, pageSize int) ([]*models.Post, int64, error) {
	var posts []*models.Post
	var totalPosts int64

	// Base query for active posts with search conditions
	searchQuery := r.db.Model(&models.Post{}).
		Where("is_active = ?", true).
		Where("title ILIKE ? OR content ILIKE ? OR summary ILIKE ?",
			"%"+query+"%", "%"+query+"%", "%"+query+"%")

	// Count total matching posts
	if err := searchQuery.Count(&totalPosts).Error; err != nil {
		return nil, 0, fmt.Errorf("error counting search results: %w", err)
	}

	// Calculate offset for pagination
	offset := (page - 1) * pageSize

	// Get paginated results
	if err := searchQuery.
		Order("created_at desc").
		Limit(pageSize).
		Offset(offset).
		Find(&posts).Error; err != nil {
		return nil, 0, fmt.Errorf("error fetching search results: %w", err)
	}

	return posts, totalPosts, nil
}
