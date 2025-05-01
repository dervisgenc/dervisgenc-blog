package like

type LikeService struct {
	repo LikeRepository
}

func NewLikeService(repo LikeRepository) *LikeService {
	return &LikeService{repo: repo}
}

// ToggleLike toggles the like status and returns the new status and count.
func (s *LikeService) ToggleLike(postID uint, ipAddress string) (bool, int, error) {
	hasLiked, err := s.repo.HasLiked(postID, ipAddress)
	if err != nil {
		return false, 0, err
	}

	newLikedStatus := !hasLiked // Determine the new status *before* the action

	if hasLiked {
		err = s.repo.RemoveLike(postID, ipAddress)
	} else {
		err = s.repo.AddLike(postID, ipAddress)
	}

	if err != nil {
		// If the error occurred, the status didn't actually change
		return hasLiked, 0, err
	}

	count, err := s.repo.GetLikeCount(postID)
	if err != nil {
		// Even if count fails, the like/unlike succeeded, return the new status
		return newLikedStatus, 0, err
	}

	return newLikedStatus, count, nil
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
