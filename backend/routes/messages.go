package routes

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/Marc-Garcia-Coronado/socialNetwork/middleware"
	"github.com/Marc-Garcia-Coronado/socialNetwork/utils"
	"github.com/go-chi/chi/v5"
)

func (s *APIServer) handleGetConversations(w http.ResponseWriter, r *http.Request) error {
	userID, ok := r.Context().Value(middleware.UserIDKey).(int) // Get the user id from the JWT
	if !ok {
		return fmt.Errorf("failed to get user id from JWT")
	}

	conversations, err := s.store.GetUserConversations(userID)
	if err != nil {
		return utils.WriteJSON(w, http.StatusInternalServerError, utils.APIError{Error: fmt.Sprintf("could not get the user conversations: %s", err)})
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]any{
		"conversations": conversations,
	})
}

func (s *APIServer) handleGetConversationMessages(w http.ResponseWriter, r *http.Request) error {
	toUserID, err := strconv.Atoi(chi.URLParam(r, "userID"))
	if err != nil {
		return err
	}

	userID, ok := r.Context().Value(middleware.UserIDKey).(int) // Get the user id from the JWT
	if !ok {
		return fmt.Errorf("failed to get user id from JWT")
	}
	messages, err := s.store.GetConversationMessages(userID, toUserID)
	if err != nil {
		return utils.WriteJSON(w, http.StatusInternalServerError, utils.APIError{Error: fmt.Sprintf("could not get the user messages: %s", err)})
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]any{
		"messages": messages,
	})
}

func (s *APIServer) handleReadConversation(w http.ResponseWriter, r *http.Request) error {
	toUserID, err := strconv.Atoi(chi.URLParam(r, "userID"))
	if err != nil {
		return err
	}

	userID, ok := r.Context().Value(middleware.UserIDKey).(int) // Get the user id from the JWT
	if !ok {
		return fmt.Errorf("failed to get user id from JWT")
	}

	err = s.store.ReadConversationMessages(userID, toUserID)
	if err != nil {
		return utils.WriteJSON(w, http.StatusInternalServerError, utils.APIError{Error: fmt.Sprintf("could not read messages: %s", err)})
	}

	return utils.WriteJSON(w, http.StatusNoContent, nil)
}

func (s *APIServer) handleGetNotReadedConversationMessages(w http.ResponseWriter, r *http.Request) error {
	toUserID, err := strconv.Atoi(chi.URLParam(r, "userID"))
	if err != nil {
		return err
	}

	userID, ok := r.Context().Value(middleware.UserIDKey).(int) // Get the user id from the JWT
	if !ok {
		return fmt.Errorf("failed to get user id from JWT")
	}

	numberMsg, err := s.store.GetNotReadedConversationMessages(userID, toUserID)
	if err != nil {
		return utils.WriteJSON(w, http.StatusInternalServerError, utils.APIError{Error: fmt.Sprintf("could not get not readed messages: %s", err)})
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]int{
		"number": numberMsg,
	})
}
