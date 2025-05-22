"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserContext } from "@/contexts/UserContext";
import { useChatSocket } from "@/hooks/useChatSocket";
import { Message, User } from "@/lib/types";
import { Send } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export default function Page() {
  const { userId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useUserContext();

  // Aquí recibimos mensajes entrantes y los añadimos a la lista
  const { sendMessage, senderId } = useChatSocket((msg) => {
    setMessages((prev) => {
      if (
        (msg.reciever.id === user?.id && msg.sender.id === Number(userId)) ||
        (msg.sender.id === user?.id && msg.reciever.id === Number(userId))
      ) {
        return [...prev, msg];
      }
      return prev;
    });
  });

  const handleSend = () => {
    if (!inputRef.current?.value.trim() || !senderId) return;

    // Aquí pones a quién le mandas el mensaje. Cambia este valor a quien quieras enviar
    const receiverId = userId?.toString() || "";

    sendMessage(receiverId, inputRef.current.value);
    inputRef.current.value = "";
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await fetch(
        `http://localhost:3000/api/messages/${userId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setMessages(Array.isArray(data.messages) ? data.messages.reverse() : []);
    };
    fetchMessages();
  }, [userId]);

  const talkingTo: User | null = useMemo(() => {
    if (messages.length === 0 || !user) return null;
    const firstMessage = messages[0];
    if (firstMessage.reciever?.id === user.id) {
      return firstMessage.sender ?? null;
    } else {
      return firstMessage.reciever ?? null;
    }
  }, [messages, user]);

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center gap-4 bg-white sticky top-0 z-10 px-4 py-6 border-b">
        <Image
          src={talkingTo?.profile_picture ?? "/teddy.webp"}
          alt={`imagen de perfil de ${talkingTo?.user_name}`}
          width={40}
          height={40}
          className="w-14 h-14 rounded-full"
        />
        <p className="text-2xl font-normal">{talkingTo?.user_name}</p>
      </header>

      <div className="flex flex-col gap-2 px-4 flex-1 overflow-y-auto">
        {messages.length === 0 && <p>No hay mensajes todavía</p>}
        {Array.isArray(messages) &&
          messages.length > 0 &&
          messages?.map((msg) => (
            <Badge
              key={msg.id}
              className={`w-fit max-w-96 py-2 flex flex-col rounded-xl ${
                msg.sender.id === user?.id
                  ? "self-end items-end"
                  : "items-start"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs text-gray-300">
                {new Date(msg.created_at).getHours()}:
                {new Date(msg.created_at).getMinutes() > 10
                  ? new Date(msg.created_at).getMinutes()
                  : `0${new Date(msg.created_at).getMinutes()}`}
              </p>
            </Badge>
          ))}
        <div ref={messagesEndRef} />
      </div>

      <footer className="sticky bottom-0 bg-white pb-24 flex mt-4 gap-2 px-4">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Escribe un mensaje..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <Button
          onClick={() => handleSend()}
          className="w-fit flex items-center justify-center"
        >
          <Send />
        </Button>
      </footer>
    </div>
  );
}
