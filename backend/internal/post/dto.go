package post

import "time"

// Summary is a post as listed on the public site.
type Summary struct {
	ID             uint       `json:"id"`
	Slug           string     `json:"slug"`
	Title          string     `json:"title"`
	Summary        string     `json:"summary"`
	CoverImageURL  string     `json:"cover_image_url"`
	Tags           []string   `json:"tags"`
	ReadingMinutes int        `json:"reading_minutes"`
	PublishedAt    *time.Time `json:"published_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
	ViewCount      int64      `json:"view_count"`
	LikeCount      int64      `json:"like_count"`
}

// Detail is a post as read on the public site.
type Detail struct {
	Summary
	Content string `json:"content"`
}

// AdminSummary is a post as listed in the admin panel.
type AdminSummary struct {
	Summary
	Status     Status    `json:"status"`
	ShareCount int64     `json:"share_count"`
	CreatedAt  time.Time `json:"created_at"`
}

// AdminDetail is a post as edited in the admin panel.
type AdminDetail struct {
	AdminSummary
	Content string `json:"content"`
}

func toSummary(p *Post) Summary {
	return Summary{
		ID:             p.ID,
		Slug:           p.Slug,
		Title:          p.Title,
		Summary:        p.Summary,
		CoverImageURL:  p.CoverImageURL,
		Tags:           p.TagNames(),
		ReadingMinutes: p.ReadingMinutes,
		PublishedAt:    p.PublishedAt,
		UpdatedAt:      p.UpdatedAt,
		ViewCount:      p.ViewCount,
		LikeCount:      p.LikeCount,
	}
}

func toAdminSummary(p *Post) AdminSummary {
	return AdminSummary{Summary: toSummary(p), Status: p.Status, ShareCount: p.ShareCount, CreatedAt: p.CreatedAt}
}

func mapPosts[T any](posts []Post, convert func(*Post) T) []T {
	out := make([]T, len(posts))
	for i := range posts {
		out[i] = convert(&posts[i])
	}
	return out
}
