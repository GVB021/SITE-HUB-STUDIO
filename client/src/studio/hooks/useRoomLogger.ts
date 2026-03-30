import { useMemo } from 'react';
import { logger } from '@studio/lib/logger';

interface RoomLoggerContext {
  sessionId: string;
  userId?: string;
  studioId?: string;
}

/**
 * Hook que fornece logger com contexto da sala de gravação
 */
export function useRoomLogger(context: RoomLoggerContext) {
  return useMemo(() => {
    return logger.withContext({
      component: 'RecordingRoom',
      sessionId: context.sessionId,
      userId: context.userId || 'unknown',
      studioId: context.studioId || 'unknown',
    });
  }, [context.sessionId, context.userId, context.studioId]);
}
