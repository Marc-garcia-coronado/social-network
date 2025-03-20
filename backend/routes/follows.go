package routes

import (
	"fmt"
	"github.com/Marc-Garcia-Coronado/socialNetwork/middleware"
	"github.com/Marc-Garcia-Coronado/socialNetwork/models"
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

	// Get pagination query params
	limitStr := r.URL.Query().Get("limit")
	pageStr := r.URL.Query().Get("page")

	// Set default values if params are missing
	limit := 10 // Default limit
	page := 1   // Default page

	if limitStr != "" {
		limit, err = strconv.Atoi(limitStr)
		if err != nil || limit <= 0 {
			return utils.WriteJSON(w, http.StatusBadRequest, utils.APIError{Error: "Invalid limit"})
		}
	}

	if pageStr != "" {
		page, err = strconv.Atoi(pageStr)
		if err != nil || page <= 0 {
			return utils.WriteJSON(w, http.StatusBadRequest, utils.APIError{Error: "Invalid page"})
		}
	}

	// Calculate offset
	offset := (page - 1) * limit

	followers, count, err := s.store.GetFollowers(userToFollowID, limit, offset)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, models.UserWithPagination{
		Users: followers,
		Pagination: models.Pagination{
			Page:       page,
			Limit:      limit,
			TotalCount: count,
		},
	})
}

func (s *APIServer) handleGetUserFollows(w http.ResponseWriter, r *http.Request) error {
	userToFollowID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		return err
	}

	// Get pagination query params
	limitStr := r.URL.Query().Get("limit")
	pageStr := r.URL.Query().Get("page")

	// Set default values if params are missing
	limit := 10 // Default limit
	page := 1   // Default page

	if limitStr != "" {
		limit, err = strconv.Atoi(limitStr)
		if err != nil || limit <= 0 {
			return utils.WriteJSON(w, http.StatusBadRequest, utils.APIError{Error: "Invalid limit"})
		}
	}

	if pageStr != "" {
		page, err = strconv.Atoi(pageStr)
		if err != nil || page <= 0 {
			return utils.WriteJSON(w, http.StatusBadRequest, utils.APIError{Error: "Invalid page"})
		}
	}

	// Calculate offset
	offset := (page - 1) * limit

	follows, count, err := s.store.GetFollows(userToFollowID, limit, offset)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, models.UserWithPagination{
		Users: follows,
		Pagination: models.Pagination{
			Page:       page,
			Limit:      limit,
			TotalCount: count,
		},
	})
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
	return utils.WriteJSON(w, http.StatusOK, map[string]int{"followers_count": *count})
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
	return utils.WriteJSON(w, http.StatusOK, map[string]int{"follows_count": *count})
}
