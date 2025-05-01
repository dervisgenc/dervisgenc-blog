package post

import (
	"errors"
	"fmt"
	"net/http" // Import http for status codes
	"time"

	myerr "github.com/dervisgenc/dervisgenc-blog/backend/pkg" // Import custom error package
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/dto"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
)

type PostService struct {
	postRepo PostRepository
	baseURL  string
}

func NewPostService(postRepo PostRepository, baseURL string) *PostService {
	return &PostService{
		postRepo: postRepo,
		baseURL:  baseURL,
	}
}

func (s *PostService) GetAllPosts() ([]dto.PostListResponse, error) {
	posts, err := s.postRepo.FindAll()
	if err != nil {
		return nil, err
	}
	return dto.ToPostListResponses(posts), nil
}

func (s *PostService) GetAllAdmin() ([]*models.Post, error) {
	return s.postRepo.FindAllAdmin()
}

func (s *PostService) GetPostByID(id uint) (*dto.PostDetailResponse, error) {
	post, err := s.postRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	response := dto.ToPostDetailResponse(post)
	return &response, nil
}

func (s *PostService) GetPostByIDAdmin(id uint) (*models.Post, error) {
	return s.postRepo.FindByIDAdmin(id)
}

func (s *PostService) CreatePost(post *models.Post) error {
	fmt.Printf("INFO: Service CreatePost - Saving Post with ImageURL: %s, Category: %s, Tags: %s\n", post.ImageURL, post.Category, post.Tags) // Log new fields

	if len(post.Title) == 0 || post.Content == "" {
		return errors.New("title and content cannot be empty")
	}

	// Ensure ImageURL is set if ImagePath exists
	// This check might be redundant if ImageURL is always provided from frontend/handler
	// if post.ImagePath != "" && post.ImageURL == "" {
	// 	return errors.New("image URL must be set when image path exists")
	// }

	post.CreatedAt = time.Now()
	post.UpdatedAt = time.Now()

	return s.postRepo.Create(post)
}

func (s *PostService) UpdatePost(post *models.Post) error {

	// Check if post exists before updating
	_, err := s.postRepo.FindByIDAdmin(post.ID)
	if err != nil {
		// Check if the error is the specific ErrPostNotFound from the repository
		if errors.Is(err, ErrPostNotFound) {
			return myerr.WithHTTPStatus(err, http.StatusNotFound) // Return 404
		}
		// For other errors during find, return 500
		return myerr.WithHTTPStatus(fmt.Errorf("error checking post existence before update: %w", err), http.StatusInternalServerError)
	}

	if len(post.Title) == 0 || post.Content == "" {
		return myerr.WithHTTPStatus(errors.New("title and content cannot be empty"), http.StatusBadRequest) // Return 400
	}

	post.UpdatedAt = time.Now()

	// The repository Update method now handles Category and Tags
	err = s.postRepo.Update(post)
	if err != nil {
		// Check if the update error is ErrPostNotFound (e.g., if row affected was 0 and check failed)
		if errors.Is(err, ErrPostNotFound) {
			return myerr.WithHTTPStatus(err, http.StatusNotFound)
		}
		// Wrap other update errors
		return myerr.WithHTTPStatus(fmt.Errorf("failed to update post in repository: %w", err), http.StatusInternalServerError)
	}
	return nil
}

func (s *PostService) DeletePost(id uint) error {
	// This performs a soft delete by setting IsActive = false
	existingPost, err := s.postRepo.FindByIDAdmin(id) // Use FindByIDAdmin to find even inactive posts
	if err != nil {
		if errors.Is(err, ErrPostNotFound) {
			return myerr.WithHTTPStatus(err, http.StatusNotFound)
		}
		return myerr.WithHTTPStatus(fmt.Errorf("error finding post to soft delete: %w", err), http.StatusInternalServerError)
	}

	// If already soft-deleted (IsActive is false), maybe return success or a specific message?
	if !existingPost.IsActive {
		// Optionally log or return a specific status/message
		return nil // Already soft-deleted, consider it a success
	}

	existingPost.IsActive = false
	existingPost.UpdatedAt = time.Now()
	// Use a specific method if available, otherwise rely on Update to only change IsActive and UpdatedAt
	err = s.postRepo.Update(existingPost) // Assuming Update can handle this partial update
	if err != nil {
		return myerr.WithHTTPStatus(fmt.Errorf("failed to soft delete post: %w", err), http.StatusInternalServerError)
	}
	return nil
}

func (s *PostService) DeletePostPermanently(id uint) error {
	// **FIX:** Call the correct repository method for permanent deletion
	err := s.postRepo.DeletePostPermanently(id)
	if err != nil {
		// The repository method already wraps errors with status codes
		// and logs details. We just pass the error up.
		return err // Pass the wrapped error (includes status code)
	}
	return nil
}

func (s *PostService) GetPaginatedPosts(page, pageSize int) (*dto.PaginatedPostResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 9 // Default page size
	}

	posts, totalPosts, err := s.postRepo.FindPaginated(page, pageSize)
	if err != nil {
		return nil, err
	}

	totalPages := int(((totalPosts - 1) / int64(pageSize)) + 1)

	return &dto.PaginatedPostResponse{
		Posts:      dto.ToPostListResponses(posts),
		TotalPosts: totalPosts,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

func (s *PostService) SearchPosts(query string, page, pageSize int) (*models.PaginatedPosts, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 9
	}

	posts, totalPosts, err := s.postRepo.SearchPosts(query, page, pageSize)
	if err != nil {
		return nil, err
	}

	totalPages := int(((totalPosts - 1) / int64(pageSize)) + 1)

	return &models.PaginatedPosts{
		Posts:      posts,
		TotalPosts: totalPosts,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

// GetRelatedPosts retrieves posts related to the given post ID.
func (s *PostService) GetRelatedPosts(id uint, limit int) ([]dto.PostListResponse, error) {
	if limit <= 0 {
		limit = 3 // Default limit
	}
	posts, err := s.postRepo.FindRelated(id, limit)
	if err != nil {
		// Error already wrapped with status code in repository
		return nil, err
	}
	return dto.ToPostListResponses(posts), nil
}
