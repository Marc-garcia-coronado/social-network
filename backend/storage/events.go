package storage

import "github.com/Marc-Garcia-Coronado/socialNetwork/models"

func (s *PostgresStore) CreateEvent(event *models.EventReq) (*models.Event, error) {
	stmt := `
	INSERT INTO events (name, description, creator_id, location, topic_id)
	VALUES ($1, $2, $3, $4, $5)
	RETURNING id, name, description, creator_id, location, topic_id;
	`

	newEvent := new(models.Event)
	row := s.Db.QueryRow(stmt, event.Name, event.Description, event.CreatorID, event.Location, event.TopicID)
	err := row.Scan(&newEvent.ID, &newEvent.Name, &newEvent.Description, &newEvent.CreatorID, &newEvent.Location, &newEvent.TopicID)
	if err != nil {
		return nil, err
	}

	return newEvent, nil
}

func (s *PostgresStore) GetAllEventsWithCount(limit, offset int) ([]models.Event, int, error) {
	var totalCount int
	queryCount := "SELECT COUNT(*) FROM events;"
	if err := s.Db.QueryRow(queryCount).Scan(&totalCount); err != nil {
		return nil, 0, err
	}

	stmt := `
	SELECT id, name, description, creator_id, location, topic_id
	FROM events
	LIMIT $1 OFFSET $2;
	`

	rows, err := s.Db.Query(stmt, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	var arrayEvents []models.Event

	for rows.Next() {
		newEvent := new(models.Event)
		err := rows.Scan(&newEvent.ID, &newEvent.Name, &newEvent.Description, &newEvent.CreatorID, &newEvent.Location, &newEvent.TopicID)
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
