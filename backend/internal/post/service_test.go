package post

import (
	"context"
	"errors"
	"slices"
	"testing"
	"time"

	"github.com/dervisgenc/dervisgenc-blog/backend/internal/database/databasetest"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/httpx"
	"gorm.io/gorm"
)

func newTestService(t *testing.T) (*Service, *gorm.DB) {
	t.Helper()
	db := databasetest.Open(t, Models()...)
	return NewService(NewRepository(db)), db
}

func mustCreate(t *testing.T, s *Service, in Input) *Post {
	t.Helper()
	p, err := s.Create(context.Background(), in)
	if err != nil {
		t.Fatalf("Create(%q): %v", in.Title, err)
	}
	return p
}

func slugs(posts []Post) []string {
	out := make([]string, len(posts))
	for i, p := range posts {
		out[i] = p.Slug
	}
	return out
}

var firstPage = httpx.PageRequest{Page: 1, PageSize: 10}

func TestCreateDerivesUniqueSlugs(t *testing.T) {
	s, _ := newTestService(t)

	first := mustCreate(t, s, Input{Title: "Merhaba Dünya", Status: StatusDraft})
	second := mustCreate(t, s, Input{Title: "Merhaba dünya!", Status: StatusDraft})
	if first.Slug != "merhaba-dunya" || second.Slug != "merhaba-dunya-2" {
		t.Errorf("slugs = %q, %q", first.Slug, second.Slug)
	}

	_, err := s.Create(context.Background(), Input{Title: "Other", Slug: "merhaba-dunya", Status: StatusDraft})
	if !errors.Is(err, ErrSlugTaken) {
		t.Errorf("explicit duplicate slug: err = %v, want ErrSlugTaken", err)
	}
}

func TestPublishingKeepsFirstPublicationDate(t *testing.T) {
	s, _ := newTestService(t)
	ctx := context.Background()

	p := mustCreate(t, s, Input{Title: "Post", Content: "Body", Status: StatusDraft})
	if p.PublishedAt != nil {
		t.Fatal("draft has a publication date")
	}

	in := Input{Title: "Post", Content: "Body", Status: StatusPublished}
	p, err := s.Update(ctx, p.ID, in)
	if err != nil || p.PublishedAt == nil {
		t.Fatalf("publish: err=%v published_at=%v", err, p.PublishedAt)
	}
	published := *p.PublishedAt

	in.Status = StatusDraft
	if _, err := s.Update(ctx, p.ID, in); err != nil {
		t.Fatal(err)
	}
	s.now = func() time.Time { return published.Add(time.Hour) }
	in.Status = StatusPublished
	p, err = s.Update(ctx, p.ID, in)
	if err != nil {
		t.Fatal(err)
	}
	if !p.PublishedAt.Equal(published) {
		t.Errorf("republished at %v, want original %v", p.PublishedAt, published)
	}
}

func TestUpdateKeepsCountersAndSlug(t *testing.T) {
	s, db := newTestService(t)
	ctx := context.Background()

	p := mustCreate(t, s, Input{Title: "Original", Content: "Body", Status: StatusPublished, Tags: []string{"go"}})
	db.Model(&Post{}).Where("id = ?", p.ID).Updates(map[string]any{"view_count": 42, "like_count": 3})

	updated, err := s.Update(ctx, p.ID, Input{Title: "Renamed", Content: "New body", Status: StatusPublished, Tags: []string{"linux", "docker"}})
	if err != nil {
		t.Fatal(err)
	}
	if updated.Slug != "original" {
		t.Errorf("slug changed to %q without being asked", updated.Slug)
	}

	stored, err := s.Get(ctx, p.ID)
	if err != nil {
		t.Fatal(err)
	}
	if stored.ViewCount != 42 || stored.LikeCount != 3 {
		t.Errorf("counters = %d views, %d likes; an edit must not reset them", stored.ViewCount, stored.LikeCount)
	}
	if got := stored.TagNames(); !slices.Equal(got, []string{"docker", "linux"}) {
		t.Errorf("tags = %q", got)
	}
	if stored.Title != "Renamed" || stored.Content != "New body" {
		t.Errorf("fields not updated: %+v", stored)
	}
}

func TestUpdateAndDeleteMissing(t *testing.T) {
	s, _ := newTestService(t)
	ctx := context.Background()

	if _, err := s.Update(ctx, 999, Input{Title: "x", Status: StatusDraft}); !errors.Is(err, ErrNotFound) {
		t.Errorf("Update: err = %v, want ErrNotFound", err)
	}
	if err := s.Delete(ctx, 999); !errors.Is(err, ErrNotFound) {
		t.Errorf("Delete: err = %v, want ErrNotFound", err)
	}
}

func TestListPublished(t *testing.T) {
	s, _ := newTestService(t)
	ctx := context.Background()

	base := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	create := func(title, content string, tags []string, status Status, day int) {
		s.now = func() time.Time { return base.AddDate(0, 0, day) }
		mustCreate(t, s, Input{Title: title, Content: content, Tags: tags, Status: status})
	}
	create("Go Concurrency", "goroutines and channels", []string{"go"}, StatusPublished, 1)
	create("Linux Networking", "routing tables, 100% practical", []string{"linux", "network"}, StatusPublished, 2)
	create("Docker for Go", "multi-stage builds", []string{"go", "docker"}, StatusPublished, 3)
	create("Secret Draft", "go draft", []string{"go"}, StatusDraft, 4)

	tests := []struct {
		query, tag string
		want       []string
	}{
		{"", "", []string{"docker-for-go", "linux-networking", "go-concurrency"}},
		{"", "go", []string{"docker-for-go", "go-concurrency"}},
		{"GO", "", []string{"docker-for-go", "go-concurrency"}},
		{"100%", "", []string{"linux-networking"}},
		{"_", "", nil},
		{"channels", "go", []string{"go-concurrency"}},
	}
	for _, tt := range tests {
		posts, total, err := s.ListPublished(ctx, tt.query, tt.tag, firstPage)
		if err != nil {
			t.Fatal(err)
		}
		if got := slugs(posts); !slices.Equal(got, tt.want) && (len(got) > 0 || len(tt.want) > 0) {
			t.Errorf("q=%q tag=%q: got %q, want %q", tt.query, tt.tag, got, tt.want)
		}
		if total != int64(len(tt.want)) {
			t.Errorf("q=%q tag=%q: total = %d, want %d", tt.query, tt.tag, total, len(tt.want))
		}
	}

	page2, total, err := s.ListPublished(ctx, "", "", httpx.PageRequest{Page: 2, PageSize: 2})
	if err != nil || total != 3 || len(page2) != 1 || page2[0].Slug != "go-concurrency" {
		t.Errorf("page 2 = %q (total %d, err %v)", slugs(page2), total, err)
	}

	all, total, err := s.ListAll(ctx, "", "", firstPage)
	if err != nil || total != 4 || all[0].Slug != "secret-draft" {
		t.Errorf("admin list = %q (total %d, err %v), want the draft first", slugs(all), total, err)
	}

	tags, err := s.Tags(ctx)
	if err != nil {
		t.Fatal(err)
	}
	want := []TagCount{{"go", 2}, {"docker", 1}, {"linux", 1}, {"network", 1}}
	if !slices.Equal(tags, want) {
		t.Errorf("tags = %v, want %v (drafts excluded)", tags, want)
	}

	if _, err := s.GetPublished(ctx, "secret-draft"); !errors.Is(err, ErrNotFound) {
		t.Errorf("draft readable publicly: err = %v", err)
	}
}

func TestRelated(t *testing.T) {
	s, _ := newTestService(t)
	ctx := context.Background()

	base := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	day := 0
	create := func(title string, tags ...string) {
		day++
		s.now = func() time.Time { return base.AddDate(0, 0, day) }
		mustCreate(t, s, Input{Title: title, Content: "x", Tags: tags, Status: StatusPublished})
	}
	create("Target", "go", "docker", "linux")
	create("Two Shared", "go", "docker")
	create("One Shared", "linux")
	create("Unrelated New")
	create("Three Shared", "go", "docker", "linux")

	related, err := s.Related(ctx, "target", 4)
	if err != nil {
		t.Fatal(err)
	}
	want := []string{"three-shared", "two-shared", "one-shared", "unrelated-new"}
	if got := slugs(related); !slices.Equal(got, want) {
		t.Errorf("related = %q, want %q", got, want)
	}
}

func TestDeleteRemovesTagLinks(t *testing.T) {
	s, db := newTestService(t)
	ctx := context.Background()

	p := mustCreate(t, s, Input{Title: "Gone", Content: "x", Tags: []string{"go"}, Status: StatusPublished})
	if err := s.Delete(ctx, p.ID); err != nil {
		t.Fatal(err)
	}
	var links int64
	db.Table("post_tags").Where("post_id = ?", p.ID).Count(&links)
	if links != 0 {
		t.Errorf("%d tag links left after delete", links)
	}
}
