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

func (s *APIServer) handleLikePost(w http.ResponseWriter, r *http.Request) error {
	userID, ok := r.Context().Value(middleware.UserIDKey).(int) // Get the user id from the JWT
	if !ok {
		return fmt.Errorf("failed to get user id from JWT")
	}

	postID, err := strconv.Atoi(chi.URLParam(r, "postID"))
	if err != nil {
		return fmt.Errorf("could not get the post id from the url: %s", err)
	}

	err = s.store.LikePost(userID, postID)
	if err != nil {
		return utils.WriteJSON(w, http.StatusInternalServerError, utils.APIError{Error: fmt.Sprintf("could not like the post: %s", err)})
	}

	return utils.WriteJSON(w, http.StatusNoContent, nil)
}

func (s *APIServer) handleLikeComment(w http.ResponseWriter, r *http.Request) error {
	userID, ok := r.Context().Value(middleware.UserIDKey).(int) // Get the user id from the JWT
	if !ok {
		return fmt.Errorf("failed to get user id from JWT")
	}

	commentID, err := strconv.Atoi(chi.URLParam(r, "commentID"))
	if err != nil {
		return fmt.Errorf("could not get the post id from the url: %s", err)
	}

	err = s.store.LikeComment(userID, commentID)
	if err != nil {
		return utils.WriteJSON(w, http.StatusInternalServerError, utils.APIError{Error: fmt.Sprintf("could not like the comment: %s", err)})
	}

	return utils.WriteJSON(w, http.StatusNoContent, nil)
}

func (s *APIServer) handleDislikePost(w http.ResponseWriter, r *http.Request) error {
	userID, ok := r.Context().Value(middleware.UserIDKey).(int) // Get the user id from the JWT
	if !ok {
		return fmt.Errorf("failed to get user id from JWT")
	}

	postID, err := strconv.Atoi(chi.URLParam(r, "postID"))
	if err != nil {
		return fmt.Errorf("could not get the post id from the url: %s", err)
	}

	err = s.store.DislikePost(userID, postID)
	if err != nil {
		return utils.WriteJSON(w, http.StatusInternalServerError, utils.APIError{Error: fmt.Sprintf("could not dislike the post: %s", err)})
	}

	return utils.WriteJSON(w, http.StatusNoContent, nil)
}

func (s *APIServer) handleDislikeComment(w http.ResponseWriter, r *http.Request) error {
	userID, ok := r.Context().Value(middleware.UserIDKey).(int) // Get the user id from the JWT
	if !ok {
		return fmt.Errorf("failed to get user id from JWT")
	}

	commentID, err := strconv.Atoi(chi.URLParam(r, "commentID"))
	if err != nil {
		return fmt.Errorf("could not get the post id from the url: %s", err)
	}

	err = s.store.DislikeComment(userID, commentID)
	if err != nil {
		return utils.WriteJSON(w, http.StatusInternalServerError, utils.APIError{Error: fmt.Sprintf("could not dislike the comment: %s", err)})
	}

	return utils.WriteJSON(w, http.StatusNoContent, nil)
}

func (s *APIServer) handleGetPostLikes(w http.ResponseWriter, r *http.Request) error {
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

	likes, count, err := s.store.GetPostLikes(postID, limit, offset)
	if err != nil {
		return utils.WriteJSON(w, http.StatusInternalServerError, utils.APIError{Error: fmt.Sprintf("could not get the likes from the post: %s", err)})
	}

	return utils.WriteJSON(w, http.StatusOK, models.LikesWithPagination[models.LikePost]{
		Likes: likes,
		Pagination: models.Pagination{
			TotalCount: count,
			Limit:      limit,
			Page:       page,
		},
	})
}

func (s *APIServer) handleGetCommentLikes(w http.ResponseWriter, r *http.Request) error {
	commentID, err := strconv.Atoi(chi.URLParam(r, "commentID"))
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

	likes, count, err := s.store.GetCommentLikes(commentID, limit, offset)
	if err != nil {
		return utils.WriteJSON(w, http.StatusInternalServerError, utils.APIError{Error: fmt.Sprintf("could not get the likes from the comment: %s", err)})
	}

	return utils.WriteJSON(w, http.StatusOK, models.LikesWithPagination[models.LikeComment]{
		Likes: likes,
		Pagination: models.Pagination{
			TotalCount: count,
			Limit:      limit,
			Page:       page,
		},
	})
}

func (s *APIServer) handleGetPostLikesCount(w http.ResponseWriter, r *http.Request) error {

	postID, err := strconv.Atoi(chi.URLParam(r, "postID"))
	if err != nil {
		return err
	}

	count, err := s.store.GetPostLikesCount(postID)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]any{
		"post_likes_count": count,
	})
}

func (s *APIServer) handleGetCommentLikesCount(w http.ResponseWriter, r *http.Request) error {

	commentID, err := strconv.Atoi(chi.URLParam(r, "commentID"))
	if err != nil {
		return err
	}

	count, err := s.store.GetCommentLikesCount(commentID)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]any{
		"comment_likes_count": count,
	})
}
func (s *APIServer) handleGetUserPostsLikes(w http.ResponseWriter, r *http.Request) error {
    userID, ok := r.Context().Value(middleware.UserIDKey).(int)
    if !ok {
        return fmt.Errorf("failed to get user id from JWT")
    }

    likes, err := s.store.GetUserPostLikes(userID)
    if err != nil {
        return utils.WriteJSON(w, http.StatusInternalServerError, utils.APIError{Error: fmt.Sprintf("could not fetch user likes: %s", err)})
    }

    return utils.WriteJSON(w, http.StatusOK, likes)
}
func (s *APIServer) handleGetUserCommentLikes(w http.ResponseWriter, r *http.Request) error {
    userID, ok := r.Context().Value(middleware.UserIDKey).(int)
    if !ok {
        return fmt.Errorf("failed to get user id from JWT")
    }

    likes, err := s.store.GetUserCommentLikes(userID)
    if err != nil {
        return utils.WriteJSON(w, http.StatusInternalServerError, utils.APIError{Error: fmt.Sprintf("could not fetch user comment likes: %s", err)})
    }

    return utils.WriteJSON(w, http.StatusOK, likes)
}