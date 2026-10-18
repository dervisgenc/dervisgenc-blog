package auth

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const issuer = "dervisgenc-blog"

// TokenManager issues and verifies admin session tokens.
type TokenManager struct {
	secret []byte
	ttl    time.Duration
	now    func() time.Time
}

func NewTokenManager(secret []byte, ttl time.Duration) *TokenManager {
	return &TokenManager{secret: secret, ttl: ttl, now: time.Now}
}

// Claims identifies the admin a token was issued for.
type Claims struct {
	Username  string
	ExpiresAt time.Time
}

// Issue returns a signed token for username.
func (m *TokenManager) Issue(username string) (string, Claims, error) {
	now := m.now()
	claims := Claims{Username: username, ExpiresAt: now.Add(m.ttl)}
	registered := jwt.RegisteredClaims{
		Issuer:    issuer,
		Subject:   username,
		IssuedAt:  jwt.NewNumericDate(now),
		ExpiresAt: jwt.NewNumericDate(claims.ExpiresAt),
	}

	signed, err := jwt.NewWithClaims(jwt.SigningMethodHS256, registered).SignedString(m.secret)
	if err != nil {
		return "", Claims{}, fmt.Errorf("sign token: %w", err)
	}
	return signed, claims, nil
}

// Verify checks the token's signature, issuer and expiry.
func (m *TokenManager) Verify(token string) (Claims, error) {
	registered := &jwt.RegisteredClaims{}
	_, err := jwt.ParseWithClaims(token, registered,
		func(*jwt.Token) (any, error) { return m.secret, nil },
		jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}),
		jwt.WithIssuer(issuer),
		jwt.WithExpirationRequired(),
		jwt.WithTimeFunc(m.now),
	)
	if err != nil {
		return Claims{}, err
	}
	return Claims{Username: registered.Subject, ExpiresAt: registered.ExpiresAt.Time}, nil
}

// TTL is how long issued tokens stay valid.
func (m *TokenManager) TTL() time.Duration {
	return m.ttl
}
