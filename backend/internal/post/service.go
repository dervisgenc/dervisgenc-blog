package post

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/dervisgenc/dervisgenc-blog/backend/internal/httpx"
)

const maxRelated = 6

// Service holds the rules for writing, publishing and reading posts.
type Service struct {
	repo *Repository
	now  func() time.Time
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo, now: time.Now}
}

// Create stores a new post. Without a slug, one is derived from the title.
func (s *Service) Create(ctx context.Context, in Input) (*Post, error) {
	in.normalize()
	if err := in.validate(); err != nil {
		return nil, err
	}

	slug, err := s.resolveSlug(ctx, in, 0)
	if err != nil {
		return nil, err
	}
	p := &Post{Slug: slug}
	s.apply(p, in)
	if err := s.repo.Create(ctx, p, in.Tags); err != nil {
		return nil, err
	}
	return p, nil
}

// Update replaces the content of an existing post. Without a slug, the
// current one is kept so published links stay valid.
func (s *Service) Update(ctx context.Context, id uint, in Input) (*Post, error) {
	in.normalize()
	if err := in.validate(); err != nil {
		return nil, err
	}

	p, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if in.Slug != "" && in.Slug != p.Slug {
		if p.Slug, err = s.resolveSlug(ctx, in, id); err != nil {
			return nil, err
		}
	}
	s.apply(p, in)
	if err := s.repo.Update(ctx, p, in.Tags); err != nil {
		return nil, err
	}
	return p, nil
}

// Delete removes a post and everything recorded about it.
func (s *Service) Delete(ctx context.Context, id uint) error {
	return s.repo.Delete(ctx, id)
}

// Get returns any post by ID, for the admin panel.
func (s *Service) Get(ctx context.Context, id uint) (*Post, error) {
	return s.repo.FindByID(ctx, id)
}

// GetPublished returns a published post by slug, for the public site.
func (s *Service) GetPublished(ctx context.Context, slug string) (*Post, error) {
	return s.repo.FindPublished(ctx, slug)
}

// ListPublished returns published posts, newest first.
func (s *Service) ListPublished(ctx context.Context, query, tag string, page httpx.PageRequest) ([]Post, int64, error) {
	f := Filter{Status: StatusPublished, Query: query, Tag: tag}
	return s.repo.List(ctx, f, "posts.published_at DESC", page)
}

// ListAll returns posts in any status, most recently edited first.
func (s *Service) ListAll(ctx context.Context, status Status, query string, page httpx.PageRequest) ([]Post, int64, error) {
	if status != StatusDraft && status != StatusPublished {
		status = ""
	}
	f := Filter{Status: status, Query: query}
	return s.repo.List(ctx, f, "posts.updated_at DESC", page)
}

// Related returns published posts similar to the one with the given slug.
func (s *Service) Related(ctx context.Context, slug string, limit int) ([]Post, error) {
	p, err := s.repo.FindPublished(ctx, slug)
	if err != nil {
		return nil, err
	}
	return s.repo.Related(ctx, p, min(max(limit, 1), maxRelated))
}

// Tags returns the tags in use on the public site.
func (s *Service) Tags(ctx context.Context) ([]TagCount, error) {
	return s.repo.TagCounts(ctx)
}

func (s *Service) apply(p *Post, in Input) {
	p.Title = in.Title
	p.Summary = in.Summary
	p.Content = in.Content
	p.CoverImageURL = in.CoverImageURL
	p.Status = in.Status
	p.ReadingMinutes = readingMinutes(in.Content)
	// The first publication date is kept when a post is unpublished and
	// published again, so it does not jump to the top of the list.
	if p.Status == StatusPublished && p.PublishedAt == nil {
		// PostgreSQL stores microseconds; match it so the returned post
		// equals the stored one.
		now := s.now().Truncate(time.Microsecond)
		p.PublishedAt = &now
	}
}

// resolveSlug returns the slug to store for in. A slug the admin chose must
// be free; one derived from the title gets a numeric suffix until it is.
func (s *Service) resolveSlug(ctx context.Context, in Input, id uint) (string, error) {
	if in.Slug != "" {
		taken, err := s.repo.SlugTaken(ctx, in.Slug, id)
		switch {
		case err != nil:
			return "", err
		case taken:
			return "", ErrSlugTaken
		}
		return in.Slug, nil
	}

	base := Slugify(in.Title)
	if base == "" {
		base = "post"
	}
	// Leave room for a suffix such as "-12".
	short := strings.TrimRight(base[:min(len(base), maxSlugLength-4)], "-")
	for n := 1; n <= 100; n++ {
		candidate := base
		if n > 1 {
			candidate = short + "-" + strconv.Itoa(n)
		}
		taken, err := s.repo.SlugTaken(ctx, candidate, id)
		if err != nil {
			return "", err
		}
		if !taken {
			return candidate, nil
		}
	}
	return "", errors.Join(ErrSlugTaken, fmt.Errorf("no free slug for %q", base))
}
