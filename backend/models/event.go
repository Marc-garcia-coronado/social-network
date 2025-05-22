package models

type EventReq struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Location    string `json:"location"`
	CreatorID   int    `json:"creator_id"`
	Date        string `json:"date"`
	TopicID     int    `json:"topic_id"`
	Picture		string `json:"picture"`
}

type Event struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Location    string `json:"location"`
	CreatorID   int    `json:"creator_id"`
	TopicID     int    `json:"topic_id"`
	Date        string `json:"date"`
	CreatedAt   string `json:"created_at"`
	Picture		string `json:"picture"`
}

type EventWithUser struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Location    string `json:"location"`
	Creator     User   `json:"creator"`
	Topic       Topic  `json:"topic"`
	Date        string `json:"date"`
	CreatedAt   string `json:"created_at"`
	Picture		string `json:"picture"`
}

type SubscribedEvent struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	Description  string `json:"description"`
	Location     string `json:"location"`
	Creator      User   `json:"creator"`
	Topic        Topic  `json:"topic"`
	Date         string `json:"date"`
	CreatedAt    string `json:"created_at"`
	SubscribedAt string `json:"subscribed_at"`
	Picture		string `json:"picture"`
}

type EventWithCountRes[T any] struct {
	Events     []T        `json:"events"` // This field could be of type Event or SubscribedEvent
	Pagination Pagination `json:"pagination"`
}

type SubscriptionRes struct {
	Message string `json:"message"`
}
