"use client"

import { useUserContext } from "@/contexts/UserContext"
import { useEffect, useRef } from "react"

interface Message {
  from: string
  content: string
}

export function useChatSocket(onMessage: (msg: Message) => void) {
  const socketRef = useRef<WebSocket | null>(null)
  const {user} = useUserContext()
  const senderId = user?.id.toString()

  useEffect(() => {
    if (!senderId) return

    const ws = new WebSocket(`ws://localhost:3000/ws?userID=${senderId}`)
    socketRef.current = ws

    ws.onmessage = (event) => {
      const msg: Message = JSON.parse(event.data)
      onMessage(msg)
    }

    ws.onclose = () => {
    }

    return () => {
      ws.close()
    }
  }, [senderId])

  const sendMessage = (to: string, content: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return
    socketRef.current.send(JSON.stringify({ to, content }))
  }

  return { sendMessage, senderId }
}
