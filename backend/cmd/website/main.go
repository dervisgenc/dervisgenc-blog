package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/dervisgenc/dervisgenc-blog/backend/internal/auth"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/image"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/like"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/post"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/routes"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/stat"
	"github.com/dervisgenc/dervisgenc-blog/backend/migrations"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/config"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	_ "github.com/dervisgenc/dervisgenc-blog/backend/docs"
)

// @title Dervis Genc Blog API
// @version 1.0
// @description This is the API documentation for Personal Blog Web Site

type App struct {
	logger      *logrus.Logger
	cfg         *config.Config
	db          *gorm.DB
	statsWorker *stat.StatsWorker
	server      *http.Server
}

func main() {
	cfg := config.LoadConfig()
	logger := config.SetupLogger(cfg)

	app := &App{
		cfg:    cfg,
		logger: logger,
	}

	if err := app.initialize(); err != nil {
		app.logger.Fatalf("Failed to initialize app: %v", err)
	}

	// Start the server in a goroutine
	go func() {
		if err := app.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			app.logger.Fatalf("Failed to start server: %v", err)
		}
	}()

	app.logger.Infof("App started at port: %s", app.cfg.Port)

	// Wait for interrupt signal to gracefully shutdown the server
	app.waitForShutdown()
}

func (a *App) initialize() error {
	// Initialize database
	db, err := a.setupDatabase()
	if err != nil {
		return fmt.Errorf("database setup failed: %w", err)
	}
	a.db = db

	// Initialize router and server
	router := a.setupRouter()
	a.server = &http.Server{
		Addr:    a.cfg.Port,
		Handler: router,
	}

	// Initialize handlers
	handlers := a.initializeHandlers()

	// Setup routes
	routes.SetupRoutes(router, handlers, []byte(os.Getenv("JWT_SECRET")))

	// Setup Swagger
	// if os.Getenv("SWAGGER_ENABLED") == "true" {
	// 	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	// }

	return nil
}

func (a *App) waitForShutdown() {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	sig := <-quit

	a.logger.Infof("Received signal: %v, initiating shutdown", sig)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Shutdown sequence
	if err := a.shutdown(ctx); err != nil {
		a.logger.Errorf("Shutdown error: %v", err)
	}
}

func (a *App) shutdown(ctx context.Context) error {
	// First, shutdown the HTTP server to stop accepting new requests
	if err := a.server.Shutdown(ctx); err != nil {
		return fmt.Errorf("server shutdown failed: %w", err)
	}
	a.logger.Info("HTTP server shutdown completed")

	// Then shutdown the stats worker to process remaining stats
	if err := a.statsWorker.Shutdown(ctx); err != nil {
		return fmt.Errorf("stats worker shutdown failed: %w", err)
	}
	a.logger.Info("Stats worker shutdown completed")

	// Finally, close the database connection
	if sqlDB, err := a.db.DB(); err == nil {
		if err := sqlDB.Close(); err != nil {
			return fmt.Errorf("database connection close failed: %w", err)
		}
		a.logger.Info("Database connection closed")
	}

	return nil
}

func (a *App) setupDatabase() (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		a.cfg.DBHost, a.cfg.DBUser, a.cfg.DBPassword, a.cfg.DBName, a.cfg.DBPort)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("database connection failed: %w", err)
	}

	if err := migrations.Initialize(db); err != nil {
		return nil, fmt.Errorf("database initialization failed: %w", err)
	}

	sqlBytes, err := os.ReadFile("postgres_script.sql")
	if err != nil {
		return nil, fmt.Errorf("failed to read SQL script: %w", err)
	}

	if err := db.Exec(string(sqlBytes)).Error; err != nil {
		return nil, fmt.Errorf("failed to execute SQL script: %w", err)
	}

	a.logger.Info("Database initialization completed successfully")
	return db, nil
}

func (a *App) setupRouter() *gin.Engine {
	r := gin.Default()

	// CORS configuration
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"https://dervisgenc.com", "https://blog.dervisgenc.com", "http://localhost:3002", "http://localhost:3000"}, // Allow specific origins including localhost for dev (React and Next.js)
		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"PATCH",
			"DELETE",
			"HEAD",
			"OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Length",
			"Content-Type",
			"Authorization",
			"Accept",
			"X-Requested-With",
			"X-CSRF-Token",
		},
		ExposeHeaders: []string{
			"Content-Length",
			"Content-Type",
			"Authorization",
			"X-Total-Count",
			"X-Total-Pages",
		},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
		AllowWebSockets:  true,
	}))

	//Add error handling and logging middleware
	r.Use(middleware.LoggingMiddleware(a.logger))
	r.Use(middleware.ErrorMiddleware())
	r.Use(middleware.DBMiddleware(a.db))

	// Create stats worker with logger
	statRepo := stat.NewStatRepository(a.db)
	a.statsWorker = stat.NewStatsWorker(statRepo, 5, a.logger) // Pass logger

	// Add stats middleware with worker
	r.Use(middleware.StatsMiddleware(a.statsWorker))
	r.Use(middleware.PostViewMiddleware(a.statsWorker))

	return r
}

func (a *App) initializeHandlers() *routes.HandlerContainer {
	// Ensure uploads directory exists
	if err := os.MkdirAll(a.cfg.Image.StoragePath, 0755); err != nil {
		a.logger.Fatalf("Failed to create upload directory: %v", err)
	}

	// Initialize image storage with correct parameters
	imgStorage := image.NewLocalStorage(
		a.cfg.Image.StoragePath,
		fmt.Sprintf("%s/api/uploads/images", a.cfg.AppURL), // Use AppURL from config
	)

	// Initialize image service with storage and config
	imgService := image.NewService(
		imgStorage,
		image.ProcessConfig{
			MaxWidth:     a.cfg.Image.MaxWidth,
			MaxHeight:    a.cfg.Image.MaxHeight,
			Quality:      a.cfg.Image.Quality,
			AllowedTypes: a.cfg.Image.AllowedTypes,
		},
	)

	// Initialize repositories
	loginRepo := auth.NewUserRepository(a.db)
	postRepo := post.NewPostRepository(a.db)
	statRepo := stat.NewStatRepository(a.db)

	loginService := auth.NewLoginService(loginRepo, a.cfg.JWTSecret)
	postService := post.NewPostService(postRepo, imgService.GetImageURL("")) // Pass base URL or rely on imageService
	statService := stat.NewStatService(statRepo)

	// Initialize handlers
	loginHandler := auth.NewLoginHandler(loginService)
	postHandler := post.NewPostHandler(postService, imgService) // Pass imgService
	statHandler := stat.NewStatHandler(statService)
	imageHandler := image.NewImageHandler(imgService) // Initialize image handler

	// Initialize like repository and service
	likeRepo := like.NewLikeRepository(a.db)
	likeService := like.NewLikeService(likeRepo)
	likeHandler := like.NewLikeHandler(likeService)

	return &routes.HandlerContainer{
		Auth:  loginHandler,
		Post:  postHandler,
		Stats: statHandler,
		Like:  likeHandler,
		Image: imageHandler, // Add image handler
	}
}
