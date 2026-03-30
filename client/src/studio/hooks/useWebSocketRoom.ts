import { useEffect, useRef, useCallback, useState } from 'react';
import { logger } from '@studio/lib/logger';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface UseWebSocketRoomOptions {
  sessionId: string;
  studioId: string;
  userId: string;
  onMessage?: (message: WebSocketMessage) => void;
  enabled?: boolean;
}

const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

/**
 * Hook para gerenciar conexão WebSocket da sala com reconexão automática
 */
export function useWebSocketRoom(options: UseWebSocketRoomOptions) {
  const { sessionId, studioId, userId, onMessage, enabled = true } = options;
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const [hasShownReconnectToast, setHasShownReconnectToast] = useState(false);

  const roomLogger = logger.withContext({
    component: 'WebSocketRoom',
    sessionId,
    userId,
  });

  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/video-sync`;
      
      roomLogger.info('Connecting to WebSocket', { wsUrl });
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        roomLogger.info('WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        setHasShownReconnectToast(false);

        // Enviar join message
        ws.send(JSON.stringify({
          type: 'join',
          sessionId,
          userId,
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          roomLogger.debug('WebSocket message received', { type: message.type });
          onMessage?.(message);
        } catch (error) {
          roomLogger.error('Failed to parse WebSocket message', { error });
        }
      };

      ws.onerror = (error) => {
        roomLogger.error('WebSocket error', { error });
      };

      ws.onclose = () => {
        roomLogger.warn('WebSocket disconnected');
        setIsConnected(false);

        // Tentar reconectar
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const attempt = reconnectAttemptsRef.current + 1;
          reconnectAttemptsRef.current = attempt;

          // Backoff exponencial com jitter
          const baseDelay = Math.min(
            BASE_RECONNECT_DELAY * Math.pow(2, attempt - 1),
            MAX_RECONNECT_DELAY
          );
          const jitter = Math.random() * 1000;
          const delay = baseDelay + jitter;

          roomLogger.info('Reconnecting WebSocket', { attempt, delay });

          if (attempt === 1 && !hasShownReconnectToast) {
            setHasShownReconnectToast(true);
          }

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          roomLogger.error('Max reconnection attempts reached');
        }
      };
    } catch (error) {
      roomLogger.error('Failed to create WebSocket', { error });
    }
  }, [enabled, sessionId, studioId, userId, onMessage, roomLogger, hasShownReconnectToast]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const send = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      roomLogger.debug('WebSocket message sent', { type: message.type });
    } else {
      roomLogger.warn('Cannot send message - WebSocket not connected', { 
        type: message.type,
        readyState: wsRef.current?.readyState 
      });
    }
  }, [roomLogger]);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected,
    send,
    disconnect,
    reconnectAttempts: reconnectAttemptsRef.current,
  };
}
