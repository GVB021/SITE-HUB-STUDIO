import { useState, useEffect, useRef } from "react";
import { useAuth } from "@studio/hooks/use-auth";

interface StudioEvent {
  type: 'user_entered' | 'user_left' | 'recording_started' | 'recording_stopped' | 'upload_started' | 'upload_completed' | 'permission_changed';
  data: any;
  timestamp: Date;
  userName?: string;
  message?: string;
}

export function useStudioEvents(studioId: string) {
  const [events, setEvents] = useState<StudioEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();

  const MAX_EVENTS = 100; // Keep only last 100 events

  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/video-sync`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('[StudioEvents] WebSocket connected');
        setIsConnected(true);
        
        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Only process events for this studio
          if (message.studioId !== studioId) {
            return;
          }

          const studioEvent: StudioEvent = {
            type: message.type,
            data: message.data,
            timestamp: new Date(),
            userName: message.userName || message.user?.displayName || message.user?.fullName || 'Usuário',
            message: message.message,
          };

          setEvents(prev => {
            const newEvents = [studioEvent, ...prev];
            return newEvents.slice(0, MAX_EVENTS);
          });
        } catch (err) {
          console.error('[StudioEvents] Error parsing WebSocket message:', err);
        }
      };

      wsRef.current.onclose = () => {
        console.log('[StudioEvents] WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 5000);
      };

      wsRef.current.onerror = (err) => {
        console.error('[StudioEvents] WebSocket error:', err);
        setIsConnected(false);
      };

    } catch (err) {
      console.error('[StudioEvents] Failed to create WebSocket connection:', err);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    if (!studioId) return;

    connectWebSocket();

    return () => {
      // Cleanup
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [studioId]);

  const clearEvents = () => {
    setEvents([]);
  };

  return {
    events,
    isConnected,
    clearEvents,
  };
}
