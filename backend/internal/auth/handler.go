package auth

import (
	"errors"
	"log/slog"
	"net/http"
	"time"

	"github.com/dervisgenc/dervisgenc-blog/backend/internal/httpx"
	"github.com/gin-gonic/gin"
)

// CookieName is the name of the session cookie.
const CookieName = "session"

type Handler struct {
	service      *Service
	tokens       *TokenManager
	secureCookie bool
	log          *slog.Logger
}

func NewHandler(service *Service, tokens *TokenManager, secureCookie bool, log *slog.Logger) *Handler {
	return &Handler{service: service, tokens: tokens, secureCookie: secureCookie, log: log}
}

type loginRequest struct {
	Username string `json:"username" binding:"required,max=64"`
	Password string `json:"password" binding:"required,max=256"`
}

type sessionResponse struct {
	Username  string    `json:"username"`
	ExpiresAt time.Time `json:"expires_at"`
}

// Login exchanges admin credentials for a session cookie.
func (h *Handler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Error(c, http.StatusBadRequest, "username and password are required")
		return
	}

	token, claims, err := h.service.Login(c.Request.Context(), req.Username, req.Password)
	switch {
	case errors.Is(err, ErrInvalidCredentials):
		h.log.Warn("admin login failed", "username", req.Username, "ip", c.ClientIP())
		httpx.Error(c, http.StatusUnauthorized, "invalid username or password")
		return
	case err != nil:
		httpx.InternalError(c, h.log, "admin login", err)
		return
	}

	h.log.Info("admin logged in", "username", claims.Username, "ip", c.ClientIP())
	h.setCookie(c, token, int(h.tokens.TTL().Seconds()))
	c.JSON(http.StatusOK, sessionResponse{Username: claims.Username, ExpiresAt: claims.ExpiresAt})
}

// Logout clears the session cookie.
func (h *Handler) Logout(c *gin.Context) {
	h.setCookie(c, "", -1)
	c.Status(http.StatusNoContent)
}

// Session describes the current admin session. It runs behind RequireAdmin.
func (h *Handler) Session(c *gin.Context) {
	claims := CurrentAdmin(c)
	c.JSON(http.StatusOK, sessionResponse{Username: claims.Username, ExpiresAt: claims.ExpiresAt})
}

func (h *Handler) setCookie(c *gin.Context, value string, maxAge int) {
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     CookieName,
		Value:    value,
		Path:     "/",
		MaxAge:   maxAge,
		HttpOnly: true,
		Secure:   h.secureCookie,
		SameSite: http.SameSiteStrictMode,
	})
}
