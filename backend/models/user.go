package models

import (
	"github.com/Marc-Garcia-Coronado/socialNetwork/utils"
	"log"
	"time"
)

type CreateUserReq struct {
	UserName string `json:"user_name"`
	FullName string `json:"full_name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginUserReq struct {
	UserName string `json:"user_name"`
	Password string `json:"password"`
}

type User struct {
	ID             int       `json:"id"`
	UserName       string    `json:"user_name"`
	FullName       string    `json:"full_name"`
	Email          string    `json:"email"`
	Password       string    `json:"password,omitempty"`
	UserSince      time.Time `json:"user_since"`
	ProfilePicture *string   `json:"profile_picture,omitempty"`
	Bio            *string   `json:"bio,omitempty"`
	IsActive       bool      `json:"is_active"`
	Role           string    `json:"role"`
}

type UserWithPagination struct {
	Users      []User     `json:"users"`
	Pagination Pagination `json:"pagination"`
}

func NewUser(userName, fullName, email, password string) *User {

	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		log.Fatal("Could not hash the password")
		return nil
	}

	return &User{
		UserName: userName,
		FullName: fullName,
		Email:    email,
		Password: hashedPassword,
		Role:     "user",
	}
}
