package post

import (
	"errors"
	"fmt"
	"time"

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
	fmt.Println(post)

	if len(post.Title) == 0 || post.Content == "" {
		return errors.New("title and content cannot be empty")
	}

	// Ensure ImageURL is set if ImagePath exists
	if post.ImagePath != "" && post.ImageURL == "" {
		return errors.New("image URL must be set when image path exists")
	}

	post.CreatedAt = time.Now()
	post.UpdatedAt = time.Now()

	return s.postRepo.Create(post)
}

func (s *PostService) UpdatePost(post *models.Post) error {

	_, err := s.postRepo.FindByIDAdmin(post.ID)
	if err != nil {
		return errors.New("post not found")
	}

	if len(post.Title) == 0 || post.Content == "" {
		return errors.New("title and content cannot be empty")
	}

	post.UpdatedAt = time.Now()

	return s.postRepo.Update(post)
}

func (s *PostService) DeletePost(id uint) error {
	existingPost, err := s.postRepo.FindByID(id)
	if err != nil {
		return errors.New("post not found")
	}
	existingPost.IsActive = false
	existingPost.UpdatedAt = time.Now()

	return s.postRepo.Update(existingPost)
}
func (s *PostService) DeletePostPermanently(id uint) error {

	existingPost, err := s.postRepo.FindByID(id)
	if err != nil {
		return errors.New("post not found")
	}

	return s.postRepo.Delete(existingPost.ID)
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
