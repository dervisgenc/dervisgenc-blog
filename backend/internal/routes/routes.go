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
	// Tüm rotaları /api altına al
	api := r.Group("/api")
	{

		api.Static("/uploads/images", "./uploads/images")

		// Public routes within /api
		api.POST("/admin/login", h.Auth.LoginHandler) // -> /api/admin/login

		posts := api.Group("/posts") // -> /api/posts grubu
		{
			posts.GET("", h.Post.GetAllPosts)                 // -> /api/posts
			posts.GET("/paginated", h.Post.GetPaginatedPosts) // -> /api/posts/paginated (ISTENEN)
			posts.GET("/search", h.Post.SearchPosts)          // -> /api/posts/search
			posts.GET("/:id", h.Post.GetPostByID)             // -> /api/posts/:id
			posts.POST("/:id/like", h.Like.ToggleLike)        // -> /api/posts/:id/like
			posts.GET("/:id/like", h.Like.GetLikeStatus)      // -> /api/posts/:id/like
			posts.POST("/:id/share", h.Stats.IncrementShare)  // -> /api/posts/:id/share
		}

		// Admin routes within /api
		admin := api.Group("/admin") // -> /api/admin grubu
		admin.Use(middleware.AuthMiddleware(jwtSecret))
		{
			setupAdminRoutes(admin, h) // setupAdminRoutes fonksiyonu artık /api/admin altındaki grupları alacak
		}
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
