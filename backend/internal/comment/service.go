package comment

import (
	"errors"
	"fmt"
	"net/mail" // For basic email validation

	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/dto"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type CommentService struct {
	repo   CommentRepository
	logger *logrus.Logger
}

func NewCommentService(repo CommentRepository, logger *logrus.Logger) *CommentService {
	return &CommentService{repo: repo, logger: logger}
}

func (s *CommentService) CreateComment(postID uint, req dto.CommentCreateRequest) (*models.Comment, error) {
	log := s.logger.WithFields(logrus.Fields{"post_id": postID, "author": req.AuthorName})
	log.Info("Service: Creating comment")

	// Basic Validation
	if _, err := mail.ParseAddress(req.AuthorEmail); err != nil {
		log.WithError(err).Warn("Service: Invalid author email format")
		return nil, fmt.Errorf("invalid email format")
	}
	if req.AuthorName == "" || req.Content == "" {
		log.Warn("Service: Author name or content is empty")
		return nil, fmt.Errorf("name and content cannot be empty")
	}

	comment := &models.Comment{
		PostID:          postID,
		AuthorName:      req.AuthorName,
		AuthorEmail:     req.AuthorEmail,
		Content:         req.Content,
		IsApproved:      false, // Comments start as unapproved
		ParentCommentID: req.ParentCommentID,
	}

	if err := s.repo.Create(comment); err != nil {
		log.WithError(err).Error("Service: Failed to create comment in repository")
		return nil, err // Return the original error
	}

	log.WithField("comment_id", comment.ID).Info("Service: Comment created successfully (pending approval)")
	// TODO: Consider sending notification for moderation
	return comment, nil
}

// GetCommentsByPostID retrieves approved comments and maps them to DTOs.
func (s *CommentService) GetCommentsByPostID(postID uint) ([]dto.CommentResponse, error) {
	log := s.logger.WithField("post_id", postID)
	log.Info("Service: Fetching comments by post ID")

	comments, err := s.repo.FindByPostID(postID)
	if err != nil {
		log.WithError(err).Error("Service: Failed to fetch comments from repository")
		return nil, err
	}

	// Map models.Comment to dto.CommentResponse
	// This simple mapping works for flat lists. For nested, you'd need recursion.
	var response []dto.CommentResponse
	for _, c := range comments {
		response = append(response, dto.CommentResponse{
			ID:              c.ID,
			CreatedAt:       c.CreatedAt,
			AuthorName:      c.AuthorName,
			Content:         c.Content,
			ParentCommentID: c.ParentCommentID,
		})
	}

	log.WithField("count", len(response)).Info("Service: Fetched comments successfully")
	return response, nil
}

// GetAllCommentsAdmin retrieves all comments for the admin panel.
func (s *CommentService) GetAllCommentsAdmin(page, pageSize int, filter string) ([]dto.AdminCommentResponse, int64, error) {
	log := s.logger.WithFields(logrus.Fields{"page": page, "pageSize": pageSize, "filter": filter})
	log.Info("Service: Fetching all comments for admin")

	offset := (page - 1) * pageSize
	comments, totalCount, err := s.repo.FindAll(offset, pageSize, filter)
	if err != nil {
		log.WithError(err).Error("Service: Failed to fetch comments from repository")
		return nil, 0, err
	}

	// Map models.AdminComment to dto.AdminCommentResponse (they are similar here, but mapping is good practice)
	var response []dto.AdminCommentResponse
	for _, c := range comments {
		response = append(response, dto.AdminCommentResponse{
			ID:              c.ID,
			CreatedAt:       c.CreatedAt,
			UpdatedAt:       c.UpdatedAt,
			PostID:          c.PostID,
			AuthorName:      c.AuthorName,
			AuthorEmail:     c.AuthorEmail,
			Content:         c.Content,
			IsApproved:      c.IsApproved,
			ApprovedAt:      c.ApprovedAt,
			ParentCommentID: c.ParentCommentID,
			PostTitle:       c.Post.Title, // Include post title
		})
	}

	log.WithFields(logrus.Fields{"count": len(response), "total": totalCount}).Info("Service: Fetched comments successfully")
	return response, totalCount, nil
}

func (s *CommentService) ApproveComment(id uint) error {
	log := s.logger.WithField("comment_id", id)
	log.Info("Service: Approving comment")
	err := s.repo.Approve(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Warn("Service: Comment not found for approval")
		} else {
			log.WithError(err).Error("Service: Failed to approve comment in repository")
		}
		return err
	}
	log.Info("Service: Comment approved successfully")
	// TODO: Consider sending notification to the author
	return nil
}

func (s *CommentService) DeleteComment(id uint) error {
	log := s.logger.WithField("comment_id", id)
	log.Info("Service: Deleting comment")
	err := s.repo.Delete(id)
	if err != nil {
		log.WithError(err).Error("Service: Failed to delete comment in repository")
		return err
	}
	log.Info("Service: Comment deleted successfully")
	return nil
}
