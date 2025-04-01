package storage

import (
	"errors"

	"github.com/Marc-Garcia-Coronado/socialNetwork/models"
)

func (s *PostgresStore) LikePost(userID, postID int) error {
	stmt := `
	INSERT INTO likes (user_id, post_id)
	VALUES ($1, $2);
	`

	if err := s.Db.QueryRow(stmt, userID, postID).Err(); err != nil {
		return err
	}
	return nil
}

func (s *PostgresStore) LikeComment(userID, commentID int) error {
	stmt := `
	INSERT INTO likes (user_id, comment_id)
	VALUES ($1, $2);
	`

	if err := s.Db.QueryRow(stmt, userID, commentID).Err(); err != nil {
		return err
	}
	return nil
}

func (s *PostgresStore) DislikePost(userID, postID int) error {
	stmt := `DELETE FROM likes WHERE post_id = $1 AND user_id = $2;`
	res, err := s.Db.Exec(stmt, postID, userID)
	if err != nil {
		return err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return errors.New("no like found to delete")
	}

	return nil
}

func (s *PostgresStore) DislikeComment(userID, commentID int) error {
	stmt := `DELETE FROM likes WHERE comment_id = $1 AND user_id = $2;`
	res, err := s.Db.Exec(stmt, commentID, userID)
	if err != nil {
		return err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return errors.New("no like found to delete")
	}

	return nil
}

func (s *PostgresStore) GetPostLikes(postID, limit, offset int) ([]models.LikePost, int, error) {
	var totalCount int
	queryCount := "SELECT COUNT(*) FROM likes WHERE post_id = $1;"
	if err := s.Db.QueryRow(queryCount, postID).Scan(&totalCount); err != nil {
		return nil, 0, err
	}

	stmt := `
	SELECT l.id, l.created_at, 
		   u.id AS user_id, u.user_name, u.full_name, u.email, u.profile_picture, u.bio, u.is_active, u.role,
		   p.id AS post_id, p.picture, p.title, p.created_at AS post_created_at,
		   pu.id AS post_user_id, pu.user_name AS post_user_name, pu.full_name AS post_full_name, pu.email AS post_user_email, pu.profile_picture AS post_user_profile_picture,
	       pu.bio AS post_user_bio, pu.is_active AS post_user_is_active, pu.role AS post_user_role,
	       tu.id AS topic_id, tu.name AS topic_name, tu.description AS topic_description, tu.created_at AS topic_created_at
	FROM likes l
	JOIN users u ON u.id = l.user_id
	JOIN posts p ON p.id = l.post_id
	JOIN users pu ON pu.id = p.user_id
	JOIN topics tu ON tu.id = p.topic_id
	WHERE l.post_id = $1
	ORDER BY l.created_at DESC
	LIMIT $2 OFFSET $3;
	`

	rows, err := s.Db.Query(stmt, postID, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	var likesArray []models.LikePost
	for rows.Next() {
		newLike := new(models.LikePost)
		if err := rows.Scan(
			&newLike.ID, &newLike.CreatedAt,
			&newLike.User.ID, &newLike.User.UserName, &newLike.User.FullName,
			&newLike.User.Email, &newLike.User.ProfilePicture, &newLike.User.Bio, &newLike.User.IsActive, &newLike.User.Role,
			&newLike.Post.ID, &newLike.Post.Picture, &newLike.Post.Title, &newLike.Post.CreatedAt,
			&newLike.Post.User.ID, &newLike.Post.User.UserName, &newLike.Post.User.FullName,
			&newLike.Post.User.Email, &newLike.Post.User.ProfilePicture, &newLike.Post.User.Bio,
			&newLike.Post.User.IsActive, &newLike.Post.User.Role,
			&newLike.Post.Topic.ID, &newLike.Post.Topic.Name, &newLike.Post.Topic.Description, &newLike.Post.Topic.CreatedAt,
		); err != nil {
			return nil, 0, err
		}
		likesArray = append(likesArray, *newLike)
	}

	return likesArray, totalCount, nil
}

func (s *PostgresStore) GetCommentLikes(commentID, limit, offset int) ([]models.LikeComment, int, error) {
	var totalCount int
	queryCount := "SELECT COUNT(*) FROM likes WHERE comment_id = $1;"
	if err := s.Db.QueryRow(queryCount, commentID).Scan(&totalCount); err != nil {
		return nil, 0, err
	}

	stmt := `
	SELECT l.id, l.created_at, 
		   u.id AS user_id, u.user_name, u.full_name, u.email, u.profile_picture, u.bio, u.is_active, u.role,
		   c.id AS comment_id, c.body, c.created_at AS comment_created_at,
		   p.id AS post_id, p.picture, p.title, p.created_at AS post_created_at,
		   pu.id AS post_user_id, pu.user_name AS post_user_name, pu.full_name AS post_full_name, pu.email AS post_user_email, pu.profile_picture AS post_user_profile_picture,
	       pu.bio AS post_user_bio, pu.is_active AS post_user_is_active, pu.role AS post_user_role,
	       tu.id AS topic_id, tu.name AS topic_name, tu.description AS topic_description, tu.created_at AS topic_created_at
	FROM likes l
	JOIN users u ON u.id = l.user_id
	JOIN comments c ON c.id = l.comment_id
	JOIN posts p ON p.id = c.post_id
	JOIN users pu ON pu.id = p.user_id
	JOIN topics tu ON tu.id = p.topic_id
	WHERE l.comment_id = $1
	ORDER BY l.created_at DESC
	LIMIT $2 OFFSET $3;
	`

	rows, err := s.Db.Query(stmt, commentID, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	var likesArray []models.LikeComment
	for rows.Next() {
		newLike := new(models.LikeComment)
		if err := rows.Scan(
			&newLike.ID, &newLike.CreatedAt,
			&newLike.User.ID, &newLike.User.UserName, &newLike.User.FullName,
			&newLike.User.Email, &newLike.User.ProfilePicture, &newLike.User.Bio, &newLike.User.IsActive, &newLike.User.Role,
			&newLike.Comment.ID, &newLike.Comment.Body, &newLike.Comment.CreatedAt,
			&newLike.Comment.Post.ID, &newLike.Comment.Post.Picture, &newLike.Comment.Post.Title, &newLike.Comment.Post.CreatedAt,
			&newLike.Comment.Post.User.ID, &newLike.Comment.Post.User.UserName, &newLike.Comment.Post.User.FullName,
			&newLike.Comment.Post.User.Email, &newLike.Comment.Post.User.ProfilePicture, &newLike.Comment.Post.User.Bio,
			&newLike.Comment.Post.User.IsActive, &newLike.Comment.Post.User.Role,
			&newLike.Comment.Post.Topic.ID, &newLike.Comment.Post.Topic.Name, &newLike.Comment.Post.Topic.Description, &newLike.Comment.Post.Topic.CreatedAt,
		); err != nil {
			return nil, 0, err
		}
		likesArray = append(likesArray, *newLike)
	}

	return likesArray, totalCount, nil
}

func (s *PostgresStore) GetPostLikesCount(postID int) (*int, error) {

	var totalCount *int
	queryCount := "SELECT COUNT(*) FROM likes WHERE post_id = $1;"
	if err := s.Db.QueryRow(queryCount, postID).Scan(&totalCount); err != nil {
		return nil, err
	}

	return totalCount, nil
}

func (s *PostgresStore) GetCommentLikesCount(commentID int) (*int, error) {

	var totalCount *int
	queryCount := "SELECT COUNT(*) FROM likes WHERE comment_id = $1;"
	if err := s.Db.QueryRow(queryCount, commentID).Scan(&totalCount); err != nil {
		return nil, err
	}

	return totalCount, nil
}
func (s *PostgresStore) GetUserPostLikes(userID int) ([]int, error) {
    stmt := `
    SELECT post_id
    FROM likes
    WHERE user_id = $1;
    `
    rows, err := s.Db.Query(stmt, userID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var likedPosts []int
    for rows.Next() {
        var postID int
        if err := rows.Scan(&postID); err != nil {
            return nil, err
        }
        likedPosts = append(likedPosts, postID)
    }
    return likedPosts, nil
}