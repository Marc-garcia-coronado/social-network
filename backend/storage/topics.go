package storage

import (
	"errors"
	"fmt"
	"github.com/Marc-Garcia-Coronado/socialNetwork/models"
	"strconv"
)

func (s *PostgresStore) GetTopics() ([]models.Topic, error) {

	query := "SELECT id, name, description, created_at FROM topics;"
	rows, err := s.Db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var topics []models.Topic
	for rows.Next() {
		topic := new(models.Topic)
		if err := rows.Scan(&topic.ID, &topic.Name, &topic.Description, &topic.CreatedAt); err != nil {
			return nil, err
		}
		topics = append(topics, *topic)
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

func (s *PostgresStore) CreateTopic(topic *models.Topic) (*models.Topic, error) {
	newTopic := new(models.Topic)

	stmt := "INSERT INTO topics (name, description) VALUES($1, $2) RETURNING id, name, description, created_at;"
	if err := s.Db.QueryRow(stmt, topic.Name, topic.Description).Scan(&newTopic.ID, &newTopic.Name, &newTopic.Description, &newTopic.CreatedAt); err != nil {
		return nil, err
	}

	return newTopic, nil
}

func (s *PostgresStore) UpdateTopic(topic map[string]interface{}, topicID int) (*models.Topic, error) {

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
	stmt += " WHERE id = $" + strconv.Itoa(i) + " RETURNING id, name, description, created_at;"
	values = append(values, topicID)

	// Execute stmt
	newTopic := new(models.Topic)
	err := s.Db.QueryRow(stmt, values...).Scan(&newTopic.ID, &newTopic.Name, &newTopic.Description, &newTopic.CreatedAt)
	if err != nil {
		return nil, err
	}

	return newTopic, nil
}

func (s *PostgresStore) DeleteTopic(id int) error {
	stmt := "DELETE FROM topics WHERE id = $1"
	res, err := s.Db.Exec(stmt, id)
	if err != nil {
		return err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return errors.New("no topic found to delete")
	}

	return nil
}

func (s *PostgresStore) GetUserTopics(userID int) ([]models.UserTopic, error) {
	stmt := `
	SELECT t.id, t.name, t.description, tu.followed_at
	FROM topics t
	JOIN topics_user tu ON t.id = tu.topic_id
	WHERE tu.user_id = $1;
	`

	rows, err := s.Db.Query(stmt, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var topics []models.UserTopic
	for rows.Next() {
		newTopic := new(models.UserTopic)
		if err := rows.Scan(&newTopic.ID, &newTopic.Name, &newTopic.Description, &newTopic.FollowedAt); err != nil {
			return nil, err
		}
		topics = append(topics, *newTopic)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return topics, nil
}

func (s *PostgresStore) FollowTopics(ids []int, userID int) error {
	query := "INSERT INTO topics_user (user_id, topic_id) VALUES "
	values := []interface{}{}

	for i, topicID := range ids {
		query += fmt.Sprintf("($%d, $%d), ", i*2+1, i*2+2)
		values = append(values, userID, topicID)
	}

	query = query[:len(query)-2] // Remove last comma
	query += ";"

	if _, err := s.Db.Exec(query, values...); err != nil {
		return err
	}

	return nil
}

func (s *PostgresStore) UnfollowTopics(ids []int, userID int) error {
	stmt := "DELETE FROM topics_user WHERE user_id = $1 AND topic_id = $2;"

	for _, topicID := range ids {
		res, err := s.Db.Exec(stmt, userID, topicID)
		if err != nil {
			return err
		}

		rowsAffected, err := res.RowsAffected()
		if err != nil {
			return err
		}
		if rowsAffected == 0 {
			return errors.New("no topic found to delete")
		}

		return nil
	}

	return nil
}

func (s *PostgresStore) GetUserFollowTopicsCount(userID int) (*int, error) {
	stmt := `
	SELECT count(*) FROM topics_user WHERE user_id = $1;
	`
	var count *int
	if err := s.Db.QueryRow(stmt, userID).Scan(&count); err != nil {
		return nil, err
	}

	return count, nil
}
