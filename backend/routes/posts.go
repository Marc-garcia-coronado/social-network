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

func (s *APIServer) handleCreatePost(w http.ResponseWriter, r *http.Request) error {
	id, ok := r.Context().Value(middleware.UserIDKey).(int) // Get the user id from the JWT
	if !ok {
		return fmt.Errorf("failed to get user id from JWT")
	}

	postReqBody := new(models.PostReq)
	if err := json.NewDecoder(r.Body).Decode(&postReqBody); err != nil {
		return err
	}
	postReqBody.UserID = id

	post, err := s.store.CreatePost(postReqBody)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusCreated, post)
}

func (s *APIServer) handleGetUserPosts(w http.ResponseWriter, r *http.Request) error {
	paramID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		return err
	}

	posts, err := s.store.GetUserPosts(paramID)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, posts)
}

func (s *APIServer) handleDeletePost(w http.ResponseWriter, r *http.Request) error {
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

	postID, err := strconv.Atoi(chi.URLParam(r, "postID"))
	if err != nil {
		return err
	}

	if userID != id && role != "admin" {
		return utils.WriteJSON(w, http.StatusForbidden, &utils.APIError{Error: "you cannot delete a post that is not yours"})
	}

	err = s.store.DeletePost(postID)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusNoContent, nil)
}

func (s *APIServer) handleUpdatePost(w http.ResponseWriter, r *http.Request) error {
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

	postID, err := strconv.Atoi(chi.URLParam(r, "postID"))
	if err != nil {
		return err
	}

	if userID != id && role != "admin" {
		return utils.WriteJSON(w, http.StatusForbidden, &utils.APIError{Error: "you cannot update a post that is not yours"})
	}

	var post map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
		return err
	}

	if len(post) == 0 {
		return fmt.Errorf("no fields to update")
	}

	_, exists := post["created_at"]
	if role != "admin" && exists {
		return fmt.Errorf("you cannot change the created_at field")
	}

	updatedPost, err := s.store.UpdatePost(post, postID)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, updatedPost)
}
