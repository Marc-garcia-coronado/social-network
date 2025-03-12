package routes

import (
	"github.com/Marc-Garcia-Coronado/socialNetwork/middleware"
	"github.com/Marc-Garcia-Coronado/socialNetwork/storage"
	"github.com/Marc-Garcia-Coronado/socialNetwork/utils"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	chimw "github.com/go-chi/chi/v5/middleware"

	"github.com/joho/godotenv"
	"log"
	"net/http"
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
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	router := chi.NewRouter()
	router.Use(chimw.Logger)
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
	}))

	// Public Routes
	router.Post("/api/register", utils.MakeHTTPHandleFunc(s.handleCreateUser))
	router.Post("/api/login", utils.MakeHTTPHandleFunc(s.handleLogin))

	// Protected router for not admin users
	protectedRouter := chi.NewRouter()
	protectedRouter.Use(middleware.JWTMiddleware)

	// User - Users routes
	protectedRouter.Get("/users/{id}", utils.MakeHTTPHandleFunc(s.handleGetUserByID))
	protectedRouter.Patch("/users/{id}", utils.MakeHTTPHandleFunc(s.handleUpdateUser))

	// User - Follows
	protectedRouter.Get("/users/{id}/followers", utils.MakeHTTPHandleFunc(s.handleGetFollowers))
	// protectedRouter.Get("/users/{id}/follows", utils.MakeHTTPHandleFunc(s.handleGetUserFollows))
	protectedRouter.Post("/users/follow/{id}", utils.MakeHTTPHandleFunc(s.handleFollowUser))
	protectedRouter.Delete("/users/unfollow/{id}", utils.MakeHTTPHandleFunc(s.handleUnfollowUser))

	// User - Topics routes
	protectedRouter.Get("/users/{userID}/topics", utils.MakeHTTPHandleFunc(s.handleGetUserTopics))
	protectedRouter.Get("/topics", utils.MakeHTTPHandleFunc(s.handleGetAllTopics))
	protectedRouter.Get("/topics/{id}", utils.MakeHTTPHandleFunc(s.handleGetTopicByID))
	protectedRouter.Post("/topics/follow", utils.MakeHTTPHandleFunc(s.handleFollowTopics))
	protectedRouter.Delete("/topics/unfollow", utils.MakeHTTPHandleFunc(s.handleUnfollowTopics))

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
