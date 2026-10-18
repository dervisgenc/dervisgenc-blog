// Package stats keeps daily traffic and engagement counters and reports
// them to the admin panel.
//
// Counters are aggregated as events happen, so no raw request log is kept
// and nothing needs periodic roll-ups. The only short-lived data are the
// marks used to count a visitor or a post view once per day; they are
// deleted after two days by Service.RunMaintenance.
package stats

import (
	"time"

	"github.com/dervisgenc/dervisgenc-blog/backend/internal/post"
)

// DailyStat holds the site-wide counters of one day.
type DailyStat struct {
	Day      time.Time `gorm:"type:date;primaryKey"`
	Views    int64     `gorm:"not null;default:0"`
	Visitors int64     `gorm:"not null;default:0"`
	Likes    int64     `gorm:"not null;default:0"`
	Shares   int64     `gorm:"not null;default:0"`
}

// PostDailyStat holds the counters of one post on one day.
type PostDailyStat struct {
	PostID uint      `gorm:"primaryKey"`
	Day    time.Time `gorm:"type:date;primaryKey;index"`
	Views  int64     `gorm:"not null;default:0"`
	Likes  int64     `gorm:"not null;default:0"`
	Shares int64     `gorm:"not null;default:0"`

	Post post.Post `gorm:"constraint:OnDelete:CASCADE"`
}

// VisitorMark records that a visitor was counted on a day.
type VisitorMark struct {
	Day     time.Time `gorm:"type:date;primaryKey"`
	Visitor string    `gorm:"size:32;primaryKey"`
}

// ViewMark records that a visitor's view of a post was counted on a day.
type ViewMark struct {
	Day     time.Time `gorm:"type:date;primaryKey"`
	PostID  uint      `gorm:"primaryKey"`
	Visitor string    `gorm:"size:32;primaryKey"`

	Post post.Post `gorm:"constraint:OnDelete:CASCADE"`
}

// Models lists the tables this package owns, in migration order.
func Models() []any {
	return []any{&DailyStat{}, &PostDailyStat{}, &VisitorMark{}, &ViewMark{}}
}

// Day returns the calendar day of t in loc, as midnight UTC. Days are
// stored in that form so the database never shifts them by a time zone.
func Day(t time.Time, loc *time.Location) time.Time {
	y, m, d := t.In(loc).Date()
	return time.Date(y, m, d, 0, 0, 0, 0, time.UTC)
}
