package routes

import (
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/auth"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/comment" // Import comment
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/image"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/like"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/post"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/stat"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/middleware"
	"github.com/gin-gonic/gin"
)

type HandlerContainer struct {
	Post    *post.PostHandler
	Auth    *auth.LoginHandler
	Like    *like.LikeHandler
	Stats   *stat.StatHandler
	Image   *image.ImageHandler
	Comment *comment.CommentHandler // Add Comment handler
}

func SetupRoutes(r *gin.Engine, h *HandlerContainer, jwtSecret []byte) {
	// Tüm rotaları /api altına al
	api := r.Group("/api")
	{

		// Serve static images - Make sure the path matches how URLs are constructed
		// The URL path should be relative to the baseURL defined in config and LocalStorage
		api.Static("/uploads/images", "./uploads/images") // URL: /api/uploads/images/<filename>, FS: ./uploads/images/<filename>

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
			posts.GET("/:id/related", h.Post.GetRelatedPosts) // -> /api/posts/:id/related (YENİ EKLENDİ)

			// Add Comment Routes (Public)
			posts.POST("/:id/comments", h.Comment.HandleCreateComment)    // Create comment for post :id
			posts.GET("/:id/comments", h.Comment.HandleGetCommentsByPost) // Get approved comments for post :id
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
		posts.GET("/detailed-stats", h.Stats.GetDetailedPostStats) // Keep this for detailed post list
		posts.POST("", h.Post.CreatePost)
		posts.GET("", h.Post.GetAllAdmin)
		posts.PUT("/:id", h.Post.UpdatePost)
		posts.GET("/:id", h.Post.GetPostByIDAdmin)
		posts.DELETE("/:id", h.Post.DeletePost)
		posts.DELETE("/:id/permanent", h.Post.DeletePostPermanently)
		// posts.GET("/stats", h.Stats.GetAllPostsStats) // Can be removed if detailed-stats is preferred
		posts.GET("/stats/:id", h.Stats.GetPostStats)
		posts.GET("/count", h.Stats.CountPosts)
	}

	stats := rg.Group("/stats")
	{
		stats.GET("/overall", h.Stats.GetOverallStats)
		stats.GET("/detailed", h.Stats.GetDetailedStats)
		stats.GET("/traffic", h.Stats.GetDailyTrafficStats) // Add route for traffic chart data
	}

	// Image upload route under /admin
	images := rg.Group("/images")
	{
		images.POST("/upload", h.Image.UploadImage) // -> /api/admin/images/upload
	}

	// Add Comment Routes (Admin)
	commentsAdmin := rg.Group("/comments")
	{
		commentsAdmin.GET("", h.Comment.HandleGetAllCommentsAdmin)                  // Get all comments (paginated, filtered)
		commentsAdmin.PATCH("/:comment_id/approve", h.Comment.HandleApproveComment) // Approve a comment
		commentsAdmin.DELETE("/:comment_id", h.Comment.HandleDeleteComment)         // Delete a comment
	}
}
