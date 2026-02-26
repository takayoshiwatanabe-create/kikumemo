import { useState, useEffect, useRef, useCallback } from "react";

interface WebSocketOptions {
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  reconnectInterval?: number; // milliseconds
  reconnectLimit?: number;
}

export function useWebSocket(url: string | null, options?: WebSocketOptions) {
  const {
    onOpen,
    onMessage,
    onClose,
    onError,
    reconnectInterval = 3000,
    reconnectLimit = 5,
  } = options || {};

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [error, setError] = useState<Event | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const shouldReconnect = useRef(true); // Flag to control manual disconnect vs. unexpected close

  const connect = useCallback(() => {
    if (!url || wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    shouldReconnect.current = true;
    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = (event) => {
      console.log("WebSocket opened:", url);
      setIsConnected(true);
      reconnectAttempts.current = 0; // Reset reconnect attempts on successful connection
      onOpen?.(event);
    };

    wsRef.current.onmessage = (event) => {
      setLastMessage(event);
      onMessage?.(event);
    };

    wsRef.current.onclose = (event) => {
      console.log("WebSocket closed:", url, event.code, event.reason);
      setIsConnected(false);
      onClose?.(event);

      if (shouldReconnect.current && reconnectAttempts.current < reconnectLimit) {
        reconnectAttempts.current++;
        console.log(`Attempting to reconnect in ${reconnectInterval / 1000}s (attempt ${reconnectAttempts.current}/${reconnectLimit})...`);
        setTimeout(connect, reconnectInterval);
      } else if (shouldReconnect.current) {
        console.warn("WebSocket reconnect limit reached.");
        setError(new Event("WebSocketReconnectLimitReached"));
      }
    };

    wsRef.current.onerror = (event) => {
      console.error("WebSocket error:", url, event);
      setError(event);
      onError?.(event);
      // Error might lead to close, which will trigger reconnect logic
    };
  }, [url, onOpen, onMessage, onClose, onError, reconnectInterval, reconnectLimit]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      shouldReconnect.current = false; // Prevent automatic reconnect
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
      reconnectAttempts.current = 0;
    }
  }, []);

  const send = useCallback((message: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    } else {
      console.warn("WebSocket is not open. Message not sent:", message);
    }
  }, []);

  useEffect(() => {
    if (url) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [url, connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    error,
    send,
    disconnect,
    connect, // Expose connect to allow manual reconnection if needed
  };
}

