package storage

import (
	"database/sql"
	"github.com/Marc-Garcia-Coronado/socialNetwork/models"
)

type Storage interface {
	CreateUser(*models.User) (*int, error)
	UpdateUser(user map[string]interface{}, userID int) error
	DeleteUser(int) error
	GetUserByID(int) (*models.User, error)
	Login(username, password string) (*int, error)
}

type PostgresStore struct {
	Db *sql.DB
}

func NewPostgresStore() (*PostgresStore, error) {
	uri := "user=postgres dbname=postgres password=socialNetwork sslmode=disable"
	db, err := sql.Open("postgres", uri)

	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	return &PostgresStore{
		Db: db,
	}, nil
}

func (s *PostgresStore) Init() error {
	if err := s.CreateUserTable(); err != nil {
		return err
	}
	return nil
}
