package models

type EventReq struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Location    string `json:"location"`
	CreatorID   int    `json:"creator_id"`
	TopicID     int    `json:"topic_id"`
}

type Event struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Location    string `json:"location"`
	CreatorID   int    `json:"creator_id"`
	TopicID     int    `json:"topic_id"`
	CreatedAt   string `json:"created_at"`
}
