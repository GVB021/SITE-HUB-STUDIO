# Hooks Customizados - RecordingRoom

Este diretório contém hooks reutilizáveis criados para modularizar a lógica do componente RecordingRoom.

## 🎯 Objetivo

Reduzir a complexidade do `room.tsx` (3.415 linhas) extraindo lógicas específicas em hooks testáveis e reutilizáveis.

## 📦 Hooks Disponíveis

### `useRoomLogger`
Logger contextualizado para a sala de gravação.

```typescript
const logger = useRoomLogger({ 
  sessionId, 
  userId, 
  studioId 
});

logger.info('Evento importante', { dados: 'extras' });
logger.error('Erro capturado', { error });
```

### `useRoomPermissions`
Gerenciamento centralizado de permissões do usuário.

```typescript
const permissions = useRoomPermissions({
  user,
  studioRole,
  hasTextControl,
  isDirector
});

if (permissions.canControlVideo) {
  // Usuário pode controlar vídeo
}
```

**Retorna:**
- `isPrivileged`, `isDirector`, `isDubber`
- `canControlVideo`, `canTextControl`, `canManageAudio`
- `canApproveTake`, `canEditScript`, `canNavigateScript`
- etc.

### `useRecordingStateMachine`
Máquina de estados para gravação com validação de transições.

```typescript
const {
  recordingStatus,
  transitionTo,
  resetToIdle,
  isRecording,
  isCountdown
} = useRecordingStateMachine({
  sessionId,
  onStateChange: (from, to) => {
    console.log(`Transição: ${from} → ${to}`);
  }
});

// Tentar transição válida
transitionTo('recording'); // ✅ Permitido se estava em 'countdown'

// Tentar transição inválida
transitionTo('recorded'); // ❌ Bloqueado se estava em 'idle'
```

**Estados válidos:**
- `idle` → `countdown`
- `countdown` → `recording` | `stopping` | `idle`
- `recording` → `stopping`
- `stopping` → `recorded` | `idle`
- `recorded` → `idle` | `previewing`
- `previewing` → `idle`

### `useWebSocketRoom`
Gerenciamento de conexão WebSocket com reconexão automática.

```typescript
const { isConnected, send, reconnectAttempts } = useWebSocketRoom({
  sessionId,
  userId,
  enabled: true,
  onMessage: (message) => {
    if (message.type === 'video-sync') {
      // Processar sincronização de vídeo
    }
  }
});

// Enviar mensagem
send({ 
  type: 'video-play', 
  timestamp: videoRef.current?.currentTime 
});
```

**Features:**
- ✅ Reconexão automática (até 10 tentativas)
- ✅ Backoff exponencial com jitter
- ✅ Logging estruturado de eventos
- ✅ Gestão automática de cleanup

### `useAudioRecording`
Gravação de áudio com análise de qualidade.

```typescript
const {
  micState,
  isInitializing,
  initializeMicrophone,
  startRecording,
  stopRecording,
  cleanup,
  hasAudioPermission
} = useAudioRecording({
  sessionId,
  onRecordingComplete: (blob, metrics) => {
    console.log('Gravação completa:', {
      size: blob.size,
      quality: metrics.score,
      clipping: metrics.clipping
    });
  },
  onError: (error) => {
    toast.error(error.message);
  }
});

// Fluxo de gravação
await initializeMicrophone();
await startRecording();
// ... gravar ...
const result = await stopRecording();
```

**Retorna:**
- `micState`: Estado do microfone
- `isInitializing`: Loading de inicialização
- `initializeMicrophone()`: Solicita permissão
- `startRecording()`: Inicia captura
- `stopRecording()`: Para e processa (retorna blob + metrics)
- `cleanup()`: Libera recursos
- `hasAudioPermission`: Boolean indicando permissão

## 🔧 Uso Combinado (Exemplo Completo)

```typescript
function RecordingRoom({ sessionId, studioId }) {
  const { user } = useAuth();
  const logger = useRoomLogger({ sessionId, userId: user?.id, studioId });
  
  const permissions = useRoomPermissions({
    user,
    studioRole: 'director',
    hasTextControl: false,
    isDirector: true
  });
  
  const {
    recordingStatus,
    transitionTo,
    isRecording
  } = useRecordingStateMachine({
    sessionId,
    onStateChange: (from, to) => {
      logger.info('Recording state changed', { from, to });
    }
  });
  
  const { send } = useWebSocketRoom({
    sessionId,
    userId: user?.id!,
    onMessage: (msg) => {
      logger.debug('WebSocket message', { type: msg.type });
    }
  });
  
  const {
    initializeMicrophone,
    startRecording,
    stopRecording
  } = useAudioRecording({
    sessionId,
    onRecordingComplete: (blob, metrics) => {
      logger.info('Recording complete', { 
        quality: metrics.score,
        duration: blob.size 
      });
    }
  });
  
  const handleRecord = async () => {
    if (!permissions.canManageAudio) {
      logger.warn('User cannot record - no permission');
      return;
    }
    
    transitionTo('countdown');
    await initializeMicrophone();
    await startRecording();
    transitionTo('recording');
  };
  
  return (
    <div>
      <button onClick={handleRecord} disabled={isRecording}>
        {isRecording ? 'Gravando...' : 'REC'}
      </button>
    </div>
  );
}
```

## 🎨 Benefícios

1. **Testabilidade**: Cada hook pode ser testado isoladamente
2. **Reutilização**: Hooks podem ser usados em outros componentes
3. **Manutenibilidade**: Lógica organizada e documentada
4. **Performance**: Evita re-renderizações desnecessárias
5. **Debugging**: Logs estruturados facilitam troubleshooting
6. **Type Safety**: TypeScript garante tipos corretos

## 📝 Convenções

- Todos os hooks retornam objetos (não arrays)
- Logs contextualizados incluem sessionId/userId
- Callbacks são opcionais (on*, onError)
- Cleanup automático via useEffect
- Validações explícitas com mensagens claras
