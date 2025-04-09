package storage

import (
	"errors"
	"github.com/Marc-Garcia-Coronado/socialNetwork/models"
)

func (s *PostgresStore) FollowUser(userToFollowID, userID int) error {
	stmt := `
	INSERT INTO user_follow_user (user_following_id, user_followed_id)
	VALUES ($1, $2) 
	ON CONFLICT (user_following_id, user_followed_id) DO NOTHING;
	`

	if err := s.Db.QueryRow(stmt, userID, userToFollowID).Err(); err != nil {
		return err
	}

	return nil
}

func (s *PostgresStore) UnfollowUser(userToFollowID, userID int) error {
	stmt := `DELETE FROM user_follow_user WHERE user_following_id = $1 AND user_followed_id = $2;`

	res, err := s.Db.Exec(stmt, userID ,userToFollowID)
	if err != nil {
		return err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return errors.New("no follow found to delete")
	}

	return nil
}

func (s *PostgresStore) GetFollowers(id, limit, offset int) ([]models.User, int, error) {
	var totalCount int
	queryCount := "SELECT COUNT(*) FROM user_follow_user WHERE user_followed_id = $1;"
	if err := s.Db.QueryRow(queryCount, id).Scan(&totalCount); err != nil {
		return nil, 0, err
	}

	stmt := `
	SELECT u.id, u.user_name, u.full_name, u.email, u.profile_picture, u.role
	FROM users u
	JOIN user_follow_user ufu ON u.id = ufu.user_following_id
	WHERE ufu.user_followed_id = $1
	ORDER BY ufu.followed_at DESC
	LIMIT $2 OFFSET $3;
	`
	rows, err := s.Db.Query(stmt, id, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		user := new(models.User)
		if err := rows.Scan(&user.ID, &user.UserName, &user.FullName, &user.Email, &user.ProfilePicture, &user.Role); err != nil {
			return nil, 0, err
		}
		users = append(users, *user)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}
	return users, totalCount, nil
}

func (s *PostgresStore) GetFollows(id, limit, offset int) ([]models.User, int, error) {
	var totalCount int
	queryCount := "SELECT COUNT(*) FROM user_follow_user WHERE user_following_id = $1;"
	if err := s.Db.QueryRow(queryCount, id).Scan(&totalCount); err != nil {
		return nil, 0, err
	}

	stmt := `
	SELECT u.id, u.user_name, u.full_name, u.email, u.profile_picture, u.role
	FROM users u
	JOIN user_follow_user ufu ON u.id = ufu.user_following_id
	WHERE ufu.user_following_id = $1
	ORDER BY ufu.followed_at DESC
	LIMIT $2 OFFSET $3;
	`

	rows, err := s.Db.Query(stmt, id, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		user := new(models.User)
		if err := rows.Scan(&user.ID, &user.UserName, &user.FullName, &user.Email, &user.ProfilePicture, &user.Role); err != nil {
			return nil, 0, err
		}
		users = append(users, *user)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}
	return users, totalCount, nil
}

func (s *PostgresStore) GetCountFollowers(id int) (*int, error) {
	stmt := `
	SELECT count(*) FROM user_follow_user WHERE user_followed_id = $1;
	`
	var count *int
	if err := s.Db.QueryRow(stmt, id).Scan(&count); err != nil {
		return nil, err
	}

	return count, nil
}

func (s *PostgresStore) GetCountFollows(id int) (*int, error) {
	stmt := `
	SELECT count(*) FROM user_follow_user WHERE user_following_id = $1;
	`
	var count *int
	if err := s.Db.QueryRow(stmt, id).Scan(&count); err != nil {
		return nil, err
	}

	return count, nil
}
func (s *PostgresStore) CheckIfFollowing(followerID, followedID int) (bool, error) {
    stmt := `
    SELECT EXISTS (
        SELECT 1 
        FROM user_follow_user 
        WHERE user_following_id = $1 AND user_followed_id = $2
    );
    `

    var isFollowing bool
    err := s.Db.QueryRow(stmt, followedID, followerID).Scan(&isFollowing)
    if err != nil {
        return false, err
    }

    return isFollowing, nil
}