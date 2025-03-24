package routes

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/Marc-Garcia-Coronado/socialNetwork/middleware"
	"github.com/Marc-Garcia-Coronado/socialNetwork/models"
	"github.com/Marc-Garcia-Coronado/socialNetwork/utils"
	"github.com/go-chi/chi/v5"
)

func (s *APIServer) handleGetUserFeed(w http.ResponseWriter, r *http.Request) error {

	var err error

	userID, ok := r.Context().Value(middleware.UserIDKey).(int) // Get the user id from the JWT
	if !ok {
		return fmt.Errorf("failed to get user id from JWT")
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
			return utils.WriteJSON(w, http.StatusBadRequest, utils.APIError{Error: "invalid limit"})
		}
	}

	if pageStr != "" {
		page, err = strconv.Atoi(pageStr)
		if err != nil || page <= 0 {
			return utils.WriteJSON(w, http.StatusBadRequest, utils.APIError{Error: "invalid page"})
		}
	}

	// Calculate offset
	offset := (page - 1) * limit

	posts, count, err := s.store.GetUserFeed(userID, limit, offset)
	if err != nil {
		return utils.WriteJSON(w, http.StatusInternalServerError, utils.APIError{Error: fmt.Sprintf("could not get the user feed: %s", err)})
	}

	return utils.WriteJSON(w, http.StatusOK, models.PostsWithPagination{
		Posts: posts,
		Pagination: models.Pagination{
			TotalCount: count,
			Page:       page,
			Limit:      limit,
		},
	})
}

func (s *APIServer) handleGetUserFeedByTopic(w http.ResponseWriter, r *http.Request) error {

	userID, ok := r.Context().Value(middleware.UserIDKey).(int) // Get the user id from the JWT
	if !ok {
		return fmt.Errorf("failed to get user id from JWT")
	}

	topicID, err := strconv.Atoi(chi.URLParam(r, "topicID"))
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
			return utils.WriteJSON(w, http.StatusBadRequest, utils.APIError{Error: "invalid limit"})
		}
	}

	if pageStr != "" {
		page, err = strconv.Atoi(pageStr)
		if err != nil || page <= 0 {
			return utils.WriteJSON(w, http.StatusBadRequest, utils.APIError{Error: "invalid page"})
		}
	}

	// Calculate offset
	offset := (page - 1) * limit

	posts, count, err := s.store.GetUserFeedByTopic(userID, topicID, limit, offset)
	if err != nil {
		return utils.WriteJSON(w, http.StatusInternalServerError, utils.APIError{Error: fmt.Sprintf("could not get the user feed by topic: %s", err)})
	}
	
	return utils.WriteJSON(w, http.StatusOK, models.PostsWithPagination{
		Posts: posts,
		Pagination: models.Pagination{
			TotalCount: count,
			Page:       page,
			Limit:      limit,
		},
	})
}
