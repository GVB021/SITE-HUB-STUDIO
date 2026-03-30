import { MicrophoneState } from './microphoneManager';
import { THRESHOLDS, VALIDATION } from '@studio/constants/timing';

export async function validateMicrophoneBeforeRecording(
  micState: MicrophoneState | null
): Promise<void> {
  if (!micState) {
    throw new Error("Microfone não inicializado");
  }

  if (!micState.stream || !micState.stream.active) {
    throw new Error("Stream de microfone não está ativa");
  }

  const audioTracks = micState.stream.getAudioTracks();
  if (audioTracks.length === 0 || !audioTracks[0].enabled) {
    throw new Error("Nenhuma track de áudio disponível ou habilitada");
  }

  if (micState.audioContext.state === "suspended") {
    await micState.audioContext.resume();
  }

  const hasSignal = await detectAudioLevel(
    micState,
    VALIDATION.MICROPHONE_DURATION_MS
  );
  
  if (!hasSignal) {
    throw new Error(
      "Nenhum sinal de áudio detectado. Verifique se o microfone está conectado e não está mudo."
    );
  }
}

async function detectAudioLevel(
  micState: MicrophoneState,
  durationMs: number
): Promise<boolean> {
  return new Promise((resolve) => {
    const analyser = micState.audioContext.createAnalyser();
    const source = micState.audioContext.createMediaStreamSource(micState.stream);
    
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    source.connect(analyser);
    
    let maxLevel = 0;
    const startTime = Date.now();
    
    const checkLevel = () => {
      analyser.getByteTimeDomainData(dataArray);
      
      for (let i = 0; i < bufferLength; i++) {
        const normalized = Math.abs(dataArray[i] - 128) / 128;
        maxLevel = Math.max(maxLevel, normalized);
      }
      
      if (Date.now() - startTime < durationMs) {
        requestAnimationFrame(checkLevel);
      } else {
        source.disconnect();
        analyser.disconnect();
        resolve(maxLevel > VALIDATION.AUDIO_LEVEL_MIN_THRESHOLD);
      }
    };
    
    checkLevel();
  });
}
