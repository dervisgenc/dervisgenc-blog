package auth

import (
	"context"
	"errors"
	"fmt"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var ErrInvalidCredentials = errors.New("invalid username or password")

// dummyHash is compared against when the username does not exist, so a
// login attempt takes the same time whether or not the user exists.
var dummyHash, _ = bcrypt.GenerateFromPassword([]byte("dummy-password"), bcrypt.DefaultCost)

// Service authenticates admins against the database.
type Service struct {
	db     *gorm.DB
	tokens *TokenManager
}

func NewService(db *gorm.DB, tokens *TokenManager) *Service {
	return &Service{db: db, tokens: tokens}
}

// Login verifies the credentials and returns a session token.
func (s *Service) Login(ctx context.Context, username, password string) (string, Claims, error) {
	var admin Admin
	err := s.db.WithContext(ctx).Where(&Admin{Username: username}).First(&admin).Error
	switch {
	case errors.Is(err, gorm.ErrRecordNotFound):
		_ = bcrypt.CompareHashAndPassword(dummyHash, []byte(password))
		return "", Claims{}, ErrInvalidCredentials
	case err != nil:
		return "", Claims{}, fmt.Errorf("find admin: %w", err)
	}

	if bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(password)) != nil {
		return "", Claims{}, ErrInvalidCredentials
	}
	return s.tokens.Issue(admin.Username)
}

// SetPassword creates the admin or replaces its password.
func (s *Service) SetPassword(ctx context.Context, username, password string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("hash password: %w", err)
	}

	admin := Admin{Username: username}
	return s.db.WithContext(ctx).
		Where(Admin{Username: username}).
		Assign(Admin{PasswordHash: string(hash)}).
		FirstOrCreate(&admin).Error
}
