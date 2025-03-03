package storage

import (
	"github.com/Marc-Garcia-Coronado/socialNetwork/models"
	"strconv"
)

func (s *PostgresStore) GetTopics() ([]*models.Topic, error) {

	query := "SELECT id, name, description, created_at FROM topics;"
	rows, err := s.Db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var topics []*models.Topic
	for rows.Next() {
		topic := new(models.Topic)
		if err := rows.Scan(&topic.ID, &topic.Name, &topic.Description, &topic.CreatedAt); err != nil {
			return nil, err
		}
		topics = append(topics, topic)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return topics, nil
}

func (s *PostgresStore) GetTopicByID(id int) (*models.Topic, error) {
	topic := new(models.Topic)
	stmt := "SELECT id, name, description, created_at FROM topics WHERE id = $1"
	if err := s.Db.QueryRow(stmt, id).Scan(&topic.ID, &topic.Name, &topic.Description, &topic.CreatedAt); err != nil {
		return nil, err
	}

	return topic, nil
}

func (s *PostgresStore) CreateTopic(topic *models.Topic) (*int, error) {
	var id *int

	stmt := "INSERT INTO topics (name, description) VALUES($1, $2) RETURNING id;"
	if err := s.Db.QueryRow(stmt, topic.Name, topic.Description).Scan(&id); err != nil {
		return nil, err
	}

	return id, nil
}

func (s *PostgresStore) UpdateTopic(topic map[string]interface{}, topicID int) error {

	// Build dynamic SQL query
	stmt := "UPDATE topics SET "
	values := []interface{}{}
	i := 1

	for key, value := range topic {
		stmt += key + " = $" + strconv.Itoa(i) + ", "
		values = append(values, value)
		i++
	}

	stmt = stmt[:len(stmt)-2] // Remove last comma
	stmt += " WHERE id = $" + strconv.Itoa(i)
	values = append(values, topicID)

	// Execute stmt
	err := s.Db.QueryRow(stmt, values...)
	if err.Err() != nil {
		return err.Err()
	}

	return nil
}

func (s *PostgresStore) DeleteTopic(id int) error {
	stmt := "DELETE FROM topics WHERE id = $1"
	if err := s.Db.QueryRow(stmt, id); err.Err() != nil {
		return err.Err()
	}

	return nil
}
