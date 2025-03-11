package storage

import (
	"database/sql"
	"github.com/Marc-Garcia-Coronado/socialNetwork/models"
)

type Storage interface {
	// User methods
	Login(username, password string) (*models.User, error)
	GetUserByID(id int) (*models.User, error)
	CreateUser(user *models.User) (*models.User, error)
	UpdateUser(user map[string]interface{}, userID int) (*models.User, error)
	DeleteUser(id int) error

	// User Follow methods
	FollowUser(userToFollowID, userID int) error
	UnfollowUser(userToFollowID, userID int) error
	GetFollowers(id int) ([]models.User, error)
	GetFollows(id int) ([]models.User, error)
	GetCountFollowers(id int) (*int, error)
	GetCountFollows(id int) (*int, error)

	// Topics methods
	GetTopics() ([]models.Topic, error)
	GetTopicByID(id int) (*models.Topic, error)
	CreateTopic(topic *models.Topic) (*models.Topic, error)
	UpdateTopic(topic map[string]interface{}, topicID int) (*models.Topic, error)
	DeleteTopic(id int) error

	// User - Topics methods
	GetUserTopics(userID int) ([]models.UserTopic, error)
	FollowTopics(ids []int, userID int) error
	UnfollowTopics(ids []int, userID int) error

	// Posts methods
	CreatePost(post *models.PostReq) (*models.Post, error)
	GetUserPosts(id int) ([]models.Post, error)
	UpdatePost(post map[string]interface{}, postID int) (*models.Post, error)
	DeletePost(id int) error

	// Events methods
	CreateEvent(event *models.EventReq) (*models.Event, error)
	GetAllEventsWithCount(limit, offset int) ([]models.Event, int, error)
	//GetUserEvents(userID, limit, offset int) ([]models.Event, error)
	//UpdateEvent(event map[string]interface{}, eventID int) (*models.Event, error)
	//DeleteEvent(id int) error

	// Users join Events methods
	//SubscribeEvent(eventID, userID int) error
	//UnsubscribeEvent(eventID, userID int) error
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
