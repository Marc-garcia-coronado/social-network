package models

type LikeReq struct {
	UserID    int `json:"user_id"`
	PostID    int `json:"post_id"`
	CommentID int `json:"comment_id"`
}

type LikePost struct {
	ID        int    `json:"id"`
	User      User   `json:"user"`
	Post      Post   `json:"post"`
	CreatedAt string `json:"created_at"`
}

type LikeComment struct {
	ID        int     `json:"id"`
	User      User    `json:"user"`
	Comment   Comment `json:"comment"`
	CreatedAt string  `json:"created_at"`
}

type LikesWithPagination[T any] struct {
	Likes      []T        `json:"likes"`
	Pagination Pagination `json:"pagination"`
}
