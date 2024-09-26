package middleware

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// DBMiddleware veritabanı bağlantısını bağlama ekleyen middleware
func DBMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	}
}
