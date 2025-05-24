package routes

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
	"strconv"

	"github.com/Marc-Garcia-Coronado/socialNetwork/middleware"
	"github.com/Marc-Garcia-Coronado/socialNetwork/models"
	"github.com/Marc-Garcia-Coronado/socialNetwork/utils"
	"github.com/go-chi/chi/v5"
)

func (s *APIServer) handleLogin(w http.ResponseWriter, r *http.Request) error {
	loginUserReq := new(models.LoginUserReq)
	if err := json.NewDecoder(r.Body).Decode(&loginUserReq); err != nil {
		return err
	}

	loggedUser, err := s.store.Login(loginUserReq.Email, loginUserReq.Password)
	if err != nil {
		return err
	}

	token, err := utils.GenerateJWT(loggedUser.ID, loggedUser.Role)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return err
	}

	// Set cookie with environment-aware security settings
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    token,
		HttpOnly: true,
		Secure:   true, // Secure only if request is HTTPS
		SameSite: http.SameSiteNoneMode,
		Path:     "/",
	})

	return utils.WriteJSON(w, http.StatusOK, map[string]any{
		"user": loggedUser,
	})
}
func (s *APIServer) handleLogout(w http.ResponseWriter, r *http.Request) error {
    http.SetCookie(w, &http.Cookie{
        Name:     "token",
        Value:    "",
        Path:     "/",
        Expires:  time.Unix(0, 0), // Expira en el pasado
        MaxAge:   -1,
        HttpOnly: true,
        Secure:   false, // true si usas HTTPS en producción
        SameSite: http.SameSiteLaxMode,
    })
    w.WriteHeader(http.StatusOK)
    w.Header().Set("Content-Type", "application/json")
    w.Write([]byte(`{"message":"Logout successful"}`))
    return nil
}

func (s *APIServer) handleAuth(w http.ResponseWriter, r *http.Request) error {
	id, ok := r.Context().Value(middleware.UserIDKey).(int) // Get the user id from the JWT
	if !ok {
		return fmt.Errorf("failed to get user id from JWT")
	}

	user, err := s.store.GetUserByID(id)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]any{
		"user": user,
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

func (s *APIServer) handleGetUserByUserName(w http.ResponseWriter, r *http.Request) error {
    user_name := chi.URLParam(r, "user_name")

    user := new(models.User)
    user, err := s.store.GetUserByUserName(user_name)
    if err != nil {
        return err
    }

    return utils.WriteJSON(w, http.StatusOK, user)
}
func (s *APIServer) handleSearchUsers(w http.ResponseWriter, r *http.Request) error {
    query := r.URL.Query().Get("query")
    limitStr := r.URL.Query().Get("limit")

    if query == "" {
        http.Error(w, "Query parameter is required", http.StatusBadRequest)
        return nil
    }

    limit, err := strconv.Atoi(limitStr)
    if err != nil || limit <= 0 {
        limit = 10 // Default limit
    }

    users, err := s.store.SearchUsers(query, limit)
    if err != nil {
        return err
    }

    return utils.WriteJSON(w, http.StatusOK, map[string]any{
        "users": users,
    })
}

func (s *APIServer) handleCreateUser(w http.ResponseWriter, r *http.Request) error {
	createUserReq := new(models.CreateUserReq)
	if err := json.NewDecoder(r.Body).Decode(createUserReq); err != nil {
		return err
	}

	user := models.NewUser(createUserReq.UserName, createUserReq.FullName, createUserReq.Email, createUserReq.Password, createUserReq.Bio, createUserReq.ProfilePicture)

	newUser, err := s.store.CreateUser(user)
	if err != nil {
		return err
	}

	token, err := utils.GenerateJWT(newUser.ID, newUser.Role)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return err
	}

	return utils.WriteJSON(w, http.StatusCreated, map[string]any{
		"created_user": newUser,
		"token": token,
	})
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
		return utils.WriteJSON(w, http.StatusForbidden, &utils.APIError{Error: "you cannot update a post that is not yours"})
	}

	var user map[string]any
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		return err
	}

	if len(user) == 0 {
		return fmt.Errorf("no fields to update")
	}

	_, exists := user["role"]
	if role != "admin" && exists {
		return fmt.Errorf("you cannot change the role field")
	}

	updatedUser, err := s.store.UpdateUser(user, id)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, updatedUser)
}

func (s *APIServer) handleDeleteUser(w http.ResponseWriter, r *http.Request) error {
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

	err = s.store.DeleteUser(paramID)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusNoContent, nil)
}
