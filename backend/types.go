package main

import (
	"database/sql"
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
	ID             int            `json:"id"`
	UserName       string         `json:"user_name"`
	FullName       string         `json:"full_name"`
	Email          string         `json:"email"`
	Password       string         `json:"password,omitempty"`
	UserSince      time.Time      `json:"user_since"`
	ProfilePicture sql.NullString `json:"profile_picture,omitempty"`
	Bio            sql.NullString `json:"bio,omitempty"`
	IsActive       bool           `json:"is_active"`
	Role           string         `json:"role"`
}

func NewUser(userName, fullName, email, password string) *User {

	hashedPassword, err := HashPassword(password)
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
