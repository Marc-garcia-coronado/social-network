package routes

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/Marc-Garcia-Coronado/socialNetwork/middleware"
	"github.com/Marc-Garcia-Coronado/socialNetwork/models"
	"github.com/Marc-Garcia-Coronado/socialNetwork/utils"
	"github.com/go-chi/chi/v5"
)

func (s *APIServer) handleCreateEvent(w http.ResponseWriter, r *http.Request) error {
	userID, ok := r.Context().Value(middleware.UserIDKey).(int) // Get the user id from the JWT
	if !ok {
		return utils.WriteJSON(w, http.StatusInternalServerError, &utils.APIError{Error: "failed to get user id from JWT"})
	}

	eventBodyReq := new(models.EventReq)
	if err := json.NewDecoder(r.Body).Decode(&eventBodyReq); err != nil {
		return err
	}
	eventBodyReq.CreatorID = userID

	newEvent, err := s.store.CreateEvent(eventBodyReq)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusCreated, map[string]any{
		"event": newEvent,
	})
}

func (s *APIServer) handleGetAllEvents(w http.ResponseWriter, r *http.Request) error {

	err := fmt.Errorf("")

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

	query := r.URL.Query().Get("q")
	topicID := r.URL.Query().Get("topic")

	events, count, err := s.store.GetAllEvents(limit, offset, query, topicID)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, models.EventWithCountRes[models.EventWithUser]{
		Events: events,
		Pagination: models.Pagination{
			Page:       page,
			TotalCount: count,
			Limit:      limit,
		},
	})
}

func (s *APIServer) handleGetClosestEvents(w http.ResponseWriter, r *http.Request) error {
	events, err := s.store.GetClosestEvents()
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]any{
		"events": events,
	})
}

func (s *APIServer) handleGetAllEventsByTopic(w http.ResponseWriter, r *http.Request) error {
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

	events, count, err := s.store.GetAllEventsByTopic(topicID, limit, offset)
	if err != nil {
		personalizedError := fmt.Sprintf("could not get the user events: %s", err)
		return utils.WriteJSON(w, http.StatusInternalServerError, utils.APIError{Error: personalizedError})
	}
	return utils.WriteJSON(w, http.StatusOK, models.EventWithCountRes[models.EventWithUser]{
		Events: events,
		Pagination: models.Pagination{
			Page:       page,
			TotalCount: count,
			Limit:      limit,
		},
	})
}

func (s *APIServer) handleGetUserEvents(w http.ResponseWriter, r *http.Request) error {
	userID, err := strconv.Atoi(chi.URLParam(r, "userID"))
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

	events, count, err := s.store.GetUserEvents(userID, limit, offset)
	if err != nil {
		personalizedError := fmt.Sprintf("could not get the user events: %s", err)
		return utils.WriteJSON(w, http.StatusInternalServerError, utils.APIError{Error: personalizedError})
	}
	return utils.WriteJSON(w, http.StatusOK, models.EventWithCountRes[models.EventWithUser]{
		Events: events,
		Pagination: models.Pagination{
			Page:       page,
			TotalCount: count,
			Limit:      limit,
		},
	})
}

func (s *APIServer) handleGetAllEventsCount(w http.ResponseWriter, r *http.Request) error {
	count, err := s.store.GetAllEventsCount()
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusAccepted, map[string]any{
		"events_count": *count,
	})
}

func (s *APIServer) handleGetAllEventsByTopicCount(w http.ResponseWriter, r *http.Request) error {
	topicID, err := strconv.Atoi(chi.URLParam(r, "topicID"))
	if err != nil {
		return err
	}

	count, err := s.store.GetAllEventsByTopicCount(topicID)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]any{
		"topic_events_count": *count,
	})
}

func (s *APIServer) handleGetUserEventsCount(w http.ResponseWriter, r *http.Request) error {
	userID, err := strconv.Atoi(chi.URLParam(r, "userID"))
	if err != nil {
		return err
	}

	count, err := s.store.GetUserEventsCount(userID)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]any{
		"user_events_count": *count,
	})
}

func (s *APIServer) handleUpdateUserEvent(w http.ResponseWriter, r *http.Request) error {
	role, ok := r.Context().Value(middleware.UserRoleKey).(string)
	if !ok {
		return fmt.Errorf("failed to get user role from JWT")
	}
	id, ok := r.Context().Value(middleware.UserIDKey).(int) // Get the user id from the JWT
	if !ok {
		return fmt.Errorf("failed to get user id from JWT")
	}

	userID, err := strconv.Atoi(chi.URLParam(r, "userID"))
	if err != nil {
		return err
	}

	eventID, err := strconv.Atoi(chi.URLParam(r, "eventID"))
	if err != nil {
		return err
	}

	if userID != id && role != "admin" {
		return utils.WriteJSON(w, http.StatusForbidden, &utils.APIError{Error: "you cannot update an event that is not yours"})
	}

	var event map[string]any
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		return err
	}

	if len(event) == 0 {
		return fmt.Errorf("no fields to update")
	}

	_, exists := event["created_at"]
	if role != "admin" && exists {
		return fmt.Errorf("you cannot change the created_at field")
	}

	updatedPost, err := s.store.UpdateEvent(event, eventID)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]any{
		"event": updatedPost,
	})
}

func (s *APIServer) handleDeleteUserEvent(w http.ResponseWriter, r *http.Request) error {
	role, ok := r.Context().Value(middleware.UserRoleKey).(string)
	if !ok {
		return fmt.Errorf("failed to get user role from JWT")
	}
	id, ok := r.Context().Value(middleware.UserIDKey).(int) // Get the user id from the JWT
	if !ok {
		return fmt.Errorf("failed to get user id from JWT")
	}

	userID, err := strconv.Atoi(chi.URLParam(r, "userID"))
	if err != nil {
		return err
	}

	eventID, err := strconv.Atoi(chi.URLParam(r, "eventID"))
	if err != nil {
		return err
	}

	if userID != id && role != "admin" {
		return utils.WriteJSON(w, http.StatusForbidden, &utils.APIError{Error: "you cannot delete an event that is not yours"})
	}

	if err := s.store.DeleteEvent(eventID); err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusNoContent, nil)
}

// Subscribe methods

func (s *APIServer) handleSubscribeToEvent(w http.ResponseWriter, r *http.Request) error {
	role, ok := r.Context().Value(middleware.UserRoleKey).(string)
	if !ok {
		return fmt.Errorf("failed to get user role from JWT")
	}
	id, ok := r.Context().Value(middleware.UserIDKey).(int) // Get the user id from the JWT
	if !ok {
		return fmt.Errorf("failed to get user id from JWT")
	}

	userID, err := strconv.Atoi(chi.URLParam(r, "userID"))
	if err != nil {
		return err
	}

	eventID, err := strconv.Atoi(chi.URLParam(r, "eventID"))
	if err != nil {
		return err
	}

	if userID != id && role != "admin" {
		return utils.WriteJSON(w, http.StatusForbidden, &utils.APIError{Error: "you cannot subscribe to an event as another user"})
	}

	if err := s.store.SubscribeEvent(eventID, userID); err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusCreated, models.SubscriptionRes{
		Message: "successfully subscribed",
	})
}

func (s *APIServer) handleUnsubscribeToEvent(w http.ResponseWriter, r *http.Request) error {
	role, ok := r.Context().Value(middleware.UserRoleKey).(string)
	if !ok {
		return fmt.Errorf("failed to get user role from JWT")
	}
	id, ok := r.Context().Value(middleware.UserIDKey).(int) // Get the user id from the JWT
	if !ok {
		return fmt.Errorf("failed to get user id from JWT")
	}

	userID, err := strconv.Atoi(chi.URLParam(r, "userID"))
	if err != nil {
		return err
	}

	eventID, err := strconv.Atoi(chi.URLParam(r, "eventID"))
	if err != nil {
		return err
	}

	if userID != id && role != "admin" {
		return utils.WriteJSON(w, http.StatusForbidden, &utils.APIError{Error: "you cannot unsubscribe to an event as another user"})
	}

	if err := s.store.UnsubscribeEvent(eventID, userID); err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, models.SubscriptionRes{
		Message: "successfully unsubscribed",
	})
}

func (s *APIServer) handleGetUserSubscribedEvents(w http.ResponseWriter, r *http.Request) error {
	userID, err := strconv.Atoi(chi.URLParam(r, "userID"))
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

	events, count, err := s.store.GetUserSubscribedEvents(userID, limit, offset)
	if err != nil {
		personalizedError := fmt.Sprintf("could not get the user events: %s", err)
		return utils.WriteJSON(w, http.StatusInternalServerError, utils.APIError{Error: personalizedError})
	}
	return utils.WriteJSON(w, http.StatusOK, models.EventWithCountRes[models.SubscribedEvent]{
		Events: events,
		Pagination: models.Pagination{
			Page:       page,
			TotalCount: count,
			Limit:      limit,
		},
	})
}

func (s *APIServer) handleGetUserSubscribedEventsCount(w http.ResponseWriter, r *http.Request) error {
	userID, err := strconv.Atoi(chi.URLParam(r, "userID"))
	if err != nil {
		return err
	}

	count, err := s.store.GetUserSubscribedEventsCount(userID)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]any{
		"user_subscribed_events_count": *count,
	})
}
