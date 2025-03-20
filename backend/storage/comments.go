package storage

import (
	"errors"
	"github.com/Marc-Garcia-Coronado/socialNetwork/models"
)

func (s *PostgresStore) CreateComment(comment *models.CommentReq) (*models.Comment, error) {
	stmt := `
	WITH inserted_comment AS (
	    INSERT INTO comments (body, user_id, post_id)
		VALUES ($1, $2, $3)
		RETURNING *
	)
	SELECT c.id, c.body, c.created_at,
	       u.id AS user_id, u.user_name, u.full_name, u.email, u.profile_picture, u.bio, u.is_active, u.role,
	       p.id AS post_id, p.picture, p.title, p.created_at AS post_created_at,
	       up.id AS post_user_id, up.user_name AS post_user_name, up.full_name AS post_full_name, up.email AS post_user_email, up.profile_picture AS post_user_profile_picture,
	       up.bio AS post_user_bio, up.is_active AS post_user_is_active, up.role AS post_user_role,
	       t.id AS topic_id, t.name AS topic_name, t.description AS topic_description, t.created_at AS topic_created_at
	FROM inserted_comment c
	JOIN users u ON u.id = c.user_id
	JOIN posts p ON p.id = c.post_id
	JOIN users up ON up.id = p.user_id
	LEFT JOIN topics t ON t.id = p.topic_id;
	`

	newComment := new(models.Comment)
	err := s.Db.QueryRow(stmt, comment.Body, comment.UserID, comment.PostID).Scan(
		&newComment.ID, &newComment.Body, &newComment.CreatedAt,
		&newComment.User.ID, &newComment.User.UserName, &newComment.User.FullName, &newComment.User.Email, &newComment.User.ProfilePicture,
		&newComment.User.Bio, &newComment.User.IsActive, &newComment.User.Role,
		&newComment.Post.ID, &newComment.Post.Picture, &newComment.Post.Title, &newComment.Post.CreatedAt,
		&newComment.Post.User.ID, &newComment.Post.User.UserName, &newComment.Post.User.FullName, &newComment.Post.User.Email, &newComment.Post.User.ProfilePicture,
		&newComment.Post.User.Bio, &newComment.Post.User.IsActive, &newComment.Post.User.Role,
		&newComment.Post.Topic.ID, &newComment.Post.Topic.Name, &newComment.Post.Topic.Description, &newComment.Post.Topic.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return newComment, nil
}

func (s *PostgresStore) GetPostComments(postID, limit, offset int) ([]models.Comment, int, error) {
	var totalCount int
	queryCount := "SELECT COUNT(*) FROM comments WHERE post_id = $1;"
	if err := s.Db.QueryRow(queryCount, postID).Scan(&totalCount); err != nil {
		return nil, 0, err
	}

	stmt := `
	SELECT c.id, c.body, c.created_at,
	       u.id AS user_id, u.user_name, u.full_name, u.email, u.profile_picture, u.bio, u.is_active, u.role,
	       p.id AS post_id, p.picture, p.title, p.created_at AS post_created_at,
	       up.id AS post_user_id, up.user_name AS post_user_name, up.full_name AS post_full_name, up.email AS post_user_email, up.profile_picture AS post_user_profile_picture,
	       up.bio AS post_user_bio, up.is_active AS post_user_is_active, up.role AS post_user_role,
	       t.id AS topic_id, t.name AS topic_name, t.description AS topic_description, t.created_at AS topic_created_at
	FROM comments c
	JOIN users u ON u.id = c.user_id
	JOIN posts p ON p.id = c.post_id
	JOIN users up ON up.id = p.user_id
	LEFT JOIN topics t ON t.id = p.topic_id
	WHERE c.post_id = $1
	ORDER BY c.created_at DESC
	LIMIT $2 OFFSET $3;
	`

	rows, err := s.Db.Query(stmt, postID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var commentsArray []models.Comment
	for rows.Next() {
		newComment := new(models.Comment)
		if err := rows.Scan(
			&newComment.ID, &newComment.Body, &newComment.CreatedAt,
			&newComment.User.ID, &newComment.User.UserName, &newComment.User.FullName, &newComment.User.Email, &newComment.User.ProfilePicture,
			&newComment.User.Bio, &newComment.User.IsActive, &newComment.User.Role,
			&newComment.Post.ID, &newComment.Post.Picture, &newComment.Post.Title, &newComment.Post.CreatedAt,
			&newComment.Post.User.ID, &newComment.Post.User.UserName, &newComment.Post.User.FullName, &newComment.Post.User.Email, &newComment.Post.User.ProfilePicture,
			&newComment.Post.User.Bio, &newComment.Post.User.IsActive, &newComment.Post.User.Role,
			&newComment.Post.Topic.ID, &newComment.Post.Topic.Name, &newComment.Post.Topic.Description, &newComment.Post.Topic.CreatedAt,
		); err != nil {
			return nil, 0, err
		}

		commentsArray = append(commentsArray, *newComment)
	}

	return commentsArray, totalCount, nil
}

func (s *PostgresStore) DeleteComment(id int) error {
	stmt := `DELETE FROM comments WHERE id = $1`
	res, err := s.Db.Exec(stmt, id)
	if err != nil {
		return err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return errors.New("no comment found to delete")
	}

	return nil
}

func (s *PostgresStore) GetIfUserOwnsComment(commentID, userID int) bool {
	stmt := "SELECT user_id FROM comments WHERE id = $1"

	var user_id int
	if err := s.Db.QueryRow(stmt, commentID).Scan(&user_id); err != nil {
		return false
	}

	return user_id == userID
}
