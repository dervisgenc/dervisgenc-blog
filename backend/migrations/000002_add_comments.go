package migrations

import (
	"time"

	"gorm.io/gorm"
)

// Define Comment struct specifically for migration if models.Comment isn't available yet
// or to avoid circular dependencies during initial setup.
type Comment_Migration_002 struct {
	ID              uint      `gorm:"primarykey"`
	CreatedAt       time.Time `gorm:"index"`
	UpdatedAt       time.Time
	DeletedAt       gorm.DeletedAt `gorm:"index"`
	PostID          uint           `gorm:"not null;index"` // Foreign key to posts
	AuthorName      string         `gorm:"type:varchar(100);not null"`
	AuthorEmail     string         `gorm:"type:varchar(100);not null"` // Consider indexing if you query by email often
	Content         string         `gorm:"type:text;not null"`
	IsApproved      bool           `gorm:"default:false;index"`
	ApprovedAt      *time.Time     // Time when the comment was approved
	ParentCommentID *uint          `gorm:"index"` // For nested comments (optional)
	// Add GORM relations if needed, e.g., Post models.Post `gorm:"foreignKey:PostID"`
	// Ensure models.Post exists or adjust accordingly.
}

func Up_000002(db *gorm.DB) error {
	return db.AutoMigrate(&Comment_Migration_002{})
}

func Down_000002(db *gorm.DB) error {
	// Be cautious with dropping tables in production
	return db.Migrator().DropTable(&Comment_Migration_002{})
}
