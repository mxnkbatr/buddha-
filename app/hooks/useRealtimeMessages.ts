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
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<any>(null);
  const retryCount = useRef(0);

  // Progressive Enhancement: Fallback to HTTP Polling if WS fails
  useEffect(() => {
    if (!isFallbackMode || !otherId) return;
    
    const pollMessages = async () => {
      try {
        const res = await fetch(`/api/messages/${otherId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (e) {
        // Silent catch for background polling
      }
    };

    // Poll every 5s silently
    const interval = setInterval(pollMessages, 5000);
    return () => clearInterval(interval);
  }, [isFallbackMode, otherId]);

  // Use the state initializer only, no useEffect to spam state updates
  // to avoid infinite loops when initialMessages is a new array reference.

  const connect = () => {
    if (!otherId || !userId || isFallbackMode) return;
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `${protocol}//${window.location.host}/api/ws`;
    
    try {
      wsRef.current = new WebSocket(`${wsUrl}?room=${userId}_${otherId}`);
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        retryCount.current = 0; // reset retries
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'new_message') {
            setMessages(prev => [...prev, msg.data]);
          }
        } catch (e) {}
      };
      
      wsRef.current.onclose = () => {
        setIsConnected(false);
        if (retryCount.current >= 2) {
          setIsFallbackMode(true); // Switch to polling
          return;
        }
        retryCount.current += 1;
        reconnectTimer.current = setTimeout(connect, 3000);
      };
      
      wsRef.current.onerror = () => {
        // Silently close, which triggers onclose and manages retry/fallback logic
        wsRef.current?.close();
      };
    } catch (e) {
      setIsFallbackMode(true);
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

  return { messages, setMessages, isConnected, isFallbackMode, sendMessage };
}
