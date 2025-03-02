package main

import (
	"database/sql"
	"fmt"
	_ "github.com/lib/pq"
	"log"
	"strconv"
)

type Storage interface {
	CreateUser(*User) (*int, error)
	UpdateUser(user map[string]interface{}, userID int) error
	DeleteUser(int) error
	GetUserByID(int) (*User, error)
	Login(username, password string) (*int, error)
}

type PostgresStore struct {
	db *sql.DB
}

func NewPostgresStore() (*PostgresStore, error) {
	uri := "user=postgres dbname=postgres password=socialNetwork sslmode=disable"
	db, err := sql.Open("postgres", uri)

	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	return &PostgresStore{
		db: db,
	}, nil
}

func (s *PostgresStore) Init() error {
	if err := s.CreateUserTable(); err != nil {
		return err
	}
	return nil
}

func (s *PostgresStore) CreteTopicsTable() error {
	query := `
	CREATE TABLE IF NOT EXISTS topics (
	  id SERIAL PRIMARY KEY,
	  name VARCHAR(255),
	  description TEXT,
	  created_at TIMESTAMPTZ DEFAULT now()
	);`

	if _, err := s.db.Exec(query); err != nil {
		fmt.Println("Could not create the topics table: ", err)
		return err
	}

	return nil
}

func (s *PostgresStore) CreateUserTable() error {
	queryEnum := `
	DO $$ 
	BEGIN 
		IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
			CREATE TYPE user_role AS ENUM ('admin', 'user');
		END IF;
	END $$;`

	queryTable := `
	CREATE TABLE IF NOT EXISTS users (
	  id SERIAL PRIMARY KEY,
	  user_name VARCHAR(100) UNIQUE NOT NULL,
	  full_name VARCHAR(100) NOT NULL,
	  email VARCHAR(255) UNIQUE NOT NULL,
	  password_hash TEXT NOT NULL,
	  profile_picture VARCHAR(255) NULL,
	  bio TEXT NULL,
	  is_active BOOLEAN DEFAULT TRUE,
	  role user_role NOT NULL,
	  user_since TIMESTAMPTZ DEFAULT now()
	);`

	_, err := s.db.Exec(queryEnum)
	if err != nil {
		log.Println("Error creating ENUM type:", err)
		return err
	}

	_, err = s.db.Exec(queryTable)
	if err != nil {
		log.Println("Error creating users table:", err)
		return err
	}

	log.Println("Users table is active!")
	return nil
}

func (s *PostgresStore) CreateUser(u *User) (*int, error) {
	stmt := `
	INSERT INTO users (user_name, full_name, email, password_hash, role)
	VALUES ($1, $2, $3, $4, $5)
	RETURNING id;
	`

	var id *int

	if err := s.db.QueryRow(stmt, u.UserName, u.FullName, u.Email, u.Password, u.Role).Scan(&id); err != nil {
		fmt.Errorf("No se ha podido insertar un user: ", err)
		return nil, err
	}

	return id, nil
}

func (s *PostgresStore) Login(username, password string) (*int, error) {
	var id *int
	var hash string
	query := `SELECT id, password_hash FROM users WHERE user_name = $1;`
	err := s.db.QueryRow(query, username).Scan(&id, &hash)
	if err != nil {
		return nil, err
	}

	ok := CheckPassword(hash, password)
	if !ok {
		return nil, fmt.Errorf("Las password no coincide")
	}

	return id, nil
}

func (s *PostgresStore) UpdateUser(user map[string]interface{}, userID int) error {

	// Build dynamic SQL query
	query := "UPDATE users SET "
	values := []interface{}{}
	i := 1

	for key, value := range user {
		query += key + " = $" + strconv.Itoa(i) + ", "
		values = append(values, value)
		i++
	}

	query = query[:len(query)-2] // Remove last comma
	query += " WHERE id = $" + strconv.Itoa(i)
	values = append(values, userID)

	// Execute query
	err := s.db.QueryRow(query, values...)
	if err.Err() != nil {
		return err.Err()
	}

	return nil
}

func (s *PostgresStore) DeleteUser(id int) error {
	return nil
}

func (s *PostgresStore) GetUserByID(id int) (*User, error) {

	user := &User{}
	stmt := "SELECT id, user_name, full_name, email, profile_picture, bio, is_active, role, user_since FROM users WHERE id = $1"
	if err := s.db.QueryRow(stmt, id).Scan(&user.ID, &user.UserName, &user.FullName, &user.Email,
		&user.ProfilePicture, &user.Bio, &user.IsActive, &user.Role, &user.UserSince); err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}

	return user, nil
}
