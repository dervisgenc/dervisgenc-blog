package engagement

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/dervisgenc/dervisgenc-blog/backend/internal/database/databasetest"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/post"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/stats"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/visitor"
	"gorm.io/gorm"
)

var (
	alice = Client{IP: "192.0.2.1", UserAgent: "firefox"}
	bob   = Client{IP: "192.0.2.2", UserAgent: "chrome"}
)

type fixture struct {
	db      *gorm.DB
	service *Service
	posts   *post.Service
}

func setup(t *testing.T) fixture {
	t.Helper()
	models := append(post.Models(), Models()...)
	db := databasetest.Open(t, append(models, stats.Models()...)...)
	repo := post.NewRepository(db)
	return fixture{
		db:      db,
		service: NewService(db, repo, visitor.NewHasher([]byte("test-secret")), time.UTC),
		posts:   post.NewService(repo),
	}
}

func (f fixture) create(t *testing.T, title string, status post.Status) *post.Post {
	t.Helper()
	p, err := f.posts.Create(context.Background(), post.Input{Title: title, Content: "Body", Status: status})
	if err != nil {
		t.Fatal(err)
	}
	return p
}

func (f fixture) reload(t *testing.T, id uint) *post.Post {
	t.Helper()
	p, err := f.posts.Get(context.Background(), id)
	if err != nil {
		t.Fatal(err)
	}
	return p
}

func TestViewsCountOncePerVisitorAndDay(t *testing.T) {
	f := setup(t)
	ctx := context.Background()
	p := f.create(t, "Post", post.StatusPublished)
	other := f.create(t, "Other", post.StatusPublished)

	for _, c := range []Client{alice, alice, bob} {
		if err := f.service.View(ctx, p.Slug, c); err != nil {
			t.Fatal(err)
		}
	}
	if err := f.service.View(ctx, other.Slug, alice); err != nil {
		t.Fatal(err)
	}

	if got := f.reload(t, p.ID).ViewCount; got != 2 {
		t.Errorf("view_count = %d, want 2", got)
	}
	var day stats.DailyStat
	f.db.First(&day)
	if day.Views != 3 || day.Visitors != 2 {
		t.Errorf("daily stats = %d views, %d visitors; want 3 views, 2 visitors", day.Views, day.Visitors)
	}

	tomorrow := time.Now().Add(24 * time.Hour)
	f.service.now = func() time.Time { return tomorrow }
	if err := f.service.View(ctx, p.Slug, alice); err != nil {
		t.Fatal(err)
	}
	if got := f.reload(t, p.ID).ViewCount; got != 3 {
		t.Errorf("view_count after a new day = %d, want 3", got)
	}
}

func TestLikesAreIdempotent(t *testing.T) {
	f := setup(t)
	ctx := context.Background()
	p := f.reload(t, f.create(t, "Post", post.StatusPublished).ID)
	updatedAt := p.UpdatedAt

	steps := []struct {
		client    Client
		like      bool
		wantLiked bool
		wantCount int64
	}{
		{alice, true, true, 1},
		{alice, true, true, 1},
		{bob, true, true, 2},
		{alice, false, false, 1},
		{alice, false, false, 1},
	}
	for i, step := range steps {
		state, err := f.service.SetLike(ctx, p.Slug, step.client, step.like)
		if err != nil {
			t.Fatal(err)
		}
		if state.Liked != step.wantLiked || state.LikeCount != step.wantCount {
			t.Errorf("step %d: state = %+v, want liked=%v count=%d", i, state, step.wantLiked, step.wantCount)
		}
	}

	state, err := f.service.LikeStatus(ctx, p.Slug, bob)
	if err != nil || !state.Liked || state.LikeCount != 1 {
		t.Errorf("bob's status = %+v (err %v)", state, err)
	}
	if got := f.reload(t, p.ID).UpdatedAt; !got.Equal(updatedAt) {
		t.Errorf("updated_at changed from %v to %v; likes are not edits", updatedAt, got)
	}
}

func TestDraftsAcceptNoEngagement(t *testing.T) {
	f := setup(t)
	ctx := context.Background()
	draft := f.create(t, "Draft", post.StatusDraft)

	if err := f.service.View(ctx, draft.Slug, alice); !errors.Is(err, post.ErrNotFound) {
		t.Errorf("View: err = %v, want ErrNotFound", err)
	}
	if _, err := f.service.SetLike(ctx, draft.Slug, alice, true); !errors.Is(err, post.ErrNotFound) {
		t.Errorf("SetLike: err = %v, want ErrNotFound", err)
	}
	if err := f.service.Share(ctx, draft.Slug); !errors.Is(err, post.ErrNotFound) {
		t.Errorf("Share: err = %v, want ErrNotFound", err)
	}
}

func TestDeletingPostRemovesItsEngagement(t *testing.T) {
	f := setup(t)
	ctx := context.Background()
	p := f.create(t, "Post", post.StatusPublished)

	if err := f.service.View(ctx, p.Slug, alice); err != nil {
		t.Fatal(err)
	}
	if _, err := f.service.SetLike(ctx, p.Slug, alice, true); err != nil {
		t.Fatal(err)
	}
	if err := f.service.Share(ctx, p.Slug); err != nil {
		t.Fatal(err)
	}
	if got := f.reload(t, p.ID).ShareCount; got != 1 {
		t.Errorf("share_count = %d, want 1", got)
	}

	if err := f.posts.Delete(ctx, p.ID); err != nil {
		t.Fatal(err)
	}
	for _, model := range []any{&Like{}, &stats.PostDailyStat{}, &stats.ViewMark{}} {
		var n int64
		f.db.Model(model).Where("post_id = ?", p.ID).Count(&n)
		if n != 0 {
			t.Errorf("%T: %d rows left after deleting the post", model, n)
		}
	}
	var site int64
	f.db.Model(&stats.DailyStat{}).Count(&site)
	if site != 1 {
		t.Errorf("site-wide stats rows = %d, want them kept", site)
	}
}
