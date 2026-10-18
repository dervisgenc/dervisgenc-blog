// Package post manages blog posts: writing and publishing them in the admin
// panel and listing, searching and reading them on the public site.
package post

import "time"

// Status is the publication state of a post.
type Status string

const (
	StatusDraft     Status = "draft"
	StatusPublished Status = "published"
)

// Post is a blog post. Content is Markdown.
type Post struct {
	ID             uint       `gorm:"primaryKey"`
	Slug           string     `gorm:"size:200;not null;uniqueIndex"`
	Title          string     `gorm:"size:200;not null"`
	Summary        string     `gorm:"size:500;not null;default:''"`
	Content        string     `gorm:"type:text;not null;default:''"`
	CoverImageURL  string     `gorm:"size:500;not null;default:''"`
	Status         Status     `gorm:"size:16;not null;index:idx_posts_status_published_at,priority:1"`
	PublishedAt    *time.Time `gorm:"index:idx_posts_status_published_at,priority:2"`
	ReadingMinutes int        `gorm:"not null;default:1"`

	// Totals shown on the site; the per-day history lives in package stats.
	ViewCount  int64 `gorm:"not null;default:0"`
	LikeCount  int64 `gorm:"not null;default:0"`
	ShareCount int64 `gorm:"not null;default:0"`

	Tags []Tag `gorm:"many2many:post_tags;constraint:OnDelete:CASCADE"`

	CreatedAt time.Time
	UpdatedAt time.Time `gorm:"index"`
}

// Tag labels posts by topic.
type Tag struct {
	ID   uint   `gorm:"primaryKey"`
	Name string `gorm:"size:32;not null;uniqueIndex"`
}

// TagCount is a tag with the number of published posts carrying it.
type TagCount struct {
	Name  string `json:"name"`
	Count int64  `json:"count"`
}

// TagNames returns the names of the post's tags.
func (p *Post) TagNames() []string {
	names := make([]string, len(p.Tags))
	for i, tag := range p.Tags {
		names[i] = tag.Name
	}
	return names
}

// Models lists the tables this package owns, in migration order.
func Models() []any {
	return []any{&Post{}, &Tag{}}
}
