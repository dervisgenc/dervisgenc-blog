// Command blog runs the blog API.
//
// Run with the argument "healthcheck" it instead checks whether a server on
// HTTP_ADDR is healthy, for container health checks in images without curl.
package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
	// Embed the time zone database so STATS_TIMEZONE works in minimal images.
	_ "time/tzdata"

	"github.com/dervisgenc/dervisgenc-blog/backend/internal/auth"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/config"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/database"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/engagement"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/media"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/post"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/server"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/stats"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/visitor"
	"github.com/joho/godotenv"
)

const (
	shutdownTimeout     = 15 * time.Second
	maintenanceInterval = 6 * time.Hour
)

func main() {
	if len(os.Args) > 1 && os.Args[1] == "healthcheck" {
		if err := healthcheck(); err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		return
	}

	log := slog.New(slog.NewTextHandler(os.Stdout, nil))
	if err := run(log); err != nil {
		log.Error("server stopped", "error", err)
		os.Exit(1)
	}
}

func run(log *slog.Logger) error {
	// A .env file is optional and only meant for local development; in
	// containers the environment comes from Compose.
	_ = godotenv.Load()

	cfg, err := config.Load()
	if err != nil {
		return err
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	db, err := database.Connect(ctx, cfg.Database, log)
	if err != nil {
		return err
	}
	if err := database.Migrate(db, schema()...); err != nil {
		return err
	}
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}
	defer sqlDB.Close()

	store, err := media.NewStore(cfg.Uploads.Dir)
	if err != nil {
		return err
	}

	tokens := auth.NewTokenManager(cfg.Auth.Secret, cfg.Auth.SessionTTL)
	posts := post.NewRepository(db)
	statsService := stats.NewService(db, cfg.StatsLocation, log)
	hasher := visitor.NewHasher(cfg.Auth.Secret)

	router, err := server.NewRouter(server.Dependencies{
		Log:            log,
		PublicURL:      cfg.PublicURL,
		TrustedProxies: cfg.TrustedProxies,
		Database:       sqlDB,
		Tokens:         tokens,
		Auth:           auth.NewHandler(auth.NewService(db, tokens), tokens, cfg.Auth.SecureCookie, log),
		Posts:          post.NewHandler(post.NewService(posts), log),
		Engagement:     engagement.NewHandler(engagement.NewService(db, posts, hasher, cfg.StatsLocation), log),
		Stats:          stats.NewHandler(statsService, log),
		Media:          media.NewHandler(store, cfg.Uploads.MaxBytes, log),
	})
	if err != nil {
		return err
	}

	go statsService.RunMaintenance(ctx, maintenanceInterval)

	srv := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           router,
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       time.Minute,
		WriteTimeout:      time.Minute,
		IdleTimeout:       2 * time.Minute,
	}

	serveErr := make(chan error, 1)
	go func() {
		log.Info("server listening", "addr", cfg.HTTPAddr, "public_url", cfg.PublicURL)
		serveErr <- srv.ListenAndServe()
	}()

	select {
	case err := <-serveErr:
		return err
	case <-ctx.Done():
	}

	log.Info("shutting down")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil && !errors.Is(err, http.ErrServerClosed) {
		return err
	}
	return nil
}

// schema lists every table, parents before the tables referencing them.
func schema() []any {
	models := []any{&auth.Admin{}}
	models = append(models, post.Models()...)
	models = append(models, engagement.Models()...)
	return append(models, stats.Models()...)
}

func healthcheck() error {
	addr := os.Getenv("HTTP_ADDR")
	if addr == "" {
		addr = ":8080"
	}
	_, port, err := net.SplitHostPort(addr)
	if err != nil {
		return err
	}

	client := http.Client{Timeout: 3 * time.Second}
	resp, err := client.Get("http://" + net.JoinHostPort("127.0.0.1", port) + "/api/health")
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("health check returned %s", resp.Status)
	}
	return nil
}
