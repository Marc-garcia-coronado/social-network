package models

import "database/sql"

type PostReq struct {
	Picture string `json:"picture"`
	Title   string `json:"title"`
	TopicID int    `json:"topic_id"`
	UserID  int    `json:"user_id"`
}

type Post struct {
	ID        int            `json:"id"`
	Picture   sql.NullString `json:"picture"`
	Title     string         `json:"title"`
	UserID    int            `json:"user_id"`
	TopicID   int            `json:"topic_id"`
	CreatedAt string         `json:"created_at"`
}
