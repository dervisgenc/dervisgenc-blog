package comment

import (
	"errors"
	"fmt"
	"time"

	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type CommentRepository interface {
	Create(comment *models.Comment) error
	FindByPostID(postID uint) ([]models.Comment, error)
	FindAll(offset, limit int, filter string) ([]models.AdminComment, int64, error)
	FindByID(id uint) (*models.Comment, error)
	Update(comment *models.Comment) error
	Delete(id uint) error
	Approve(id uint) error
}

type commentRepository struct {
	db     *gorm.DB
	logger *logrus.Logger
}

func NewCommentRepository(db *gorm.DB, logger *logrus.Logger) CommentRepository {
	return &commentRepository{db: db, logger: logger}
}

func (r *commentRepository) Create(comment *models.Comment) error {
	log := r.logger.WithFields(logrus.Fields{"author": comment.AuthorName, "post_id": comment.PostID})
	log.Info("Repository: Creating comment")
	if err := r.db.Create(comment).Error; err != nil {
		log.WithError(err).Error("Repository: Failed to create comment")
		return fmt.Errorf("failed to create comment: %w", err)
	}
	log.Info("Repository: Comment created successfully")
	return nil
}

// FindByPostID retrieves only approved comments for a specific post, ordered by creation date.
func (r *commentRepository) FindByPostID(postID uint) ([]models.Comment, error) {
	var comments []models.Comment
	log := r.logger.WithField("post_id", postID)
	log.Info("Repository: Fetching approved comments by post ID")

	// Fetch only approved comments, ordered by creation date
	// Add Preload("Replies") if you want to fetch nested replies automatically
	err := r.db.Where("post_id = ? AND is_approved = ?", postID, true).
		Order("created_at ASC").
		Find(&comments).Error

	if err != nil {
		log.WithError(err).Error("Repository: Failed to fetch comments by post ID")
		return nil, fmt.Errorf("failed to fetch comments: %w", err)
	}
	log.WithField("count", len(comments)).Info("Repository: Fetched comments successfully")
	return comments, nil
}

// FindAll retrieves all comments (including unapproved) for the admin panel with pagination and filtering.
func (r *commentRepository) FindAll(offset, limit int, filter string) ([]models.AdminComment, int64, error) {
	var comments []models.AdminComment
	var totalCount int64
	log := r.logger.WithFields(logrus.Fields{"offset": offset, "limit": limit, "filter": filter})
	log.Info("Repository: Fetching all comments for admin")

	query := r.db.Model(&models.Comment{}).
		Select("comments.*, posts.title as post_title").        // Select fields from both tables
		Joins("LEFT JOIN posts ON posts.id = comments.post_id") // Join with posts table

	// Apply filter
	switch filter {
	case "approved":
		query = query.Where("comments.is_approved = ?", true)
	case "pending":
		query = query.Where("comments.is_approved = ?", false)
	case "all":
		// No additional filter needed
	default:
		query = query.Where("comments.is_approved = ?", false) // Default to pending
	}

	// Count total matching records
	if err := query.Count(&totalCount).Error; err != nil {
		log.WithError(err).Error("Repository: Failed to count comments")
		return nil, 0, fmt.Errorf("failed to count comments: %w", err)
	}

	// Fetch paginated results
	err := query.Order("comments.created_at DESC").
		Offset(offset).
		Limit(limit).
		Scan(&comments).Error // Use Scan to map to AdminComment struct

	if err != nil {
		log.WithError(err).Error("Repository: Failed to fetch comments")
		return nil, 0, fmt.Errorf("failed to fetch comments: %w", err)
	}

	log.WithFields(logrus.Fields{"count": len(comments), "total": totalCount}).Info("Repository: Fetched comments successfully")
	return comments, totalCount, nil
}

func (r *commentRepository) FindByID(id uint) (*models.Comment, error) {
	var comment models.Comment
	log := r.logger.WithField("comment_id", id)
	log.Info("Repository: Fetching comment by ID")
	if err := r.db.First(&comment, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Warn("Repository: Comment not found")
			return nil, gorm.ErrRecordNotFound
		}
		log.WithError(err).Error("Repository: Failed to fetch comment by ID")
		return nil, fmt.Errorf("failed to fetch comment: %w", err)
	}
	log.Info("Repository: Fetched comment successfully")
	return &comment, nil
}

func (r *commentRepository) Update(comment *models.Comment) error {
	log := r.logger.WithField("comment_id", comment.ID)
	log.Info("Repository: Updating comment")
	// Use Select to update only specific fields if needed, e.g., content, is_approved
	if err := r.db.Save(comment).Error; err != nil {
		log.WithError(err).Error("Repository: Failed to update comment")
		return fmt.Errorf("failed to update comment: %w", err)
	}
	log.Info("Repository: Comment updated successfully")
	return nil
}

func (r *commentRepository) Delete(id uint) error {
	log := r.logger.WithField("comment_id", id)
	log.Info("Repository: Deleting comment")
	if err := r.db.Delete(&models.Comment{}, id).Error; err != nil {
		log.WithError(err).Error("Repository: Failed to delete comment")
		return fmt.Errorf("failed to delete comment: %w", err)
	}
	log.Info("Repository: Comment deleted successfully")
	return nil
}

func (r *commentRepository) Approve(id uint) error {
	log := r.logger.WithField("comment_id", id)
	log.Info("Repository: Approving comment")
	now := time.Now()
	result := r.db.Model(&models.Comment{}).Where("id = ?", id).Updates(map[string]interface{}{
		"is_approved": true,
		"approved_at": &now,
	})
	if result.Error != nil {
		log.WithError(result.Error).Error("Repository: Failed to approve comment")
		return fmt.Errorf("failed to approve comment: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		log.Warn("Repository: Comment not found for approval or already approved")
		return gorm.ErrRecordNotFound // Or a more specific error
	}
	log.Info("Repository: Comment approved successfully")
	return nil
}
