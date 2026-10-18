package stats

import (
	"fmt"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// Delta is a change to the counters of one day.
type Delta struct {
	Views    int64
	Visitors int64
	Likes    int64
	Shares   int64
}

// Add adds d to the site-wide counters of day and, when postID is not zero,
// to that post's counters. It is meant to run inside the transaction that
// records the event.
func Add(tx *gorm.DB, day time.Time, postID uint, d Delta) error {
	site := DailyStat{Day: day, Views: d.Views, Visitors: d.Visitors, Likes: d.Likes, Shares: d.Shares}
	err := tx.Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "day"}},
		DoUpdates: clause.Assignments(map[string]any{
			"views":    gorm.Expr("daily_stats.views + ?", d.Views),
			"visitors": gorm.Expr("daily_stats.visitors + ?", d.Visitors),
			"likes":    gorm.Expr("daily_stats.likes + ?", d.Likes),
			"shares":   gorm.Expr("daily_stats.shares + ?", d.Shares),
		}),
	}).Create(&site).Error
	if err != nil {
		return fmt.Errorf("update daily stats: %w", err)
	}
	if postID == 0 {
		return nil
	}

	perPost := PostDailyStat{PostID: postID, Day: day, Views: d.Views, Likes: d.Likes, Shares: d.Shares}
	err = tx.Omit(clause.Associations).Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "post_id"}, {Name: "day"}},
		DoUpdates: clause.Assignments(map[string]any{
			"views":  gorm.Expr("post_daily_stats.views + ?", d.Views),
			"likes":  gorm.Expr("post_daily_stats.likes + ?", d.Likes),
			"shares": gorm.Expr("post_daily_stats.shares + ?", d.Shares),
		}),
	}).Create(&perPost).Error
	if err != nil {
		return fmt.Errorf("update post daily stats: %w", err)
	}
	return nil
}

// MarkVisitor records visitor for day and reports whether this is the
// visitor's first mark that day.
func MarkVisitor(tx *gorm.DB, day time.Time, visitor string) (bool, error) {
	return insertOnce(tx, &VisitorMark{Day: day, Visitor: visitor})
}

// MarkView records the visitor's view of the post for day and reports
// whether it is the first one that day.
func MarkView(tx *gorm.DB, day time.Time, postID uint, visitor string) (bool, error) {
	return insertOnce(tx, &ViewMark{Day: day, PostID: postID, Visitor: visitor})
}

func insertOnce(tx *gorm.DB, mark any) (bool, error) {
	res := tx.Omit(clause.Associations).Clauses(clause.OnConflict{DoNothing: true}).Create(mark)
	if res.Error != nil {
		return false, fmt.Errorf("insert %T: %w", mark, res.Error)
	}
	return res.RowsAffected == 1, nil
}
