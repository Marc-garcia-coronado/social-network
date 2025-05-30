package routes

import (
	"log"
	"net/http"

	"github.com/Marc-Garcia-Coronado/socialNetwork/middleware"
	"github.com/Marc-Garcia-Coronado/socialNetwork/storage"
	"github.com/Marc-Garcia-Coronado/socialNetwork/utils"
	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

type APIServer struct {
	listenAddress string
	store         storage.Storage
}

func NewAPIServer(listenAddress string, store *storage.PostgresStore) *APIServer {
	return &APIServer{
		listenAddress: listenAddress,
		store:         store,
	}
}

func (s *APIServer) Run() {
	router := chi.NewRouter()
	router.Use(chimw.Logger)
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://flexin-frontend-production.up.railway.app", "localhost:3001"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
	}))

	// Public Routes
	router.Post("/api/register", utils.MakeHTTPHandleFunc(s.handleCreateUser))
	router.Post("/api/login", utils.MakeHTTPHandleFunc(s.handleLogin))
	router.Get("/api/topics", utils.MakeHTTPHandleFunc(s.handleGetAllTopics))
	router.Get("/api/events/closest", utils.MakeHTTPHandleFunc(s.handleGetClosestEvents))
	router.Get("/api/validate-token", utils.MakeHTTPHandleFunc(s.handleValidateToken))
	// User - WebSocket route
	router.Get("/wss", s.handleWebSocket)

	// Protected router for not admin users
	protectedRouter := chi.NewRouter()
	protectedRouter.Use(middleware.JWTMiddleware)

	// User - Users routes
	protectedRouter.Get("/auth", utils.MakeHTTPHandleFunc(s.handleAuth))
	protectedRouter.Get("/users/{id}", utils.MakeHTTPHandleFunc(s.handleGetUserByID))
	protectedRouter.Get("/users/{user_name}", utils.MakeHTTPHandleFunc(s.handleGetUserByUserName))
	protectedRouter.Get("/users/search", utils.MakeHTTPHandleFunc(s.handleSearchUsers))
	protectedRouter.Patch("/users/{id}", utils.MakeHTTPHandleFunc(s.handleUpdateUser))
	protectedRouter.Post("/logout", utils.MakeHTTPHandleFunc(s.handleLogout))

	// User - Follows routes
	protectedRouter.Get("/users/{id}/followers", utils.MakeHTTPHandleFunc(s.handleGetFollowers))
	protectedRouter.Get("/users/{id}/follows", utils.MakeHTTPHandleFunc(s.handleGetUserFollows))
	protectedRouter.Get("/users/{id}/followers/count", utils.MakeHTTPHandleFunc(s.handleGetCountFollowers))
	protectedRouter.Get("/users/{id}/follows/count", utils.MakeHTTPHandleFunc(s.handleGetUserCountFollows))
	protectedRouter.Get("/users/{id}/following", utils.MakeHTTPHandleFunc(s.handleCheckIfFollowing))
	protectedRouter.Post("/users/follow/{id}", utils.MakeHTTPHandleFunc(s.handleFollowUser))
	protectedRouter.Delete("/users/unfollow/{id}", utils.MakeHTTPHandleFunc(s.handleUnfollowUser))

	// User - Topics routes
	protectedRouter.Get("/users/{userID}/topics", utils.MakeHTTPHandleFunc(s.handleGetUserTopics))
	protectedRouter.Get("/topics", utils.MakeHTTPHandleFunc(s.handleGetAllTopics))
	protectedRouter.Get("/topics/{id}", utils.MakeHTTPHandleFunc(s.handleGetTopicByID))
	protectedRouter.Get("/users/{userID}/topics/follow/count", utils.MakeHTTPHandleFunc(s.handleGetFollowTopicsCount))
	protectedRouter.Post("/topics/follow", utils.MakeHTTPHandleFunc(s.handleFollowTopics))
	protectedRouter.Delete("/topics/unfollow", utils.MakeHTTPHandleFunc(s.handleUnfollowTopics))

	// User - Posts routes
	protectedRouter.Get("/users/{id}/posts", utils.MakeHTTPHandleFunc(s.handleGetUserPosts))
	protectedRouter.Get("/users/{userID}/posts/{postID}", utils.MakeHTTPHandleFunc(s.handleGetUserPosts))
	protectedRouter.Get("/users/{userID}/posts/count", utils.MakeHTTPHandleFunc(s.handleGetUserPostsCount))
	protectedRouter.Post("/posts", utils.MakeHTTPHandleFunc(s.handleCreatePost))
	protectedRouter.Patch("/users/{userID}/posts/{postID}", utils.MakeHTTPHandleFunc(s.handleUpdatePost))
	protectedRouter.Delete("/users/{userID}/posts/{postID}", utils.MakeHTTPHandleFunc(s.handleDeletePost))

	// User - Events routes
	protectedRouter.Get("/events", utils.MakeHTTPHandleFunc(s.handleGetAllEvents))
	protectedRouter.Get("/events/count", utils.MakeHTTPHandleFunc(s.handleGetAllEventsCount))
	protectedRouter.Get("/events/topics/{topicID}", utils.MakeHTTPHandleFunc(s.handleGetAllEventsByTopic))
	protectedRouter.Get("/events/topics/{topicID}/count", utils.MakeHTTPHandleFunc(s.handleGetAllEventsByTopicCount))
	protectedRouter.Get("/users/{userID}/events", utils.MakeHTTPHandleFunc(s.handleGetUserEvents))
	protectedRouter.Get("/users/{userID}/events/count", utils.MakeHTTPHandleFunc(s.handleGetUserEventsCount))
	protectedRouter.Post("/events", utils.MakeHTTPHandleFunc(s.handleCreateEvent))
	protectedRouter.Patch("/users/{userID}/events/{eventID}", utils.MakeHTTPHandleFunc(s.handleUpdateUserEvent))
	protectedRouter.Delete("/users/{userID}/events/{eventID}", utils.MakeHTTPHandleFunc(s.handleDeleteUserEvent))

	// User - Subscribe/Unsubscribe to Events routes
	protectedRouter.Get("/users/{userID}/events/subscribed", utils.MakeHTTPHandleFunc(s.handleGetUserSubscribedEvents))
	protectedRouter.Get("/users/{userID}/events/subscribed/count", utils.MakeHTTPHandleFunc(s.handleGetUserSubscribedEventsCount))
	protectedRouter.Post("/users/{userID}/events/{eventID}/subscribe", utils.MakeHTTPHandleFunc(s.handleSubscribeToEvent))
	protectedRouter.Delete("/users/{userID}/events/{eventID}/unsubscribe", utils.MakeHTTPHandleFunc(s.handleUnsubscribeToEvent))

	// User - Comments routes
	protectedRouter.Get("/posts/{postID}/comments", utils.MakeHTTPHandleFunc(s.handleGetPostComments))
	protectedRouter.Get("/posts/{postID}/comments/count", utils.MakeHTTPHandleFunc(s.handleGetPostCommentsCount))
	protectedRouter.Post("/posts/{postID}/comments", utils.MakeHTTPHandleFunc(s.handleCreatePostComment))
	protectedRouter.Delete("/comments/{commentID}", utils.MakeHTTPHandleFunc(s.handleDeletePostComment))

	// User - Likes routes
	protectedRouter.Get("/likes/posts/{postID}", utils.MakeHTTPHandleFunc(s.handleGetPostLikes))
	protectedRouter.Get("/likes/comments/{commentID}", utils.MakeHTTPHandleFunc(s.handleGetCommentLikes))
	protectedRouter.Get("/likes/posts/{postID}/count", utils.MakeHTTPHandleFunc(s.handleGetPostLikesCount))
	protectedRouter.Get("/likes/comments/{commentID}/count", utils.MakeHTTPHandleFunc(s.handleGetCommentLikesCount))
	protectedRouter.Post("/posts/{postID}/like", utils.MakeHTTPHandleFunc(s.handleLikePost))
	protectedRouter.Post("/comments/{commentID}/like", utils.MakeHTTPHandleFunc(s.handleLikeComment))
	protectedRouter.Delete("/posts/{postID}/dislike", utils.MakeHTTPHandleFunc(s.handleDislikePost))
	protectedRouter.Delete("/comments/{commentID}/dislike", utils.MakeHTTPHandleFunc(s.handleDislikeComment))
	protectedRouter.Get("/users/likes/posts", utils.MakeHTTPHandleFunc(s.handleGetUserPostsLikes))
	protectedRouter.Get("/users/likes/comments", utils.MakeHTTPHandleFunc(s.handleGetUserCommentLikes))

	// User - Feed routes
	protectedRouter.Get("/feed", utils.MakeHTTPHandleFunc(s.handleGetUserFeed))
	protectedRouter.Get("/feed/topics/{topicID}", utils.MakeHTTPHandleFunc(s.handleGetUserFeedByTopic))

	// User - Messages routes
	protectedRouter.Get("/messages", utils.MakeHTTPHandleFunc(s.handleGetConversations))
	protectedRouter.Get("/messages/{userID}", utils.MakeHTTPHandleFunc(s.handleGetConversationMessages))
	protectedRouter.Get("/messages/{userID}/read", utils.MakeHTTPHandleFunc(s.handleGetNotReadedConversationMessages))
	protectedRouter.Patch("/messages/{userID}/read", utils.MakeHTTPHandleFunc(s.handleReadConversation))

	// Protected router for admin
	adminRouter := chi.NewRouter()
	adminRouter.Use(middleware.JWTMiddleware)
	adminRouter.Use(middleware.AdminMiddleware)

	// Admin - User routes
	adminRouter.Post("/users", utils.MakeHTTPHandleFunc(s.handleCreateUser))
	adminRouter.Delete("/users/{id}", utils.MakeHTTPHandleFunc(s.handleDeleteUser))

	// Admin - Topics routes
	adminRouter.Post("/topics", utils.MakeHTTPHandleFunc(s.handleCreateTopic))
	adminRouter.Patch("/topics/{id}", utils.MakeHTTPHandleFunc(s.handleUpdateTopic))
	adminRouter.Delete("/topics/{id}", utils.MakeHTTPHandleFunc(s.handleDeleteTopic))

	// Defining the start of the url to match the patterns and then redirecting
	// to protected router ( if it starts with /api )
	// or admin router ( if it starts with /api/admin )
	router.Mount("/api", protectedRouter)
	router.Mount("/api/admin", adminRouter)

	log.Println("Server running on ", s.listenAddress)
	if err := http.ListenAndServe(s.listenAddress, router); err != nil {
		log.Fatalf("Error starting API server: %v", err)
	}
}
