package storage

import (
	"database/sql"

	"github.com/Marc-Garcia-Coronado/socialNetwork/models"
)

type Storage interface {
	// User methods
	Login(username, password string) (*models.User, error)
	GetUserByID(id int) (*models.User, error)
	GetUserByUserName(user_name string) (*models.User, error)
	SearchUsers(query string, limit int) ([]*models.User, error)
	CreateUser(user *models.User) (*models.User, error)
	UpdateUser(user map[string]any, userID int) (*models.User, error)
	DeleteUser(id int) error

	// User Follow methods
	FollowUser(userToFollowID, userID int) error
	UnfollowUser(userToFollowID, userID int) error
	GetFollowers(id, limit, offset int) ([]models.User, int, error)
	GetFollows(id, limit, offset int) ([]models.User, int, error)
	GetCountFollowers(id int) (*int, error)
	GetCountFollows(id int) (*int, error)
	CheckIfFollowing(followerID, followedID int) (bool, error)

	// Topics methods
	GetTopics() ([]models.Topic, error)
	GetTopicByID(id int) (*models.Topic, error)
	CreateTopic(topic *models.Topic) (*models.Topic, error)
	UpdateTopic(topic map[string]any, topicID int) (*models.Topic, error)
	DeleteTopic(id int) error

	// User Topics methods
	GetUserTopics(userID int) ([]models.UserTopic, error)
	FollowTopics(ids []int, userID int) error
	UnfollowTopics(ids []int, userID int) error
	GetUserFollowTopicsCount(userID int) (*int, error)

	// Posts methods
	CreatePost(post *models.PostReq) (*models.Post, error)
	GetUserPosts(id, limit, offset int) ([]models.Post, int, error)
	UpdatePost(post map[string]any, postID int) (*models.Post, error)
	DeletePost(id int) error
	GetUserPostsCount(userID int) (*int, error)

	// Events methods
	CreateEvent(event *models.EventReq) (*models.EventWithUser, error)
	GetAllEvents(limit, offset int, query string, topicID string) ([]models.EventWithUser, int, error)
	GetClosestEvents() ([]models.EventWithUser, error)
	GetAllEventsByTopic(topicID, limit, offset int) ([]models.EventWithUser, int, error)
	GetUserEvents(userID, limit, offset int) ([]models.EventWithUser, int, error)
	UpdateEvent(event map[string]any, eventID int) (*models.EventWithUser, error)
	DeleteEvent(id int) error
	GetAllEventsCount() (*int, error)
	GetAllEventsByTopicCount(topicID int) (*int, error)
	GetUserEventsCount(userID int) (*int, error)

	// Subscription to Events methods
	SubscribeEvent(eventID, userID int) error
	GetUserSubscribedEventsCount(userID int) (*int, error)
	UnsubscribeEvent(eventID, userID int) error
	GetUserSubscribedEvents(userID, limit, offset int) ([]models.SubscribedEvent, int, error)

	// Comments methods
	CreateComment(comment *models.CommentReq) (*models.Comment, error)
	GetPostComments(postID, limit, offset int) ([]models.Comment, int, error)
	GetPostCommentsCount(postID int) (*int, error)
	DeleteComment(id int) error
	GetIfUserOwnsComment(commentID, userID int) bool

	// Likes methods
	LikePost(userID, postID int) error
	LikeComment(userID, commentID int) error
	DislikePost(userID, postID int) error
	DislikeComment(userID, commentID int) error
	GetPostLikes(postID, limit, offset int) ([]models.LikePost, int, error)
	GetCommentLikes(commentID, limit, offset int) ([]models.LikeComment, int, error)
	GetPostLikesCount(postID int) (*int, error)
	GetCommentLikesCount(commentID int) (*int, error)
	GetUserPostLikes(userID int) ([]int, error)
	GetUserCommentLikes(userID int) ([]int, error)

	// Feed methods
	GetUserFeed(userID, limit, offset int) ([]models.Post, int, error)
	GetUserFeedByTopic(userID, topicID, limit, offset int) ([]models.Post, int, error)

	// Messages methods
	SaveMessage(message *models.MessageReq) (*models.Message, error)
	GetConversationMessages(from, to int) ([]models.Message, error)
	GetUserConversations(userID int) ([]models.User, error)
	ReadConversationMessages(from, to int) error
	GetNotReadedConversationMessages(from, to int) (int, error)
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
