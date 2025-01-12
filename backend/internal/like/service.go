package like

import "github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"

type LikeService struct {
	repo LikeRepository
}

func NewLikeService(repo LikeRepository) *LikeService {
	return &LikeService{repo: repo}
}

func (s *LikeService) ToggleLike(postID uint, ipAddress string) (*models.LikeResponse, error) {
	hasLiked, err := s.repo.HasLiked(postID, ipAddress)
	if err != nil {
		return nil, err
	}

	if hasLiked {
		err = s.repo.RemoveLike(postID, ipAddress)
	} else {
		err = s.repo.AddLike(postID, ipAddress)
	}

	if err != nil {
		return nil, err
	}

	count, err := s.repo.GetLikeCount(postID)
	if err != nil {
		return nil, err
	}

	return &models.LikeResponse{
		Success: true,
		Likes:   count,
	}, nil
}

func (s *LikeService) GetLikeStatus(postID uint, ipAddress string) (bool, int, error) {
	hasLiked, err := s.repo.HasLiked(postID, ipAddress)
	if err != nil {
		return false, 0, err
	}

	count, err := s.repo.GetLikeCount(postID)
	if err != nil {
		return false, 0, err
	}

	return hasLiked, count, nil
}
