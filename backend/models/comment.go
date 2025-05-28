package models

type CommentReq struct {
	Body   string `json:"body"`
	UserID int    `json:"user_id"`
	PostID int    `json:"post_id"`
}

type Comment struct {
	ID        int    `json:"id"`
	Body      string `json:"body"`
	User      User   `json:"user"`
	Post      Post   `json:"post"`
	CreatedAt string `json:"created_at"`
}

type CommentsWithCountRes struct {
	Comments   []Comment  `json:"comments"`
	Pagination Pagination `json:"pagination"`
}
