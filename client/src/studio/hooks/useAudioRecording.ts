import { useState, useCallback, useRef } from 'react';
import { logger } from '@studio/lib/logger';
import {
  requestMicrophone,
  releaseMicrophone,
  type MicrophoneState,
} from '@studio/lib/audio/microphoneManager';
import {
  startCapture,
  stopCapture,
  type RecordingResult,
} from '@studio/lib/audio/recordingEngine';
import {
  encodeWav,
  wavToBlob,
} from '@studio/lib/audio/wavEncoder';
import { analyzeTakeQuality, type QualityMetrics } from '@studio/lib/audio/qualityAnalysis';

interface UseAudioRecordingOptions {
  sessionId: string;
  onRecordingComplete?: (blob: Blob, metrics: QualityMetrics) => void;
  onError?: (error: Error) => void;
}

export interface RecordingData {
  blob: Blob;
  metrics: QualityMetrics;
  duration: number;
}

/**
 * Hook para gerenciar gravação de áudio com microfone
 * Encapsula toda a lógica de captura, processamento e qualidade
 */
export function useAudioRecording(options: UseAudioRecordingOptions) {
  const { sessionId, onRecordingComplete, onError } = options;
  const [micState, setMicState] = useState<MicrophoneState | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const initPromiseRef = useRef<Promise<MicrophoneState> | null>(null);

  const roomLogger = logger.withContext({
    component: 'AudioRecording',
    sessionId,
  });

  /**
   * Inicializa o microfone com fallbacks progressivos
   */
  const initializeMicrophone = useCallback(async () => {
    if (micState) {
      roomLogger.debug('Microphone already initialized');
      return micState;
    }

    if (initPromiseRef.current) {
      roomLogger.debug('Microphone initialization in progress');
      return initPromiseRef.current;
    }

    setIsInitializing(true);
    roomLogger.info('Initializing microphone');

    const promise = requestMicrophone()
      .then((state) => {
        setMicState(state);
        setIsInitializing(false);
        initPromiseRef.current = null;
        roomLogger.info('Microphone initialized successfully', {
          sampleRate: state.audioContext.sampleRate,
          channelCount: state.stream.getAudioTracks()[0]?.getSettings().channelCount || 1,
        });
        return state;
      })
      .catch((error) => {
        setIsInitializing(false);
        initPromiseRef.current = null;
        roomLogger.error('Failed to initialize microphone', { error: error.message });
        onError?.(error);
        throw error;
      });

    initPromiseRef.current = promise;
    return promise;
  }, [micState, roomLogger, onError]);

  /**
   * Inicia captura de áudio
   */
  const startRecording = useCallback(async () => {
    if (!micState) {
      roomLogger.warn('Cannot start recording - microphone not initialized');
      throw new Error('Microphone not initialized');
    }

    try {
      roomLogger.info('Starting audio capture');
      await startCapture(micState);
      roomLogger.debug('Audio capture started successfully');
    } catch (error) {
      roomLogger.error('Failed to start audio capture', { error });
      onError?.(error as Error);
      throw error;
    }
  }, [micState, roomLogger, onError]);

  /**
   * Para captura e processa o áudio gravado
   */
  const stopRecording = useCallback(async (): Promise<RecordingData> => {
    if (!micState) {
      roomLogger.warn('Cannot stop recording - microphone not initialized');
      throw new Error('Microphone not initialized');
    }

    try {
      roomLogger.info('Stopping audio capture');
      const result: RecordingResult = await stopCapture(micState);

      if (!result.samples || result.samples.length === 0) {
        throw new Error('No audio data captured');
      }

      roomLogger.debug('Audio data captured', { 
        samples: result.samples.length,
        duration: result.durationSeconds 
      });

      // Analisar qualidade
      const metrics = analyzeTakeQuality(result.samples);
      roomLogger.info('Audio quality analyzed', { score: metrics.score });

      // Codificar WAV (encodeWav usa constantes internas para sampleRate e channels)
      const wavData = encodeWav(result.samples);
      const blob = wavToBlob(wavData);

      roomLogger.info('Recording processed successfully', {
        duration: result.durationSeconds,
        qualityScore: metrics.score,
        size: blob.size,
      });

      const recordingData: RecordingData = {
        blob,
        metrics,
        duration: result.durationSeconds,
      };

      onRecordingComplete?.(blob, metrics);
      return recordingData;
    } catch (error) {
      roomLogger.error('Failed to stop and process recording', { error });
      onError?.(error as Error);
      throw error;
    }
  }, [micState, roomLogger, onRecordingComplete, onError]);

  /**
   * Libera recursos do microfone
   */
  const cleanup = useCallback(() => {
    if (micState) {
      roomLogger.info('Releasing microphone resources');
      releaseMicrophone();
      setMicState(null);
    }
  }, [micState, roomLogger]);

  return {
    micState,
    isInitializing,
    initializeMicrophone,
    startRecording,
    stopRecording,
    cleanup,
    hasAudioPermission: !!micState,
  };
}
