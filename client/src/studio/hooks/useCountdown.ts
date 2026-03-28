import { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '@studio/lib/logger';
import { playCountdownBeep } from '@studio/lib/audio/recordingEngine';

interface UseCountdownOptions {
  sessionId: string;
  onComplete?: () => void;
  onCancel?: () => void;
  countdownSeconds?: number;
  audioContext?: AudioContext;
}

/**
 * Hook para gerenciar contagem regressiva antes da gravação
 * Com beeps sonoros e cancelamento
 */
export function useCountdown(options: UseCountdownOptions) {
  const { 
    sessionId, 
    onComplete, 
    onCancel,
    countdownSeconds = 3,
    audioContext
  } = options;

  const [count, setCount] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(0);

  const roomLogger = logger.withContext({
    component: 'Countdown',
    sessionId,
  });

  /**
   * Inicia contagem regressiva
   */
  const start = useCallback(() => {
    if (isActive) {
      roomLogger.warn('Countdown already active');
      return;
    }

    roomLogger.info('Starting countdown', { seconds: countdownSeconds });
    setIsActive(true);
    setCount(countdownSeconds);
    startTimeRef.current = Date.now();

    let currentCount = countdownSeconds;

    const tick = () => {
      currentCount -= 1;
      setCount(currentCount);

      // Tocar beep
      if (audioContext) {
        try {
          playCountdownBeep(audioContext, {
            frequency: currentCount === 0 ? 1200 : 880,
            volume: currentCount === 0 ? 0.12 : 0.09,
          });
        } catch (error) {
          roomLogger.warn('Failed to play countdown beep', { error });
        }
      }

      if (currentCount === 0) {
        roomLogger.info('Countdown complete');
        setIsActive(false);
        setCount(null);
        onComplete?.();
      } else {
        timerRef.current = setTimeout(tick, 1000);
      }
    };

    timerRef.current = setTimeout(tick, 1000);
  }, [isActive, countdownSeconds, audioContext, onComplete, roomLogger]);

  /**
   * Cancela contagem regressiva
   */
  const cancel = useCallback(() => {
    if (!isActive) return;

    roomLogger.info('Countdown cancelled', { remainingCount: count });

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }

    setIsActive(false);
    setCount(null);
    onCancel?.();
  }, [isActive, count, onCancel, roomLogger]);

  /**
   * Cleanup ao desmontar
   */
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    count,
    isActive,
    start,
    cancel,
  };
}
