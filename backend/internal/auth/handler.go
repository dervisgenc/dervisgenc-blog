package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginHandler struct {
	service *LoginService
}

func NewLoginHandler(service *LoginService) *LoginHandler {
	return &LoginHandler{service: service}
}

// LoginHandler, Login kullanıcılarının giriş yapmasına olanak tanır.
// @Summary Login login
// @Description Authenticates an Login user and returns a JWT token.
// @Tags Auth
// @Accept json
// @Produce json
// @Param Login body auth.LoginRequest true "Login login credentials"
// @Success 200 {object} models.TokenResponse "JWT token"
// @Failure 400 {object} models.ErrorResponse "Invalid request"
// @Failure 401 {object} models.ErrorResponse "Invalid username or password"
// @Router /Login/login [post]
func (h *LoginHandler) LoginHandler(c *gin.Context) {
	var loginReq LoginRequest
	if err := c.ShouldBindJSON(&loginReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	token, err := h.service.AuthenticateAdmin(loginReq.Username, loginReq.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":   token,
		"message": "Successfully logged in",
	})
}
