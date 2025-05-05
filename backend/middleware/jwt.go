package middleware

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// Context keys for storing user ID and role
type ContextKey string

const (
	UserIDKey   ContextKey = "userID"
	UserRoleKey ContextKey = "userRole"
)

// JWTMiddleware validates the JWT token and extracts user info
func JWTMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var tokenString string

		// Try to get token from Authorization header
		authHeader := r.Header.Get("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
		} else {
			// Try to get token from cookie
			cookie, err := r.Cookie("token")
			if err == nil {
				tokenString = cookie.Value
			}
		}

		// If no token is found, return Unauthorized
		if tokenString == "" {
			http.Error(w, "Missing token", http.StatusUnauthorized)
			return
		}

		// Validate the JWT
		secret := os.Getenv("JWT_SECRET")
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// Extract claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			http.Error(w, "Invalid token claims", http.StatusUnauthorized)
			return
		}

		userIDFloat, ok := claims["sub"].(float64)
		if !ok {
			http.Error(w, "Invalid user ID in token", http.StatusUnauthorized)
			return
		}
		userID := int(userIDFloat)

		userRole, ok := claims["role"].(string)
		if !ok {
			http.Error(w, "Invalid user role in token", http.StatusUnauthorized)
			return
		}

		// Store user ID and role in context
		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		ctx = context.WithValue(ctx, UserRoleKey, userRole)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
