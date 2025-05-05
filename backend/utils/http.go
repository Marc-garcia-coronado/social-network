package utils

import (
	"net/http"
)

type APIFunc func(http.ResponseWriter, *http.Request) error

type APIError struct {
	Error string `json:"error"`
}

func MakeHTTPHandleFunc(f APIFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := f(w, r); err != nil {
			WriteJSON(w, http.StatusBadRequest, APIError{Error: err.Error()})
		}
	}
}
