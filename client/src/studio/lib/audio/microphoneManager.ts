const SAMPLE_RATE = 48000;
const FFT_SIZE = 2048;

export type VoiceCaptureMode = "studio" | "original" | "high-fidelity";

export interface MicrophoneState {
  stream: MediaStream;
  audioContext: AudioContext;
  sourceNode: MediaStreamAudioSourceNode;
  gainNode: GainNode;
  analyserNode: AnalyserNode;
  captureMode: VoiceCaptureMode;
  filterNodes: AudioNode[];
  workletNode?: AudioWorkletNode;
}

let currentState: MicrophoneState | null = null;

async function resumeIfSuspended(ctx: AudioContext): Promise<void> {
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
      console.log("[Mic] AudioContext resumed from suspended");
    } catch (e) {
      console.warn("[Mic] Failed to resume AudioContext:", e);
    }
  }
}

export async function requestMicrophone(
  mode: VoiceCaptureMode = "original",
  deviceId?: string
): Promise<MicrophoneState> {
  if (currentState && currentState.audioContext.state !== "closed") {
    // If asking for same mode AND same device (or no device specified and we have one), return current
    const currentTrack = currentState.stream.getAudioTracks()[0];
    const currentDeviceId = currentTrack.getSettings().deviceId;
    
    if (currentState.captureMode === mode && (!deviceId || currentDeviceId === deviceId)) {
      return currentState;
    }
  }

  const isStudio = mode === "studio";
  const isHighFidelity = mode === "high-fidelity";
  
  let stream: MediaStream | undefined;
  try {
    const constraints: MediaTrackConstraints = {
      sampleRate: SAMPLE_RATE,
      channelCount: 1,
    };

    if (deviceId) {
      constraints.deviceId = { exact: deviceId };
    }

    if (isHighFidelity) {
      // Strict constraints for lossless/raw capture
      Object.assign(constraints, {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        highpassFilter: false,
        sampleSize: 24, // Attempt 24-bit capture if supported
      });
    } else {
      Object.assign(constraints, {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      });
    }

    stream = await navigator.mediaDevices.getUserMedia({
      audio: constraints,
    });
  } catch (err: any) {
    console.error("[Mic] getUserMedia failed for mode", mode, {
      name: err?.name,
      message: err?.message,
      constraintName: err?.constraint,
      deviceId: deviceId || "default",
    });
    
    // If user explicitly denied permission, don't try fallbacks
    if (err?.name === 'NotAllowedError') {
      throw new Error("Permissão de microfone negada pelo usuário. Por favor,允许 o acesso ao microfone nas configurações do navegador.");
    }
    
    // Try progressive fallbacks
    const fallbackAttempts = [
      // Attempt 1: Same constraints but without specific deviceId
      ...(deviceId ? [{
        name: "default device",
        constraints: {
          sampleRate: SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        }
      }] : []),
      // Attempt 2: Minimal constraints without sampleRate/channelCount
      {
        name: "minimal constraints",
        constraints: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        }
      },
      // Attempt 3: Absolute minimal - just audio: true
      {
        name: "basic audio",
        constraints: true as any
      }
    ];

    for (const attempt of fallbackAttempts) {
      try {
        console.warn(`[Mic] Trying fallback: ${attempt.name}`);
        stream = await navigator.mediaDevices.getUserMedia({
          audio: attempt.constraints,
        });
        console.warn(`[Mic] Fallback succeeded: ${attempt.name}`);
        break;
      } catch (fallbackErr: any) {
        console.error(`[Mic] Fallback failed: ${attempt.name}`, {
          name: fallbackErr?.name,
          message: fallbackErr?.message,
        });
        
        // If user denied permission, stop trying fallbacks
        if (fallbackErr?.name === 'NotAllowedError') {
          throw new Error("Permissão de microfone negada pelo usuário. Por favor,允许 o acesso ao microfone nas configurações do navegador.");
        }
        // Continue to next fallback attempt
      }
    }

    // If all fallbacks failed and we have existing state, keep it
    if (!stream && currentState && currentState.audioContext.state !== "closed") {
      console.log("[Mic] All fallbacks failed, keeping existing mic state");
      return currentState;
    }

    // If we still don't have a stream, throw the original error
    if (!stream) {
      throw err;
    }
  }

  if (currentState && currentState.audioContext.state !== "closed") {
    await releaseMicrophoneAsync();
  }

  const audioContext = new AudioContext({ 
    sampleRate: SAMPLE_RATE,
    latencyHint: "interactive"
  });
  
  await resumeIfSuspended(audioContext);

  const sourceNode = audioContext.createMediaStreamSource(stream);
  const gainNode = audioContext.createGain();
  gainNode.gain.value = 1.0;

  const analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = FFT_SIZE;
  analyserNode.smoothingTimeConstant = 0.6;
  analyserNode.minDecibels = -90;
  analyserNode.maxDecibels = 0;

  const filterNodes: AudioNode[] = [];

  if (isStudio) {
    // Studio mode: RAW capture without processing
    sourceNode.connect(gainNode);
    console.log("[Mic] Studio mode: RAW capture (no processing)");
  } else if (isHighFidelity) {
    // Direct path for high fidelity
    sourceNode.connect(gainNode);
    console.log("[Mic] High-Fidelity mode: RAW capture (24-bit/48kHz requested)");
  } else {
    sourceNode.connect(gainNode);
    console.log("[Mic] Original mode: source → gain (no processing)");
  }

  gainNode.connect(analyserNode);

  currentState = {
    stream,
    audioContext,
    sourceNode,
    gainNode,
    analyserNode,
    captureMode: mode,
    filterNodes,
  };
  return currentState;
}

export function getFrequencyData(state: MicrophoneState): Uint8Array {
  const data = new Uint8Array(state.analyserNode.frequencyBinCount);
  state.analyserNode.getByteFrequencyData(data);
  return data;
}

export function getTimeDomainData(state: MicrophoneState): Uint8Array {
  const data = new Uint8Array(state.analyserNode.fftSize);
  state.analyserNode.getByteTimeDomainData(data);
  return data;
}

export function getAnalyserData(state: MicrophoneState): Uint8Array {
  return getFrequencyData(state);
}

export function setGain(state: MicrophoneState, value: number): void {
  // 🔒 CRITICAL FIX: Prevent crash when audioContext is undefined
  if (!state?.audioContext) {
    console.warn("[Mic] AudioContext not available, cannot set gain");
    return;
  }
  const clamped = Math.max(0, Math.min(2, value));
  state.gainNode.gain.setTargetAtTime(clamped, state.audioContext.currentTime, 0.01);
}

async function releaseMicrophoneAsync(): Promise<void> {
  if (!currentState) return;
  currentState.stream.getTracks().forEach((t) => t.stop());
  if (currentState.audioContext.state !== "closed") {
    await currentState.audioContext.close().catch(() => {});
  }
  currentState = null;
}

export function releaseMicrophone(): void {
  if (!currentState) return;
  currentState.stream.getTracks().forEach((t) => t.stop());
  if (currentState.audioContext.state !== "closed") {
    currentState.audioContext.close().catch(() => {});
  }
  currentState = null;
}

export function getMicState(): MicrophoneState | null {
  return currentState;
}

export function getEstimatedInputLatencyMs(state: MicrophoneState): number {
  // 🔒 CRITICAL FIX: Prevent crash when audioContext is undefined
  if (!state?.audioContext) {
    console.warn("[Mic] AudioContext not available, returning default latency");
    return 10; // Safe default latency in ms
  }
  const baseLatency = Number(state.audioContext.baseLatency || 0);
  const outputLatency = Number((state.audioContext as any).outputLatency || 0);
  return (baseLatency + outputLatency) * 1000;
}
