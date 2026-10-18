package stats

import (
	"context"
	"log/slog"
	"testing"
	"time"

	"github.com/dervisgenc/dervisgenc-blog/backend/internal/database/databasetest"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/post"
	"gorm.io/gorm"
)

var istanbul = mustLoad("Europe/Istanbul")

func mustLoad(name string) *time.Location {
	loc, err := time.LoadLocation(name)
	if err != nil {
		panic(err)
	}
	return loc
}

func TestDayUsesStatsTimeZone(t *testing.T) {
	// 22:30 UTC on 17 October is already 18 October in Istanbul (UTC+3).
	got := Day(time.Date(2026, 10, 17, 22, 30, 0, 0, time.UTC), istanbul)
	if want := time.Date(2026, 10, 18, 0, 0, 0, 0, time.UTC); !got.Equal(want) {
		t.Errorf("Day = %v, want %v", got, want)
	}
}

func setup(t *testing.T, now time.Time) (*Service, *gorm.DB) {
	t.Helper()
	db := databasetest.Open(t, append(post.Models(), Models()...)...)
	s := NewService(db, istanbul, slog.New(slog.DiscardHandler))
	s.now = func() time.Time { return now }
	return s, db
}

func TestDailyAndSummary(t *testing.T) {
	now := time.Date(2026, 10, 18, 12, 0, 0, 0, istanbul)
	s, db := setup(t, now)
	ctx := context.Background()
	today := Day(now, istanbul)

	p := post.Post{Slug: "p", Title: "P", Status: post.StatusPublished, ViewCount: 10, LikeCount: 2, ShareCount: 1}
	db.Create(&p)
	db.Create(&post.Post{Slug: "d", Title: "D", Status: post.StatusDraft})

	add := func(day time.Time, d Delta) {
		if err := Add(db, day, p.ID, d); err != nil {
			t.Fatal(err)
		}
	}
	add(today, Delta{Views: 2, Visitors: 1})
	add(today, Delta{Views: 1, Visitors: 1, Likes: 1})
	add(today.AddDate(0, 0, -2), Delta{Views: 5, Visitors: 3})
	add(today.AddDate(0, 0, -40), Delta{Views: 100, Visitors: 50})

	days, err := s.Daily(ctx, 3)
	if err != nil {
		t.Fatal(err)
	}
	want := []SiteDay{
		{Day: "2026-10-16", Views: 5, Visitors: 3},
		{Day: "2026-10-17"},
		{Day: "2026-10-18", Views: 3, Visitors: 2, Likes: 1},
	}
	if len(days) != len(want) {
		t.Fatalf("Daily = %+v", days)
	}
	for i := range want {
		if days[i] != want[i] {
			t.Errorf("day %d = %+v, want %+v", i, days[i], want[i])
		}
	}

	perPost, err := s.PostDaily(ctx, p.ID, 3)
	if err != nil || perPost[2].Views != 3 || perPost[2].Likes != 1 || perPost[0].Views != 5 {
		t.Errorf("PostDaily = %+v (err %v)", perPost, err)
	}

	sum, err := s.Summary(ctx)
	if err != nil {
		t.Fatal(err)
	}
	wantSum := Summary{
		PostsPublished: 1, PostsDraft: 1,
		TotalViews: 10, TotalLikes: 2, TotalShares: 1,
		ViewsToday: 3, VisitorsToday: 2,
		Views30d: 8, Visitors30d: 5,
	}
	if sum != wantSum {
		t.Errorf("Summary = %+v, want %+v", sum, wantSum)
	}

	top, err := s.TopPosts(ctx, 30, 5)
	if err != nil || len(top) != 1 || top[0].Views != 8 || top[0].Slug != "p" {
		t.Errorf("TopPosts = %+v (err %v)", top, err)
	}
}

func TestPurgeMarks(t *testing.T) {
	now := time.Date(2026, 10, 18, 12, 0, 0, 0, istanbul)
	s, db := setup(t, now)
	today := Day(now, istanbul)

	for _, day := range []time.Time{today, today.AddDate(0, 0, -1), today.AddDate(0, 0, -2), today.AddDate(0, 0, -3)} {
		if _, err := MarkVisitor(db, day, "v"); err != nil {
			t.Fatal(err)
		}
	}
	first, err := MarkVisitor(db, today, "v")
	if err != nil || first {
		t.Errorf("second mark on the same day: first=%v err=%v", first, err)
	}

	deleted, err := s.PurgeMarks(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	if deleted != 1 {
		t.Errorf("deleted %d marks, want only the one older than two days", deleted)
	}
}
