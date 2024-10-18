package main

import (
	"fmt"
	"os"
	"time"

	"github.com/dervisgenc/dervisgenc-blog/backend/internal/auth"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/post"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/stat"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/config"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/middleware"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	_ "github.com/dervisgenc/dervisgenc-blog/backend/docs"
)

// @title Dervis Genc Blog API
// @version 1.0
// @description This is the API documentation for Personal Blog Web Site

func main() {

	cfg := config.LoadConfig()
	logger := config.SetupLogger(cfg)

	logger.Info("App Initializing")

	// Create data source name
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort)

	// Gorm usage form postgres
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		logger.Fatal("Database connection failed: ", err)
	}

	err = db.AutoMigrate(models.User{}, models.Post{}, models.Stat{})
	if err != nil {
		logger.Fatal("Failed to migrate database models: ", err)
	}

	logger.Info("Database connection and migration successful")

	jwtSecret := []byte(os.Getenv("JWT_SECRET"))

	// Start Gin router
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // Önden gelen URL'yi ekle
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Serve static files from the "uploads" directory
	r.Static("/uploads", "./uploads")

	//Add error handling and logging middleware
	r.Use(middleware.LoggingMiddleware(logger))
	r.Use(middleware.ErrorMiddleware())
	r.Use(middleware.DBMiddleware(db))

	//Define services, repos and handlers

	loginRepo := auth.NewUserRepository(db)
	loginService := auth.NewLoginService(loginRepo, jwtSecret)
	loginHandler := auth.NewLoginHandler(loginService)

	postRepo := post.NewPostRepository(db)
	postService := post.NewPostService(postRepo)
	postHandler := post.NewPostHandler(postService)

	statRepo := stat.NewStatRepository(db)
	statService := stat.NewStatService(statRepo)
	statHandler := stat.NewStatHandler(statService)

	//Public endpoints
	r.POST("/admin/login", loginHandler.LoginHandler)

	r.GET("/posts", postHandler.GetAllPosts)
	r.GET("/posts/:id", postHandler.GetPostByID)

	//Admin endpoints (needs authentication)
	adminRoutes := r.Group("/admin")
	// adminRoutes.Use(middleware.CORSMiddleware()) // Removed as cors.Default() is already used
	adminRoutes.Use(middleware.AuthMiddleware(jwtSecret))
	{
		adminRoutes.POST("/posts", postHandler.CreatePost)
		adminRoutes.PUT("/posts/:id", postHandler.UpdatePost)
		adminRoutes.DELETE("/posts/:id", postHandler.DeletePost)
		adminRoutes.DELETE("/posts/:id/permanent", postHandler.DeletePostPermanently)
		adminRoutes.GET("/posts/stats", statHandler.GetAllPostsStats)
		adminRoutes.GET("/posts/stats/:id", statHandler.GetPostStats)
		adminRoutes.GET("/posts/count", statHandler.CountPosts)
		adminRoutes.POST("/upload", postHandler.UploadImage)
	}

	//Enable swagger if SWAGGER_ENABLED is set to true
	if os.Getenv("SWAGGER_ENABLED") == "true" {
		r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	} else {
		fmt.Println("Swagger is disabled")
	}

	r.Run(cfg.Port)

	logger.Infof("App started at port: %s", cfg.Port)
}
