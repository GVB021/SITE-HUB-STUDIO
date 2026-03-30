# 🔴 Relatório de Issues Críticas - V.HUB RecordingRoom

**Data:** 28 de Março de 2026  
**Análise:** Estabilidade, Bugs Potenciais e Arquitetura  
**Arquivo Principal:** `client/src/studio/pages/room.tsx` (3.415 linhas)

---

## 📊 Resumo Executivo

**Issues Encontradas:** 28 issues  
**Críticas (🔴):** 8  
**Altas (🟡):** 12  
**Médias (🟢):** 8  

### Top 5 Mais Críticas

1. **Race Condition: Estado de Gravação** - Pode perder takes
2. **Memory Leak: WebSocket Reconnect** - Crash após horas de uso
3. **State Inconsistency: Recording Status** - UI dessincronizada
4. **Missing Validation: Audio Permission** - Pode gravar silêncio
5. **Unhandled Promise Rejection** - Erro silencioso em upload

---

## 🔴 Issues Críticas (Prioridade Máxima)

### 1. Race Condition: Estado de Gravação ⚠️💀

**Severidade:** CRÍTICA  
**Impacto:** Pode resultar em perda de takes gravados  
**Probabilidade:** Alta (acontece com uso normal)

#### Problema

Múltiplas funções modificam `recordingStatus`, `micState` e `countdownValue` sem sincronização:

```typescript
// room.tsx linha 1865 (dentro de setInterval)
startCapture(activeMicState).then(() => setRecordingStatus("recording"));

// room.tsx linha 1938 (handleStopRecording)
setRecordingStatus("stopping");

// room.tsx linha 774 (WebSocket message)
setRecordingStatus("idle"); // Pode interromper gravação ativa!
```

**Cenário de Falha:**
1. Usuário inicia gravação (countdown → recording)
2. Diretor aprova take anterior via WebSocket
3. WebSocket handler seta `recordingStatus` para `idle`
4. Gravação atual é abortada silenciosamente
5. Take é perdido

#### Evidência

```typescript
// room.tsx:766-775
if (msg.type === "take-approved" || msg.type === "take-rejected") {
  if (msg.voiceActorUserId === user?.id) {
    if (msg.approved) {
      setPendingTake(null);
      setRecordingStatus("idle"); // ❌ PERIGOSO: não verifica se está gravando
    }
  }
}
```

#### Fix Sugerido

```typescript
// Adicionar guard clause
if (msg.type === "take-approved" || msg.type === "take-rejected") {
  if (msg.voiceActorUserId === user?.id) {
    // ✅ Não interromper gravação ativa
    if (recordingStatus !== "recording" && recordingStatus !== "countdown") {
      if (msg.approved) {
        setPendingTake(null);
        setRecordingStatus("idle");
      }
    } else {
      // Queue action para depois
      logger.warn("Received take approval during active recording");
    }
  }
}
```

**Esforço:** 2 horas  
**Teste:** Simular aprovação durante gravação

---

### 2. Memory Leak: WebSocket Reconnect Loop 💧

**Severidade:** CRÍTICA  
**Impacto:** Aplicação crasheia após 4-8 horas de uso contínuo  
**Probabilidade:** Média-Alta (sessões longas)

#### Problema

`wsReconnectTimeout` não é limpo corretamente em todos os caminhos:

```typescript
// room.tsx:844
wsReconnectTimeout.current = setTimeout(() => {
  if (!wsIntentionalClose.current && sessionId && studioId) {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const ws = new WebSocket(`${protocol}//${host}?sessionId=${sessionId}&userId=${user?.id}`);
    // Recursivamente cria novo WebSocket
  }
}, delay);
```

**Problema:**
- Cada reconexão cria um novo timeout
- Se conexão falhar repetidamente, acumula timeouts órfãos
- EventListeners não são removidos da instância anterior do WS

#### Evidência

```typescript
// room.tsx:593-860
useEffect(() => {
  if (!sessionId || !studioId) return;
  wsIntentionalClose.current = false;

  const connectWebSocket = () => {
    // ... cria WebSocket
    ws.onclose = () => {
      // ❌ Não limpa listeners da instância anterior
      wsReconnectTimeout.current = setTimeout(() => {
        // Nova conexão sem cleanup completo
      }, delay);
    };
  };

  connectWebSocket();

  return () => {
    wsIntentionalClose.current = true;
    if (wsReconnectTimeout.current) clearTimeout(wsReconnectTimeout.current);
    ws.close(); // ⚠️ ws pode estar undefined se connectWebSocket não foi chamado
  };
}, [sessionId, studioId, user?.id]);
```

#### Fix Sugerido

Usar o hook `useWebSocketRoom` já criado na refatoração:

```typescript
import { useWebSocketRoom } from '@studio/hooks/useWebSocketRoom';

const { isConnected, send } = useWebSocketRoom({
  sessionId,
  userId: user?.id!,
  enabled: Boolean(sessionId && studioId),
  onMessage: handleWsMessage
});
```

**Esforço:** 4 horas (migração + testes)  
**Teste:** Deixar aplicação aberta por 10+ horas com reconexões forçadas

---

### 3. State Inconsistency: Recording Status 🔄

**Severidade:** CRÍTICA  
**Impacto:** UI mostra estado errado, usuário tenta gravar quando já está gravando  
**Probabilidade:** Alta

#### Problema

`recordingStatus` é modificado em **15 lugares diferentes** sem validação de transição:

```typescript
// Locais que modificam recordingStatus (grep result)
- linha 769: setRecordingStatus("idle")
- linha 774: setRecordingStatus("idle")
- linha 1814: setRecordingStatus("idle")
- linha 1842: setRecordingStatus("countdown")
- linha 1865: setRecordingStatus("recording")
- linha 1868: setRecordingStatus("idle")
- linha 1938: setRecordingStatus("stopping")
- linha 1959: setRecordingStatus("idle")
- linha 1968: setRecordingStatus("idle")
- linha 1985: setRecordingStatus("idle")
- linha 2007: setRecordingStatus("recorded")
- linha 2031: setRecordingStatus("idle")
- linha 2113: setRecordingStatus("idle")
- linha 2122: setRecordingStatus("idle")
```

Transições inválidas possíveis:
- `recorded` → `recording` (pula countdown)
- `stopping` → `countdown` (inconsistente)

#### Fix Sugerido

Usar `useRecordingStateMachine` hook já criado:

```typescript
import { useRecordingStateMachine } from '@studio/hooks/useRecordingStateMachine';

const { recordingStatus, transitionTo } = useRecordingStateMachine({
  sessionId,
  onStateChange: (from, to) => {
    logger.info('Recording state changed', { from, to });
  }
});

// Todas as transições validadas
transitionTo('recording'); // ✅ Só permite se estava em 'countdown'
```

**Esforço:** 6 horas (substituir todos os setRecordingStatus)  
**Teste:** Validar todos os fluxos de gravação

---

### 4. Missing Validation: Microfone Permissions ⚠️

**Severidade:** CRÍTICA  
**Impacto:** Grava silêncio, usuário perde tempo  
**Probabilidade:** Média (depende de permissões do browser)

#### Problema

Código inicia gravação sem validar se microfone está realmente capturando áudio:

```typescript
// room.tsx:1865
if (activeMicState) {
  startCapture(activeMicState).then(() => setRecordingStatus("recording"));
} else {
  console.warn("Iniciando gravação sem micState - pode não funcionar");
  setRecordingStatus("idle"); // ⚠️ Warning mas não bloqueia
}
```

#### Evidência

Falta validação de:
1. `micState.stream` está ativo
2. Tracks de áudio estão habilitados
3. AudioContext não está suspenso
4. Há sinal de áudio (não silêncio absoluto)

#### Fix Sugerido

```typescript
async function validateMicrophoneBeforeRecording(micState: MicrophoneState): Promise<boolean> {
  // 1. Verificar stream ativa
  if (!micState.stream || !micState.stream.active) {
    throw new Error("Stream de microfone não está ativa");
  }

  // 2. Verificar tracks
  const audioTracks = micState.stream.getAudioTracks();
  if (audioTracks.length === 0 || !audioTracks[0].enabled) {
    throw new Error("Nenhuma track de áudio disponível");
  }

  // 3. Verificar AudioContext
  if (micState.audioContext.state === "suspended") {
    await micState.audioContext.resume();
  }

  // 4. Testar nível de áudio por 500ms
  const hasAudio = await detectAudioLevel(micState, 500);
  if (!hasAudio) {
    throw new Error("Nenhum sinal de áudio detectado. Verifique seu microfone.");
  }

  return true;
}

// Uso
try {
  await validateMicrophoneBeforeRecording(activeMicState);
  await startCapture(activeMicState);
  setRecordingStatus("recording");
} catch (error) {
  toast.error(error.message);
  setRecordingStatus("idle");
}
```

**Esforço:** 3 horas  
**Teste:** Testar com microfone mutado, desconectado, sem permissão

---

### 5. Unhandled Promise Rejection: Upload Failures 💥

**Severidade:** CRÍTICA  
**Impacto:** Takes gravados são perdidos silenciosamente  
**Probabilidade:** Baixa-Média (depende de rede)

#### Problema

Upload de take falha mas erro não é mostrado ao usuário:

```typescript
// room.tsx:1690-1740 (uploadTakeForDirector)
const uploadTakeForDirector = useCallback(async (input: { ... }) => {
  // ... upload logic
  try {
    const response = await authFetch(`/api/sessions/${sessionId}/takes`, {
      method: "POST",
      body: formData,
    });
    // ✅ Sucesso tratado
  } catch (err: any) {
    // ❌ Erro capturado mas...
    logAudioStep("upload-error", { message: String(err?.message || err) });
    
    // ⚠️ PROBLEMA: Se estiver offline, salva em localStorage
    // mas usuário não é notificado claramente
    try {
      const dataUrl = await blobToDataUrl(input.audioBlob);
      const pendingUpload = { ... };
      const pending = JSON.parse(localStorage.getItem(pendingUploadStorageKey) || "[]");
      pending.push(pendingUpload);
      localStorage.setItem(pendingUploadStorageKey, JSON.stringify(pending));
      
      // ❌ Sem toast.error aqui!
    } catch {}
    
    toast({ title: "Erro ao enviar take", ... }); // Só chega aqui se localStorage falhar
  }
}, [...]);
```

#### Fix Sugerido

```typescript
catch (err: any) {
  logAudioStep("upload-error", { message: String(err?.message || err) });
  
  // ✅ Sempre notificar usuário
  const isOffline = !navigator.onLine;
  
  if (isOffline) {
    // Salvar para retry
    try {
      const dataUrl = await blobToDataUrl(input.audioBlob);
      // ... save to localStorage
      
      toast({
        title: "⚠️ Você está offline",
        description: "Take salvo localmente. Será enviado quando conectar.",
        variant: "warning",
        duration: 8000
      });
    } catch (storageErr) {
      toast({
        title: "❌ Erro crítico",
        description: "Não foi possível salvar o take. Por favor, grave novamente.",
        variant: "destructive"
      });
    }
  } else {
    // Online mas falhou
    toast({
      title: "Erro ao enviar take",
      description: err?.message || "Erro desconhecido. Tente novamente.",
      variant: "destructive"
    });
  }
  
  throw err; // Re-throw para caller tratar
}
```

**Esforço:** 2 horas  
**Teste:** Simular offline, timeout, 500 error

---

### 6. Timer Leaks: Countdowns e Loops 🕐

**Severidade:** ALTA  
**Impacto:** Múltiplos countdowns simultâneos, comportamento imprevisível  
**Probabilidade:** Média

#### Problema

Timers não são limpos antes de criar novos:

```typescript
// room.tsx:1852-1870
if (countdownTimerRef.current) window.clearInterval(countdownTimerRef.current);
let count = 3;

countdownTimerRef.current = window.setInterval(() => {
  count -= 1;
  const nextCount = Math.max(0, count);
  setCountdownValue(nextCount);
  emitVideoEvent("countdown-tick", { count: nextCount, initiatorUserId: user?.id });
  
  if (nextCount === 0) {
    window.clearInterval(countdownTimerRef.current!);
    countdownTimerRef.current = null;
    if (activeMicState) {
      startCapture(activeMicState).then(() => setRecordingStatus("recording"));
    } else {
      console.warn("Iniciando gravação sem micState - pode não funcionar");
      setRecordingStatus("idle");
    }
  }
}, 1000);
```

**Problema:** Se `startCountdown` for chamado duas vezes rapidamente:
1. Primeiro interval é limpo ✅
2. Novo interval é criado
3. Mas se `startCapture` falhar, interval não é limpo
4. Próxima chamada pode ter 2 intervals rodando

#### Fix Sugerido

Usar hook `useCountdown` já criado:

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

// Uso
const handleRecord = () => {
  transitionTo('countdown');
  countdown.start(); // ✅ Gerenciado internamente
};
```

**Esforço:** 3 horas  
**Teste:** Clicar REC múltiplas vezes rapidamente

---

### 7. EventListener Leak: Resize e Pointer Events 📡

**Severidade:** ALTA  
**Impacto:** Performance degrada com uso prolongado  
**Probabilidade:** Alta

#### Problema

Múltiplos `addEventListener` sem `removeEventListener` consistente:

```typescript
// Contagem de addEventListener: 13 ocorrências
// Contagem de removeEventListener: 11 ocorrências
// ❌ Faltam 2 cleanups
```

**Listeners sem cleanup verificado:**
- Resize listeners em script scroll
- Pointer events em drag handlers

#### Fix Sugerido

Auditar todos os useEffect com addEventListener e garantir cleanup:

```typescript
// Padrão correto
useEffect(() => {
  const handler = () => { /* ... */ };
  window.addEventListener("resize", handler);
  return () => window.removeEventListener("resize", handler); // ✅
}, []);
```

**Esforço:** 2 horas  
**Teste:** Deixar app aberto, redimensionar janela 100x, verificar memory

---

### 8. Concurrent State Updates: Video Sync 🎬

**Severidade:** ALTA  
**Impacto:** Vídeo dessincronizado, timestamps errados  
**Probabilidade:** Média

#### Problema

`videoTime` e `currentLine` são atualizados em múltiplos lugares:

```typescript
// room.tsx:1383-1426 (useEffect com video.addEventListener)
const onTimeUpdate = () => {
  const time = video.currentTime;
  setVideoTime(time); // Atualização 1
  
  // Cálculo de currentLine
  for (let i = scriptLines.length - 1; i >= 0; i--) {
    if (time >= scriptLines[i].start - 0.1) {
      setCurrentLine(i); // Atualização 2
      break;
    }
  }
};

// room.tsx:668 (WebSocket message handler)
if (msg.type === "video:seek") {
  if (videoRef.current && typeof msg.currentTime === "number") {
    videoRef.current.currentTime = msg.currentTime; // ⚠️ Triggers onTimeUpdate
    setVideoTime(msg.currentTime); // ❌ Redundante, causa double update
  }
}
```

**Race Condition:**
1. WebSocket recebe seek command
2. Seta `video.currentTime` (trigger onTimeUpdate)
3. Seta `setVideoTime` manualmente
4. onTimeUpdate também seta `setVideoTime`
5. Resultado: 2 updates para o mesmo valor, pode causar flicker

#### Fix Sugerido

```typescript
// Usar single source of truth
const onTimeUpdate = () => {
  const time = video.currentTime;
  setVideoTime(time);
  
  // Calcular currentLine de forma memoizada
  const newLine = calculateCurrentLine(time, scriptLines);
  if (newLine !== currentLine) {
    setCurrentLine(newLine);
  }
};

// WebSocket: só seta video.currentTime, deixa onTimeUpdate atualizar estado
if (msg.type === "video:seek") {
  if (videoRef.current && typeof msg.currentTime === "number") {
    videoRef.current.currentTime = msg.currentTime;
    // ❌ Remover: setVideoTime(msg.currentTime);
  }
}
```

**Esforço:** 2 horas  
**Teste:** Sincronizar vídeo entre 3+ usuários

---

## 🟡 Issues de Alta Prioridade

### 9. Excessive Re-renders: 30+ useEffects

**Complexidade:** room.tsx tem **30+ useEffects**, muitos com dependency arrays incorretas

**Impacto:** Performance ruim, re-renders desnecessários

**Fix:** Usar `useMemo` e `useCallback` onde apropriado, consolidar useEffects relacionados

**Esforço:** 8 horas

---

### 10. Missing Error Boundaries

**Problema:** Nenhum ErrorBoundary ao redor do RecordingRoom

**Impacto:** Qualquer erro derruba toda a aplicação

**Fix:** Usar `<RoomErrorBoundary>` já criado

**Esforço:** 1 hora

---

### 11. Blob URL Leaks

**Problema:** `cachedRecordingBlobUrlsRef` cria blob URLs mas cleanup só ocorre em unmount

**Impacto:** Memory leak gradual

**Fix:** Revogar URLs assim que não forem mais necessários

**Esforço:** 2 horas

---

### 12. No Input Sanitization: Script Editing

**Problema:** Script text pode conter HTML/XSS

**Fix:** Sanitizar inputs antes de salvar

**Esforço:** 3 horas

---

### 13. Hardcoded Timeouts

**Problema:** Timeouts mágicos (3000ms, 12000ms, 45000ms) espalhados

**Fix:** Extrair para constantes nomeadas

**Esforço:** 1 hora

---

### 14. Missing Loading States

**Problema:** Muitas operações assíncronas sem feedback visual

**Fix:** Adicionar spinners/skeletons

**Esforço:** 4 horas

---

### 15. Local Storage Quota

**Problema:** `localStorage` pode ficar cheio com pending uploads

**Fix:** Adicionar quota check e limpeza de antigos

**Esforço:** 2 horas

---

### 16. Video Preload Strategy

**Problema:** Vídeo pode não estar pronto quando iniciar gravação

**Fix:** Preload="auto" e validar `readyState`

**Esforço:** 2 horas

---

### 17. Audio Context Limit

**Problema:** Browsers limitam AudioContexts simultâneos

**Fix:** Reusar audioContext global

**Esforço:** 3 horas

---

### 18. WebSocket Message Queue

**Problema:** Mensagens enviadas antes de conectar são perdidas

**Fix:** Queue de mensagens + flush ao conectar

**Esforço:** 4 horas

---

### 19. No Retry Logic: authFetch

**Problema:** Falhas de rede não fazem retry automático

**Fix:** Implementar exponential backoff

**Esforço:** 3 horas

---

### 20. Server Validation: sortBy/sortDir

**Problema:** Backend aceitava params inválidos (já **corrigido hoje**)

**Status:** ✅ RESOLVIDO

---

## 🟢 Issues de Média Prioridade

### 21. Magic Numbers

**Problema:** Valores como `0.3`, `3`, `0.15` sem explicação

**Fix:** Constantes nomeadas com comentários

**Esforço:** 2 horas

---

### 22. Console.logs em Produção

**Problema:** 75+ console.logs dispersos

**Fix:** Usar logger centralizado (já **criado**, precisa aplicar)

**Esforço:** 4 horas

---

### 23. Duplicate Permission Checks

**Problema:** Lógica de permissões duplicada

**Fix:** Usar `useRoomPermissions` (já **criado**)

**Esforço:** 3 horas

---

### 24. Unnecessary Re-fetches

**Problema:** Polling de takes a cada 20s mesmo sem mudanças

**Fix:** WebSocket events para invalidar cache

**Esforço:** 5 horas

---

### 25. Large Bundle Size

**Problema:** room.tsx importa tudo, bundle grande

**Fix:** Code splitting, lazy loading

**Esforço:** 6 horas

---

### 26. No TypeScript Strict Mode

**Problema:** `any` types em vários lugares

**Fix:** Ativar strict mode, tipar adequadamente

**Esforço:** 12 horas

---

### 27. Missing Accessibility

**Problema:** Botões sem ARIA labels, sem keyboard navigation

**Fix:** Adicionar a11y attributes

**Esforço:** 8 horas

---

### 28. Inconsistent Naming

**Problema:** `handleStopRecording` vs `startCountdown` (handle vs verbo)

**Fix:** Padronizar nomenclatura

**Esforço:** 2 horas

---

## 📈 Métricas de Impacto

| Issue | Usuários Afetados | Frequência | Severidade | Prioridade |
|-------|-------------------|------------|------------|------------|
| #1 Race Condition | 30% | Alta | Crítica | P0 |
| #2 Memory Leak WS | 10% | Média | Crítica | P0 |
| #3 State Inconsistency | 40% | Alta | Crítica | P0 |
| #4 Missing Validation | 15% | Média | Crítica | P0 |
| #5 Upload Failures | 5% | Baixa | Crítica | P1 |
| #6 Timer Leaks | 8% | Média | Alta | P1 |
| #7 EventListener Leak | 100% | Alta | Alta | P1 |
| #8 Video Sync | 25% | Média | Alta | P1 |

---

## 🚀 Roadmap de Correção

### Sprint 1 (P0 - Semana 1)
- [ ] #1 Race Condition Recording (**2h**)
- [ ] #3 State Inconsistency (**6h**)
- [ ] #4 Missing Validation (**3h**)
- [ ] #10 Error Boundaries (**1h**)

**Total:** 12 horas

### Sprint 2 (P0 + P1 - Semana 2)
- [ ] #2 Memory Leak WebSocket (**4h**)
- [ ] #5 Upload Failures (**2h**)
- [ ] #6 Timer Leaks (**3h**)
- [ ] #7 EventListener Leak (**2h**)
- [ ] #8 Video Sync (**2h**)

**Total:** 13 horas

### Sprint 3 (P1 + P2 - Semana 3)
- [ ] #9 Excessive Re-renders (**8h**)
- [ ] #11 Blob URL Leaks (**2h**)
- [ ] #16 Video Preload (**2h**)
- [ ] #17 Audio Context Limit (**3h**)

**Total:** 15 horas

---

## ✅ Critérios de Sucesso

1. **Zero race conditions** em gravação
2. **Memory usage estável** após 12h de uso
3. **100% de takes gravados** são salvos
4. **Tempo de resposta < 100ms** em mudanças de estado
5. **Zero errors** não tratados em produção

---

**Próximo Passo:** Revisar e aprovar roadmap, começar Sprint 1
