package storage

import (
	"errors"
	"fmt"

	"github.com/Marc-Garcia-Coronado/socialNetwork/models"
)

func (s *PostgresStore) CreatePost(post *models.PostReq) (*models.Post, error) {
	stmt := `
	WITH inserted_post AS (
		INSERT INTO posts (picture, title, user_id, topic_id) 
		VALUES ($1, $2, $3, $4) 
		RETURNING id, picture, title, user_id, topic_id, created_at
	)
	SELECT ip.id, ip.picture, ip.title, ip.created_at,
	       u.id AS creator_id, u.user_name, u.full_name, u.email, u.profile_picture,
	       t.id AS topic_id, t.name AS topic_name, t.description AS topic_description, t.created_at AS topic_created_at
	FROM inserted_post ip
	JOIN users u ON u.id = ip.user_id
	JOIN topics t ON t.id = ip.topic_id
	`

	newPost := new(models.Post)
	err := s.Db.QueryRow(stmt, post.Picture, post.Title, post.UserID, post.TopicID).Scan(
		&newPost.ID, &newPost.Picture, &newPost.Title, &newPost.CreatedAt,
		&newPost.User.ID, &newPost.User.UserName, &newPost.User.FullName,
		&newPost.User.Email, &newPost.User.ProfilePicture,
		&newPost.Topic.ID, &newPost.Topic.Name, &newPost.Topic.Description, &newPost.Topic.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return newPost, nil
}

func (s *PostgresStore) GetUserPosts(id, limit, offset int) ([]models.Post, int, error) {
	var totalCount int
	queryCount := "SELECT COUNT(*) FROM posts WHERE user_id = $1;"
	if err := s.Db.QueryRow(queryCount, id).Scan(&totalCount); err != nil {
		return nil, 0, err
	}

	stmt := `
	SELECT p.id, p.picture, p.title, p.user_id, p.created_at,
		   u.id AS creator_id, u.user_name, u.full_name, u.email, u.profile_picture, u.is_active, u.role,
	       t.id AS topic_id, t.name AS topic_name, t.description AS topic_description, t.created_at AS topic_created_at
	FROM posts p
	JOIN users u ON u.id = p.user_id
	JOIN topics t ON t.id = p.topic_id
	WHERE p.user_id = $1
	ORDER BY p.created_at DESC
	LIMIT $2 OFFSET $3;
	`

	rows, err := s.Db.Query(stmt, id, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var postsArray []models.Post

	for rows.Next() {
		var newPost models.Post
		if err := rows.Scan(
			&newPost.ID, &newPost.Picture, &newPost.Title, &newPost.User.ID, &newPost.CreatedAt,
			&newPost.User.ID, &newPost.User.UserName, &newPost.User.FullName,
			&newPost.User.Email, &newPost.User.ProfilePicture, &newPost.User.IsActive, &newPost.User.Role,
			&newPost.Topic.ID, &newPost.Topic.Name, &newPost.Topic.Description, &newPost.Topic.CreatedAt,
		); err != nil {
			return nil, 0, err
		}
		postsArray = append(postsArray, newPost)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return postsArray, totalCount, nil
}

func (s *PostgresStore) UpdatePost(post map[string]any, postID int) (*models.Post, error) {
	// Validar que el mapa no esté vacío
	if len(post) == 0 {
		return nil, fmt.Errorf("no fields to update")
	}

	// Construir dinámicamente la consulta SQL
	query := "UPDATE posts SET "
	args := []interface{}{}
	i := 1

	for key, value := range post {
		query += fmt.Sprintf("%s = $%d, ", key, i)
		args = append(args, value)
		i++
	}

	// Remover la última coma y espacio, y agregar la cláusula WHERE
	query = query[:len(query)-2] + " WHERE id = $%d RETURNING *;"
	args = append(args, postID)

	// Formatear el índice del parámetro de la cláusula WHERE
	query = fmt.Sprintf(query, i)

	// Ejecutar la consulta y escanear el resultado
	var updatedPost models.Post
	err := s.Db.QueryRow(query, args...).Scan(
		&updatedPost.ID, &updatedPost.Picture, &updatedPost.Title,
		&updatedPost.User.ID, &updatedPost.Topic.ID, &updatedPost.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &updatedPost, nil
}

func (s *PostgresStore) DeletePost(id int) error {
	stmt := "DELETE FROM posts WHERE id = $1;"

	res, err := s.Db.Exec(stmt, id)
	if err != nil {
		return err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return errors.New("no post found to delete")
	}

	return nil
}

func (s *PostgresStore) GetUserPostsCount(userID int) (*int, error) {
	stmt := `
	SELECT count(*) FROM posts WHERE user_id = $1;
	`
	var count *int
	if err := s.Db.QueryRow(stmt, userID).Scan(&count); err != nil {
		return nil, err
	}

	return count, nil
}
