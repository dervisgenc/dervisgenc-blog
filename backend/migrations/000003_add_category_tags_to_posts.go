package migrations

import (
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
	"gorm.io/gorm"
)

// Up_000003 ensures category and tags columns exist (handled by AutoMigrate in MigrateSchema)
func Up_000003(db *gorm.DB) error {
	// No explicit AddColumn needed here if AutoMigrate(&models.Post{}) is called elsewhere.
	// AutoMigrate will add the columns based on the struct definition if they don't exist.
	// Returning nil assumes AutoMigrate handles the addition.
	return nil
	/*
		// Original code attempting to add columns explicitly:
		type Post_Migration_003 struct {
			Category string `gorm:"type:varchar(100);index"`
			Tags     string `gorm:"type:varchar(255);index"`
		}
		if err := db.Migrator().AddColumn(&models.Post{}, "Category"); err != nil {
			// Consider logging a warning instead of returning error if column already exists
			// Or use HasColumn check before adding
			// return err // This causes the fatal error if AutoMigrate already added it
		}
		if err := db.Migrator().AddColumn(&models.Post{}, "Tags"); err != nil {
			// return err // This causes the fatal error if AutoMigrate already added it
		}
		return nil
	*/
}

// Down_000003 removes category and tags columns from the posts table
func Down_000003(db *gorm.DB) error {
	// Keep the Down migration logic to allow rollback
	if err := db.Migrator().DropColumn(&models.Post{}, "Category"); err != nil {
		return err
	}
	return db.Migrator().DropColumn(&models.Post{}, "Tags")
}
