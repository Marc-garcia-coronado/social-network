package storage

import (
	"database/sql"
	"fmt"

	"github.com/Marc-Garcia-Coronado/socialNetwork/models"
	"github.com/Marc-Garcia-Coronado/socialNetwork/utils"
	_ "github.com/lib/pq"
	"strconv"
)

func (s *PostgresStore) CreateUser(u *models.User) (*int, error) {
	stmt := `
	INSERT INTO users (user_name, full_name, email, password_hash, role)
	VALUES ($1, $2, $3, $4, $5)
	RETURNING id;
	`

	var id *int

	if err := s.Db.QueryRow(stmt, u.UserName, u.FullName, u.Email, u.Password, u.Role).Scan(&id); err != nil {
		fmt.Errorf("No se ha podido insertar un user: ", err)
		return nil, err
	}

	return id, nil
}

func (s *PostgresStore) Login(username, password string) (*int, error) {
	var id *int
	var hash string
	stmt := `SELECT id, password_hash FROM users WHERE user_name = $1;`
	err := s.Db.QueryRow(stmt, username).Scan(&id, &hash)
	if err != nil {
		return nil, err
	}

	ok := utils.CheckPassword(hash, password)
	if !ok {
		return nil, fmt.Errorf("Las password no coincide")
	}

	return id, nil
}

func (s *PostgresStore) UpdateUser(user map[string]interface{}, userID int) error {

	// Build dynamic SQL query
	stmt := "UPDATE users SET "
	values := []interface{}{}
	i := 1

	for key, value := range user {
		stmt += key + " = $" + strconv.Itoa(i) + ", "
		values = append(values, value)
		i++
	}

	stmt = stmt[:len(stmt)-2] // Remove last comma
	stmt += " WHERE id = $" + strconv.Itoa(i)
	values = append(values, userID)

	// Execute stmt
	err := s.Db.QueryRow(stmt, values...)
	if err.Err() != nil {
		return err.Err()
	}

	return nil
}

func (s *PostgresStore) DeleteUser(id int) error {
	stmt := "DELETE FROM users WHERE id = $1"
	if err := s.Db.QueryRow(stmt, id); err.Err() != nil {
		return err.Err()
	}
	return nil
}

func (s *PostgresStore) GetUserByID(id int) (*models.User, error) {

	user := &models.User{}
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
