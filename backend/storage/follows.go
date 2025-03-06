package storage

import "github.com/Marc-Garcia-Coronado/socialNetwork/models"

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

	if err := s.Db.QueryRow(stmt, userID, userToFollowID).Err(); err != nil {
		return err
	}

	return nil
}

func (s *PostgresStore) GetFollowers(id int) ([]models.User, error) {
	stmt := `
	SELECT u.id, u.user_name, u.full_name, u.email, u.profile_picture 
	FROM users u
	JOIN user_follow_user ufu ON u.id = ufu.user_following_id
	WHERE ufu.user_followed_id = $1
	ORDER BY ufu.followed_at DESC;
	`
	rows, err := s.Db.Query(stmt, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		user := new(models.User)
		if err := rows.Scan(&user.ID, &user.UserName, &user.FullName, &user.Email, &user.ProfilePicture); err != nil {
			return nil, err
		}
		users = append(users, *user)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return users, nil
}
