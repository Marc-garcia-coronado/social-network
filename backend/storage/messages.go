package storage

import (
	"github.com/Marc-Garcia-Coronado/socialNetwork/models"
)

func (s *PostgresStore) SaveMessage(message *models.MessageReq) (*models.Message, error) {
	stmt := `
	WITH inserted_msg AS (
		INSERT INTO messages (sender_id, receiver_id, content) 
		VALUES ($1, $2, $3) 
		RETURNING id, sender_id, receiver_id, content, created_at, is_read
	)

	SELECT im.id, im.content, im.created_at, im.is_read,
	       us.id AS sender_id, us.user_name, us.full_name, us.email, us.profile_picture, us.is_active, us.role,
	       ur.id AS receiver_id, ur.user_name AS receiver_user_name, ur.full_name AS receiver_full_name, ur.email AS receiver_email, ur.profile_picture AS receiver_profile_picture, ur.is_active AS receiver_is_active, ur.role AS receiver_role
	FROM inserted_msg im
	JOIN users us ON us.id = im.sender_id
	JOIN users ur ON ur.id = im.receiver_id;
	`

	newMsg := new(models.Message)
	err := s.Db.QueryRow(stmt, message.SenderID, message.ReceiverID, message.Content).Scan(
		&newMsg.ID, &newMsg.Content, &newMsg.CreatedAt, &newMsg.IsRead,
		&newMsg.Sender.ID, &newMsg.Sender.UserName, &newMsg.Sender.FullName,
		&newMsg.Sender.Email, &newMsg.Sender.ProfilePicture, &newMsg.Sender.IsActive, &newMsg.Sender.Role,
		&newMsg.Receiver.ID, &newMsg.Receiver.UserName, &newMsg.Receiver.FullName,
		&newMsg.Receiver.Email, &newMsg.Receiver.ProfilePicture, &newMsg.Receiver.IsActive, &newMsg.Receiver.Role,
	)
	if err != nil {
		return nil, err
	}

	return newMsg, nil
}

func (s *PostgresStore) GetConversationMessages(from, to int) ([]models.Message, error) {

	stmt := `
	SELECT im.id, im.content, im.created_at, im.is_read,
	       us.id AS sender_id, us.user_name, us.full_name, us.email, us.profile_picture, us.is_active, us.role,
	       ur.id AS receiver_id, ur.user_name AS receiver_user_name, ur.full_name AS receiver_full_name, ur.email AS receiver_email, ur.profile_picture AS receiver_profile_picture, ur.is_active AS receiver_is_active, ur.role AS receiver_role
	FROM messages im
	JOIN users us ON us.id = im.sender_id
	JOIN users ur ON ur.id = im.receiver_id
	WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
	ORDER BY im.created_at DESC;
	`

	rows, err := s.Db.Query(stmt, from, to)
	if err != nil {
		return nil, err
	}

	var arrayMessages []models.Message
	for rows.Next() {
		newMessage := new(models.Message)
		err := rows.Scan(&newMessage.ID, &newMessage.Content, &newMessage.CreatedAt, &newMessage.IsRead,
			&newMessage.Sender.ID, &newMessage.Sender.UserName, &newMessage.Sender.FullName,
			&newMessage.Sender.Email, &newMessage.Sender.ProfilePicture, &newMessage.Sender.IsActive, &newMessage.Sender.Role,
			&newMessage.Receiver.ID, &newMessage.Receiver.UserName, &newMessage.Receiver.FullName,
			&newMessage.Receiver.Email, &newMessage.Receiver.ProfilePicture, &newMessage.Receiver.IsActive, &newMessage.Receiver.Role,
		)
		if err != nil {
			return nil, err
		}

		arrayMessages = append(arrayMessages, *newMessage)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return arrayMessages, nil
}

func (s *PostgresStore) GetUserConversations(userID int) ([]models.User, error) {
	stmt := `
	WITH last_messages AS (
    SELECT DISTINCT ON (
        LEAST(sender_id, receiver_id), 
        GREATEST(sender_id, receiver_id)
    ) *
    FROM messages
    WHERE sender_id = $1 OR receiver_id = $1
    ORDER BY 
        LEAST(sender_id, receiver_id), 
        GREATEST(sender_id, receiver_id), 
        created_at DESC
	)
	SELECT 
		us.id AS sender_id,
		us.user_name,
		us.full_name,
		us.email,
		us.profile_picture,
		us.is_active,
		us.role
	FROM last_messages lm
	JOIN users us ON (
		(us.id = lm.receiver_id AND lm.sender_id = $1)
		OR 
		(us.id = lm.sender_id AND lm.receiver_id = $1)
	)
	ORDER BY lm.created_at DESC;
	`

	rows, err := s.Db.Query(stmt, userID)
	if err != nil {
		return nil, err
	}

	var arrayUsers []models.User
	for rows.Next() {
		newUser := new(models.User)
		err := rows.Scan(&newUser.ID, &newUser.UserName, &newUser.FullName, &newUser.Email, &newUser.ProfilePicture, &newUser.IsActive, &newUser.Role)
		if err != nil {
			return nil, err
		}

		arrayUsers = append(arrayUsers, *newUser)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return arrayUsers, nil
}

func (s *PostgresStore) ReadConversationMessages(from, to int) error {
	stmt := `
		UPDATE messages 
		SET is_read = true 
		WHERE sender_id = $2 AND receiver_id = $1 AND is_read = false;
	`

	_, err := s.Db.Exec(stmt, from, to)
	return err
}

func (s *PostgresStore) GetNotReadedConversationMessages(from, to int) (int, error) {
	stmt := `
	SELECT COUNT(*)
	FROM messages
	WHERE (sender_id = $2 AND receiver_id = $1) AND is_read = false;
	`
	var number int
	err := s.Db.QueryRow(stmt, from, to).Scan(&number)
	if err != nil {
		return 0, err
	}

	return number, nil
}
