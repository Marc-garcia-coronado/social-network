package storage

import (
	"fmt"

	"github.com/Marc-Garcia-Coronado/socialNetwork/models"
)

func (s *PostgresStore) SaveMessage(message *models.MessageReq) error {
	stmt := `
	INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3);
	`

	_, err := s.Db.Exec(stmt, message.SenderID, message.ReceiverID, message.Content)
	if err != nil {
		fmt.Println("err", err)
		return err
	}

	return nil
}
