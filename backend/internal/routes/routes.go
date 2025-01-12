package routes

import (
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/auth"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/like"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/post"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/stat"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/middleware"
	"github.com/gin-gonic/gin"
)

type HandlerContainer struct {
	Post  *post.PostHandler
	Auth  *auth.LoginHandler
	Like  *like.LikeHandler
	Stats *stat.StatHandler
}

func SetupRoutes(r *gin.Engine, h *HandlerContainer, jwtSecret []byte) {
	// Public routes
	r.POST("/admin/login", h.Auth.LoginHandler)

	posts := r.Group("/posts")
	{
		posts.GET("", h.Post.GetAllPosts)
		posts.GET("/paginated", h.Post.GetPaginatedPosts)
		posts.GET("/search", h.Post.SearchPosts)
		posts.GET("/:id", h.Post.GetPostByID)
		posts.POST("/:id/like", h.Like.ToggleLike)
		posts.GET("/:id/like", h.Like.GetLikeStatus)
		posts.POST("/:id/share", h.Stats.IncrementShare)
	}

	// Admin routes
	admin := r.Group("/admin")
	admin.Use(middleware.AuthMiddleware(jwtSecret))
	{
		setupAdminRoutes(admin, h)
	}
}

func setupAdminRoutes(rg *gin.RouterGroup, h *HandlerContainer) {
	posts := rg.Group("/posts")
	{
		posts.GET("/detailed-stats", h.Stats.GetDetailedPostStats)
		posts.POST("", h.Post.CreatePost)
		posts.GET("", h.Post.GetAllAdmin)
		posts.PUT("/:id", h.Post.UpdatePost)
		posts.GET("/:id", h.Post.GetPostByIDAdmin)
		posts.DELETE("/:id", h.Post.DeletePost)
		posts.DELETE("/:id/permanent", h.Post.DeletePostPermanently)
		posts.GET("/stats", h.Stats.GetAllPostsStats)
		posts.GET("/stats/:id", h.Stats.GetPostStats)
		posts.GET("/count", h.Stats.CountPosts)
	}

	stats := rg.Group("/stats")
	{
		stats.GET("/detailed", h.Stats.GetDetailedStats)
		stats.GET("/posts", h.Stats.GetDetailedPostStats)
	}
}
