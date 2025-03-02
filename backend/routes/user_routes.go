package routes

import (
	"encoding/json"
	"fmt"
	"github.com/Marc-Garcia-Coronado/socialNetwork/middleware"
	"github.com/Marc-Garcia-Coronado/socialNetwork/models"
	"github.com/Marc-Garcia-Coronado/socialNetwork/utils"
	"github.com/go-chi/chi/v5"
	"net/http"
	"strconv"
)

func (s *APIServer) handleLogin(w http.ResponseWriter, r *http.Request) error {
	loginUserReq := new(models.LoginUserReq)
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

	return utils.WriteJSON(w, http.StatusOK, struct {
		User  *models.User `json:"user"`
		Token string       `json:"token"`
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

	user := new(models.User)
	user, err = s.store.GetUserByID(id)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, user)
}

func (s *APIServer) handleCreateUser(w http.ResponseWriter, r *http.Request) error {
	createUserReq := new(models.CreateUserReq)
	if err := json.NewDecoder(r.Body).Decode(createUserReq); err != nil {
		return err
	}

	user := models.NewUser(createUserReq.UserName, createUserReq.FullName, createUserReq.Email, createUserReq.Password)

	id, err := s.store.CreateUser(user)
	if err != nil {
		return err
	}

	insertedUser, err := s.store.GetUserByID(*id)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusCreated, insertedUser)
}

func (s *APIServer) handleUpdateUser(w http.ResponseWriter, r *http.Request) error {
	role, ok := r.Context().Value(middleware.UserRoleKey).(string)
	if !ok {
		return fmt.Errorf("failed to get user role from JWT")
	}
	id, ok := r.Context().Value(middleware.UserIDKey).(int) // Get the user id from the JWT
	if !ok {
		return fmt.Errorf("failed to get user id from JWT")
	}

	paramID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		return err
	}

	// Check if the user id is the same as the JWT which means is updating itself but if is an admin he can update
	if paramID != id && role != "admin" {
		return fmt.Errorf("you can't update another user that is not you")
	}

	var user map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		return err
	}

	if len(user) == 0 {
		return fmt.Errorf("no fields to update")
	}

	err = s.store.UpdateUser(user, id)
	if err != nil {
		return err
	}

	updatedUser, err := s.store.GetUserByID(id)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, updatedUser)
}

func (s *APIServer) handleDeleteUser(w http.ResponseWriter, r *http.Request) error {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		return err
	}

	err = s.store.DeleteUser(id)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusNoContent, nil)
}
