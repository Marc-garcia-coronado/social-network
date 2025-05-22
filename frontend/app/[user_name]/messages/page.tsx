"use client"

import { useState } from "react";
import { useChatSocket } from "@/hooks/useChatSocket"; // ajusta la ruta

interface Message {
  from: string;
  content: string;
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  
  // Aquí recibimos mensajes entrantes y los añadimos a la lista
  const { sendMessage, senderId } = useChatSocket((msg) => {
    setMessages((prev) => [...prev, msg]);
  });

  const handleSend = () => {
    
    if (!input.trim() || !senderId) return;
    
    // Aquí pones a quién le mandas el mensaje. Cambia este valor a quien quieras enviar
    const receiverId = "3"; 
    
    sendMessage(receiverId, input);

    // Puedes mostrar tu propio mensaje en la UI instantáneamente
    setMessages((prev) => [...prev, { from: senderId, content: input }]);
    setInput("");
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Chat en tiempo real</h2>
      <p>Conectado como usuario: {senderId}</p>
      
      <div 
        style={{ 
          border: "1px solid #ccc", 
          padding: 10, 
          height: 300, 
          overflowY: "auto", 
          marginBottom: 10 
        }}
      >
        {messages.length === 0 && <p>No hay mensajes todavía</p>}
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <b>{msg.from === senderId ? "Tú" : `User ${msg.from}`}</b>: {msg.content}
          </div>
        ))}
      </div>

      <input
        type="text"
        placeholder="Escribe un mensaje..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        style={{ width: "100%", padding: 8 }}
      />

      <button onClick={() => handleSend()} style={{ marginTop: 8, width: "100%" }}>
        Enviar
      </button>
    </div>
  );
}
