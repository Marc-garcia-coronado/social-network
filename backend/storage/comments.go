package storage

import "github.com/Marc-Garcia-Coronado/socialNetwork/models"

func (s *PostgresStore) CreateComment(comment *models.CommentReq) (*models.Comment, error) {
	stmt := `
	WITH inserted_comment AS (
	    INSERT INTO comments (body, user_id, post_id)
		VALUES ($1, $2, $3)
		RETURNING *
	)
	SELECT c.id, c.body, c.created_at,
	       u.id AS user_id, u.user_name, u.full_name, u.email, u.profile_picture,
	       p.id AS post_id, p.picture, p.title, p.created_at AS post_created_at,
	       up.id AS post_user_id, up.user_name AS post_user_name, up.full_name AS post_full_name, up.email AS post_user_email, up.profile_picture AS post_user_profile_picture,
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
		&newComment.Post.ID, &newComment.Post.Picture, &newComment.Post.Title, &newComment.Post.CreatedAt,
		&newComment.Post.User.ID, &newComment.Post.User.UserName, &newComment.Post.User.FullName, &newComment.Post.User.Email, &newComment.Post.User.ProfilePicture,
		&newComment.Post.Topic.ID, &newComment.Post.Topic.Name, &newComment.Post.Topic.Description, &newComment.Post.Topic.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return newComment, nil
}

func (s *PostgresStore) DeleteComment(postID, userID int) error {
	return nil
}

func (s *PostgresStore) GetPostComments(postID, limit, offset int) ([]models.Comment, int, error) {
	return nil, 0, nil
}
