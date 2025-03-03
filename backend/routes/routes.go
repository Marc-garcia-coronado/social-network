package routes

import (
	"github.com/Marc-Garcia-Coronado/socialNetwork/middleware"
	"github.com/Marc-Garcia-Coronado/socialNetwork/storage"
	"github.com/Marc-Garcia-Coronado/socialNetwork/utils"
	"github.com/go-chi/chi/v5"
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

	// Public Routes
	router.Post("/api/register", utils.MakeHTTPHandleFunc(s.handleCreateUser))
	router.Post("/api/login", utils.MakeHTTPHandleFunc(s.handleLogin))

	// Protected router for not admin users
	protectedRouter := chi.NewRouter()
	protectedRouter.Use(middleware.JWTMiddleware)

	// User - Users routes
	protectedRouter.Patch("/user/{id}", utils.MakeHTTPHandleFunc(s.handleUpdateUser))

	// Protected router for admin
	adminRouter := chi.NewRouter()
	adminRouter.Use(middleware.JWTMiddleware)
	adminRouter.Use(middleware.AdminMiddleware)

	// Admin - User routes
	adminRouter.Get("/user/{id}", utils.MakeHTTPHandleFunc(s.handleGetUserByID))
	adminRouter.Post("/user", utils.MakeHTTPHandleFunc(s.handleCreateUser))
	adminRouter.Patch("/user/{id}", utils.MakeHTTPHandleFunc(s.handleUpdateUser))
	adminRouter.Delete("/user/{id}", utils.MakeHTTPHandleFunc(s.handleDeleteUser))

	// Admin - Topics routes
	//adminRouter.Get("/topic", utils.MakeHTTPHandleFunc(s.))
	//adminRouter.Get("/topic/{id}", utils.MakeHTTPHandleFunc(s.))
	//adminRouter.Post("/topic", utils.MakeHTTPHandleFunc(s.))
	//adminRouter.Patch("/topic/{id}", utils.MakeHTTPHandleFunc(s.))
	//adminRouter.Delete("/topic/{id}", utils.MakeHTTPHandleFunc(s.))

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
