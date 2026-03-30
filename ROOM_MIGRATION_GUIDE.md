# Guia de Migração - RecordingRoom Refatorado

Este documento explica como aplicar os novos hooks e componentes no `room.tsx` existente.

---

## 📋 Checklist de Migração

### Fase 1: Preparação
- [x] Criar sistema de logging
- [x] Criar hooks customizados
- [x] Criar componentes UI reutilizáveis
- [ ] Backup do room.tsx original
- [ ] Aplicar mudanças incrementalmente
- [ ] Testar cada mudança

### Fase 2: Substituições

#### 1. Substituir console.logs

**Antes:**
```typescript
console.log('[Room] Initializing session', sessionId);
console.error('[Room] Failed to connect', error);
```

**Depois:**
```typescript
import { useRoomLogger } from '@studio/hooks/useRoomLogger';

const logger = useRoomLogger({ sessionId, userId: user?.id, studioId });

logger.info('Initializing session');
logger.error('Failed to connect', { error });
```

**Impacto:** Remove ~75 console.logs, adiciona contexto automático.

---

#### 2. Substituir lógica de permissões

**Antes:**
```typescript
// Espalhado em vários lugares
const isPrivileged = user?.role === 'owner' || studioRole === 'admin' || isDirector;
const canControl = isDirector || hasTextControl;
const canApprove = isPrivileged;
// ... mais 20+ verificações duplicadas
```

**Depois:**
```typescript
import { useRoomPermissions } from '@studio/hooks/useRoomPermissions';

const permissions = useRoomPermissions({
  user,
  studioRole,
  hasTextControl,
  isDirector
});

// Usar em qualquer lugar
if (permissions.canControlVideo) { /* ... */ }
if (permissions.canApproveTake) { /* ... */ }
```

**Impacto:** Centraliza permissões, remove ~200 linhas duplicadas.

---

#### 3. Substituir estado de gravação

**Antes:**
```typescript
const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');

// Sem validação de transições
const startRecording = () => {
  setRecordingStatus('recording'); // Pode criar estado inválido
};
```

**Depois:**
```typescript
import { useRecordingStateMachine } from '@studio/hooks/useRecordingStateMachine';

const {
  recordingStatus,
  transitionTo,
  isRecording,
  isCountdown
} = useRecordingStateMachine({
  sessionId,
  onStateChange: (from, to) => {
    logger.info('Recording state changed', { from, to });
  }
});

// Transições validadas
transitionTo('recording'); // ✅ Só permite se transição for válida
```

**Impacto:** Previne bugs de estado, adiciona logging automático.

---

#### 4. Substituir WebSocket

**Antes:**
```typescript
const wsRef = useRef<WebSocket | null>(null);
const [reconnectAttempts, setReconnectAttempts] = useState(0);

useEffect(() => {
  const ws = new WebSocket(wsUrl);
  
  ws.onopen = () => { /* ... */ };
  ws.onmessage = (e) => { /* ... */ };
  ws.onerror = () => { /* ... */ };
  ws.onclose = () => {
    // Lógica complexa de reconexão
    setTimeout(() => connectWebSocket(), delay);
  };
  
  return () => ws.close();
}, []);

// ~250 linhas de lógica WS
```

**Depois:**
```typescript
import { useWebSocketRoom } from '@studio/hooks/useWebSocketRoom';

const { isConnected, send } = useWebSocketRoom({
  sessionId,
  userId: user?.id!,
  enabled: true,
  onMessage: (message) => {
    if (message.type === 'video-sync') {
      handleVideoSync(message);
    }
  }
});

// Enviar mensagem
send({ type: 'video-play', timestamp: videoRef.current?.currentTime });
```

**Impacto:** Remove ~250 linhas, reconexão robusta automática.

---

#### 5. Substituir lógica de áudio

**Antes:**
```typescript
const [micState, setMicState] = useState<MicrophoneState | null>(null);

const initMic = async () => {
  try {
    const state = await requestMicrophone();
    setMicState(state);
  } catch (error) {
    console.error('Mic error', error);
    toast.error('Erro ao acessar microfone');
  }
};

const startRec = async () => {
  await startCapture(micState);
};

const stopRec = async () => {
  const data = await stopCapture(micState);
  const quality = analyzeTakeQuality(data);
  const wav = encodeWav(data, micState.sampleRate, 1);
  const blob = wavToBlob(wav);
  // ... mais processamento
};

// ~300 linhas de lógica de áudio
```

**Depois:**
```typescript
import { useAudioRecording } from '@studio/hooks/useAudioRecording';

const {
  initializeMicrophone,
  startRecording,
  stopRecording,
  hasAudioPermission
} = useAudioRecording({
  sessionId,
  onRecordingComplete: (blob, metrics) => {
    logger.info('Recording done', { quality: metrics.score });
    uploadTake(blob);
  },
  onError: (error) => {
    toast.error(error.message);
  }
});

// Uso simples
await initializeMicrophone();
await startRecording();
const result = await stopRecording();
```

**Impacto:** Remove ~300 linhas, análise de qualidade automática.

---

#### 6. Adicionar sincronização de vídeo

**Novo:**
```typescript
import { useVideoSync } from '@studio/hooks/useVideoSync';

const videoSync = useVideoSync({
  sessionId,
  videoRef,
  sendMessage: wsSend,
  isPrivileged: permissions.isPrivileged,
  onSync: (message) => {
    logger.debug('Video synced', { type: message.type });
  }
});

// Diretor controla
const handlePlay = () => {
  videoRef.current?.play();
  videoSync.syncPlay();
};

// Outros recebem via WebSocket
onMessage={(msg) => {
  if (msg.type.startsWith('video-')) {
    videoSync.handleSyncMessage(msg);
  }
}}
```

---

#### 7. Adicionar contagem regressiva

**Novo:**
```typescript
import { useCountdown } from '@studio/hooks/useCountdown';

const countdown = useCountdown({
  sessionId,
  countdownSeconds: 3,
  audioContext: micState?.audioContext,
  onComplete: async () => {
    await startRecording();
    transitionTo('recording');
  },
  onCancel: () => {
    transitionTo('idle');
  }
});

// Iniciar gravação com countdown
const handleRecord = () => {
  transitionTo('countdown');
  countdown.start();
};

// UI do countdown
{countdown.isActive && (
  <div className="text-6xl font-bold">
    {countdown.count}
  </div>
)}
```

---

#### 8. Usar componentes visuais

**Antes:**
```typescript
<button 
  onClick={isRecording ? handleStop : handleStart}
  className={cn(
    "px-4 py-2 rounded",
    isRecording && "bg-red-500 animate-pulse"
  )}
>
  {isRecording ? 'PARAR' : 'REC'}
</button>
```

**Depois:**
```typescript
import { RecordingButton } from '@studio/components/room/RecordingButton';
import { StatusBadge } from '@studio/components/room/StatusBadge';

<RecordingButton
  recordingStatus={recordingStatus}
  onStart={handleStart}
  onStop={handleStop}
  disabled={!hasAudioPermission}
/>

<StatusBadge status={recordingStatus} />
```

---

## 🎯 Exemplo Completo - RecordingRoom Refatorado

```typescript
import { useParams } from 'wouter';
import { useAuth } from '@studio/hooks/use-auth';
import { useRoomLogger } from '@studio/hooks/useRoomLogger';
import { useRoomPermissions } from '@studio/hooks/useRoomPermissions';
import { useRecordingStateMachine } from '@studio/hooks/useRecordingStateMachine';
import { useWebSocketRoom } from '@studio/hooks/useWebSocketRoom';
import { useAudioRecording } from '@studio/hooks/useAudioRecording';
import { useVideoSync } from '@studio/hooks/useVideoSync';
import { useCountdown } from '@studio/hooks/useCountdown';
import { RecordingButton } from '@studio/components/room/RecordingButton';
import { StatusBadge } from '@studio/components/room/StatusBadge';
import { RoomErrorBoundary } from '@studio/components/room/ErrorBoundary';

export default function RecordingRoom() {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Logging contextualizado
  const logger = useRoomLogger({ 
    sessionId, 
    userId: user?.id, 
    studioId 
  });
  
  // Permissões calculadas
  const permissions = useRoomPermissions({
    user,
    studioRole,
    hasTextControl,
    isDirector
  });
  
  // Estado de gravação validado
  const {
    recordingStatus,
    transitionTo,
    isRecording
  } = useRecordingStateMachine({
    sessionId,
    onStateChange: (from, to) => {
      logger.info('State transition', { from, to });
    }
  });
  
  // WebSocket com reconexão
  const { isConnected, send } = useWebSocketRoom({
    sessionId,
    userId: user?.id!,
    onMessage: handleWebSocketMessage
  });
  
  // Sincronização de vídeo
  const videoSync = useVideoSync({
    sessionId,
    videoRef,
    sendMessage: send,
    isPrivileged: permissions.isPrivileged,
  });
  
  // Gravação de áudio
  const {
    initializeMicrophone,
    startRecording,
    stopRecording,
    hasAudioPermission
  } = useAudioRecording({
    sessionId,
    onRecordingComplete: handleTakeComplete,
    onError: (error) => toast.error(error.message)
  });
  
  // Contagem regressiva
  const countdown = useCountdown({
    sessionId,
    audioContext: micState?.audioContext,
    onComplete: async () => {
      await startRecording();
      transitionTo('recording');
    }
  });
  
  // Handlers simplificados
  const handleRecord = async () => {
    if (!permissions.canManageAudio) {
      logger.warn('User cannot record');
      return;
    }
    
    await initializeMicrophone();
    transitionTo('countdown');
    countdown.start();
  };
  
  const handleStop = async () => {
    transitionTo('stopping');
    const result = await stopRecording();
    transitionTo('recorded');
    logger.info('Recording stopped', { quality: result.metrics.score });
  };
  
  const handlePlay = () => {
    videoRef.current?.play();
    videoSync.syncPlay();
  };
  
  function handleWebSocketMessage(message: any) {
    if (message.type.startsWith('video-')) {
      videoSync.handleSyncMessage(message);
    }
  }
  
  return (
    <RoomErrorBoundary>
      <div className="recording-room">
        {/* Status */}
        <StatusBadge status={recordingStatus} />
        
        {/* Countdown visual */}
        {countdown.isActive && (
          <div className="countdown-overlay">
            <span className="text-6xl">{countdown.count}</span>
          </div>
        )}
        
        {/* Controles */}
        <RecordingButton
          recordingStatus={recordingStatus}
          onStart={handleRecord}
          onStop={handleStop}
          disabled={!hasAudioPermission}
        />
        
        {/* Vídeo */}
        <video ref={videoRef} onPlay={handlePlay} />
      </div>
    </RoomErrorBoundary>
  );
}
```

---

## 📊 Resultado Esperado

### Antes
```
room.tsx: 3.415 linhas
- Lógica misturada
- console.logs dispersos
- Difícil testar
- Re-renders excessivos
```

### Depois
```
room.tsx: ~800 linhas (redução de 76%)
- Hooks especializados
- Logging estruturado
- Componentes testáveis
- Performance otimizada
```

---

## ✅ Validação

Após migração, validar:

1. **Funcionalidade**
   - ✅ Gravação funciona
   - ✅ Sincronização de vídeo funciona
   - ✅ WebSocket reconecta
   - ✅ Permissões respeitadas

2. **Performance**
   - ✅ Menos re-renders
   - ✅ Memória estável
   - ✅ CPU reduzida

3. **Logs**
   - ✅ Logs estruturados
   - ✅ Contexto presente
   - ✅ Sem console.log

---

## 🚀 Próximos Passos

1. Aplicar migração em branch separada
2. Testar cada hook individualmente
3. Testar fluxo completo de gravação
4. Validar em produção (staging)
5. Monitorar métricas pós-deploy

---

**Documentação completa:** `client/src/studio/hooks/README.md`
