package main

import (
	"encoding/json"
	"errors"
	"github.com/Marc-Garcia-Coronado/socialNetwork/middleware"
	"github.com/Marc-Garcia-Coronado/socialNetwork/utils"
	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
	"log"
	"net/http"
	"strconv"
)

type APIServer struct {
	listenAddress string
	store         Storage
}

func NewAPIServer(listenAddress string, store *PostgresStore) *APIServer {
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
	router.Post("/api/register", makeHTTPHandleFunc(s.handleCreateUser))
	router.Post("/api/login", makeHTTPHandleFunc(s.handleLogin))

	protectedRouter := chi.NewRouter()
	protectedRouter.Use(middleware.JWTMiddleware)
	protectedRouter.Patch("/user/{id}", makeHTTPHandleFunc(s.handleUpdateUser))

	adminRouter := chi.NewRouter()
	adminRouter.Use(middleware.JWTMiddleware)
	adminRouter.Use(middleware.AdminMiddleware)
	adminRouter.Get("/user/{id}", makeHTTPHandleFunc(s.handleGetUserByID))

	router.Mount("/api", protectedRouter)
	router.Mount("/api/admin", adminRouter)

	log.Println("Server running on ", s.listenAddress)
	if err := http.ListenAndServe(s.listenAddress, router); err != nil {
		log.Fatalf("Error starting API server: %v", err)
	}
}

func (s *APIServer) handleLogin(w http.ResponseWriter, r *http.Request) error {
	loginUserReq := new(LoginUserReq)
	if err := json.NewDecoder(r.Body).Decode(&loginUserReq); err != nil {
		return err
	}

	id, err := s.store.Login(loginUserReq.UserName, loginUserReq.Password)
	if err != nil {
		return err
	}

	loggedUser, err := s.store.GetUserByID(*id)

	token, err := utils.GenerateJWT(*id, loggedUser.Role)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return err
	}

	return WriteJSON(w, http.StatusOK, struct {
		User  *User  `json:"user"`
		Token string `json:"token"`
	}{
		User:  loggedUser,
		Token: token,
	})
}

func (s *APIServer) handleGetUserByID(w http.ResponseWriter, r *http.Request) error {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		return err
	}

	user := new(User)
	user, err = s.store.GetUserByID(id)
	if err != nil {
		return err
	}

	return WriteJSON(w, http.StatusOK, user)
}

func (s *APIServer) handleCreateUser(w http.ResponseWriter, r *http.Request) error {
	createUserReq := new(CreateUserReq)
	if err := json.NewDecoder(r.Body).Decode(createUserReq); err != nil {
		return err
	}

	user := NewUser(createUserReq.UserName, createUserReq.FullName, createUserReq.Email, createUserReq.Password)

	id, err := s.store.CreateUser(user)
	if err != nil {
		return err
	}

	insertedUser, err := s.store.GetUserByID(*id)
	if err != nil {
		return err
	}

	return WriteJSON(w, http.StatusCreated, insertedUser)
}

func (s *APIServer) handleUpdateUser(w http.ResponseWriter, r *http.Request) error {
	id, ok := r.Context().Value(middleware.UserIDKey).(int) // Get the user id from the JWT
	if !ok {
		err := errors.New("failed to get user id from JWT")
		return err
	}

	paramID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		return err
	}

	if paramID != id {
		err = errors.New("you can't update another user that is not you")
		return err
	}

	var user map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		return err
	}

	if len(user) == 0 {
		err = errors.New("no fields to update")
		return err
	}

	err = s.store.UpdateUser(user, id)
	if err != nil {
		return err
	}

	updatedUser, err := s.store.GetUserByID(id)
	if err != nil {
		return err
	}

	return WriteJSON(w, http.StatusOK, updatedUser)
}

func WriteJSON(w http.ResponseWriter, status int, v any) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	return json.NewEncoder(w).Encode(v)
}

type APIFunc func(http.ResponseWriter, *http.Request) error

type APIError struct {
	Error string
}

func makeHTTPHandleFunc(f APIFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := f(w, r); err != nil {
			WriteJSON(w, http.StatusBadRequest, APIError{Error: err.Error()})
		}
	}
}
