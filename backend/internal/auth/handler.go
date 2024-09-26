package auth

import (
	"errors"
	"net/http"

	myerr "github.com/dervisgenc/dervisgenc-blog/backend/pkg"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
	"github.com/gin-gonic/gin"
)

type LoginLoginRequest struct {
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
// @Param Login body auth.LoginLoginRequest true "Login login credentials"
// @Success 200 {object} models.TokenResponse "JWT token"
// @Failure 400 {object} models.ErrorResponse "Invalid request"
// @Failure 401 {object} models.ErrorResponse "Invalid username or password"
// @Router /Login/login [post]
func (h *LoginHandler) LoginHandler(c *gin.Context) {
	var req LoginLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(myerr.WithHTTPStatus(errors.New("invalid request"), http.StatusBadRequest))
		return
	}

	token, err := h.service.AuthenticateAdmin(req.Username, req.Password)
	if err != nil {
		c.Error(myerr.WithHTTPStatus(err, http.StatusBadRequest))
		return
	}

	c.JSON(http.StatusOK, models.TokenResponse{Token: token})
}
