package post

import (
	"errors"
	"fmt"
	"net/http"
	"strings" // Import strings package

	myerr "github.com/dervisgenc/dervisgenc-blog/backend/pkg"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// Define a sentinel error for post not found
var ErrPostNotFound = errors.New("post not found")

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
	DeletePostPermanently(id uint) error                        // Add this line
	FindRelated(postID uint, limit int) ([]*models.Post, error) // Add this line for related posts
}

type postRepository struct {
	db     *gorm.DB
	logger *logrus.Logger // Add logger field
}

// Modify NewPostRepository to accept and store the logger
func NewPostRepository(db *gorm.DB, logger *logrus.Logger) PostRepository {
	return &postRepository{db: db, logger: logger}
}

func (r *postRepository) Create(post *models.Post) error {
	result := r.db.Create(post)
	if result.Error != nil {
		return fmt.Errorf("failed to create post: %w", result.Error)
	}
	return nil
}

func (r *postRepository) Update(post *models.Post) error {
	// Use Select to specify which fields to update, including new ones
	result := r.db.Model(post).Select(
		"title", "content", "summary", "image_path", "image_url",
		"read_time", "is_active", "updated_at", "category", "tags", // Added category and tags
	).Updates(post)

	if result.Error != nil {
		r.logger.WithError(result.Error).Errorf("Error updating post with ID %d", post.ID)
		return fmt.Errorf("error while updating post: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		// Optionally check if the record exists to differentiate between not found and no changes
		var exists int64
		r.db.Model(&models.Post{}).Where("id = ?", post.ID).Count(&exists)
		if exists == 0 {
			r.logger.Warnf("Attempted to update non-existent post with ID %d", post.ID)
			return myerr.WithHTTPStatus(ErrPostNotFound, http.StatusNotFound) // Use the sentinel error
		}
		r.logger.Infof("No changes detected for post with ID %d during update", post.ID)
	}
	return nil
}

func (r *postRepository) Delete(post_id uint) error {
	// This method performs a GORM soft delete if DeletedAt field exists,
	// or a hard delete if it doesn't.
	// It's better to have explicit SoftDelete and DeletePermanently methods.
	// For now, we assume this is intended for soft delete based on the service logic.
	// The permanent delete logic is correctly in DeletePostPermanently.
	result := r.db.Delete(&models.Post{}, post_id)
	if result.Error != nil {
		r.logger.WithError(result.Error).Errorf("Error performing delete operation on post ID %d", post_id)
		return fmt.Errorf("error while deleting post: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		r.logger.Warnf("Attempted to delete non-existent or already deleted post with ID %d", post_id)
		// Consider returning ErrPostNotFound here as well
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

// FindRelated finds posts related to the given postID based on category and tags.
func (r *postRepository) FindRelated(postID uint, limit int) ([]*models.Post, error) {
	var currentPost models.Post
	// First, get the category and tags of the current post
	if err := r.db.Select("category", "tags").First(&currentPost, postID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			r.logger.Warnf("FindRelated: Current post with ID %d not found", postID)
			return nil, myerr.WithHTTPStatus(fmt.Errorf("current post not found: %w", err), http.StatusNotFound)
		}
		r.logger.WithError(err).Errorf("FindRelated: Error fetching current post with ID %d", postID)
		return nil, myerr.WithHTTPStatus(fmt.Errorf("error fetching current post: %w", err), http.StatusInternalServerError)
	}

	var relatedPosts []*models.Post
	query := r.db.Model(&models.Post{}).
		Select("id", "title", "summary", "image_url", "read_time", "like_count", "is_active", "created_at", "category", "tags"). // Select necessary fields
		Where("id <> ?", postID).                                                                                                // Exclude the current post
		Where("is_active = ?", true)

	// Build ORDER BY clause parts using CASE statement for relevance
	// var orderClauses []string
	var args []interface{}

	hasCategoryCondition := currentPost.Category != ""
	hasTagsCondition := currentPost.Tags != ""
	tags := splitTags(currentPost.Tags) // Use helper function

	// Build CASE statement for ordering
	caseStatement := "CASE "
	priority := 1 // Lower number means higher priority

	// Priority 1: Category AND Tags match (requires robust tag matching)
	if hasCategoryCondition && hasTagsCondition && len(tags) > 0 {
		// Build tag matching condition (example using simple LIKE, adjust as needed)
		tagLikes := make([]string, len(tags))
		tagArgs := make([]interface{}, len(tags))
		for i, tag := range tags {
			// Assuming tags are comma-separated, check if the tag exists within the string
			// This is basic, consider full-text search or array types in Postgres for better performance/accuracy
			tagLikes[i] = "tags LIKE ?"
			tagArgs[i] = "%" + tag + "%"
		}
		tagCondition := "(" + strings.Join(tagLikes, " OR ") + ")" // Match any tag

		caseStatement += fmt.Sprintf("WHEN category = ? AND %s THEN %d ", tagCondition, priority)
		args = append(args, currentPost.Category)
		args = append(args, tagArgs...)
		priority++
	}

	// Priority 2: Category Only matches
	if hasCategoryCondition {
		caseStatement += fmt.Sprintf("WHEN category = ? THEN %d ", priority)
		args = append(args, currentPost.Category)
		priority++
	}

	// Priority 3: Tags Only match (requires robust tag matching)
	if hasTagsCondition && len(tags) > 0 {
		// Reuse tag matching condition from Priority 1 if built
		tagLikes := make([]string, len(tags))
		tagArgs := make([]interface{}, len(tags))
		for i, tag := range tags {
			tagLikes[i] = "tags LIKE ?"
			tagArgs[i] = "%" + tag + "%"
		}
		tagCondition := "(" + strings.Join(tagLikes, " OR ") + ")"

		caseStatement += fmt.Sprintf("WHEN %s THEN %d ", tagCondition, priority)
		args = append(args, tagArgs...)
		priority++
	}

	// Default priority (lower relevance)
	caseStatement += fmt.Sprintf("ELSE %d END", priority)

	// Final Order Clause: Order by relevance (CASE statement), then by creation date
	finalOrderClause := gorm.Expr(caseStatement+", created_at DESC", args...)

	// Log the generated clause and arguments for debugging
	r.logger.WithFields(logrus.Fields{
		"case_statement": caseStatement,
		"arguments":      args,
	}).Debug("FindRelated: Generated ORDER BY CASE statement")

	// Apply conditions and limit
	if err := query.Order(finalOrderClause).Limit(limit).Find(&relatedPosts).Error; err != nil {
		r.logger.WithError(err).Errorf("FindRelated: Error fetching related posts for ID %d", postID)
		// Wrap the error with a 500 status code
		return nil, myerr.WithHTTPStatus(fmt.Errorf("error fetching related posts: %w", err), http.StatusInternalServerError)
	}

	r.logger.Infof("FindRelated: Found %d related posts for ID %d", len(relatedPosts), postID)
	return relatedPosts, nil
}

// Helper function to split tags (simple comma split and trim)
func splitTags(tags string) []string {
	if tags == "" {
		return []string{}
	}
	split := strings.Split(tags, ",")
	result := make([]string, 0, len(split))
	for _, tag := range split {
		trimmed := strings.TrimSpace(tag)
		if trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}

func (r *postRepository) DeletePostPermanently(id uint) error {
	log := r.logger.WithField("post_id", id)
	log.Info("Attempting to permanently delete post")

	// Check if the post exists (unscoped to find soft-deleted posts too)
	var post models.Post
	if err := r.db.Unscoped().First(&post, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Warn("Post not found for permanent deletion")
			// Return the wrapped sentinel error
			return myerr.WithHTTPStatus(ErrPostNotFound, http.StatusNotFound)
		}
		log.WithError(err).Error("Error checking post existence for permanent deletion")
		// Wrap other DB errors
		return myerr.WithHTTPStatus(fmt.Errorf("error checking post existence: %w", err), http.StatusInternalServerError)
	}

	// Use transaction to delete related data and the post itself
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Delete related likes
		log.Info("Deleting related post likes")
		if err := tx.Unscoped().Where("post_id = ?", id).Delete(&models.PostLike{}).Error; err != nil {
			log.WithError(err).Error("Error deleting post likes")
			return myerr.WithHTTPStatus(fmt.Errorf("error deleting post likes: %w", err), http.StatusInternalServerError)
		}

		// Delete related views
		log.Info("Deleting related post views")
		if err := tx.Unscoped().Where("post_id = ?", id).Delete(&models.PostView{}).Error; err != nil {
			log.WithError(err).Error("Error deleting post views")
			return myerr.WithHTTPStatus(fmt.Errorf("error deleting post views: %w", err), http.StatusInternalServerError)
		}

		// Delete related shares (ADDED)
		log.Info("Deleting related post shares")
		if err := tx.Unscoped().Where("post_id = ?", id).Delete(&models.PostShare{}).Error; err != nil {
			log.WithError(err).Error("Error deleting post shares")
			return myerr.WithHTTPStatus(fmt.Errorf("error deleting post shares: %w", err), http.StatusInternalServerError)
		}

		// Delete related stats
		log.Info("Deleting related post stats")
		if err := tx.Unscoped().Where("post_id = ?", id).Delete(&models.Stat{}).Error; err != nil {
			log.WithError(err).Error("Error deleting post stats")
			return myerr.WithHTTPStatus(fmt.Errorf("error deleting post stats: %w", err), http.StatusInternalServerError)
		}

		// Delete related comments
		log.Info("Deleting related post comments")
		if err := tx.Unscoped().Where("post_id = ?", id).Delete(&models.Comment{}).Error; err != nil {
			log.WithError(err).Error("Error deleting post comments")
			return myerr.WithHTTPStatus(fmt.Errorf("error deleting post comments: %w", err), http.StatusInternalServerError)
		}

		// Permanently delete the post
		log.Info("Permanently deleting post record")
		// Use Unscoped to ensure hard delete even if GORM's default is soft delete
		if err := tx.Unscoped().Delete(&models.Post{}, id).Error; err != nil {
			// Log the detailed GORM error HERE
			log.WithError(err).Error("GORM error during permanent post deletion")
			// Wrap and return the error
			return myerr.WithHTTPStatus(fmt.Errorf("error permanently deleting post: %w", err), http.StatusInternalServerError)
		}

		log.Info("Post permanently deleted successfully")
		return nil
	})
}
