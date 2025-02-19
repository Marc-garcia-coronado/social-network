package main

import (
	"database/sql"
	_ "github.com/lib/pq"
	"log"
)

type Storage interface {
	CreateUser(*User) error
	UpdateUser(*User) error
	DeleteUser(int) error
	GetUserByID(int) (*User, error)
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
	return nil
}

func (s *PostgresStore) CreateUserTable() error {
	// Ensure the ENUM type exists
	queryEnum := `
	DO $$ 
	BEGIN 
		IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
			CREATE TYPE user_role AS ENUM ('admin', 'user');
		END IF;
	END $$;`

	// Create the users table
	queryTable := `
	CREATE TABLE IF NOT EXISTS users (
	  id SERIAL PRIMARY KEY,
	  user_name VARCHAR(100) NOT NULL,
	  full_name VARCHAR(100) NOT NULL,
	  email VARCHAR(255) UNIQUE NOT NULL,
	  password VARCHAR(255) NOT NULL,
	  profile_picture VARCHAR(255),
	  bio VARCHAR(255),
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

	log.Println("Users table created successfully!")
	return nil
}

func (s *PostgresStore) CreateUser(u *User) error {
	stmt := `
	insert into users (user_name, full_name, email, password, role)
	VALUES ($1, $2, $3, $4, $5)
	`

	if _, err := s.db.Query(stmt, u.UserName, u.FullName, u.Email, u.Password, u.Role); err != nil {
		log.Fatal("Error inserting user: ", err)
		return err
	}

	return nil
}

func (s *PostgresStore) UpdateUser(u *User) error {
	return nil
}

func (s *PostgresStore) DeleteUser(id int) error {
	return nil
}

func (s *PostgresStore) GetUserByID(id int) (*User, error) {
	return nil, nil
}
