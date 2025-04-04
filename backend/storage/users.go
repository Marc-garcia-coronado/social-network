package storage

import (
	"database/sql"
	"errors"
	"fmt"

	"strconv"

	"github.com/Marc-Garcia-Coronado/socialNetwork/models"
	"github.com/Marc-Garcia-Coronado/socialNetwork/utils"
	_ "github.com/lib/pq"
)

func (s *PostgresStore) CreateUser(u *models.User) (*models.User, error) {
	stmt := `
	INSERT INTO users (user_name, full_name, email, password_hash, role)
	VALUES ($1, $2, $3, $4, $5)
	RETURNING id, user_name, full_name, email, profile_picture, bio, is_active, role, user_since;
	`

	newUser := new(models.User)

	if err := s.Db.QueryRow(stmt, u.UserName, u.FullName, u.Email, u.Password, u.Role).Scan(&newUser.ID, &newUser.UserName, &newUser.FullName, &newUser.Email,
		&newUser.ProfilePicture, &newUser.Bio, &newUser.IsActive, &newUser.Role, &newUser.UserSince); err != nil {
		return nil, err
	}

	return newUser, nil
}

func (s *PostgresStore) Login(email, password string) (*models.User, error) {
	var hash string
	newUser := new(models.User)

	stmt := `
	SELECT id, user_name, full_name, email, profile_picture, bio, is_active, role, user_since, password_hash 
	FROM users 
	WHERE email = $1;
	`
	err := s.Db.QueryRow(stmt, email).Scan(&newUser.ID, &newUser.UserName, &newUser.FullName, &newUser.Email,
		&newUser.ProfilePicture, &newUser.Bio, &newUser.IsActive, &newUser.Role, &newUser.UserSince, &hash)
	if err != nil {
		return nil, err
	}

	ok := utils.CheckPassword(hash, password)
	if !ok {
		return nil, fmt.Errorf("las contraseñas no coinciden")
	}

	return newUser, nil
}

func (s *PostgresStore) GetUserByID(id int) (*models.User, error) {

	user := new(models.User)
	stmt := "SELECT id, user_name, full_name, email, profile_picture, bio, is_active, role, user_since FROM users WHERE id = $1"
	if err := s.Db.QueryRow(stmt, id).Scan(&user.ID, &user.UserName, &user.FullName, &user.Email,
		&user.ProfilePicture, &user.Bio, &user.IsActive, &user.Role, &user.UserSince); err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}

	return user, nil
}

func (s *PostgresStore) GetUserByUserName(user_name string) (*models.User, error) {
	if s.Db == nil {
		return nil, fmt.Errorf("database connection is nil")
	}

	user := new(models.User)
	query := `SELECT id, user_name, full_name, email, profile_picture, bio, is_active, role, user_since 
			FROM users 
			WHERE user_name = $1`

	err := s.Db.QueryRow(query, user_name).Scan(
		&user.ID, &user.UserName, &user.FullName, &user.Email,
		&user.ProfilePicture, &user.Bio, &user.IsActive, &user.Role, &user.UserSince,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found: %s", user_name)
		}
		return nil, fmt.Errorf("query error: %v", err)
	}

	return user, nil
}

func (s *PostgresStore) UpdateUser(user map[string]any, userID int) (*models.User, error) {

	// Build dynamic SQL query
	stmt := "UPDATE users SET "
	values := []any{}
	i := 1

	for key, value := range user {
		stmt += key + " = $" + strconv.Itoa(i) + ", "
		values = append(values, value)
		i++
	}

	stmt = stmt[:len(stmt)-2] // Remove last comma
	stmt += " WHERE id = $" + strconv.Itoa(i) + " RETURNING id, user_name, full_name, email, profile_picture, bio, is_active, role, user_since"
	values = append(values, userID)

	updatedUser := new(models.User)
	// Execute stmt
	err := s.Db.QueryRow(stmt, values...).Scan(&updatedUser.ID, &updatedUser.UserName, &updatedUser.FullName, &updatedUser.Email,
		&updatedUser.ProfilePicture, &updatedUser.Bio, &updatedUser.IsActive, &updatedUser.Role, &updatedUser.UserSince)
	if err != nil {
		return nil, err
	}

	return updatedUser, nil
}

func (s *PostgresStore) DeleteUser(id int) error {
	stmt := "DELETE FROM users WHERE id = $1"
	res, err := s.Db.Exec(stmt, id)
	if err != nil {
		return err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return errors.New("no user found to delete")
	}

	return nil
}
