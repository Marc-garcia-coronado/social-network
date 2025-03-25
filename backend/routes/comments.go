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

func (s *APIServer) handleGetPostComments(w http.ResponseWriter, r *http.Request) error {
	postID, err := strconv.Atoi(chi.URLParam(r, "postID"))
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

	comments, count, err := s.store.GetPostComments(postID, limit, offset)
	if err != nil {
		return utils.WriteJSON(w, http.StatusInternalServerError, fmt.Sprintf("could not get the comments: %s", err))
	}

	return utils.WriteJSON(w, http.StatusOK, models.CommentsWithCountRes{
		Comments: comments,
		Pagination: models.Pagination{
			TotalCount: count,
			Limit:      limit,
			Page:       page,
		},
	})
}

func (s *APIServer) handleCreatePostComment(w http.ResponseWriter, r *http.Request) error {
	id, ok := r.Context().Value(middleware.UserIDKey).(int) // Get the user id from the JWT
	if !ok {
		return fmt.Errorf("failed to get user id from JWT")
	}

	postID, err := strconv.Atoi(chi.URLParam(r, "postID"))
	if err != nil {
		return err
	}

	commentReq := new(models.CommentReq)
	if err := json.NewDecoder(r.Body).Decode(&commentReq); err != nil {
		return err
	}

	commentReq.UserID = id
	commentReq.PostID = postID

	comment, err := s.store.CreateComment(commentReq)
	if err != nil {
		return utils.WriteJSON(w, http.StatusInternalServerError, utils.APIError{Error: fmt.Sprintf("could not commment the post: %s", err)})
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]any{
		"comment": comment,
	})
}

func (s *APIServer) handleDeletePostComment(w http.ResponseWriter, r *http.Request) error {
	role, ok := r.Context().Value(middleware.UserRoleKey).(string)
	if !ok {
		return fmt.Errorf("failed to get user role from JWT")
	}
	id, ok := r.Context().Value(middleware.UserIDKey).(int) // Get the user id from the JWT
	if !ok {
		return fmt.Errorf("failed to get user id from JWT")
	}

	commentID, err := strconv.Atoi(chi.URLParam(r, "commentID"))
	if err != nil {
		return err
	}

	if !s.store.GetIfUserOwnsComment(commentID, id) && role != "admin" {
		return utils.WriteJSON(w, http.StatusForbidden, &utils.APIError{Error: "you cannot delete a comment that is not yours"})
	}

	if err := s.store.DeleteComment(commentID); err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusNoContent, nil)
}

func (s *APIServer) handleGetPostCommentsCount(w http.ResponseWriter, r *http.Request) error {
	postID, err := strconv.Atoi(chi.URLParam(r, "postID"))
	if err != nil {
		return err
	}

	count, err := s.store.GetPostCommentsCount(postID)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]any{
		"post_comments_count": *count,
	})
}
