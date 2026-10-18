package post

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/dervisgenc/dervisgenc-blog/backend/internal/httpx"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var (
	ErrNotFound  = errors.New("post not found")
	ErrSlugTaken = errors.New("slug is already used by another post")
)

// editableColumns are the columns an update may change. Counters are left
// out so an edit never overwrites views or likes recorded meanwhile.
var editableColumns = []string{
	"Slug", "Title", "Summary", "Content", "CoverImageURL",
	"Status", "PublishedAt", "ReadingMinutes", "UpdatedAt",
}

// Filter narrows a post listing.
type Filter struct {
	Status Status // empty means any status
	Query  string // matched against title, summary and content
	Tag    string
}

// Repository stores posts in PostgreSQL.
type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

// Create inserts the post with its tags.
func (r *Repository) Create(ctx context.Context, p *Post, tags []string) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var err error
		if p.Tags, err = ensureTags(tx, tags); err != nil {
			return err
		}
		// Omit("Tags.*") links the existing tags without upserting them.
		return translate(tx.Omit("Tags.*").Create(p).Error)
	})
}

// Update saves the editable fields of the post and replaces its tags.
func (r *Repository) Update(ctx context.Context, p *Post, tags []string) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		res := tx.Model(&Post{ID: p.ID}).Select(editableColumns).Updates(p)
		if err := translate(res.Error); err != nil {
			return err
		}
		if res.RowsAffected == 0 {
			return ErrNotFound
		}

		var err error
		if p.Tags, err = ensureTags(tx, tags); err != nil {
			return err
		}
		return tx.Model(p).Association("Tags").Replace(p.Tags)
	})
}

// Delete removes the post. Its tags links, likes and statistics are removed
// by the database through ON DELETE CASCADE.
func (r *Repository) Delete(ctx context.Context, id uint) error {
	res := r.db.WithContext(ctx).Delete(&Post{}, id)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return ErrNotFound
	}
	return nil
}

// FindByID returns the post with its tags, whatever its status.
func (r *Repository) FindByID(ctx context.Context, id uint) (*Post, error) {
	var p Post
	err := r.withTags(ctx).First(&p, id).Error
	return &p, notFound(err)
}

// FindPublished returns the published post with the given slug.
func (r *Repository) FindPublished(ctx context.Context, slug string) (*Post, error) {
	var p Post
	err := r.withTags(ctx).Where(&Post{Slug: slug, Status: StatusPublished}).First(&p).Error
	return &p, notFound(err)
}

// PublishedID returns the ID of the published post with the given slug.
func (r *Repository) PublishedID(ctx context.Context, slug string) (uint, error) {
	var p Post
	err := r.db.WithContext(ctx).Select("id").Where(&Post{Slug: slug, Status: StatusPublished}).First(&p).Error
	return p.ID, notFound(err)
}

// SlugTaken reports whether a post other than excludeID uses slug.
func (r *Repository) SlugTaken(ctx context.Context, slug string, excludeID uint) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&Post{}).
		Where("slug = ? AND id <> ?", slug, excludeID).
		Count(&count).Error
	return count > 0, err
}

// List returns one page of posts matching f, ordered by orderBy.
func (r *Repository) List(ctx context.Context, f Filter, orderBy string, page httpx.PageRequest) ([]Post, int64, error) {
	query := r.filtered(ctx, f)

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("count posts: %w", err)
	}

	var posts []Post
	err := query.Preload("Tags", orderTags).
		Order(orderBy).Order("posts.id DESC").
		Offset(page.Offset()).Limit(page.PageSize).
		Find(&posts).Error
	if err != nil {
		return nil, 0, fmt.Errorf("list posts: %w", err)
	}
	return posts, total, nil
}

// Related returns up to limit published posts sharing the most tags with p,
// topped up with the latest posts when too few share a tag.
func (r *Repository) Related(ctx context.Context, p *Post, limit int) ([]Post, error) {
	db := r.db.WithContext(ctx)

	var ids []uint
	err := db.Table("post_tags").
		Joins("JOIN posts ON posts.id = post_tags.post_id").
		Where("post_tags.tag_id IN (?)", db.Table("post_tags").Select("tag_id").Where("post_id = ?", p.ID)).
		Where("posts.id <> ? AND posts.status = ?", p.ID, StatusPublished).
		Group("post_tags.post_id").
		Order("COUNT(*) DESC, MAX(posts.published_at) DESC").
		Limit(limit).
		Pluck("post_tags.post_id", &ids).Error
	if err != nil {
		return nil, fmt.Errorf("find related posts: %w", err)
	}

	if len(ids) < limit {
		var latest []uint
		err := db.Model(&Post{}).
			Where("status = ? AND id <> ?", StatusPublished, p.ID).
			Where("id NOT IN (?)", append(ids, 0)).
			Order("published_at DESC").
			Limit(limit-len(ids)).
			Pluck("id", &latest).Error
		if err != nil {
			return nil, fmt.Errorf("find latest posts: %w", err)
		}
		ids = append(ids, latest...)
	}
	if len(ids) == 0 {
		return []Post{}, nil
	}

	var posts []Post
	if err := r.withTags(ctx).Where("id IN ?", ids).Find(&posts).Error; err != nil {
		return nil, fmt.Errorf("load related posts: %w", err)
	}
	return orderByIDs(posts, ids), nil
}

// TagCounts returns the tags of published posts, most used first.
func (r *Repository) TagCounts(ctx context.Context) ([]TagCount, error) {
	counts := []TagCount{}
	err := r.db.WithContext(ctx).Model(&Tag{}).
		Select("tags.name AS name, COUNT(*) AS count").
		Joins("JOIN post_tags ON post_tags.tag_id = tags.id").
		Joins("JOIN posts ON posts.id = post_tags.post_id").
		Where("posts.status = ?", StatusPublished).
		Group("tags.name").
		Order("count DESC, name").
		Scan(&counts).Error
	return counts, err
}

func (r *Repository) withTags(ctx context.Context) *gorm.DB {
	return r.db.WithContext(ctx).Preload("Tags", orderTags)
}

func (r *Repository) filtered(ctx context.Context, f Filter) *gorm.DB {
	db := r.db.WithContext(ctx)
	query := db.Model(&Post{})
	if f.Status != "" {
		query = query.Where("posts.status = ?", f.Status)
	}
	if f.Query != "" {
		pattern := "%" + escapeLike(f.Query) + "%"
		query = query.Where(db.Where("posts.title ILIKE ?", pattern).
			Or("posts.summary ILIKE ?", pattern).
			Or("posts.content ILIKE ?", pattern))
	}
	if f.Tag != "" {
		query = query.Where("posts.id IN (?)", db.Table("post_tags").
			Select("post_tags.post_id").
			Joins("JOIN tags ON tags.id = post_tags.tag_id").
			Where("tags.name = ?", f.Tag))
	}
	return query
}

// ensureTags returns the tags with the given names, creating missing ones.
func ensureTags(tx *gorm.DB, names []string) ([]Tag, error) {
	if len(names) == 0 {
		return []Tag{}, nil
	}
	rows := make([]Tag, len(names))
	for i, name := range names {
		rows[i] = Tag{Name: name}
	}
	if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&rows).Error; err != nil {
		return nil, fmt.Errorf("create tags: %w", err)
	}

	var tags []Tag
	if err := tx.Where("name IN ?", names).Find(&tags).Error; err != nil {
		return nil, fmt.Errorf("load tags: %w", err)
	}
	return tags, nil
}

func orderTags(db *gorm.DB) *gorm.DB {
	return db.Order("tags.name")
}

func orderByIDs(posts []Post, ids []uint) []Post {
	byID := make(map[uint]Post, len(posts))
	for _, p := range posts {
		byID[p.ID] = p
	}
	ordered := make([]Post, 0, len(posts))
	for _, id := range ids {
		if p, ok := byID[id]; ok {
			ordered = append(ordered, p)
		}
	}
	return ordered
}

// escapeLike escapes the LIKE wildcards in s; PostgreSQL's default escape
// character is the backslash.
func escapeLike(s string) string {
	return strings.NewReplacer(`\`, `\\`, `%`, `\%`, `_`, `\_`).Replace(s)
}

func notFound(err error) error {
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return ErrNotFound
	}
	return err
}

func translate(err error) error {
	if errors.Is(err, gorm.ErrDuplicatedKey) {
		return ErrSlugTaken
	}
	return err
}
