/**
 * Barrel export para hooks customizados do RecordingRoom
 * Facilita importação: import { useRoomLogger, useRoomPermissions } from '@studio/hooks'
 */

export { useRoomLogger } from './useRoomLogger';
export { useRoomPermissions, type UserPermissions } from './useRoomPermissions';
export { useRecordingStateMachine } from './useRecordingStateMachine';
export { useWebSocketRoom } from './useWebSocketRoom';
export { useAudioRecording, type RecordingData } from './useAudioRecording';
export { useVideoSync } from './useVideoSync';
export { useCountdown } from './useCountdown';

// Re-export hooks existentes para conveniência
export { useAuth } from './use-auth';
export { useStudioRole } from './use-studio-role';
export { useToast } from './use-toast';
