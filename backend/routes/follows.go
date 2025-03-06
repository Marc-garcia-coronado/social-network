package routes

import (
	"fmt"
	"github.com/Marc-Garcia-Coronado/socialNetwork/middleware"
	"github.com/Marc-Garcia-Coronado/socialNetwork/utils"
	"github.com/go-chi/chi/v5"
	"net/http"
	"strconv"
)

func (s *APIServer) handleFollowUser(w http.ResponseWriter, r *http.Request) error {
	userToFollowID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		return err
	}

	id, ok := r.Context().Value(middleware.UserIDKey).(int) // Get the user id from the JWT
	if !ok {
		return fmt.Errorf("failed to get user id from JWT")
	}

	err = s.store.FollowUser(userToFollowID, id)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusCreated, nil)
}

func (s *APIServer) handleUnfollowUser(w http.ResponseWriter, r *http.Request) error {
	userToFollowID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		return err
	}

	id, ok := r.Context().Value(middleware.UserIDKey).(int) // Get the user id from the JWT
	if !ok {
		return fmt.Errorf("failed to get user id from JWT")
	}

	err = s.store.UnfollowUser(userToFollowID, id)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusNoContent, nil)
}

func (s *APIServer) handleGetFollowers(w http.ResponseWriter, r *http.Request) error {
	userToFollowID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		return err
	}

	followers, err := s.store.GetFollowers(userToFollowID)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, followers)
}
