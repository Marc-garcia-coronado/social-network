package storage

import (
	"github.com/Marc-Garcia-Coronado/socialNetwork/models"
	"strconv"
)

func (s *PostgresStore) CreatePost(post *models.PostReq) (*models.Post, error) {
	stmt := `
	INSERT INTO posts (picture, title, user_id, topic_id) 
	VALUES ($1, $2, $3, $4) 
	RETURNING id, picture, title, user_id, topic_id, created_at;
	`

	newPost := new(models.Post)
	err := s.Db.QueryRow(stmt, post.Picture, post.Title, post.UserID, post.TopicID).Scan(&newPost.ID, &newPost.Picture, &newPost.Title, &newPost.UserID, &newPost.TopicID, &newPost.CreatedAt)
	if err != nil {
		return nil, err
	}

	return newPost, nil
}

func (s *PostgresStore) GetUserPosts(id int) ([]models.Post, error) {
	stmt := `
	SELECT id, picture, title, user_id, topic_id, created_at
	FROM posts
	WHERE user_id = $1
	ORDER BY created_at DESC;
	`

	rows, err := s.Db.Query(stmt, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var postsArray []models.Post

	for rows.Next() {
		var newPost models.Post
		if err := rows.Scan(&newPost.ID, &newPost.Picture, &newPost.Title, &newPost.UserID, &newPost.TopicID, &newPost.CreatedAt); err != nil {
			return nil, err
		}
		postsArray = append(postsArray, newPost)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return postsArray, nil
}

func (s *PostgresStore) UpdatePost(post map[string]interface{}, postID int) (*models.Post, error) {

	// Build dynamic SQL query
	stmt := "UPDATE posts SET "
	values := []interface{}{}
	i := 1

	for key, value := range post {
		stmt += key + " = $" + strconv.Itoa(i) + ", "
		values = append(values, value)
		i++
	}

	stmt = stmt[:len(stmt)-2] // Remove last comma
	stmt += " WHERE id = $" + strconv.Itoa(i) + " RETURNING id, picture, title, user_id, topic_id, created_at;"
	values = append(values, postID)

	updatedPost := new(models.Post)
	// Execute stmt
	err := s.Db.QueryRow(stmt, values...).Scan(&updatedPost.ID, &updatedPost.Picture, &updatedPost.Title, &updatedPost.UserID, &updatedPost.TopicID, &updatedPost.CreatedAt)
	if err != nil {
		return nil, err
	}

	return updatedPost, nil
}

func (s *PostgresStore) DeletePost(id int) error {
	stmt := `
	DELETE FROM posts WHERE id = $1;
	`

	if err := s.Db.QueryRow(stmt, id).Err(); err != nil {
		return err
	}

	return nil
}
