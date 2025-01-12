package migrations

import (
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
	"gorm.io/gorm"
)

func MigrateSchema(db *gorm.DB) error {
	// Create extensions if they don't exist
	db.Exec(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`)
	db.Exec(`CREATE EXTENSION IF NOT EXISTS "pg_cron"`)

	// Auto-migrate all models
	return db.AutoMigrate(
		&models.User{},
		&models.Post{},
		&models.Stat{},
		&models.PostLike{},
		&models.PostShare{},
		&models.Visitor{},
		&models.PostView{},
		&models.DailyStat{},
	)
}

// CreateIndices creates necessary database indices
func CreateIndices(db *gorm.DB) error {
	// Visitor table indices
	db.Exec(`CREATE INDEX IF NOT EXISTS idx_visitors_ip_visit_time ON visitors(ip_address, visit_time)`)
	db.Exec(`CREATE INDEX IF NOT EXISTS idx_visitors_path ON visitors(path)`)

	// Post views indices
	db.Exec(`CREATE INDEX IF NOT EXISTS idx_post_views_post_id_view_time ON post_views(post_id, view_time)`)
	db.Exec(`CREATE INDEX IF NOT EXISTS idx_post_views_ip_address ON post_views(ip_address)`)

	// Post shares indices
	db.Exec(`CREATE INDEX IF NOT EXISTS idx_post_shares_post_id ON post_shares(post_id)`)
	db.Exec(`CREATE INDEX IF NOT EXISTS idx_post_shares_created_at ON post_shares(created_at)`)

	// Stats indices
	db.Exec(`CREATE INDEX IF NOT EXISTS idx_stats_post_id_updated_at ON stats(post_id, updated_at)`)

	// Daily stats indices
	db.Exec(`CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date)`)

	return nil
}

func CreateTriggers(db *gorm.DB) error {
	// Create a function to generate the unique constraint
	db.Exec(`
		CREATE OR REPLACE FUNCTION generate_post_like_constraint()
		RETURNS TRIGGER AS $$
		BEGIN
			NEW.unique_constraint := NEW.post_id || '_' || NEW.ip_address;
			RETURN NEW;
		END;
		$$ LANGUAGE plpgsql;
	`)

	// Create a trigger that runs before insert
	db.Exec(`
		DROP TRIGGER IF EXISTS set_post_like_constraint ON post_likes;
		CREATE TRIGGER set_post_like_constraint
		BEFORE INSERT ON post_likes
		FOR EACH ROW
		EXECUTE FUNCTION generate_post_like_constraint();
	`)

	return nil
}

// Initialize initializes the database schema and required objects
func Initialize(db *gorm.DB) error {
	// First run migrations
	if err := MigrateSchema(db); err != nil {
		return err
	}

	// Then create indices
	if err := CreateIndices(db); err != nil {
		return err
	}

	// Finally create triggers
	if err := CreateTriggers(db); err != nil {
		return err
	}

	return nil
}
