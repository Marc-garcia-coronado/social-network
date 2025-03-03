package models

type TopicReq struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type Topic struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	CreatedAt   string `json:"created_at"`
}

func NewTopic(name, description string) *Topic {
	return &Topic{
		Name:        name,
		Description: description,
	}
}
