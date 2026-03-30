import { useCallback, useRef } from 'react';
import { logger } from '@studio/lib/logger';

interface VideoSyncMessage {
  type: 'video-play' | 'video-pause' | 'video-seek' | 'video-rate';
  timestamp?: number;
  playbackRate?: number;
  userId?: string;
}

interface UseVideoSyncOptions {
  sessionId: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  onSync?: (message: VideoSyncMessage) => void;
  sendMessage: (message: any) => void;
  isPrivileged: boolean;
}

/**
 * Hook para sincronizar vídeo entre múltiplos usuários via WebSocket
 * Diretor controla, outros seguem
 */
export function useVideoSync(options: UseVideoSyncOptions) {
  const { sessionId, videoRef, onSync, sendMessage, isPrivileged } = options;
  const isSyncingRef = useRef(false);
  
  const roomLogger = logger.withContext({
    component: 'VideoSync',
    sessionId,
  });

  /**
   * Envia comando de play para todos
   */
  const syncPlay = useCallback(() => {
    if (!isPrivileged || !videoRef.current) return;

    const timestamp = videoRef.current.currentTime;
    roomLogger.debug('Syncing play', { timestamp });

    sendMessage({
      type: 'video-play',
      timestamp,
    });
  }, [isPrivileged, videoRef, sendMessage, roomLogger]);

  /**
   * Envia comando de pause para todos
   */
  const syncPause = useCallback(() => {
    if (!isPrivileged || !videoRef.current) return;

    const timestamp = videoRef.current.currentTime;
    roomLogger.debug('Syncing pause', { timestamp });

    sendMessage({
      type: 'video-pause',
      timestamp,
    });
  }, [isPrivileged, videoRef, sendMessage, roomLogger]);

  /**
   * Envia comando de seek para todos
   */
  const syncSeek = useCallback((timestamp: number) => {
    if (!isPrivileged) return;

    roomLogger.debug('Syncing seek', { timestamp });

    sendMessage({
      type: 'video-seek',
      timestamp,
    });
  }, [isPrivileged, sendMessage, roomLogger]);

  /**
   * Envia mudança de velocidade de reprodução
   */
  const syncPlaybackRate = useCallback((rate: number) => {
    if (!isPrivileged) return;

    roomLogger.debug('Syncing playback rate', { rate });

    sendMessage({
      type: 'video-rate',
      playbackRate: rate,
    });
  }, [isPrivileged, sendMessage, roomLogger]);

  /**
   * Processa mensagem de sincronização recebida
   */
  const handleSyncMessage = useCallback((message: VideoSyncMessage) => {
    if (isPrivileged || !videoRef.current || isSyncingRef.current) {
      return; // Diretor não recebe sync, apenas envia
    }

    isSyncingRef.current = true;

    try {
      const video = videoRef.current;

      switch (message.type) {
        case 'video-play':
          if (message.timestamp !== undefined) {
            video.currentTime = message.timestamp;
          }
          video.play().catch((err) => {
            roomLogger.warn('Failed to sync play', { error: err.message });
          });
          roomLogger.debug('Video synced: play', { timestamp: message.timestamp });
          break;

        case 'video-pause':
          if (message.timestamp !== undefined) {
            video.currentTime = message.timestamp;
          }
          video.pause();
          roomLogger.debug('Video synced: pause', { timestamp: message.timestamp });
          break;

        case 'video-seek':
          if (message.timestamp !== undefined) {
            video.currentTime = message.timestamp;
            roomLogger.debug('Video synced: seek', { timestamp: message.timestamp });
          }
          break;

        case 'video-rate':
          if (message.playbackRate !== undefined) {
            video.playbackRate = message.playbackRate;
            roomLogger.debug('Video synced: rate', { rate: message.playbackRate });
          }
          break;
      }

      onSync?.(message);
    } catch (error) {
      roomLogger.error('Error processing sync message', { error, message });
    } finally {
      // Permitir próxima sincronização após pequeno delay
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 100);
    }
  }, [isPrivileged, videoRef, onSync, roomLogger]);

  return {
    syncPlay,
    syncPause,
    syncSeek,
    syncPlaybackRate,
    handleSyncMessage,
  };
}
