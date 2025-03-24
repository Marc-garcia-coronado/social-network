package storage

import (
	"github.com/Marc-Garcia-Coronado/socialNetwork/models"
)

func (s *PostgresStore) GetUserFeed(userID, limit, offset int) ([]models.Post, int, error) {
	queryCount := `
	SELECT COUNT(DISTINCT p.id) 
	FROM posts p
	JOIN topics_user tu ON tu.topic_id = p.topic_id
	WHERE tu.user_id = $1`

	var totalCount int
	if err := s.Db.QueryRow(queryCount, userID).Scan(&totalCount); err != nil {
		return nil, 0, err
	}

	query := `
	SELECT DISTINCT 
		p.id, p.picture, p.title, p.created_at,
		u.id AS user_id, u.user_name, u.full_name, u.email, u.profile_picture, u.is_active, u.role,
		t.id AS topic_id, t.name, t.description, t.created_at AS topic_created_at
	FROM posts p
	JOIN topics_user tu ON tu.topic_id = p.topic_id
	JOIN users u ON u.id = p.user_id
	JOIN topics t ON t.id = p.topic_id
	WHERE tu.user_id = $1
	ORDER BY p.created_at DESC
	LIMIT $2 OFFSET $3;
	`

	rows, err := s.Db.Query(query, userID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var posts []models.Post
	for rows.Next() {
		var post models.Post
		err := rows.Scan(
			&post.ID, &post.Picture, &post.Title, &post.CreatedAt,
			&post.User.ID, &post.User.UserName, &post.User.FullName,
			&post.User.Email, &post.User.ProfilePicture, &post.User.IsActive, &post.User.Role,
			&post.Topic.ID, &post.Topic.Name, &post.Topic.Description,
			&post.Topic.CreatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		posts = append(posts, post)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, err
	}

	return posts, totalCount, nil
}

func (s *PostgresStore) GetUserFeedByTopic(userID, topicID, limit, offset int) ([]models.Post, int, error) {
	queryCount := `
	SELECT COUNT(DISTINCT p.id) 
	FROM posts p
	JOIN topics_user tu ON tu.topic_id = p.topic_id
	WHERE tu.user_id = $1 AND p.topic_id = $2`

	var totalCount int
	if err := s.Db.QueryRow(queryCount, userID, topicID).Scan(&totalCount); err != nil {
		return nil, 0, err
	}

	query := `
	SELECT DISTINCT 
		p.id, p.picture, p.title, p.created_at,
		u.id AS user_id, u.user_name, u.full_name, u.email, u.profile_picture, u.is_active, u.role,
		t.id AS topic_id, t.name, t.description, t.created_at AS topic_created_at
	FROM posts p
	JOIN topics_user tu ON tu.topic_id = p.topic_id
	JOIN users u ON u.id = p.user_id
	JOIN topics t ON t.id = p.topic_id
	WHERE tu.user_id = $1 AND p.topic_id = $2
	ORDER BY p.created_at DESC
	LIMIT $3 OFFSET $4;
	`

	rows, err := s.Db.Query(query, userID, topicID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var posts []models.Post
	for rows.Next() {
		var post models.Post
		err := rows.Scan(
			&post.ID, &post.Picture, &post.Title, &post.CreatedAt,
			&post.User.ID, &post.User.UserName, &post.User.FullName,
			&post.User.Email, &post.User.ProfilePicture, &post.User.IsActive, &post.User.Role,
			&post.Topic.ID, &post.Topic.Name, &post.Topic.Description,
			&post.Topic.CreatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		posts = append(posts, post)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, err
	}

	return posts, totalCount, nil
}
