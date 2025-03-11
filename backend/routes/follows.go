package routes

import (
	"fmt"
	"github.com/Marc-Garcia-Coronado/socialNetwork/middleware"
	"github.com/Marc-Garcia-Coronado/socialNetwork/utils"
	"github.com/go-chi/chi/v5"
	"log"
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

	log.Println(followers)

	return utils.WriteJSON(w, http.StatusOK, followers)
}

func (s *APIServer) handleGetUserFollows(w http.ResponseWriter, r *http.Request) error {
	userToFollowID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		return err
	}

	follows, err := s.store.GetFollows(userToFollowID)
	if err != nil {
		return err
	}

	log.Println(follows)

	return utils.WriteJSON(w, http.StatusOK, follows)
}

func (s *APIServer) handleGetCountFollowers(w http.ResponseWriter, r *http.Request) error {
	userID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		return err
	}

	count, err := s.store.GetCountFollowers(userID)
	if err != nil {
		return err
	}
	return utils.WriteJSON(w, http.StatusOK, count)
}

func (s *APIServer) handleGetUserCountFollows(w http.ResponseWriter, r *http.Request) error {
	userID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		return err
	}

	count, err := s.store.GetCountFollows(userID)
	if err != nil {
		return err
	}
	return utils.WriteJSON(w, http.StatusOK, count)
}
