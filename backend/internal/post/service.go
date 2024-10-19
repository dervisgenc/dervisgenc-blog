package post

import (
	"errors"
	"time"

	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
)

type PostService struct {
	postRepo PostRepository
}

func NewPostService(postRepo PostRepository) *PostService {
	return &PostService{postRepo: postRepo}
}

func (s *PostService) GetAllPosts() ([]*models.Post, error) {
	return s.postRepo.FindAll()
}
func (s *PostService) GetAllAdmin() ([]*models.Post, error) {
	return s.postRepo.FindAllAdmin()
}

func (s *PostService) GetPostByID(id uint) (*models.Post, error) {
	return s.postRepo.FindByID(id)
}
func (s *PostService) GetPostByIDAdmin(id uint) (*models.Post, error) {
	return s.postRepo.FindByIDAdmin(id)
}

func (s *PostService) CreatePost(post *models.Post) error {

	if len(post.Title) == 0 || post.Content == "" {
		return errors.New("title and content cannot be empty")
	}
	post.CreatedAt = time.Now()
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
