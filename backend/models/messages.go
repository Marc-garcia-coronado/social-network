package models

type MessageReq struct {
	ID         int    `json:"id"`
	SenderID   int    `json:"sender_id"`
	ReceiverID int    `json:"reciever_id"`
	Content    string `json:"content"`
	CreatedAt  string `json:"created_at"`
	IsRead     bool   `json:"is_read"`
}

type Message struct {
	ID        int    `json:"id"`
	Sender    User   `json:"sender"`
	Receiver  User   `json:"reciever"`
	Content   string `json:"content"`
	CreatedAt string `json:"created_at"`
	IsRead    bool   `json:"is_read"`
}
