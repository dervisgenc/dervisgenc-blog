package main

import (
	"fmt"

	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/config"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/middleware"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {

	cfg := config.LoadConfig()
	logger := config.SetupLogger(cfg)

	logger.Info("App Initializing")

	// Start Gin router
	r := gin.Default()

	r.Use(cors.Default())

	//Add error handling and logging middleware
	r.Use(middleware.LoggingMiddleware(logger))
	r.Use(middleware.ErrorMiddleware())

	// Create data source name
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort)

	// Gorm usage form postgres
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		logger.Fatal("Database connection failed: ", err)
	}
	//TODO: Add migration and models
	err = db.AutoMigrate(models.User{}, models.Post{}, models.Stat{})
	if err != nil {
		logger.Fatal("Failed to migrate database models: ", err)
	}

	logger.Info("Database connection and migration successful")

	r.Run(cfg.Port)

	logger.Infof("App started at port: %s", cfg.Port)

}
