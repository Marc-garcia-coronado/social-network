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
	User      User           `json:"user"`
	Topic     Topic          `json:"topic"`
	CreatedAt string         `json:"created_at"`
}
