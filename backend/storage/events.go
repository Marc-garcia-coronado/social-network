package storage

import (
	"errors"
	"strconv"

	"github.com/Marc-Garcia-Coronado/socialNetwork/models"
)

func (s *PostgresStore) CreateEvent(event *models.EventReq) (*models.EventWithUser, error) {
	stmt := `
	WITH inserted_event AS (
    INSERT INTO events (name, description, creator_id, location, date, topic_id, picture)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, name, description, location, created_at, creator_id, topic_id, date, picture
	)
	SELECT e.id, e.name, e.description, e.location, e.created_at, e.date, e.picture,
		   u.id AS creator_id, u.user_name, u.full_name, u.email, u.profile_picture, u.is_active, u.role,
		   t.id AS topic_id, t.name AS topic_name, t.description AS topic_description, t.created_at AS topic_created_at
	FROM inserted_event e
	JOIN users u ON u.id = e.creator_id
	JOIN topics t ON t.id = e.topic_id;
	`

	newEvent := new(models.EventWithUser)
	row := s.Db.QueryRow(stmt, event.Name, event.Description, event.CreatorID, event.Location, event.Date, event.TopicID, event.Picture)
	err := row.Scan(&newEvent.ID, &newEvent.Name, &newEvent.Description, &newEvent.Location, &newEvent.CreatedAt, &newEvent.Date, &newEvent.Picture,
		&newEvent.Creator.ID, &newEvent.Creator.UserName, &newEvent.Creator.FullName,
		&newEvent.Creator.Email, &newEvent.Creator.ProfilePicture, &newEvent.Creator.IsActive, &newEvent.Creator.Role,
		&newEvent.Topic.ID, &newEvent.Topic.Name, &newEvent.Topic.Description, &newEvent.Topic.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return newEvent, nil
}

func (s *PostgresStore) GetAllEvents(limit, offset int, query string, topicID string) ([]models.EventWithUser, int, error) {
	var totalCount int
	queryCount := "SELECT COUNT(*) FROM events e WHERE e.name ILIKE $1 AND ($2 ILIKE '' OR e.topic_id::text ILIKE $2);"
	if err := s.Db.QueryRow(queryCount, "%"+query+"%", "%"+topicID+"%").Scan(&totalCount); err != nil {
		return nil, 0, err
	}

	stmt := `
	SELECT e.id, e.name, e.description, e.location, e.created_at, e.date, e.picture,
		   u.id AS creator_id, u.user_name, u.full_name, u.email, u.profile_picture, u.is_active, u.role,
		   t.id AS topic_id, t.name AS topic_name, t.description AS topic_description, t.created_at AS topic_created_at
	FROM events e
	JOIN users u ON u.id = e.creator_id
	JOIN topics t ON t.id = e.topic_id
	WHERE e.name ILIKE $3 AND ($4 ILIKE '' OR e.topic_id::text ILIKE $4)
	ORDER BY e.created_at DESC
	LIMIT $1 OFFSET $2;
	`

	rows, err := s.Db.Query(stmt, limit, offset, "%"+query+"%", "%"+topicID+"%")
	if err != nil {
		return nil, 0, err
	}

	var arrayEvents []models.EventWithUser

	for rows.Next() {
		newEvent := new(models.EventWithUser)
		err := rows.Scan(&newEvent.ID, &newEvent.Name, &newEvent.Description, &newEvent.Location, &newEvent.CreatedAt, &newEvent.Date, &newEvent.Picture,
			&newEvent.Creator.ID, &newEvent.Creator.UserName, &newEvent.Creator.FullName,
			&newEvent.Creator.Email, &newEvent.Creator.ProfilePicture, &newEvent.Creator.IsActive, &newEvent.Creator.Role,
			&newEvent.Topic.ID, &newEvent.Topic.Name, &newEvent.Topic.Description, &newEvent.Topic.CreatedAt,
		)
		if err != nil {
			return nil, 0, err
		}

		arrayEvents = append(arrayEvents, *newEvent)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return arrayEvents, totalCount, nil
}

func (s *PostgresStore) GetAllEventsCount() (*int, error) {
	var totalCount *int
	queryCount := "SELECT COUNT(*) FROM events;"
	if err := s.Db.QueryRow(queryCount).Scan(&totalCount); err != nil {
		return nil, err
	}

	return totalCount, nil
}

func (s *PostgresStore) GetAllEventsByTopic(topicID, limit, offset int) ([]models.EventWithUser, int, error) {
	var totalCount int
	queryCount := "SELECT COUNT(*) FROM events WHERE topic_id = $1;"
	if err := s.Db.QueryRow(queryCount, topicID).Scan(&totalCount); err != nil {
		return nil, 0, err
	}

	stmt := `
	SELECT e.id, e.name, e.description, e.location, e.created_at, e.date, e.picture,
		   u.id AS creator_id, u.user_name, u.full_name, u.email, u.profile_picture, u.is_active, u.role,
		   t.id AS topic_id, t.name AS topic_name, t.description AS topic_description, t.created_at AS topic_created_at
	FROM events e
	JOIN users u ON u.id = e.creator_id
	JOIN topics t ON t.id = e.topic_id
	WHERE e.topic_id = $1
	ORDER BY e.created_at DESC
	LIMIT $2 OFFSET $3;
	`

	rows, err := s.Db.Query(stmt, topicID, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	var arrayEvents []models.EventWithUser

	for rows.Next() {
		newEvent := new(models.EventWithUser)
		err := rows.Scan(&newEvent.ID, &newEvent.Name, &newEvent.Description, &newEvent.Location, &newEvent.CreatedAt, &newEvent.Date, &newEvent.Picture,
			&newEvent.Creator.ID, &newEvent.Creator.UserName, &newEvent.Creator.FullName,
			&newEvent.Creator.Email, &newEvent.Creator.ProfilePicture, &newEvent.Creator.IsActive, &newEvent.Creator.Role,
			&newEvent.Topic.ID, &newEvent.Topic.Name, &newEvent.Topic.Description, &newEvent.Topic.CreatedAt,
		)
		if err != nil {
			return nil, 0, err
		}

		arrayEvents = append(arrayEvents, *newEvent)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return arrayEvents, totalCount, nil
}

func (s *PostgresStore) GetAllEventsByTopicCount(topicID int) (*int, error) {
	var totalCount *int
	queryCount := "SELECT COUNT(*) FROM events WHERE topic_id = $1;"
	if err := s.Db.QueryRow(queryCount, topicID).Scan(&totalCount); err != nil {
		return nil, err
	}

	return totalCount, nil
}

func (s *PostgresStore) GetUserEventsCount(userID int) (*int, error) {
	var totalCount *int
	queryCount := "SELECT COUNT(*) FROM events WHERE creator_id = $1;"
	if err := s.Db.QueryRow(queryCount, userID).Scan(&totalCount); err != nil {
		return nil, err
	}

	return totalCount, nil
}

func (s *PostgresStore) GetUserEvents(userID, limit, offset int) ([]models.EventWithUser, int, error) {
	var totalCount int
	queryCount := "SELECT COUNT(*) FROM events WHERE creator_id = $1;"
	if err := s.Db.QueryRow(queryCount, userID).Scan(&totalCount); err != nil {
		return nil, 0, err
	}

	stmt := `
	SELECT e.id, e.name, e.description, e.location, e.created_at, e.date, e.picture,
		   u.id AS creator_id, u.user_name, u.full_name, u.email, u.profile_picture, u.is_active, u.role,
		   t.id AS topic_id, t.name AS topic_name, t.description AS topic_description, t.created_at AS topic_created_at
	FROM events e
	JOIN users u ON u.id = e.creator_id
	JOIN topics t ON t.id = e.topic_id
	WHERE e.creator_id = $1
	ORDER BY e.created_at DESC
	LIMIT $2 OFFSET $3;
	`
	rows, err := s.Db.Query(stmt, userID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var arrayEvents []models.EventWithUser

	for rows.Next() {
		newEvent := new(models.EventWithUser)
		err := rows.Scan(&newEvent.ID, &newEvent.Name, &newEvent.Description, &newEvent.Location, &newEvent.CreatedAt, &newEvent.Date, &newEvent.Picture,
			&newEvent.Creator.ID, &newEvent.Creator.UserName, &newEvent.Creator.FullName,
			&newEvent.Creator.Email, &newEvent.Creator.ProfilePicture, &newEvent.Creator.IsActive, &newEvent.Creator.Role,
			&newEvent.Topic.ID, &newEvent.Topic.Name, &newEvent.Topic.Description, &newEvent.Topic.CreatedAt,
		)
		if err != nil {
			return nil, 0, err
		}

		arrayEvents = append(arrayEvents, *newEvent)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return arrayEvents, totalCount, nil
}

func (s *PostgresStore) UpdateEvent(event map[string]any, eventID int) (*models.EventWithUser, error) {
	stmt := "UPDATE events SET "
	values := []any{}
	i := 1

	for key, value := range event {
		stmt += key + " = $" + strconv.Itoa(i) + ", "
		values = append(values, value)
		i++
	}

	stmt = stmt[:len(stmt)-2]

	stmt += ` FROM users u, topics t 
	         WHERE events.id = $` + strconv.Itoa(i) + `
	         AND events.creator_id = u.id 
	         AND events.topic_id = t.id`

	stmt += ` RETURNING 
		events.id, events.name, events.description, events.location, events.created_at, events.date, events.picture,
		u.id, u.user_name, u.full_name, u.email, u.profile_picture, u.is_active, u.role,
		t.id, t.name, t.description, t.created_at;`

	values = append(values, eventID)

	updatedEvent := new(models.EventWithUser)

	err := s.Db.QueryRow(stmt, values...).Scan(
		&updatedEvent.ID, &updatedEvent.Name, &updatedEvent.Description,
		&updatedEvent.Location, &updatedEvent.CreatedAt, &updatedEvent.Date, &updatedEvent.Picture,
		&updatedEvent.Creator.ID, &updatedEvent.Creator.UserName,
		&updatedEvent.Creator.FullName, &updatedEvent.Creator.Email,
		&updatedEvent.Creator.ProfilePicture, &updatedEvent.Creator.IsActive,
		&updatedEvent.Creator.Role,
		&updatedEvent.Topic.ID, &updatedEvent.Topic.Name,
		&updatedEvent.Topic.Description, &updatedEvent.Topic.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return updatedEvent, nil
}

func (s *PostgresStore) DeleteEvent(id int) error {
	stmt := "DELETE FROM events WHERE id = $1;"

	res, err := s.Db.Exec(stmt, id)
	if err != nil {
		return err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return errors.New("no event found to delete")
	}

	return nil
}

// Subscription to Events methods
func (s *PostgresStore) SubscribeEvent(eventID, userID int) error {
	stmt := `
	INSERT INTO user_event (user_id, event_id)
	VALUES ($1, $2);
	`

	if err := s.Db.QueryRow(stmt, userID, eventID).Err(); err != nil {
		return err
	}

	return nil
}

func (s *PostgresStore) UnsubscribeEvent(eventID, userID int) error {
	stmt := "DELETE FROM user_event WHERE event_id = $1 AND user_id = $2;"

	if err := s.Db.QueryRow(stmt, eventID, userID).Err(); err != nil {
		return err
	}

	return nil
}

func (s *PostgresStore) GetUserSubscribedEvents(userID, limit, offset int) ([]models.SubscribedEvent, int, error) {
	var totalCount int
	queryCount := "SELECT COUNT(*) FROM user_event WHERE user_id = $1;"
	if err := s.Db.QueryRow(queryCount, userID).Scan(&totalCount); err != nil {
		return nil, 0, err
	}

	stmt := `
	SELECT e.id, e.name, e.description, e.picture, u.id, u.user_name, u.full_name, u.email, u.profile_picture, u.is_active, u.role, e.location, 
		t.id, t.name, t.description, t.created_at, e.created_at, e.date, ue.subscribed_at
	FROM user_event ue
	JOIN events e ON e.id = ue.event_id
	JOIN users u ON u.id = e.creator_id 
	JOIN topics t ON t.id = e.topic_id
	WHERE ue.user_id = $1
	ORDER BY ue.subscribed_at DESC
	LIMIT $2 OFFSET $3;
	`

	rows, err := s.Db.Query(stmt, userID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var arrayEvents []models.SubscribedEvent

	for rows.Next() {
		newEvent := new(models.SubscribedEvent)
		err := rows.Scan(&newEvent.ID, &newEvent.Name, &newEvent.Description, &newEvent.Picture,
			&newEvent.Creator.ID, &newEvent.Creator.UserName, &newEvent.Creator.FullName,
			&newEvent.Creator.Email, &newEvent.Creator.ProfilePicture, &newEvent.Creator.IsActive, &newEvent.Creator.Role, &newEvent.Location,
			&newEvent.Topic.ID, &newEvent.Topic.Name, &newEvent.Topic.Description, &newEvent.Topic.CreatedAt,
			&newEvent.CreatedAt, &newEvent.Date, &newEvent.SubscribedAt,
		)
		if err != nil {
			return nil, 0, err
		}

		arrayEvents = append(arrayEvents, *newEvent)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return arrayEvents, totalCount, nil
}

func (s *PostgresStore) GetUserSubscribedEventsCount(userID int) (*int, error) {
	var totalCount *int
	queryCount := "SELECT COUNT(*) FROM user_event WHERE user_id = $1;"
	if err := s.Db.QueryRow(queryCount, userID).Scan(&totalCount); err != nil {
		return nil, err
	}

	return totalCount, nil
}
