package main

import (
	"encoding/json"
	"fmt"
	"github.com/go-chi/chi/v5"
	"log"
	"net/http"
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
	router := chi.NewRouter()

	router.Get("/user", makeHTTPHandleFunc(s.handleGetUser))
	router.Get("/user/{id}", makeHTTPHandleFunc(s.handleGetUserByID))
	router.Post("/user", makeHTTPHandleFunc(s.handleCreateUser))

	log.Println("Server running on", s.listenAddress)
	if err := http.ListenAndServe(s.listenAddress, router); err != nil {
		log.Fatalf("Error starting API server: %v", err)
	}
}

func (s *APIServer) handleGetUser(w http.ResponseWriter, r *http.Request) error {
	user := NewUser("marc", "marc test", "marctest@test.com", "1234")
	return WriteJSON(w, http.StatusOK, user)
}

func (s *APIServer) handleGetUserByID(w http.ResponseWriter, r *http.Request) error {
	vars := chi.URLParam(r, "id")
	fmt.Println(vars)
	return WriteJSON(w, http.StatusOK, &User{})
}

func (s *APIServer) handleCreateUser(w http.ResponseWriter, r *http.Request) error {
	createUserReq := new(CreateUserReq)
	if err := json.NewDecoder(r.Body).Decode(createUserReq); err != nil {
		return err
	}

	user := NewUser(createUserReq.UserName, createUserReq.FullName, createUserReq.Email, createUserReq.Password)

	if err := s.store.CreateUser(user); err != nil {
		fmt.Println("Esta pasando algo")
		return err
	}

	return WriteJSON(w, http.StatusCreated, user)
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
