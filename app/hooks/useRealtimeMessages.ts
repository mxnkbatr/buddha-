import { useEffect, useRef, useState } from 'react';

// Assuming Message interface from the page, or export it from types.
interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export function useRealtimeMessages(otherId: string | null, userId: string | null, initialMessages: Message[] = []) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<any>(null);

  // Use the state initializer only, no useEffect to spam state updates
  // to avoid infinite loops when initialMessages is a new array reference.

  const connect = () => {
    if (!otherId || !userId) return;
    
    // Using a more robust WS url resolution
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `${protocol}//${window.location.host}/api/ws`;
    
    try {
      wsRef.current = new WebSocket(`${wsUrl}?room=${userId}_${otherId}`);
      
      wsRef.current.onopen = () => setIsConnected(true);
      
      wsRef.current.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'new_message') {
            setMessages(prev => [...prev, msg.data]);
          }
        } catch (e) {
          console.error("Failed to parse websocket message", e);
        }
      };
      
      wsRef.current.onclose = () => {
        setIsConnected(false);
        // Auto reconnect 3 секундын дараа
        reconnectTimer.current = setTimeout(connect, 3000);
      };
      
      wsRef.current.onerror = (e) => {
        console.error("WebSocket Error", e);
        wsRef.current?.close();
      };
    } catch (e) {
      console.error("WebSocket connection failed", e);
    }
  };

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect loop on unmount
        wsRef.current.close();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherId, userId]);

  const sendMessage = (text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message', text, to: otherId }));
      return true;
    }
    return false;
  };

  return { messages, setMessages, isConnected, sendMessage };
}
