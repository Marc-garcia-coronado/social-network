package storage

import (
	"fmt"
	"log"
)

func (s *PostgresStore) CreteTopicsTable() error {
	query := `
	CREATE TABLE IF NOT EXISTS topics (
	  id SERIAL PRIMARY KEY,
	  name VARCHAR(255),
	  description TEXT,
	  created_at TIMESTAMPTZ DEFAULT now()
	);`

	if _, err := s.Db.Exec(query); err != nil {
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

	_, err := s.Db.Exec(queryEnum)
	if err != nil {
		log.Println("Error creating ENUM type:", err)
		return err
	}

	_, err = s.Db.Exec(queryTable)
	if err != nil {
		log.Println("Error creating users table:", err)
		return err
	}

	log.Println("Users table is active!")
	return nil
}
