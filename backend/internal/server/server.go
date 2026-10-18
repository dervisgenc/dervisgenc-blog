// Package server wires the HTTP routes and middleware.
package server

import (
	"context"
	"io"
	"log/slog"
	"net/http"
	"time"

	"github.com/dervisgenc/dervisgenc-blog/backend/internal/auth"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/engagement"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/httpx"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/media"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/post"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/ratelimit"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/stats"
	"github.com/gin-gonic/gin"
)

// maxJSONBody bounds request bodies other than image uploads.
const maxJSONBody = 1 << 20

// Pinger reports whether a dependency is reachable.
type Pinger interface {
	PingContext(ctx context.Context) error
}

// Dependencies are the components the routes are served by.
type Dependencies struct {
	Log            *slog.Logger
	PublicURL      string
	TrustedProxies []string
	Database       Pinger
	Tokens         *auth.TokenManager
	Auth           *auth.Handler
	Posts          *post.Handler
	Engagement     *engagement.Handler
	Stats          *stats.Handler
	Media          *media.Handler
}

// NewRouter returns the HTTP handler for the whole API.
func NewRouter(deps Dependencies) (http.Handler, error) {
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.HandleMethodNotAllowed = true
	if err := r.SetTrustedProxies(deps.TrustedProxies); err != nil {
		return nil, err
	}
	// nginx puts the visitor's address, taken from Cloudflare, in X-Real-IP.
	r.RemoteIPHeaders = []string{"X-Real-IP", "X-Forwarded-For"}
	r.Use(recovery(deps.Log), requestLogger(deps.Log), securityHeaders)
	r.NoRoute(func(c *gin.Context) { httpx.Error(c, http.StatusNotFound, "not found") })
	r.NoMethod(func(c *gin.Context) { httpx.Error(c, http.StatusMethodNotAllowed, "method not allowed") })

	api := r.Group("/api")
	api.GET("/health", health(deps.Database))
	api.GET("/uploads/:name", deps.Media.Serve)

	public := api.Group("", limitBody(maxJSONBody))
	public.GET("/posts", deps.Posts.List)
	public.GET("/posts/:slug", deps.Posts.Get)
	public.GET("/posts/:slug/related", deps.Posts.Related)
	public.GET("/tags", deps.Posts.Tags)

	// Counters are written by anonymous readers, so they are rate limited
	// to keep a single client from inflating them.
	engage := public.Group("/posts/:slug", ratelimit.PerIP(2*time.Second, 30))
	engage.POST("/views", deps.Engagement.View)
	engage.GET("/like", deps.Engagement.LikeStatus)
	engage.PUT("/like", deps.Engagement.Like)
	engage.DELETE("/like", deps.Engagement.Unlike)
	engage.POST("/shares", deps.Engagement.Share)

	admin := api.Group("/admin", auth.SameOrigin(deps.PublicURL), noStore)
	admin.POST("/login", limitBody(maxJSONBody), ratelimit.PerIP(12*time.Second, 5), deps.Auth.Login)
	admin.POST("/logout", deps.Auth.Logout)

	// Uploads get their own, larger body limit from the media handler.
	signedIn := admin.Group("", auth.RequireAdmin(deps.Tokens))
	signedIn.POST("/uploads", deps.Media.Upload)

	signedIn.Use(limitBody(maxJSONBody))
	signedIn.GET("/session", deps.Auth.Session)
	signedIn.GET("/posts", deps.Posts.AdminList)
	signedIn.POST("/posts", deps.Posts.Create)
	signedIn.GET("/posts/:id", deps.Posts.AdminGet)
	signedIn.PUT("/posts/:id", deps.Posts.Update)
	signedIn.DELETE("/posts/:id", deps.Posts.Delete)
	signedIn.GET("/stats/summary", deps.Stats.Summary)
	signedIn.GET("/stats/daily", deps.Stats.Daily)
	signedIn.GET("/stats/top-posts", deps.Stats.TopPosts)
	signedIn.GET("/stats/posts/:id/daily", deps.Stats.PostDaily)

	return r, nil
}

// health reports whether the API can serve requests.
func health(db Pinger) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
		defer cancel()
		if err := db.PingContext(ctx); err != nil {
			httpx.Error(c, http.StatusServiceUnavailable, "database unavailable")
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	}
}

func limitBody(n int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, n)
		c.Next()
	}
}

func securityHeaders(c *gin.Context) {
	h := c.Writer.Header()
	h.Set("X-Content-Type-Options", "nosniff")
	h.Set("X-Frame-Options", "DENY")
	h.Set("Referrer-Policy", "strict-origin-when-cross-origin")
	c.Next()
}

// noStore keeps admin responses out of browser and proxy caches.
func noStore(c *gin.Context) {
	c.Header("Cache-Control", "no-store")
	c.Next()
}

func recovery(log *slog.Logger) gin.HandlerFunc {
	return gin.CustomRecoveryWithWriter(io.Discard, func(c *gin.Context, err any) {
		log.Error("panic", "error", err, "method", c.Request.Method, "path", c.Request.URL.Path)
		httpx.Error(c, http.StatusInternalServerError, "internal error")
	})
}

func requestLogger(log *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		if c.Request.URL.Path == "/api/health" {
			return
		}
		log.Info("request",
			"method", c.Request.Method,
			"path", c.Request.URL.Path,
			"status", c.Writer.Status(),
			"duration", time.Since(start).Round(time.Millisecond),
			"ip", c.ClientIP(),
		)
	}
}
