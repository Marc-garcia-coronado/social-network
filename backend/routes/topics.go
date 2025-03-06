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

func (s *APIServer) handleGetAllTopics(w http.ResponseWriter, r *http.Request) error {
	topics, err := s.store.GetTopics()
	if err != nil {
		return err
	}
	return utils.WriteJSON(w, http.StatusOK, topics)
}

func (s *APIServer) handleGetTopicByID(w http.ResponseWriter, r *http.Request) error {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		return err
	}

	topic, err := s.store.GetTopicByID(id)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, topic)
}

func (s *APIServer) handleCreateTopic(w http.ResponseWriter, r *http.Request) error {
	topicReq := new(models.TopicReq)
	if err := json.NewDecoder(r.Body).Decode(&topicReq); err != nil {
		return err
	}

	topic := models.NewTopic(topicReq.Name, topicReq.Description)

	newTopic, err := s.store.CreateTopic(topic)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusCreated, newTopic)
}

func (s *APIServer) handleUpdateTopic(w http.ResponseWriter, r *http.Request) error {
	paramID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		return err
	}

	var topic map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&topic); err != nil {
		return err
	}

	if len(topic) == 0 {
		return fmt.Errorf("no fields to update")
	}

	updatedTopic, err := s.store.UpdateTopic(topic, paramID)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, updatedTopic)
}

func (s *APIServer) handleDeleteTopic(w http.ResponseWriter, r *http.Request) error {
	paramID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		return err
	}

	err = s.store.DeleteTopic(paramID)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusNoContent, nil)
}

func (s *APIServer) handleGetUserTopics(w http.ResponseWriter, r *http.Request) error {
	userID, err := strconv.Atoi(chi.URLParam(r, "userID"))
	if err != nil {
		return err
	}

	topics, err := s.store.GetUserTopics(userID)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, topics)
}

func (s *APIServer) handleFollowTopics(w http.ResponseWriter, r *http.Request) error {
	topicsToFollowReq := new(models.FollowTopicsReq)
	if err := json.NewDecoder(r.Body).Decode(&topicsToFollowReq); err != nil {
		return err
	}

	if len(topicsToFollowReq.Topics) == 0 {
		return fmt.Errorf("no topics provided")
	}

	id, ok := r.Context().Value(middleware.UserIDKey).(int) // Get the user id from the JWT
	if !ok {
		return fmt.Errorf("failed to get user id from JWT")
	}

	err := s.store.FollowTopics(topicsToFollowReq.Topics, id)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusCreated, nil)
}

func (s *APIServer) handleUnfollowTopics(w http.ResponseWriter, r *http.Request) error {
	topicsToUnfollow := new(models.FollowTopicsReq)
	if err := json.NewDecoder(r.Body).Decode(&topicsToUnfollow); err != nil {
		return err
	}

	if len(topicsToUnfollow.Topics) == 0 {
		return fmt.Errorf("no topics provided")
	}

	id, ok := r.Context().Value(middleware.UserIDKey).(int) // Get the user id from the JWT
	if !ok {
		return fmt.Errorf("failed to get user id from JWT")
	}

	err := s.store.UnfollowTopics(topicsToUnfollow.Topics, id)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusNoContent, nil)
}
