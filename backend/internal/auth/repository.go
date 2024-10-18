package auth

import (
	"fmt"

	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
	"gorm.io/gorm"
)

type UserRepository interface {
	FindByUsername(username string) (*models.User, error)
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

// FindByUsername, kullanıcı adını kullanarak kullanıcıyı veritabanında bulur.
func (r *userRepository) FindByUsername(username string) (*models.User, error) {
	var user models.User
	var users []models.User
	r.db.Find(&users)
	fmt.Println(users)
	if err := r.db.Where("username = ?", username).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}
