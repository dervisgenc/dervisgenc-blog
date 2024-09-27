package main

import (
	"fmt"
	"os"

	"github.com/dervisgenc/dervisgenc-blog/backend/internal/auth"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/post"
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

	r.Use(cors.Default())

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

	//Public endpoints
	r.POST("admin/login", loginHandler.LoginHandler)

	r.GET("/posts", postHandler.GetAllPosts)
	r.GET("/posts/:id", postHandler.GetPostByID)

	//Admin endpoints (needs authentication)
	adminRoutes := r.Group("/admin")
	adminRoutes.Use(middleware.AuthMiddleware(jwtSecret))
	{
		adminRoutes.POST("/posts", postHandler.CreatePost)
		adminRoutes.PUT("/posts/:id", postHandler.UpdatePost)
		adminRoutes.DELETE("/posts/:id", postHandler.DeletePost)
		adminRoutes.DELETE("/posts/:id/permanent", postHandler.DeletePostPermanently)
	}

	r.Run(cfg.Port)

	logger.Infof("App started at port: %s", cfg.Port)
}
