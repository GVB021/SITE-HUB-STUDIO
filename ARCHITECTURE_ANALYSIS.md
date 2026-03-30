# 🏗️ Análise Arquitetural - V.HUB RecordingRoom

**Data:** 28 de Março de 2026  
**Foco:** Code Smells, Acoplamento, Duplicação, Manutenibilidade  

---

## 📊 Resumo Executivo

### Classificação Geral: ⚠️ **PRECISA REFATORAÇÃO URGENTE**

| Aspecto | Nota | Status |
|---------|------|--------|
| **Modularidade** | 3/10 | 🔴 Crítico |
| **Acoplamento** | 2/10 | 🔴 Crítico |
| **Coesão** | 4/10 | 🔴 Baixa |
| **Testabilidade** | 2/10 | 🔴 Crítico |
| **Manutenibilidade** | 3/10 | 🔴 Difícil |
| **Performance** | 5/10 | 🟡 Regular |

---

## 🎯 Code Smells Identificados

### 1. 💀 **GOD OBJECT** - RecordingRoom Component

**Severidade:** CRÍTICA  
**Tipo:** Design Smell  

#### Evidências

```typescript
// room.tsx tem TODAS estas responsabilidades:
✗ Gerenciamento de WebSocket (conexão, reconexão, mensagens)
✗ Controle de vídeo (play, pause, seek, loop)
✗ Gravação de áudio (microfone, recording engine, upload)
✗ Gerenciamento de script (scroll, edição, sync)
✗ Controle de permissões (RBAC, director, dubber)
✗ Estado de UI (modals, dropdowns, panels)
✗ Sincronização de tempo (video ↔ script)
✗ Gestão de takes (list, preview, delete, approve)
✗ Comunicação em tempo real (presence, drafts, locks)
✗ Device settings (mic, output, gain, monitor)
✗ Offline handling (pending uploads, retry)
✗ Keyboard shortcuts (global handlers)
```

**Métrica:** 12 responsabilidades em um único componente

**Violação:** Single Responsibility Principle (SRP)

#### Impacto

- ❌ **Impossível testar** de forma isolada
- ❌ **Qualquer mudança** afeta múltiplas features
- ❌ **Onboarding** de novos devs leva semanas
- ❌ **Debugging** requer entender 3.415 linhas
- ❌ **Code review** impraticável

#### Solução

**Separar em módulos especializados:**

```
RecordingRoom/
├── VideoPlayer/           (play, pause, seek, sync)
├── AudioRecorder/         (mic, recording, upload)
├── ScriptPanel/           (scroll, edit, highlight)
├── TakesManager/          (list, preview, approve)
├── RoomControls/          (REC button, shortcuts)
├── DeviceSettings/        (mic/output selection)
├── RoomProvider/          (WebSocket, permissions)
└── index.tsx              (orchestration apenas)
```

**Esforço:** 40 horas (2 sprints)

---

### 2. 📏 **LONG METHOD** - handleStopRecording (98 linhas)

**Severidade:** ALTA  
**Tipo:** Method Smell

#### Evidência

```typescript
// room.tsx:1924-2033 (109 linhas de função)
const handleStopRecording = useCallback(async () => {
  if (recordingStatus !== "recording") {
    console.warn("[StopRecording] Chamado em estado inválido:", recordingStatus);
    return;
  }
  
  console.log("[StopRecording] Iniciando processo...");
  
  // ... 98 linhas de lógica complexa
  // - Validação de estado
  // - Limpeza de timers
  // - Parar captura
  // - Validar amostras
  // - Análise de qualidade
  // - Encoding WAV
  // - Validação de duração
  // - Upload para diretor
  // - Tratamento de erros
  // ... etc
}, [recordingStatus, micState, emitVideoEvent, ...]);
```

**Complexidade Ciclomática:** ~18 (Alto)

#### Problema

- Múltiplas razões para mudar
- Difícil de testar cada caminho
- Duplica lógica com `uploadTakeForDirector`

#### Solução

```typescript
// Quebrar em funções menores
async function stopRecording() {
  validateCanStop();
  await cleanupTimers();
  const audioData = await captureAudio();
  const validated = await validateAudioData(audioData);
  const encoded = await encodeToWav(validated);
  const quality = await analyzeQuality(encoded);
  await uploadToDirector(encoded, quality);
  return { encoded, quality };
}
```

**Esforço:** 4 horas

---

### 3. 🔗 **LONG PARAMETER LIST** - uploadTakeForDirector (10 params)

**Severidade:** ALTA  
**Tipo:** Method Smell

#### Evidência

```typescript
// room.tsx:1690
const uploadTakeForDirector = useCallback(async (input: {
  audioBlob: Blob;            // 1
  qualityScore: number;       // 2
  waveformData?: number[];    // 3
  duration: number;           // 4
  lineIndex: number;          // 5
  sessionId: string;          // 6
  voiceActorId: string;       // 7
  characterId: string;        // 8
  lineText: string;           // 9
  voiceActorName: string;     // 10
}) => { ... }, [...]);
```

**Problema:** 10 parâmetros é difícil de lembrar ordem e significado

#### Solução

```typescript
// Usar objeto tipado
interface TakeUploadData {
  audio: {
    blob: Blob;
    duration: number;
    waveform?: number[];
  };
  quality: {
    score: number;
    metrics: QualityMetrics;
  };
  context: {
    sessionId: string;
    lineIndex: number;
    lineText: string;
  };
  actor: {
    id: string;
    name: string;
  };
  character: {
    id: string;
  };
}

const uploadTake = useCallback(async (data: TakeUploadData) => {
  // Mais legível e manutenível
}, []);
```

**Esforço:** 2 horas

---

### 4. 🔄 **DUPLICATED CODE** - Permission Checks

**Severidade:** MÉDIA-ALTA  
**Tipo:** Duplication Smell

#### Evidências

```typescript
// Padrão repetido 15+ vezes:

// Ocorrência 1 (linha 1808)
if (!isPrivileged && !isDirector) {
  toast({ title: "Permissão negada", variant: "destructive" });
  return;
}

// Ocorrência 2 (linha 2056)
const canApprove = isPrivileged || isDirector;
if (!canApprove) {
  toast({ title: "Somente diretor pode aprovar", variant: "destructive" });
  return;
}

// Ocorrência 3 (linha 2234)
const canEdit = user?.role === "owner" || studioRole === "admin" || isDirector;
if (!canEdit) {
  return;
}

// ... +12 ocorrências similares
```

**Duplicação:** 200+ linhas de lógica de permissões

#### Solução

Usar hook `useRoomPermissions` já criado:

```typescript
const permissions = useRoomPermissions({
  user,
  studioRole,
  hasTextControl,
  isDirector
});

// Uso limpo
if (!permissions.canControlVideo) {
  toast.error("Permissão negada");
  return;
}

if (!permissions.canApproveTake) {
  toast.error("Somente diretor pode aprovar");
  return;
}
```

**Redução:** -200 linhas  
**Esforço:** 3 horas

---

### 5. 🎭 **FEATURE ENVY** - Script Line Manipulation

**Severidade:** MÉDIA  
**Tipo:** Coupling Smell

#### Evidência

```typescript
// room.tsx usa mais métodos de scriptLines do que seus próprios
const effectiveScriptLines = useMemo(() => {
  return baseScriptLines.map((line, idx) => {
    const override = lineOverrides[idx];
    if (!override) return line;
    return {
      ...line,
      character: override.character ?? line.character,
      text: override.text ?? line.text,
      start: override.start ?? line.start,
    };
  });
}, [baseScriptLines, lineOverrides]);

const scriptLines = useMemo(() => {
  if (!selectedCharacter) return effectiveScriptLines;
  return effectiveScriptLines.filter(line => 
    String(line.character || "").toLowerCase().trim() === selectedCharacter.toLowerCase().trim()
  );
}, [effectiveScriptLines, selectedCharacter]);

// Mais manipulações de scriptLines em várias partes...
```

**Problema:** RecordingRoom conhece demais sobre estrutura de script

#### Solução

```typescript
// Criar useScriptManager hook
const {
  scriptLines,
  currentLine,
  setOverride,
  clearOverride,
  filterByCharacter,
  scrollToLine
} = useScriptManager({
  production,
  selectedCharacter,
  videoTime
});
```

**Esforço:** 6 horas

---

### 6. 🧩 **SHOTGUN SURGERY** - Adicionar Novo Tipo de Mensagem WS

**Severidade:** MÉDIA  
**Tipo:** Change Smell

#### Problema

Para adicionar um novo tipo de mensagem WebSocket, é necessário modificar:

```typescript
1. room.tsx linha 603-790 (handleWsMessage - switch gigante)
2. room.tsx linha 2700+ (emitVideoEvent em vários lugares)
3. server/websocket.ts (message handler)
4. Types definition (se ainda não existe)
5. Qualquer componente que reage à mensagem
```

**Arquivos afetados:** 3-5 arquivos  
**Linhas modificadas:** 50-100 linhas

#### Solução

**Padrão Observer com Event Bus:**

```typescript
// useWebSocketMessages.ts
const useWebSocketMessages = () => {
  const handlers = useRef<Map<string, (msg: any) => void>>(new Map());
  
  const subscribe = (type: string, handler: (msg: any) => void) => {
    handlers.current.set(type, handler);
  };
  
  const handleMessage = (msg: any) => {
    const handler = handlers.current.get(msg.type);
    if (handler) handler(msg);
  };
  
  return { subscribe, handleMessage };
};

// Uso
const { subscribe } = useWebSocketMessages();

useEffect(() => {
  subscribe('video:play', (msg) => {
    videoRef.current?.play();
  });
  
  subscribe('video:pause', (msg) => {
    videoRef.current?.pause();
  });
}, []);
```

**Esforço:** 8 horas (refatorar todos os handlers)

---

### 7. 🎲 **MAGIC NUMBERS** - Timeouts e Durações

**Severidade:** BAIXA-MÉDIA  
**Tipo:** Clarity Smell

#### Evidências

```typescript
// room.tsx - números mágicos sem explicação

setTimeout(() => setLoopPreparing(false), 3000);  // Por que 3 segundos?

const diff = Math.abs(video.currentTime - msg.currentTime);
if (diff > 0.3) { ... }  // Por que 0.3?

await new Promise((resolve) => window.setTimeout(resolve, 260));  // 260ms?

const timeout = window.setTimeout(() => controller.abort(), 45000);  // 45 segundos?

if (result.durationSeconds + 0.15 < expectedDuration) { ... }  // 0.15?

refetchInterval: 20000,  // 20 segundos?

controlsTimeoutRef.current = window.setTimeout(() => {
  setControlsVisible(false);
}, 3000);  // 3 segundos de novo
```

#### Solução

```typescript
// constants/timing.ts
export const TIMING = {
  LOOP_PREPARATION_MS: 3000,        // Tempo para preparar loop
  VIDEO_SYNC_TOLERANCE_S: 0.3,      // Diferença aceitável em sync
  OPTIMISTIC_DELETE_DELAY_MS: 260,  // Delay para animação de delete
  NETWORK_TIMEOUT_MS: 45000,        // Timeout para downloads
  RECORDING_TOLERANCE_S: 0.15,      // Margem para duração de gravação
  TAKES_REFETCH_INTERVAL_MS: 20000, // Polling de takes
  CONTROLS_HIDE_DELAY_MS: 3000,     // Esconder controles após inatividade
} as const;

// Uso
setTimeout(() => setLoopPreparing(false), TIMING.LOOP_PREPARATION_MS);
```

**Esforço:** 2 horas

---

## 🔗 Análise de Acoplamento

### Dependências do RecordingRoom

```
RecordingRoom depende de:
├── @tanstack/react-query (queries, mutations)
├── wouter (routing, params)
├── framer-motion (animations)
├── 15+ hooks customizados
├── 20+ lib utilities
├── 25+ UI components
├── WebSocket (realtime)
├── LocalStorage (persistence)
├── SessionStorage (temp state)
└── AudioContext (recording)

Total: 70+ dependências diretas
```

**Nível de Acoplamento:** 💀 **MUITO ALTO** (>50 dependências)

### Impacto

- **Impossível** mover para outro projeto
- **Difícil** atualizar dependências
- **Quebra** facilmente com mudanças externas
- **Lento** para compilar/testar

### Solução

**Dependency Injection + Facade Pattern:**

```typescript
interface RoomDependencies {
  audioService: AudioRecordingService;
  videoService: VideoPlayerService;
  realtimeService: RealtimeService;
  permissionsService: PermissionsService;
  storageService: StorageService;
}

function RecordingRoom({ dependencies }: { dependencies: RoomDependencies }) {
  // Usa interfaces ao invés de implementações concretas
}
```

**Esforço:** 20 horas (grande refatoração)

---

## 🧬 Análise de Coesão

### Funções com Baixa Coesão

#### 1. `handleStopRecording` (98 linhas)

Faz 8 coisas não relacionadas:
1. Validação de estado
2. Limpeza de timers
3. Parar captura de áudio
4. Validar samples
5. Análise de qualidade
6. Encoding WAV
7. Upload via rede
8. Notificação de erros

**Coesão:** Baixa (1/10)

#### 2. `startCountdown` (50 linhas)

Faz 5 coisas:
1. Validar microfone
2. Calcular timestamps de vídeo
3. Emitir eventos WebSocket
4. Controlar UI de countdown
5. Iniciar gravação ao final

**Coesão:** Média-Baixa (4/10)

### Módulos com Alta Coesão ✅

- `microphoneManager.ts` - Só lida com microfone
- `wavEncoder.ts` - Só codifica WAV
- `qualityAnalysis.ts` - Só analisa qualidade

---

## 📐 Complexidade Ciclomática

### Top 10 Funções Mais Complexas

| Função | Linhas | Branches | CC | Severidade |
|--------|--------|----------|-----|-----------|
| `handleStopRecording` | 98 | 12 | 18 | 🔴 Muito Alto |
| `handleWsMessage` | 187 | 25 | 32 | 💀 Crítico |
| `startCountdown` | 50 | 8 | 12 | 🔴 Alto |
| `uploadTakeForDirector` | 50 | 6 | 10 | 🟡 Médio-Alto |
| `getTakeStreamUrl` | 78 | 10 | 14 | 🔴 Alto |
| `handleDownloadTake` | 28 | 4 | 7 | 🟢 OK |
| `handleDiscardTake` | 40 | 5 | 8 | 🟡 Médio |
| `flushPendingUploads` | 45 | 7 | 11 | 🟡 Médio-Alto |
| `effectiveScriptLines` | 8 | 3 | 5 | 🟢 OK |
| `rebuildScrollAnchors` | 30 | 4 | 6 | 🟢 OK |

**Média de CC:** ~12 (Médio-Alto)  
**Recomendado:** < 10

---

## 🎨 Padrões Arquiteturais Ausentes

### 1. ❌ **Repository Pattern**

Acesso direto a `authFetch` espalhado em 20+ lugares

**Deveria ser:**
```typescript
const takesRepository = useTakesRepository();
await takesRepository.upload(takeData);
await takesRepository.delete(takeId);
```

### 2. ❌ **Command Pattern**

Ações como "gravar", "parar", "aprovar" espalhadas

**Deveria ser:**
```typescript
const recordCommand = new RecordTakeCommand(micState, videoRef);
await recordCommand.execute();
await recordCommand.undo(); // Se necessário
```

### 3. ❌ **Observer Pattern**

WebSocket messages tratadas em switch gigante

**Deveria ser:**
```typescript
wsObservable.subscribe('video:play', handleVideoPlay);
wsObservable.subscribe('take:approved', handleTakeApproved);
```

### 4. ❌ **State Machine Pattern**

`recordingStatus` modificado em 15 lugares sem validação

**Deveria ser:**
```typescript
const stateMachine = useRecordingStateMachine();
stateMachine.transition('recording'); // Valida automaticamente
```

### 5. ✅ **Provider Pattern** (Parcialmente usado)

Contextos globais via hooks, mas poderia ser mais organizado

---

## 📊 Métricas de Qualidade

### SOLID Principles Violations

| Princípio | Violações | Exemplos |
|-----------|-----------|----------|
| **S**ingle Responsibility | 🔴 15+ | RecordingRoom tem 12 responsabilidades |
| **O**pen/Closed | 🟡 5 | handleWsMessage precisa editar para adicionar tipo |
| **L**iskov Substitution | 🟢 0 | Não usa herança |
| **I**nterface Segregation | 🟡 3 | Interfaces grandes (TakeData com 15 campos) |
| **D**ependency Inversion | 🔴 10+ | Depende de implementações concretas |

### DRY (Don't Repeat Yourself)

**Duplicações Identificadas:** 12 blocos

```
1. Permission checks (15x)
2. Toast error patterns (20x)
3. Try-catch-toast (18x)
4. Video sync logic (4x)
5. LocalStorage access (8x)
6. Timecode parsing (3x)
7. Character filtering (3x)
8. Script line mapping (4x)
9. Error logging (12x)
10. Blob URL creation (5x)
11. MediaStream track handling (3x)
12. WebSocket emit patterns (10x)
```

**Total de Linhas Duplicadas:** ~600 linhas

---

## 🏆 Melhores Práticas Seguidas ✅

1. **TypeScript** usado consistentemente
2. **Hooks** ao invés de classes
3. **useMemo/useCallback** em lugares chave
4. **Error handling** presente (embora inconsistente)
5. **Logging** detalhado (embora console.log)
6. **Comentários** em lógica complexa

---

## 🎯 Recomendações Arquiteturais

### Curto Prazo (1-2 sprints)

1. **Aplicar hooks já criados**
   - useRoomLogger (substituir console.logs)
   - useRoomPermissions (centralizar permissões)
   - useRecordingStateMachine (validar transições)
   - useWebSocketRoom (fix memory leaks)
   - useAudioRecording (encapsular áudio)

2. **Extrair componentes grandes**
   - VideoControls
   - ScriptPanel
   - RecordingButton
   - TakesManager

3. **Consolidar constantes**
   - Timeouts em constants/timing.ts
   - Thresholds em constants/thresholds.ts
   - Messages em constants/messages.ts

**Esforço:** 40 horas

### Médio Prazo (1-2 meses)

4. **Implementar Repository Pattern**
   - TakesRepository
   - SessionRepository
   - ProductionRepository

5. **Adicionar State Machine**
   - Validação rígida de transições
   - Logs automáticos
   - Debugging facilitado

6. **Criar Event Bus**
   - WebSocket messages
   - UI events
   - Lifecycle events

**Esforço:** 80 horas

### Longo Prazo (3-6 meses)

7. **Micro-frontends**
   - Separar RecordingRoom em app independente
   - Comunicação via postMessage
   - Deploy independente

8. **Monorepo**
   - Shared components library
   - Shared types package
   - Shared utils package

9. **End-to-End Testing**
   - Playwright scenarios
   - Visual regression tests
   - Performance benchmarks

**Esforço:** 200 horas

---

## 📈 Comparação: Antes vs Depois (Projetado)

| Métrica | Atual | Após Refatoração | Melhoria |
|---------|-------|------------------|----------|
| **Linhas room.tsx** | 3.415 | ~800 | -76% |
| **Componentes** | 1 | ~15 | +1400% |
| **Complexidade Média** | 12 | 6 | -50% |
| **Duplicação** | 600 linhas | <100 | -83% |
| **Testabilidade** | 2/10 | 8/10 | +300% |
| **Acoplamento** | 70 deps | ~20 | -71% |
| **Tempo onboarding** | 2 semanas | 2 dias | -80% |
| **Code review** | Impossível | Viável | ✅ |

---

## ✅ Critérios de Sucesso

1. ✅ Nenhum componente com > 500 linhas
2. ✅ Complexidade ciclomática < 10 em todas as funções
3. ✅ Zero duplicação de lógica de negócio
4. ✅ 80%+ de cobertura de testes unitários
5. ✅ Tempo de build < 10s
6. ✅ Bundle size < 500KB

---

**Próximo Passo:** Revisar métricas e iniciar refatoração incremental
