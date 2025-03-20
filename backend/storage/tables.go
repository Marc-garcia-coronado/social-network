package storage

import (
	"log"
)

func (s *PostgresStore) createLikesTable() error {
	query := `
	CREATE TABLE IF NOT EXISTS likes (
	  id SERIAL PRIMARY KEY,
	  user_id INT NOT NULL,
	  post_id INT NULL,
	  comment_id INT NULL,
	  created_at TIMESTAMPTZ DEFAULT now(),
	      
	  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
	  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
	  UNIQUE (user_id, post_id),
	  UNIQUE (user_id, comment_id)
	);`

	if _, err := s.Db.Exec(query); err != nil {
		return err
	}

	return nil
}

func (s *PostgresStore) createUserEventTable() error {
	query := `
	CREATE TABLE IF NOT EXISTS user_event (
	  id SERIAL PRIMARY KEY,
	  user_id INT NOT NULL,
	  event_id INT NOT NULL,
	  subscribed_at TIMESTAMPTZ DEFAULT now(),

	  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
	  UNIQUE (user_id, event_id)
	);`

	if _, err := s.Db.Exec(query); err != nil {
		return err
	}

	return nil
}

func (s *PostgresStore) createEventsTable() error {
	query := `
	CREATE TABLE IF NOT EXISTS events (
	  id SERIAL PRIMARY KEY,
	  name VARCHAR(255),
	  description TEXT,
	  location VARCHAR(255),
	  creator_id INT NOT NULL,
	  topic_id INT NOT NULL,
	  created_at TIMESTAMPTZ DEFAULT now(),
	  
	  FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
	  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
	);`

	if _, err := s.Db.Exec(query); err != nil {
		return err
	}

	return nil
}

func (s *PostgresStore) createCommentsTable() error {
	query := `
	CREATE TABLE IF NOT EXISTS comments (
	  id SERIAL PRIMARY KEY,
	  body TEXT,
	  user_id INT NOT NULL,
	  post_id INT NOT NULL,
	  created_at TIMESTAMPTZ DEFAULT now(),
	  
	  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
	);`

	if _, err := s.Db.Exec(query); err != nil {
		return err
	}

	return nil
}

func (s *PostgresStore) createPostsTable() error {
	query := `
	CREATE TABLE IF NOT EXISTS posts (
	  id SERIAL PRIMARY KEY,
	  picture VARCHAR(255),
	  title VARCHAR(255),
	  user_id INT NOT NULL,
	  topic_id INT NOT NULL,
	  created_at TIMESTAMPTZ DEFAULT now(),
	  
	  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
	);`

	if _, err := s.Db.Exec(query); err != nil {
		return err
	}

	return nil
}

func (s *PostgresStore) createFollowsTables() error {
	query := `
	CREATE TABLE IF NOT EXISTS user_follow_user (
	  id SERIAL PRIMARY KEY,
	  user_following_id INT NOT NULL,
	  user_followed_id INT NOT NULL,
	  followed_at TIMESTAMPTZ DEFAULT now(),
	  
	  FOREIGN KEY (user_following_id) REFERENCES users(id) ON DELETE CASCADE,
	  FOREIGN KEY (user_followed_id) REFERENCES users(id) ON DELETE CASCADE,
	  UNIQUE (user_followed_id, user_following_id)
	);`

	if _, err := s.Db.Exec(query); err != nil {
		return err
	}

	return nil
}

func (s *PostgresStore) createTopicsUserTable() error {
	query := `
	CREATE TABLE IF NOT EXISTS topics_user (
	  id SERIAL PRIMARY KEY,
	  user_id INT NOT NULL,
	  topic_id INT NOT NULL,
	  followed_at TIMESTAMPTZ DEFAULT now(),

	  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
	);`

	if _, err := s.Db.Exec(query); err != nil {
		return err
	}

	return nil
}

func (s *PostgresStore) createTopicsTable() error {
	query := `
	CREATE TABLE IF NOT EXISTS topics (
	  id SERIAL PRIMARY KEY,
	  name VARCHAR(255),
	  description TEXT,
	  created_at TIMESTAMPTZ DEFAULT now()
	);`

	if _, err := s.Db.Exec(query); err != nil {
		return err
	}

	return nil
}

func (s *PostgresStore) createUsersTable() error {
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
	  profile_picture VARCHAR(255),
	  bio TEXT,
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
		return err
	}

	return nil
}

func (s *PostgresStore) CreateTables() error {
	if err := s.createUsersTable(); err != nil {
		log.Println("ERR USERS TABLE")
		return err
	}
	if err := s.createTopicsTable(); err != nil {
		log.Println("ERR TOPICS TABLE")
		return err
	}
	if err := s.createTopicsUserTable(); err != nil {
		log.Println("ERR TOPICS USERS TABLE")
		return err
	}
	if err := s.createFollowsTables(); err != nil {
		log.Println("ERR FOLLOWS TABLE")
		return err
	}
	if err := s.createEventsTable(); err != nil {
		log.Println("ERR EVENTS TABLE")
		return err
	}
	if err := s.createUserEventTable(); err != nil {
		log.Println("ERR USER EVENT TABLE")
		return err
	}
	if err := s.createPostsTable(); err != nil {
		log.Println("ERR POSTS TABLE")
		return err
	}
	if err := s.createCommentsTable(); err != nil {
		log.Println("ERR COMMENTS TABLE")
		return err
	}
	if err := s.createLikesTable(); err != nil {
		log.Println("ERR LIKES TABLE")
		return err
	}

	// TODO: Falta implementar las tablas de Stories, Conversations
	return nil
}
