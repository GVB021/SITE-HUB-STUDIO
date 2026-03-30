import { useState, useCallback, useRef } from 'react';
import { isValidTransition, type RecordingState } from '@studio/lib/recordingStateMachine';
import { logger } from '@studio/lib/logger';

interface UseRecordingStateMachineOptions {
  onStateChange?: (from: RecordingState, to: RecordingState) => void;
  sessionId: string;
}

/**
 * Hook para gerenciar a máquina de estados de gravação com validação
 */
export function useRecordingStateMachine(options: UseRecordingStateMachineOptions) {
  const { onStateChange, sessionId } = options;
  const [recordingStatus, setRecordingStatus] = useState<RecordingState>('idle');
  const previousStateRef = useRef<RecordingState>('idle');

  const transitionTo = useCallback((newState: RecordingState, force = false) => {
    const currentState = recordingStatus;

    if (!force && !isValidTransition(currentState, newState)) {
      logger.warn('Invalid recording state transition blocked', {
        sessionId,
        from: currentState,
        to: newState,
      });
      return false;
    }

    logger.debug('Recording state transition', {
      sessionId,
      from: currentState,
      to: newState,
    });

    previousStateRef.current = currentState;
    setRecordingStatus(newState);
    onStateChange?.(currentState, newState);
    return true;
  }, [recordingStatus, sessionId, onStateChange]);

  const resetToIdle = useCallback(() => {
    transitionTo('idle', true);
  }, [transitionTo]);

  return {
    recordingStatus,
    previousState: previousStateRef.current,
    transitionTo,
    resetToIdle,
    isIdle: recordingStatus === 'idle',
    isRecording: recordingStatus === 'recording',
    isCountdown: recordingStatus === 'countdown',
    isStopping: recordingStatus === 'stopping',
  };
}
