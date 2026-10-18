// Package engagement records how readers interact with published posts:
// views, likes and shares. There are no reader accounts; readers are told
// apart by anonymous visitor hashes.
package engagement

import (
	"context"
	"fmt"
	"time"

	"github.com/dervisgenc/dervisgenc-blog/backend/internal/post"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/stats"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/visitor"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// Like is a reader's like of a post.
type Like struct {
	PostID    uint   `gorm:"primaryKey"`
	Visitor   string `gorm:"size:32;primaryKey"`
	CreatedAt time.Time

	Post post.Post `gorm:"constraint:OnDelete:CASCADE"`
}

func (Like) TableName() string { return "post_likes" }

// Models lists the tables this package owns, in migration order.
func Models() []any {
	return []any{&Like{}}
}

// Channels are the places a post can be shared to.
var Channels = map[string]bool{
	"x": true, "linkedin": true, "whatsapp": true, "telegram": true, "copy": true, "native": true,
}

// Client identifies the reader behind a request.
type Client struct {
	IP        string
	UserAgent string
}

// LikeState is a reader's like status on a post.
type LikeState struct {
	Liked     bool  `json:"liked"`
	LikeCount int64 `json:"like_count"`
}

// Service records views, likes and shares.
type Service struct {
	db     *gorm.DB
	posts  *post.Repository
	hasher *visitor.Hasher
	loc    *time.Location
	now    func() time.Time
}

func NewService(db *gorm.DB, posts *post.Repository, hasher *visitor.Hasher, loc *time.Location) *Service {
	return &Service{db: db, posts: posts, hasher: hasher, loc: loc, now: time.Now}
}

// View counts a page view of the post, at most once per reader and day.
func (s *Service) View(ctx context.Context, slug string, client Client) error {
	postID, err := s.posts.PublishedID(ctx, slug)
	if err != nil {
		return err
	}
	day := stats.Day(s.now(), s.loc)
	id := s.hasher.Daily(day, client.IP, client.UserAgent)

	return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		first, err := stats.MarkView(tx, day, postID, id)
		if err != nil || !first {
			return err
		}
		newVisitor, err := stats.MarkVisitor(tx, day, id)
		if err != nil {
			return err
		}
		delta := stats.Delta{Views: 1}
		if newVisitor {
			delta.Visitors = 1
		}
		if err := incrementPost(tx, postID, "view_count", 1); err != nil {
			return err
		}
		return stats.Add(tx, day, postID, delta)
	})
}

// LikeStatus returns whether the reader likes the post.
func (s *Service) LikeStatus(ctx context.Context, slug string, client Client) (LikeState, error) {
	postID, err := s.posts.PublishedID(ctx, slug)
	if err != nil {
		return LikeState{}, err
	}
	return s.likeState(s.db.WithContext(ctx), postID, s.hasher.Stable(client.IP))
}

// SetLike likes or unlikes the post for the reader. Repeating the same call
// changes nothing.
func (s *Service) SetLike(ctx context.Context, slug string, client Client, liked bool) (LikeState, error) {
	postID, err := s.posts.PublishedID(ctx, slug)
	if err != nil {
		return LikeState{}, err
	}
	id := s.hasher.Stable(client.IP)

	var state LikeState
	err = s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if liked {
			res := tx.Omit(clause.Associations).Clauses(clause.OnConflict{DoNothing: true}).
				Create(&Like{PostID: postID, Visitor: id})
			if res.Error != nil {
				return fmt.Errorf("insert like: %w", res.Error)
			}
			if res.RowsAffected == 1 {
				if err := incrementPost(tx, postID, "like_count", 1); err != nil {
					return err
				}
				// Daily counters record likes given that day; taking a like
				// back later only lowers the post's total.
				if err := stats.Add(tx, stats.Day(s.now(), s.loc), postID, stats.Delta{Likes: 1}); err != nil {
					return err
				}
			}
		} else {
			res := tx.Where(&Like{PostID: postID, Visitor: id}).Delete(&Like{})
			if res.Error != nil {
				return fmt.Errorf("delete like: %w", res.Error)
			}
			if res.RowsAffected == 1 {
				if err := incrementPost(tx, postID, "like_count", -1); err != nil {
					return err
				}
			}
		}

		var err error
		state, err = s.likeState(tx, postID, id)
		return err
	})
	return state, err
}

// Share counts a share of the post.
func (s *Service) Share(ctx context.Context, slug string) error {
	postID, err := s.posts.PublishedID(ctx, slug)
	if err != nil {
		return err
	}
	return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := incrementPost(tx, postID, "share_count", 1); err != nil {
			return err
		}
		return stats.Add(tx, stats.Day(s.now(), s.loc), postID, stats.Delta{Shares: 1})
	})
}

func (s *Service) likeState(db *gorm.DB, postID uint, id string) (LikeState, error) {
	var state LikeState
	var p post.Post
	if err := db.Select("like_count").First(&p, postID).Error; err != nil {
		return state, fmt.Errorf("load like count: %w", err)
	}
	var count int64
	if err := db.Model(&Like{}).Where(&Like{PostID: postID, Visitor: id}).Count(&count).Error; err != nil {
		return state, fmt.Errorf("check like: %w", err)
	}
	return LikeState{Liked: count > 0, LikeCount: p.LikeCount}, nil
}

// incrementPost adds by to one of the post's counters. UpdateColumn leaves
// updated_at alone: engagement is not an edit.
func incrementPost(tx *gorm.DB, postID uint, column string, by int) error {
	err := tx.Model(&post.Post{}).Where("id = ?", postID).
		UpdateColumn(column, gorm.Expr("GREATEST("+column+" + ?, 0)", by)).Error
	if err != nil {
		return fmt.Errorf("update post %s: %w", column, err)
	}
	return nil
}
