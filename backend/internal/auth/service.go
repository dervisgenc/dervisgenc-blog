package auth

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt"
	"golang.org/x/crypto/bcrypt"
)

type LoginService struct {
	userRepo  UserRepository
	jwtSecret []byte
}

func NewLoginService(userRepo UserRepository, jwtSecret []byte) *LoginService {
	return &LoginService{userRepo: userRepo, jwtSecret: jwtSecret}
}

// Represents the claims of the JWT token
type Claims struct {
	Username string `json:"username"`
	jwt.StandardClaims
}

func (s *LoginService) AuthenticateAdmin(username, password string) (string, error) {

	user, err := s.userRepo.FindByUsername(username)
	if err != nil || !CheckPasswordHash(password, user.PasswordHash) {
		return "", errors.New("invalid username or password")
	}

	token, err := s.generateJWT(username)
	if err != nil {
		return "", err
	}

	return token, nil
}

// Generates a JWT token
func (s *LoginService) generateJWT(username string) (string, error) {
	expirataionTime := time.Now().Add(6 * time.Hour)
	claims := &Claims{
		Username: username,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirataionTime.Unix(),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString(s.jwtSecret)
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func ValidateToken(tokenString string, jwtSecret []byte) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

// Hashes the password
func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	fmt.Println("Hashed password: ", string(hashedPassword))
	return string(hashedPassword), nil
}

// Checks if the password is same as the hashed password
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
