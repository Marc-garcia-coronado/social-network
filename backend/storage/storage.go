package storage

import (
	"database/sql"
	"github.com/Marc-Garcia-Coronado/socialNetwork/models"
)

type Storage interface {
	// User's methods
	Login(username, password string) (*int, error)
	GetUserByID(int) (*models.User, error)
	CreateUser(*models.User) (*int, error)
	UpdateUser(user map[string]interface{}, userID int) error
	DeleteUser(int) error

	// Topics methods
	GetTopics() ([]*models.Topic, error)
	GetTopicByID(int) (*models.Topic, error)
	CreateTopic(topic *models.Topic) (*int, error)
	UpdateTopic(topic map[string]interface{}, topicID int) error
	DeleteTopic(int) error
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
	if err := s.CreateTables(); err != nil {
		return err
	}

	return nil
}
