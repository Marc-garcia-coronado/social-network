"use client"

import { useUserContext } from "@/contexts/UserContext";
import { Message } from "@/lib/types";
import { useEffect, useRef, useState, useCallback } from "react";

export function useChatSocket(onMessage: (msg: Message) => void) {
  const socketRef = useRef<WebSocket | null>(null);
  const { user } = useUserContext();
  const senderId = user?.id.toString();
  const [shouldReconnect, setShouldReconnect] = useState(true);

  const connect = useCallback(() => {
    if (!senderId) return;
    const ws = new WebSocket(`ws://social-network-production.up.railway.app/ws?userID=${senderId}`);
    socketRef.current = ws;

    ws.onmessage = (event) => {
      const msg: Message = JSON.parse(event.data);
      onMessage(msg);
    };

    ws.onclose = () => {
      if (shouldReconnect) {
        setTimeout(() => {
          connect();
        }, 3000);
      }
    };

    ws.onerror = (e) => {
      console.error("WebSocket error:", e);
      ws.close();
    };
  }, [onMessage, senderId, shouldReconnect]);

  useEffect(() => {
    connect();
    return () => {
      setShouldReconnect(false);
      socketRef.current?.close();
    };
  }, [connect]);

  const sendMessage = (to: string, content: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(JSON.stringify({ to, content }));
  };

  return { sendMessage, senderId };
}
