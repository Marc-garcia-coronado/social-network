package models

type Pagination struct {
	TotalCount int `json:"total_count"`
	Page       int `json:"page"`
	Limit      int `json:"limit"`
}
