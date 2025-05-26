package routes

import (
	"log"
	"net/http"
	"strconv"

	"github.com/Marc-Garcia-Coronado/socialNetwork/models"
	"github.com/gorilla/websocket"
)

var clients = make(map[string]*websocket.Conn)

// Upgrader para WebSocket
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		// Permitir solo desde tu frontend (cambia al dominio que uses)
		return origin == "http://localhost:3001" || origin == "https://https://flexin-frontend-production.up.railway.app"
	},
}

func (s *APIServer) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("userID")
	if userID == "" {
		http.Error(w, "Missing userID query parameter", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error al hacer upgrade:", err)
		return
	}
	defer conn.Close()

	clients[userID] = conn
	log.Println("Usuario conectado:", userID)

	for {
		var msg map[string]string
		if err := conn.ReadJSON(&msg); err != nil {
			log.Println("Error al leer mensaje:", err)
			delete(clients, userID)
			break
		}

		to := msg["to"]
		content := msg["content"]

		log.Printf("Mensaje de %s a %s: %s\n", userID, to, content)

		reciever, err := strconv.Atoi(to)
		if err != nil {
			return
		}
		sender, err := strconv.Atoi(userID)
		if err != nil {
			return
		}

		newMessage := new(models.MessageReq)
		newMessage.Content = content
		newMessage.ReceiverID = reciever
		newMessage.SenderID = sender

		newMsg, err := s.store.SaveMessage(newMessage)
		if err != nil {
			return
		}

		// Enviar al destinatario si está conectado
		if toConn, ok := clients[to]; ok {
			toConn.WriteJSON(newMsg)
		}

		// También enviar al emisor (si está conectado)
		if fromConn, ok := clients[userID]; ok {
			fromConn.WriteJSON(newMsg)
		}
	}

	return
}
