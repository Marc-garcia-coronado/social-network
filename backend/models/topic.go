package models

type TopicReq struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}
type FollowTopicsReq struct {
	Topics []int `json:"topics"`
}

type UnfollowTopicsReq struct {
	Topics []int `json:"topics"`
}

type UserTopic struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	FollowedAt  string `json:"followed_at"`
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
