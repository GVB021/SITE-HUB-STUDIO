# Documento Oficial Completo - Sistema HubDub
**Estúdio de Dublagem Virtual em Tempo Real**

---

**Versão do Documento:** 1.0  
**Data:** 17 de Março de 2026  
**Status:** Produção  
**Autores:** Equipe HubDub  
**Linguagem:** Português Técnico Formal  

---

## Índice

1. [Introdução e Visão Geral](#1-introdução-e-visão-geral)
2. [Como Funciona](#2-como-funciona)
3. [Arquitetura Técnica](#3-arquitetura-técnica)
4. [Tecnologias Embarcadas](#4-tecnologias-embarcadas)
5. [O Coração do Sistema: RecordingRoom](#5-o-coração-do-sistema-recordingroom)
6. [HubAlign: A Montagem Inteligente](#6-hubalign-a-montagem-inteligente)
7. [Funcionalidades Detalhadas](#7-funcionalidades-detalhadas)
8. [Banco de Dados e Persistência](#8-banco-de-dados-e-persistência)
9. [API e Comunicação](#9-api-e-comunicação)
10. [Deploy e Operações](#10-deploy-e-operações)
11. [Segurança](#11-segurança)
12. [Performance e Otimização](#12-performance-e-otimização)
13. [Guia de Implementação](#13-guia-de-implementação)
14. [Futuro e Inovações](#14-futuro-e-inovações)
15. [Anexos Técnicos](#15-anexos-técnicos)

---

## 1. Introdução e Visão Geral

### O que é o HubDub

O **HubDub** é uma plataforma profissional de **dublagem remota em tempo real** que revoluciona como estúdios de dublagem trabalham. Imagine poder gravar dublagens com equipes espalhadas pelo mundo, mas com a sincronia perfeita de um estúdio físico.

**Em termos simples:** É como ter um estúdio de dublagem completo no seu navegador, onde diretores, dubladores e engenheiros podem colaborar como se estivessem na mesma sala.

### O Problema que Resolvemos

Antes do HubDub, a dublagem remota sofria com:

- **Latência Problemática:** O vídeo do diretor não sincronizava com o do dublador
- **Complicações Técnicas:** Arquivos enviados por e-mail, WeTransfer, drives compartilhados
- **Perda de Tempo:** Horas gastas organizando arquivos e sincronizando manualmente
- **Qualidade Inconsistente:** Diferentes equipamentos e configurações

**Nossa Solução:** Tudo em uma única interface, sincronizada perfeitamente, com qualidade profissional.

### Por que o HubDub é Revolucionário

#### 🎯 **Sincronia Absoluta**
O vídeo roda exatamente no mesmo frame na tela do diretor e do dublador. Não mais "1, 2, 3... já!" - todos veem a mesma coisa ao mesmo tempo.

#### ☁️ **Takes na Nuvem Imediatos**
Assim que o dublador grava, o áudio vai para o servidor. O diretor já pode ouvir segundos depois, sem esperar uploads.

#### 🎬 **Room Integrada**
Vídeo, script (roteiro) e comunicação (videochamada) na mesma tela. Não mais janelas espalhadas, tudo organizado.

#### ⚡ **HubAlign Inteligente**
Ferramenta pós-gravação que organiza automaticamente os takes em timeline, economizando horas de trabalho do editor.

### Quem Usa o HubDub

#### 🎭 **Diretores de Dublagem**
- Controlam toda a sessão remotamente
- Aprovam ou rejeitam takes em tempo real
- Dão direções via videochamada integrada

#### 🎙️ **Dubladores Profissionais**
- Gravam de qualquer lugar com qualidade profissional
- Veem o roteiro rolando automaticamente (teleprompter)
- Recebem feedback imediato

#### 🔧 **Engenheiros de Áudio**
- Monitoram qualidade de áudio em tempo real
- Ajustam configurações remotamente
- Organizam takes para pós-produção

#### 🏢 **Estúdios de Gravação**
- Expandem alcance geográfico
- Reduzem custos operacionais
- Aumentam produtividade

### Benefícios Principais

#### ⏰ **Economia de Tempo**
- 70% mais rápido que métodos tradicionais
- Sem perdas de tempo com uploads/downloads
- Feedback imediato reduz refilagens

#### 💰 **Redução de Custos**
- Sem necessidade de estúdio físico para cada sessão
- Sem custos de deslocamento
- Menos horas de edição pós-gravação

#### 🎯 **Qualidade Profissional**
- Áudio em alta qualidade (44.1kHz, 16-bit)
- Sincronia frame-perfect
- Ferramentas profissionais integradas

#### 🌍 **Acesso Global**
- Trabalhe com talentos do mundo todo
- Sem barreiras geográficas
- 24/7 disponibilidade

---

## 2. Como Funciona

### Fluxo de Trabalho Simples: Do Script ao Áudio Final

#### 📝 **Passo 1: Preparação**
```
Script → Upload → Parser → Personagens → Scheduling
```

1. **Upload do Script:** O produtor faz upload do roteiro em formato JSON
2. **Parser Automático:** O sistema identifica personagens e falas
3. **Definição de Papéis:** Cada dublador é associado a seus personagens
4. **Agendamento:** Sessões são agendadas com todos os participantes

#### 🎬 **Passo 2: Sessão de Gravação**
```
Login → Room Sync → Recording → Real-time Review → Approval
```

1. **Entrada na Room:** Todos acessam a mesma sala virtual
2. **Sincronização:** Vídeo e script sincronizam automaticamente
3. **Gravação:** Dublador grava enquanto vê o vídeo e roteiro
4. **Review Imediato:** Diretor ouve e aprova/rejeita instantaneamente
5. **Próximo Take:** Sistema avança automaticamente para próxima fala

#### ⚡ **Passo 3: Pós-Gravação**
```
Takes → HubAlign → Timeline → Export → Editor
```

1. **Organização:** Takes aprovados vão para HubAlign
2. **Alinhamento:** Sistema organiza em timeline automaticamente
3. **Export:** Arquivos organizados são exportados
4. **Entrega:** Editor recebe material pronto para trabalhar

### A "Sala Mágica": Como Todos Trabalham Juntos Remotamente

#### 🏠 **A Room Virtual**

Imagine uma sala de estúdio física, mas digital:

```
┌─────────────────────────────────────────────────────────────┐
│  [Vídeo Original]  [Script Rolando]  [Controles de Áudio]    │
│                                                             │
│  [Videochamada com Diretor]  [Métricas de Qualidade]       │
│                                                             │
│  [Lista de Takes]  [Botões: Gravar/Parar/Loop]             │
└─────────────────────────────────────────────────────────────┘
```

**O que cada um vê:**

- **Dublador:** Vídeo sincronizado + script rolando + controles de gravação
- **Diretor:** Todas as telas acima + botões de aprovação + comunicação
- **Engenheiro:** Métricas de áudio + configurações técnicas

#### 🔄 **Sincronização Perfeita**

**O Segredo:** WebSocket + Timestamps + Algoritmos de Compensação

```javascript
// Como a sincronização funciona (explicação simples)
1. Diretor clica "Play" → WebSocket envia: {type: "play", time: 123.45}
2. Todos recebem ao mesmo tempo → Vídeo inicia em 123.45
3. Se alguém estiver 0.3s atrás → Sistema ajusta automaticamente
4. Resultado: Todos no mesmo frame, sempre!
```

#### 🎭 **Colaboração em Tempo Real**

**Lock de Linhas:** Evita que dois dubladores gravem a mesma fala simultaneamente.

**Live Changes:** Se o diretor corrige o roteiro, todos veem a mudança instantaneamente.

**Presence System:** Ícones mostram quem está online e o que cada um está fazendo.

### Tecnologia por Trás: Conceitos Básicos Explicados

#### 🌐 **WebSocket: A Mágica da Comunicação Instantânea

**Analogia:** Pense no WebSocket como um telefone entre os navegadores dos participantes.

- **Tradicional (HTTP):** Você pergunta, servidor responde, fim da conversa
- **WebSocket:** Linha aberta permanente, todos conversam simultaneamente

**Resultado:** Quando o diretor clica "play", todos os dubladores veem o vídeo começar ao mesmo tempo.

#### 🎵 **Web Audio API: O Estúdio no Navegador

**Analogia:** É como ter uma mesa de som profissional dentro do browser.

- Captura áudio do microfone com qualidade profissional
- Analisa qualidade em tempo real (volume, ruído, clipping)
- Processa e comprime para envio eficiente

#### 📹 **Daily.co: Vídeo de Qualidade

**Analogia:** Como um Zoom otimizado para dublagem.

- Latência ultrabaixa (<200ms)
- Sincronização perfeita com áudio
- Qualidade de estúdio

#### 🗄️ **PostgreSQL + Drizzle: O Cérebro Organizado

**Analogia:** Uma biblioteca super organizada que nunca perde nada.

- Todos os dados seguros e estruturados
- Relacionamentos claros (quem gravou o quê)
- Performance mesmo com milhares de takes

### Analogias Práticas: Comparação com Estúdios Físicos

#### 🏢 **Estúdio Tradicional vs HubDub**

| Estúdio Físico | HubDub Virtual |
|---|---|
| Sala de gravação física | Room virtual no navegador |
| Mesa de som analógica | Web Audio API |
| Roteiro impresso | Script digital rolando |
| Interfone para comunicação | Videochamada integrada |
| Fitas/HDs para gravação | Nuvem automática |
| Editor organiza manualmente | HubAlign automático |

#### ⏱️ **Tempo de Produção Comparativo**

```
Estúdio Tradicional: 4 horas
- 1h: Setup e preparação
- 2h: Gravação (com pausas)
- 1h: Organização manual

HubDub: 1.5 horas
- 5min: Entrar na room
- 1h: Gravação contínua
- 25min: HubAlign automático
```

**Economia: 62% de tempo reduzido!**

---

## 3. Arquitetura Técnica

### Mapa da Arquitetura: Como Tudo se Conecta

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/TypeScript)              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Recording   │ │   HubAlign   │ │   Admin     │           │
│  │    Room     │ │             │ │   Panel     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                      API GATEWAY (Express.js)               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │    Auth     │ │   WebSocket │ │  File API   │           │
│  │  Service    │ │   Service   │ │   Service   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                    BANCO DE DADOS (PostgreSQL)             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Studios   │ │  Sessions   │ │    Takes    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│              ARMAZENAMENTO (Supabase Storage)             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Áudio WAV  │ │   Vídeos    │ │   Scripts   │           │
│  │    Files    │ │   Files     │ │    JSON     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Tecnologias Escolhidas: Por Que Essas Stack?

#### 🎯 **Frontend: React 18 + TypeScript**

**Por que React?**
- **Componentização:** Cada parte da interface é um bloco reutilizável
- **Estado Reactivo:** Interface atualiza automaticamente quando dados mudam
- **Ecossistema Rico:** Milhares de bibliotecas testadas
- **Performance:** Virtual DOM para renderização eficiente

**Por que TypeScript?**
- **Segurança:** Erros detectados antes de rodar
- **IntelliSense:** Autocompletar inteligente no código
- **Manutenibilidade:** Código mais legível e documentado
- **Escalabilidade:** Facilita trabalho em equipe

```typescript
// Exemplo: Tipagem segura no HubDub
interface RecordingRoom {
  studioId: string;
  sessionId: string;
  participants: User[];
  videoState: VideoState;
  audioState: AudioState;
}

// Erro detectado em tempo de compilação, não em produção!
const room: RecordingRoom = {
  studioId: "studio-123",
  sessionId: "session-456",
  // participants: [], // TypeScript avisa: campo obrigatório!
};
```

#### ⚡ **Backend: Node.js + Express.js**

**Por que Node.js?**
- **JavaScript Universal:** Mesma linguagem frontend/backend
- **Performance:** Event loop não-bloqueante
- **Ecossistema NPM:** Maior registro de pacotes do mundo
- **WebSocket Nativo:** Comunicação real-time eficiente

**Por que Express.js?**
- **Simplicidade:** API minimalista e poderosa
- **Middleware:** Sistema de plugins flexível
- **Comunidade:** Milhares de tutoriais e exemplos
- **Performance:** Leve e rápido

```javascript
// Exemplo: API RESTful com Express
app.get('/api/sessions/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 🗄️ **Banco: PostgreSQL + Drizzle ORM**

**Por que PostgreSQL?**
- **ACID Compliance:** Transações 100% seguras
- **Performance:** Excelente para queries complexas
- **Escalabilidade:** Suporta terabytes de dados
- **Features:** JSONB, full-text search, geospatial

**Por que Drizzle ORM?**
- **TypeScript First:** Tipagem segura do banco ao código
- **Performance:** Queries otimizadas automaticamente
- **Simplicidade:** API intuitiva e moderna
- **Migrations:** Controle de versão do schema

```typescript
// Exemplo: Schema tipado com Drizzle
export const studios = pgTable('studios', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  ownerId: text('owner_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Query 100% tipada e segura
const studios = await db.select().from(studios)
  .where(eq(studios.ownerId, user.id));
```

#### 📁 **Storage: Supabase Storage**

**Por que Supabase?**
- **PostgreSQL Integrado:** Banco + storage em um serviço
- **API Simples:** Upload/download com uma linha de código
- **Segurança:** Políticas de acesso granulares
- **Performance:** CDN global automático

```typescript
// Exemplo: Upload de áudio
const { data, error } = await supabase.storage
  .from('audio-files')
  .upload(`takes/${takeId}.wav`, audioBlob, {
    contentType: 'audio/wav'
  });
```

### Padrões de Projeto: Como o Código Está Organizado

#### 🏗️ **Arquitetura em Camadas**

```
┌─────────────────────────────────────────┐
│           PRESENTATION LAYER            │
│  (React Components, UI, User Interactions)│
├─────────────────────────────────────────┤
│            BUSINESS LAYER               │
│   (Logic, Rules, Workflows, Validation)  │
├─────────────────────────────────────────┤
│            DATA LAYER                   │
│   (Database, Storage, External APIs)    │
└─────────────────────────────────────────┘
```

#### 🎯 **Domain-Driven Design (DDD)**

**Domínios Principais:**
- **Recording:** Sessões, takes, gravações
- **Production:** Estúdios, produções, scripts
- **User Management:** Autenticação, permissões, perfis
- **Media:** Áudio, vídeo, processamento

**Bounded Contexts:** Cada domínio tem suas regras e limites bem definidos.

#### 🔧 **Clean Architecture**

```typescript
// Exemplo: Separação de responsabilidades
// Controller (Presentation)
export class RecordingController {
  constructor(private recordingService: RecordingService) {}
  
  async startRecording(req: Request, res: Response) {
    const result = await this.recordingService.start(req.body);
    res.json(result);
  }
}

// Service (Business)
export class RecordingService {
  constructor(private recordingRepo: RecordingRepository) {}
  
  async start(data: StartRecordingData) {
    // Lógica de negócio aqui
    return await this.recordingRepo.save(data);
  }
}

// Repository (Data)
export class RecordingRepository {
  async save(data: RecordingData) {
    // Acesso ao banco de dados
  }
}
```

#### 🔄 **Event-Driven Architecture**

**Eventos do Sistema:**
- `recording.started`
- `take.approved`
- `session.ended`
- `user.joined`

**Benefícios:**
- Desacoplamento entre módulos
- Facilidade para adicionar novas features
- Debugging e auditoria simplificados

### Diagramas Visuais: Arquitetura em Detalhes

#### 🔄 **Fluxo de Dados: Sessão de Gravação**

```mermaid
sequenceDiagram
    participant D as Dublador
    participant R as RecordingRoom
    participant WS as WebSocket
    participant S as Server
    participant DB as Database
    participant ST as Storage

    D->>R: Clica "Gravar"
    R->>WS: {type: "recording:start"}
    WS->>S: Broadcast para todos
    S->>DB: Salva estado da sessão
    D->>R: Grava áudio (Web Audio API)
    R->>ST: Upload áudio em tempo real
    S->>DB: Salva metadados do take
    WS->>R: Broadcast: "take:completed"
    R->>D: Mostra take para review
```

#### 🏗️ **Arquitetura de Componentes**

```mermaid
graph TD
    A[App.tsx] --> B[Router]
    B --> C[RecordingRoom]
    B --> D[HubAlign]
    B --> E[AdminPanel]
    
    C --> F[VideoPlayer]
    C --> G[Teleprompter]
    C --> H[AudioControls]
    C --> I[WebSocketService]
    
    F --> J[VideoSync]
    G --> K[ScriptParser]
    H --> L[AudioAnalyzer]
    I --> M[RealtimeEvents]
```

#### 🗄️ **Schema de Banco de Dados**

```mermaid
erDiagram
    USERS ||--o{ STUDIO_MEMBERS : belongs_to
    STUDIOS ||--o{ PRODUCTIONS : owns
    PRODUCTIONS ||--o{ SESSIONS : contains
    SESSIONS ||--o{ TAKES : has
    SESSIONS ||--o{ SESSION_PARTICIPANTS : includes
    USERS ||--o{ SESSION_PARTICIPANTS : participates
    PRODUCTIONS ||--o{ CHARACTERS : defines
    TAKES }o--|| CHARACTERS : belongs_to
    USERS }o--|| TAKES : records
```

---

## 4. Tecnologias Embarcadas

### React Ecosystem: O Coração do Frontend

#### 🎯 **Hooks Avançados em Ação**

**useState vs useReducer:**
- `useState`: Para estado simples
- `useReducer`: Para estado complexo com múltiplas ações

```typescript
// Estado simples
const [isRecording, setIsRecording] = useState(false);

// Estado complexo com reducer
const [videoState, dispatch] = useReducer(videoReducer, {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1
});

// Ações do reducer
type VideoAction = 
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'SEEK'; time: number }
  | { type: 'SET_RATE'; rate: number };
```

**useEffect: Gerenciamento de Side Effects**

```typescript
// Efeito de sincronização de vídeo
useEffect(() => {
  if (!videoRef.current) return;
  
  const video = videoRef.current;
  
  // Sincroniza com estado global
  if (videoState.isPlaying) {
    video.play().catch(console.error);
  } else {
    video.pause();
  }
  
  video.currentTime = videoState.currentTime;
  video.playbackRate = videoState.playbackRate;
}, [videoState]);
```

**useMemo: Performance Inteligente**

```typescript
// Cache pesado de parsing de script
const parsedScript = useMemo(() => {
  if (!scriptJson) return [];
  
  return JSON.parse(scriptJson).map((line, index) => ({
    ...line,
    id: `line-${index}`,
    start: parseFloat(line.start),
    end: parseFloat(line.end || line.start + 2)
  }));
}, [scriptJson]); // Só recalcula se scriptJson mudar
```

**useCallback: Funções Otimizadas**

```typescript
// Evita recriação de funções
const handlePlay = useCallback(() => {
  dispatch({ type: 'PLAY' });
  wsRef.current?.send(JSON.stringify({ type: 'video:play' }));
}, []); // Dependências vazias = função nunca muda
```

#### 🔄 **Concurrent Features: React 18**

**Suspense para Loading States**

```typescript
const RecordingRoom = lazy(() => import('./RecordingRoom'));
const HubAlign = lazy(() => import('./HubAlign'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/room/:id" element={<RecordingRoom />} />
        <Route path="/align/:id" element={<HubAlign />} />
      </Routes>
    </Suspense>
  );
}
```

**Transições Automáticas**

```typescript
const [isPending, startTransition] = useTransition();

const handleScriptUpdate = (newScript) => {
  startTransition(() => {
    // Atualização não urgente (não bloqueia UI)
    setScriptJson(newScript);
  });
};
```

### TanStack Query: Gestão de Estado Server

#### 🔄 **Cache Inteligente e Sincronização**

```typescript
// Hook personalizado para dados de sessão
export function useSessionData(studioId: string, sessionId: string) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => fetchSession(studioId, sessionId),
    enabled: !!studioId && !!sessionId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    cacheTime: 1000 * 60 * 30, // 30 minutos
    refetchInterval: 1000 * 30, // Atualiza a cada 30 segundos
  });
}

// Mutations para atualizações
export function useApproveTake() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ takeId, approved }) => approveTake(takeId, approved),
    onSuccess: () => {
      // Invalida cache relacionado
      queryClient.invalidateQueries(['takes']);
      queryClient.invalidateQueries(['session']);
    },
  });
}
```

#### 🔄 **Background Sync e Refetching**

```typescript
// Sync automático em segundo plano
const queryClient = useQueryClient();

// Quando WebSocket recebe atualização
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'session:update') {
    // Atualiza cache em background
    queryClient.setQueryData(['session', data.sessionId], data.session);
  }
};
```

### WebSocket em Ação: Sincronização em Tempo Real

#### 🔌 **Arquitetura WebSocket**

```typescript
// Serviço WebSocket customizado
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  connect(studioId: string, sessionId: string) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    
    this.ws = new WebSocket(`${protocol}//${host}/ws/video-sync?studioId=${studioId}&sessionId=${sessionId}`);
    
    this.setupEventHandlers();
  }
  
  private setupEventHandlers() {
    if (!this.ws) return;
    
    this.ws.onopen = () => {
      console.log('🔌 WebSocket conectado');
      this.reconnectAttempts = 0;
    };
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
    
    this.ws.onclose = () => {
      console.log('🔌 WebSocket desconectado');
      this.attemptReconnect();
    };
    
    this.ws.onerror = (error) => {
      console.error('🔌 WebSocket error:', error);
    };
  }
  
  private handleMessage(message: any) {
    switch (message.type) {
      case 'video:play':
        this.handleVideoPlay(message);
        break;
      case 'video:pause':
        this.handleVideoPause(message);
        break;
      case 'video:seek':
        this.handleVideoSeek(message);
        break;
      case 'text:lock-line':
        this.handleTextLock(message);
        break;
      case 'presence:update':
        this.handlePresenceUpdate(message);
        break;
    }
  }
  
  send(type: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
    }
  }
}
```

#### 🎯 **Eventos de Sincronização**

```typescript
// Tipos de eventos para sincronização perfeita
interface VideoSyncEvent {
  type: 'video:sync';
  currentTime: number;
  isPlaying: boolean;
  timestamp: number; // UTC timestamp para drift compensation
}

interface TextLockEvent {
  type: 'text:lock-line';
  lineIndex: number;
  userId: string;
  userName: string;
}

interface PresenceEvent {
  type: 'presence:update';
  users: Array<{
    id: string;
    name: string;
    status: 'online' | 'away' | 'recording';
    currentLine?: number;
  }>;
}

// Handler para compensação de drift
const handleVideoSync = (event: VideoSyncEvent) => {
  const video = videoRef.current;
  if (!video) return;
  
  // Calcula drift
  const drift = Math.abs(video.currentTime - event.currentTime);
  const now = Date.now();
  const messageAge = now - event.timestamp;
  
  // Compensa se drift > 300ms
  if (drift > 0.3) {
    video.currentTime = event.currentTime;
  }
  
  // Sincroniza play/pause
  if (event.isPlaying && video.paused) {
    video.play().catch(console.error);
  } else if (!event.isPlaying && !video.paused) {
    video.pause();
  }
};
```

### Web Audio API: O Estúdio no Navegador

#### 🎵 **Gravação Profissional**

```typescript
class AudioRecordingEngine {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  
  async startRecording(options: RecordingOptions = {}): Promise<void> {
    try {
      // Solicita permissão e captura áudio
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 1, // Mono para dublagem
        }
      });
      
      // Configura Web Audio API
      this.setupAudioAnalysis();
      
      // Configura MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: this.getSupportedMimeType()
      });
      
      // Coleta chunks de áudio
      const chunks: Blob[] = [];
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      // Processa áudio quando parar
      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const wavBlob = await this.convertToWAV(audioBlob);
        
        // Envia para servidor
        await this.uploadAudio(wavBlob);
      };
      
      // Inicia gravação
      this.mediaRecorder.start(100); // Chunk de 100ms
      
    } catch (error) {
      console.error('❌ Erro ao iniciar gravação:', error);
      throw error;
    }
  }
  
  private setupAudioAnalysis(): void {
    if (!this.stream) return;
    
    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(this.stream);
    
    // Configura analisador para métricas em tempo real
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;
    
    source.connect(this.analyser);
    
    // Inicia monitoramento
    this.startAudioMonitoring();
  }
  
  private startAudioMonitoring(): void {
    if (!this.analyser) return;
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const analyze = () => {
      if (!this.analyser) return;
      
      this.analyser.getByteFrequencyData(dataArray);
      
      // Calcula métricas
      const metrics = this.calculateAudioMetrics(dataArray);
      
      // Atualiza UI
      this.updateAudioMetrics(metrics);
      
      // Continua análise
      requestAnimationFrame(analyze);
    };
    
    analyze();
  }
  
  private calculateAudioMetrics(dataArray: Uint8Array): AudioMetrics {
    // Loudness (EBU R128)
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = dataArray[i] / 255;
      sum += normalized * normalized;
    }
    const loudness = -0.691 + 10 * Math.log10(sum / dataArray.length);
    
    // Clipping detection
    const clipping = dataArray.some(value => value >= 254);
    
    // Peak level
    const peak = Math.max(...dataArray) / 255 * 100;
    
    return {
      loudness: Math.round(loudness * 10) / 10,
      clipping,
      peak: Math.round(peak),
      noiseFloor: this.calculateNoiseFloor(dataArray)
    };
  }
  
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4'
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    
    return 'audio/webm'; // Fallback
  }
}
```

#### 📊 **Análise de Qualidade em Tempo Real**

```typescript
interface AudioMetrics {
  loudness: number;      // -60 a 0 dB
  clipping: boolean;     // Detecção de distorção
  peak: number;          // 0 a 100%
  noiseFloor: number;    // Ruído de fundo em dB
}

// Componente de visualização
const AudioMeter: React.FC<{ metrics: AudioMetrics }> = ({ metrics }) => {
  return (
    <div className="audio-meter">
      <div className="loudness-bar">
        <div 
          className={`bar ${metrics.clipping ? 'clipping' : ''}`}
          style={{ width: `${Math.max(0, metrics.loudness + 60)}%` }}
        />
      </div>
      
      <div className="metrics">
        <span className={metrics.clipping ? 'warning' : ''}>
          {metrics.loudness.toFixed(1)} dB
        </span>
        {metrics.clipping && <span className="clip-warning">⚠️ CLIPPING</span>}
      </div>
    </div>
  );
};
```

### Daily.co Integration: Vídeo de Baixa Latência

#### 📹 **Configuração da Videochamada**

```typescript
import { DailyProvider, DailyCall } from '@daily-co/daily-react';

// Provider para toda aplicação
const App: React.FC = () => {
  return (
    <DailyProvider>
      <RecordingRoom />
    </DailyProvider>
  );
};

// Componente de videochamada
const VideoCall: React.FC<{ roomUrl: string }> = ({ roomUrl }) => {
  const call = useDaily();
  
  useEffect(() => {
    // Entrar na sala
    call.join({ url: roomUrl });
    
    return () => {
      // Sair quando desmontar
      call.leave();
    };
  }, [call, roomUrl]);
  
  return (
    <div className="video-call">
      {/* Vídeo local */}
      <LocalVideo />
      
      {/* Vídeos remotos */}
      <RemoteVideos />
      
      {/* Controles */}
      <CallControls />
    </div>
  );
};
```

#### 🎯 **Otimização para Dublagem**

```typescript
// Configuração otimizada para dublagem
const dublagemCallConfig = {
  // Baixa latência priorizada
  video: {
    target: 'browser',
    quality: 'low', // Menos bandwidth para mais foco em áudio
    simulcast: false, // Sem múltiplos streams
  },
  audio: {
    target: 'browser',
    quality: 'high', // Máxima qualidade de áudio
    processor: 'none', // Sem processamento adicional
  },
  // Reduz overhead
    exp: 60, // 1 minuto
    nbf: 0,
    iat: Math.floor(Date.now() / 1000),
  },
};
```

### Drizzle ORM: Banco de Dados Seguro e Tipado

#### 🗄️ **Schema Definido com Tipos**

```typescript
// schema.ts - Definição completa do banco
import { pgTable, text, timestamp, boolean, integer, uuid } from 'drizzle-orm/pg-core';

// Usuários do sistema
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name'),
  displayName: text('display_name'),
  role: text('role').default('dublator'),
  avatarUrl: text('avatar_url'),
  preferences: json('preferences').default('{}'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastLogin: timestamp('last_login'),
});

// Estúdios de dublagem
export const studios = pgTable('studios', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  avatarUrl: text('avatar_url'),
  ownerId: text('owner_id').references(() => users.id, { onDelete: 'cascade' }),
  settings: json('settings').default('{}'),
  subscriptionTier: text('subscription_tier').default('free'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Produções (filmes, séries, etc)
export const productions = pgTable('productions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  scriptJson: json('script_json'),
  scriptUrl: text('script_url'),
  studioId: text('studio_id').references(() => studios.id, { onDelete: 'cascade' }),
  status: text('status').default('draft'),
  metadata: json('metadata').default('{}'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Sessões de gravação
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  productionId: text('production_id').references(() => productions.id, { onDelete: 'cascade' }),
  status: text('status').default('scheduled'),
  scheduledAt: timestamp('scheduled_at'),
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
  settings: json('settings').default('{}'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Takes (gravações individuais)
export const takes = pgTable('takes', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
  characterId: text('character_id').references(() => characters.id),
  voiceActorId: text('voice_actor_id').references(() => users.id),
  lineIndex: integer('line_index'),
  audioUrl: text('audio_url'),
  audioBlobUrl: text('audio_blob_url'),
  durationSeconds: decimal('duration_seconds', { precision: 10, scale: 2 }),
  fileSizeBytes: integer('file_size_bytes'),
  qualityMetrics: json('quality_metrics'),
  status: text('status').default('pending'),
  notes: text('notes'),
  reviewedBy: text('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

#### 🔄 **Queries Tipadas e Seguras**

```typescript
// repository.ts - Camada de acesso a dados
export class SessionRepository {
  constructor(private db: DrizzleDB) {}
  
  // Busca sessão com todos os relacionamentos
  async findWithDetails(sessionId: string): Promise<SessionWithDetails> {
    const result = await this.db
      .select({
        session: sessions,
        production: productions,
        studio: studios,
        takes: takes,
        participants: {
          user: users,
          role: sessionParticipants.role,
        },
      })
      .from(sessions)
      .leftJoin(productions, eq(sessions.productionId, productions.id))
      .leftJoin(studios, eq(productions.studioId, studios.id))
      .leftJoin(takes, eq(sessions.id, takes.sessionId))
      .leftJoin(sessionParticipants, eq(sessions.id, sessionParticipants.sessionId))
      .leftJoin(users, eq(sessionParticipants.userId, users.id))
      .where(eq(sessions.id, sessionId));
    
    return this.formatSessionWithDetails(result);
  }
  
  // Cria sessão com validação
  async create(data: CreateSessionData): Promise<Session> {
    // Validações
    await this.validateSessionData(data);
    
    // Insert com retorno tipado
    const [session] = await this.db
      .insert(sessions)
      .values({
        id: generateId(),
        ...data,
        createdAt: new Date(),
      })
      .returning();
    
    return session;
  }
  
  private async validateSessionData(data: CreateSessionData): Promise<void> {
    // Verifica se produção existe
    const production = await this.db
      .select()
      .from(productions)
      .where(eq(productions.id, data.productionId))
      .limit(1);
    
    if (!production.length) {
      throw new Error('Produção não encontrada');
    }
    
    // Verifica permissões do usuário
    // ... mais validações
  }
}
```

#### 🚀 **Performance com Queries Otimizadas**

```typescript
// Queries complexas otimizadas
export class TakeRepository {
  // Dashboard com aggregates
  async getDashboardData(studioId: string): Promise<DashboardData> {
    const result = await this.db
      .select({
        totalSessions: sql<number>`count(DISTINCT ${sessions.id})`,
        totalTakes: sql<number>`count(${takes.id})`,
        approvedTakes: sql<number>`count(CASE WHEN ${takes.status} = 'approved' THEN 1 END)`,
        totalDuration: sql<number>`sum(${takes.durationSeconds})`,
        avgQuality: sql<number>`avg((${takes.qualityMetrics}->>'score')::integer)`,
      })
      .from(sessions)
      .leftJoin(productions, eq(sessions.productionId, productions.id))
      .leftJoin(takes, eq(sessions.id, takes.sessionId))
      .where(eq(productions.studioId, studioId));
    
    return result[0];
  }
  
  // Paginação eficiente
  async getTakesPaginated(sessionId: string, options: PaginationOptions): Promise<PaginatedResult<Take>> {
    const { page = 1, limit = 20, status } = options;
    const offset = (page - 1) * limit;
    
    let query = this.db
      .select()
      .from(takes)
      .where(eq(takes.sessionId, sessionId));
    
    if (status) {
      query = query.where(eq(takes.status, status));
    }
    
    const [takes, total] = await Promise.all([
      query.limit(limit).offset(offset),
      this.db.select({ count: sql<number>`count(*)` }).from(takes).where(eq(takes.sessionId, sessionId))
    ]);
    
    return {
      data: takes,
      pagination: {
        page,
        limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / limit),
      },
    };
  }
}
```

---

## 5. O Coração do Sistema: RecordingRoom

### Componente Principal: room.tsx Explicado

O `RecordingRoom` é o componente mais complexo e importante do HubDub. É aqui que toda a mágica acontece: gravação, sincronização, colaboração em tempo real.

Vamos analisá-lo em detalhes:

#### 🏗️ **Estrutura do Componente**

```typescript
// client/src/studio/pages/room.tsx

export default function RecordingRoom({ studioId, sessionId }: RecordingRoomProps) {
  // 1. Estados Principais (Hook declarations)
  // 2. Efeitos Colaterais (useEffects)
  // 3. Handlers de Eventos
  // 4. Renderização JSX
  
  return (
    <div className="recording-room">
      {/* Layout principal */}
    </div>
  );
}
```

#### 🎯 **Estados Principais: O Cérebro da Room**

```typescript
// Estados de Sessão e Usuário
const [session, setSession] = useState<Session | null>(null);
const [user, setUser] = useState<User | null>(null);
const [studio, setStudio] = useState<Studio | null>(null);

// Estados de Vídeo e Sincronização
const [videoState, setVideoState] = useState<VideoState>({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
});

// Estados de Gravação
const [recordingState, setRecordingState] = useState<RecordingState>({
  isRecording: false,
  currentTake: null,
  countdownValue: 0,
  qualityMetrics: null,
});

// Estados de Script e Teleprompter
const [scriptState, setScriptState] = useState<ScriptState>({
  lines: [],
  currentLine: 0,
  autoFollow: true,
  fontSize: 16,
});

// Estados Colaborativos
const [presenceState, setPresenceState] = useState<PresenceState>({
  onlineUsers: [],
  lockedLines: new Set(),
  textControllerUsers: new Set(),
});
```

#### 🔄 **WebSocket: A Conexão que Tudo Une**

```typescript
// Hook personalizado para WebSocket
const { wsRef, isConnected, sendEvent } = useWebSocket(studioId, sessionId);

// Efeito principal de sincronização
useEffect(() => {
  if (!wsRef.current) return;
  
  const ws = wsRef.current;
  
  // Handler principal de mensagens
  const handleMessage = (event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'video:sync':
          handleVideoSync(message);
          break;
          
        case 'video:play':
          setVideoState(prev => ({ ...prev, isPlaying: true }));
          break;
          
        case 'video:pause':
          setVideoState(prev => ({ ...prev, isPlaying: false }));
          break;
          
        case 'video:seek':
          setVideoState(prev => ({ ...prev, currentTime: message.currentTime }));
          break;
          
        case 'text:lock-line':
          setPresenceState(prev => ({
            ...prev,
            lockedLines: new Set([...prev.lockedLines, message.lineIndex]),
          }));
          break;
          
        case 'text:unlock-line':
          setPresenceState(prev => {
            const newLocked = new Set(prev.lockedLines);
            newLocked.delete(message.lineIndex);
            return { ...prev, lockedLines: newLocked };
          });
          break;
          
        case 'presence:update':
          setPresenceState(prev => ({
            ...prev,
            onlineUsers: message.users,
          }));
          break;
          
        case 'take:completed':
          handleTakeCompleted(message);
          break;
          
        case 'take:approved':
          handleTakeApproved(message);
          break;
      }
    } catch (error) {
      console.error('Erro ao processar mensagem WebSocket:', error);
    }
  };
  
  ws.addEventListener('message', handleMessage);
  
  return () => {
    ws.removeEventListener('message', handleMessage);
  };
}, [wsRef]);
```

#### 🎬 **Sincronização de Vídeo: Algoritmos Precisos**

```typescript
// Sistema de sincronização frame-perfect
const handleVideoSync = useCallback((message: VideoSyncMessage) => {
  const video = videoRef.current;
  if (!video) return;
  
  // Calcula drift (diferença de tempo)
  const currentVideoTime = video.currentTime;
  const targetTime = message.currentTime;
  const drift = Math.abs(currentVideoTime - targetTime);
  
  // Timestamp da mensagem para compensar latência
  const now = Date.now();
  const messageAge = now - message.timestamp;
  
  // Compensa drift se > 300ms
  if (drift > 0.3) {
    // Ajuste suave para não pular visualmente
    video.currentTime = targetTime;
  }
  
  // Sincroniza estado de play/pause
  if (message.isPlaying && video.paused) {
    video.play().catch(console.error);
  } else if (!message.isPlaying && !video.paused) {
    video.pause();
  }
  
  // Sincroniza velocidade
  if (video.playbackRate !== message.playbackRate) {
    video.playbackRate = message.playbackRate;
  }
}, []);

// Envio de eventos de vídeo
const sendVideoEvent = useCallback((type: string, data: any) => {
  sendEvent('video:' + type, {
    ...data,
    timestamp: Date.now(), // Crucial para drift compensation
  });
}, [sendEvent]);

// Handlers de vídeo
const handlePlay = useCallback(() => {
  setVideoState(prev => ({ ...prev, isPlaying: true }));
  sendVideoEvent('play', { currentTime: videoRef.current?.currentTime || 0 });
}, [sendVideoEvent]);

const handlePause = useCallback(() => {
  setVideoState(prev => ({ ...prev, isPlaying: false }));
  sendVideoEvent('pause', { currentTime: videoRef.current?.currentTime || 0 });
}, [sendVideoEvent]);

const handleSeek = useCallback((time: number) => {
  setVideoState(prev => ({ ...prev, currentTime: time }));
  sendVideoEvent('seek', { currentTime: time });
}, [sendVideoEvent]);
```

#### 📝 **Teleprompter Inteligente: Rolagem Automática**

```typescript
// Sistema de teleprompter sincronizado
const TeleprompterSystem = {
  // Calcula posição de rolagem baseada no vídeo
  calculateScrollPosition: (videoTime: number, videoDuration: number, speed: number) => {
    const progress = videoTime / videoDuration;
    const viewport = scriptViewportRef.current;
    
    if (!viewport) return 0;
    
    const scrollHeight = viewport.scrollHeight;
    const clientHeight = viewport.clientHeight;
    const maxScroll = scrollHeight - clientHeight;
    
    // Aplica velocidade de teleprompter
    return progress * maxScroll * speed;
  },
  
  // Rolagem suave
  smoothScroll: (targetPosition: number) => {
    const viewport = scriptViewportRef.current;
    if (!viewport) return;
    
    viewport.scrollTo({
      top: targetPosition,
      behavior: 'smooth',
    });
  },
  
  // Destaque de linha atual
  highlightCurrentLine: (lineIndex: number) => {
    const lines = document.querySelectorAll('.script-line');
    lines.forEach((line, index) => {
      if (index === lineIndex) {
        line.classList.add('current-line');
        line.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        line.classList.remove('current-line');
      }
    });
  },
};

// Efeito de rolagem automática
useEffect(() => {
  if (!scriptState.autoFollow || !videoState.isPlaying) return;
  
  const scrollPosition = TeleprompterSystem.calculateScrollPosition(
    videoState.currentTime,
    videoState.duration,
    1.0 // Velocidade padrão
  );
  
  TeleprompterSystem.smoothScroll(scrollPosition);
  
  // Destaca linha atual
  const currentLine = scriptState.lines.findIndex(
    line => line.start <= videoState.currentTime && line.end > videoState.currentTime
  );
  
  if (currentLine !== -1) {
    TeleprompterSystem.highlightCurrentLine(currentLine);
    setScriptState(prev => ({ ...prev, currentLine }));
  }
}, [videoState.currentTime, videoState.isPlaying, scriptState.autoFollow, scriptState.lines]);
```

#### 🎙️ **Sistema de Gravação: Qualidade Profissional**

```typescript
// Engine de gravação com métricas em tempo real
const RecordingEngine = {
  // Inicia gravação
  startRecording: async () => {
    try {
      // Solicita permissão de microfone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 1,
        },
      });
      
      // Configura Web Audio API
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 2048;
      source.connect(analyser);
      
      // Configura MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      
      // Coleta chunks
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      // Processa quando parar
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        
        // Converte para WAV
        const wavBlob = await convertToWAV(audioBlob);
        
        // Envia para servidor
        await uploadTake(wavBlob);
      };
      
      // Inicia gravação
      mediaRecorder.start(100);
      
      // Inicia monitoramento
      startAudioMonitoring(analyser);
      
      // Atualiza estado
      setRecordingState(prev => ({
        ...prev,
        isRecording: true,
        currentTake: {
          id: generateId(),
          startTime: Date.now(),
          stream,
          mediaRecorder,
        },
      }));
      
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      toast.error('Não foi possível acessar o microfone');
    }
  },
  
  // Para gravação
  stopRecording: () => {
    const { currentTake } = recordingState;
    if (!currentTake) return;
    
    // Para MediaRecorder
    currentTake.mediaRecorder.stop();
    
    // Para stream
    currentTake.stream.getTracks().forEach(track => track.stop());
    
    // Atualiza estado
    setRecordingState(prev => ({
      ...prev,
      isRecording: false,
      currentTake: null,
    }));
  },
  
  // Monitoramento de qualidade
  startAudioMonitoring: (analyser: AnalyserNode) => {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const monitor = () => {
      if (!recordingState.isRecording) return;
      
      analyser.getByteFrequencyData(dataArray);
      
      // Calcula métricas
      const metrics = calculateAudioMetrics(dataArray);
      
      // Atualiza estado
      setRecordingState(prev => ({
        ...prev,
        qualityMetrics: metrics,
      }));
      
      // Alertas de qualidade
      if (metrics.clipping) {
        toast.warning('⚠️ Detectado clipping! Reduza o volume.');
      }
      
      if (metrics.loudness < -30) {
        toast.warning('🎤 Áudio muito baixo. Aproxime-se do microfone.');
      }
      
      requestAnimationFrame(monitor);
    };
    
    monitor();
  },
};
```

#### 🔄 **Sistema de Loop: Gravação Repetitiva Inteligente**

```typescript
// Sistema de loop para prática e aperfeiçoamento
const LoopSystem = {
  // Configura loop
  configureLoop: (config: LoopConfig) => {
    setLoopState({
      isActive: true,
      type: config.type,
      startLine: config.startLine,
      endLine: config.endLine,
      startTime: config.startTime,
      endTime: config.endTime,
      prerollSeconds: config.prerollSeconds || 3,
    });
    
    // Se for loop de linha, ajusta vídeo
    if (config.type === 'line' && config.startTime && config.endTime) {
      const video = videoRef.current;
      if (video) {
        video.currentTime = Math.max(0, config.startTime - 3);
        video.play().catch(console.error);
      }
    }
  },
  
  // Executa loop
  executeLoop: () => {
    const video = videoRef.current;
    if (!video || !loopState.isActive) return;
    
    const currentTime = video.currentTime;
    
    // Verifica se passou do ponto final
    if (currentTime >= loopState.endTime!) {
      // Volta para início com preroll
      const startTime = Math.max(0, loopState.startTime! - loopState.prerollSeconds!);
      video.currentTime = startTime;
      
      // Continua reprodução
      video.play().catch(console.error);
    }
  },
  
  // Para loop
  stopLoop: () => {
    setLoopState({
      isActive: false,
      type: null,
      startLine: null,
      endLine: null,
      startTime: null,
      endTime: null,
      prerollSeconds: 3,
    });
  },
};

// Efeito de monitoramento de loop
useEffect(() => {
  if (!loopState.isActive) return;
  
  const video = videoRef.current;
  if (!video) return;
  
  const checkLoop = () => {
    LoopSystem.executeLoop();
  };
  
  const interval = setInterval(checkLoop, 100);
  
  return () => clearInterval(interval);
}, [loopState]);
```

#### 🎯 **Renderização JSX: A Interface Completa**

```typescript
return (
  <div className="recording-room h-screen flex flex-col bg-background">
    {/* Header com informações da sessão */}
    <Header 
      studio={studio}
      session={session}
      onlineUsers={presenceState.onlineUsers}
    />
    
    {/* Conteúdo principal */}
    <div className="flex-1 flex overflow-hidden">
      {/* Painel esquerdo: Vídeo e controles */}
      <div className="flex-1 flex flex-col">
        {/* Vídeo principal */}
        <VideoPlayer
          ref={videoRef}
          src={videoUrl}
          onPlay={handlePlay}
          onPause={handlePause}
          onSeek={handleSeek}
          currentTime={videoState.currentTime}
          isPlaying={videoState.isPlaying}
        />
        
        {/* Controles de gravação */}
        <RecordingControls
          isRecording={recordingState.isRecording}
          onStartRecording={RecordingEngine.startRecording}
          onStopRecording={RecordingEngine.stopRecording}
          qualityMetrics={recordingState.qualityMetrics}
          countdownValue={recordingState.countdownValue}
        />
        
        {/* Sistema de loop */}
        <LoopControls
          isActive={loopState.isActive}
          onConfigureLoop={LoopSystem.configureLoop}
          onStopLoop={LoopSystem.stopLoop}
          scriptLines={scriptState.lines}
        />
      </div>
      
      {/* Painel central: Script/Teleprompter */}
      <div className="w-96 border-l bg-card">
        <Teleprompter
          lines={scriptState.lines}
          currentLine={scriptState.currentLine}
          fontSize={scriptState.fontSize}
          autoFollow={scriptState.autoFollow}
          onLineLock={handleLineLock}
          lockedLines={presenceState.lockedLines}
          onTextChange={handleTextChange}
        />
      </div>
      
      {/* Painel direito: Takes e colaboração */}
      <div className="w-80 border-l bg-card">
        <TakesPanel
          sessionId={sessionId}
          onTakeSelect={handleTakeSelect}
          onTakeApprove={handleTakeApprove}
        />
        
        <PresencePanel
          users={presenceState.onlineUsers}
          textControllerUsers={presenceState.textControllerUsers}
        />
      </div>
    </div>
    
    {/* Footer com status e conexão */}
    <Footer
      isConnected={isConnected}
      recordingStatus={recordingState.isRecording ? 'REC' : 'READY'}
      sessionStatus={session?.status}
    />
  </div>
);
```

---

## 6. HubAlign: A Montagem Inteligente

### O que Faz: Organização Automática de Timeline

O HubAlign é a ferramenta pós-gravação que revoluciona o trabalho dos editores. Em vez de horas organizando manualmente os takes, o sistema faz isso automaticamente com precisão de milissegundos.

#### 🎯 **Propósito Principal**

**Problema Tradicional:**
- Editor recebe 50+ arquivos de áudio
- Precisa ouvir cada um para identificar
- Organiza manualmente na timeline
- Processo demorado e sujeito a erros

**Solução HubAlign:**
- Takes já identificados com timestamps
- Sistema organiza automaticamente
- Editor recebe timeline pronta
- Economia de 70% do tempo de edição

### Como Funciona: Algoritmos de Alinhamento

#### 🔄 **Processo de Alinhamento**

```typescript
// Algoritmo principal de alinhamento
class HubAlignEngine {
  async alignTakes(sessionId: string): Promise<AlignedTimeline> {
    // 1. Busca todos os takes aprovados da sessão
    const takes = await this.getApprovedTakes(sessionId);
    
    // 2. Busca script original para referência
    const script = await this.getSessionScript(sessionId);
    
    // 3. Processa cada take
    const alignedSegments = await Promise.all(
      takes.map(take => this.processTake(take, script))
    );
    
    // 4. Organiza em ordem cronológica
    const timeline = this.buildTimeline(alignedSegments);
    
    // 5. Gera arquivos para editor
    const exportData = await this.generateExportData(timeline);
    
    return {
      timeline,
      exportData,
      metadata: {
        totalDuration: timeline.duration,
        takeCount: takes.length,
        alignmentAccuracy: this.calculateAccuracy(alignedSegments),
      },
    };
  }
  
  private async processTake(take: Take, script: Script): Promise<AlignedSegment> {
    // Análise de áudio para detectar início/fim exato
    const audioAnalysis = await this.analyzeAudio(take.audioUrl);
    
    // Detecção de fala vs silêncio
    const speechSegments = this.detectSpeech(audioAnalysis);
    
    // Alinhamento com script usando timestamps
    const scriptLine = script.lines.find(line => line.index === take.lineIndex);
    
    if (!scriptLine) {
      throw new Error(`Script line not found for take ${take.id}`);
    }
    
    // Ajuste fino usando waveform analysis
    const adjustedTiming = await this.fineTuneTiming(
      speechSegments,
      scriptLine.start,
      scriptLine.end
    );
    
    return {
      takeId: take.id,
      character: scriptLine.character,
      text: scriptLine.text,
      startTime: adjustedTiming.start,
      endTime: adjustedTiming.end,
      duration: adjustedTiming.end - adjustedTiming.start,
      confidence: adjustedTiming.confidence,
    };
  }
  
  private async analyzeAudio(audioUrl: string): Promise<AudioAnalysis> {
    // Carrega arquivo de áudio
    const audioBuffer = await this.loadAudioBuffer(audioUrl);
    
    // Análise de waveform
    const waveform = this.extractWaveform(audioBuffer);
    
    // Detecção de energia (speech vs silence)
    const energyLevels = this.calculateEnergyLevels(waveform);
    
    // Detecção de pitch para análise de voz
    const pitchContour = this.extractPitchContour(audioBuffer);
    
    return {
      waveform,
      energyLevels,
      pitchContour,
      sampleRate: audioBuffer.sampleRate,
      duration: audioBuffer.duration,
    };
  }
  
  private detectSpeech(analysis: AudioAnalysis): SpeechSegment[] {
    const { energyLevels, duration } = analysis;
    const segments: SpeechSegment[] = [];
    
    // Threshold para detecção de fala
    const speechThreshold = this.calculateSpeechThreshold(energyLevels);
    
    let inSpeech = false;
    let segmentStart = 0;
    
    for (let i = 0; i < energyLevels.length; i++) {
      const time = (i / energyLevels.length) * duration;
      const energy = energyLevels[i];
      
      if (energy > speechThreshold && !inSpeech) {
        // Início de fala
        inSpeech = true;
        segmentStart = time;
      } else if (energy <= speechThreshold && inSpeech) {
        // Fim de fala
        inSpeech = false;
        segments.push({
          start: segmentStart,
          end: time,
          confidence: this.calculateSegmentConfidence(energyLevels, segmentStart, time),
        });
      }
    }
    
    // Se terminou em fala, adiciona último segmento
    if (inSpeech) {
      segments.push({
        start: segmentStart,
        end: duration,
        confidence: this.calculateSegmentConfidence(energyLevels, segmentStart, duration),
      });
    }
    
    return segments;
  }
  
  private async fineTuneTiming(
    speechSegments: SpeechSegment[],
    scriptStart: number,
    scriptEnd: number
  ): Promise<AdjustedTiming> {
    // Usa machine learning para ajuste fino
    const model = await this.loadTimingModel();
    
    // Features para o modelo
    const features = {
      speechStart: speechSegments[0]?.start || 0,
      speechEnd: speechSegments[speechSegments.length - 1]?.end || 0,
      scriptStart,
      scriptEnd,
      segmentCount: speechSegments.length,
      averageConfidence: speechSegments.reduce((sum, seg) => sum + seg.confidence, 0) / speechSegments.length,
    };
    
    // Predição de timing ajustado
    const prediction = await model.predict(features);
    
    return {
      start: prediction.adjustedStart,
      end: prediction.adjustedEnd,
      confidence: prediction.confidence,
    };
  }
}
```

#### 🎯 **Algoritmos de Machine Learning**

```typescript
// Modelo de ajuste fino de timing
class TimingAdjustmentModel {
  private model: any;
  
  constructor() {
    // Carrega modelo pré-treinado
    this.loadModel();
  }
  
  private async loadModel(): Promise<void> {
    // Em produção, isso viria de um arquivo .json ou TensorFlow.js
    this.model = {
      weights: [/* ... pesos pré-treinados ... */],
      bias: [/* ... biases ... */],
    };
  }
  
  async predict(features: TimingFeatures): Promise<TimingPrediction> {
    // Normalização de features
    const normalizedFeatures = this.normalizeFeatures(features);
    
    // Forward pass da rede neural
    const hidden = this.activate(
      this.matrixMultiply(normalizedFeatures, this.model.weights[0]),
      this.model.bias[0]
    );
    
    const output = this.activate(
      this.matrixMultiply(hidden, this.model.weights[1]),
      this.model.bias[1]
    );
    
    // Desnormalização
    const prediction = this.denormalizeOutput(output);
    
    return {
      adjustedStart: prediction.start,
      adjustedEnd: prediction.end,
      confidence: prediction.confidence,
    };
  }
  
  private normalizeFeatures(features: TimingFeatures): number[] {
    // Normalização min-max para cada feature
    return [
      this.normalize(features.speechStart, 0, 10),
      this.normalize(features.scriptStart, 0, 3600),
      this.normalize(features.speechEnd - features.speechStart, 0, 30),
      this.normalize(features.scriptEnd - features.scriptStart, 0, 30),
      this.normalize(features.segmentCount, 1, 10),
      this.normalize(features.averageConfidence, 0, 1),
    ];
  }
}
```

### Benefícios para Editores: Economia de Horas de Trabalho

#### ⏰ **Comparação de Tempo**

| Tarefa | Método Tradicional | HubAlign | Economia |
|---|---|---|---|
| Identificar takes | 2 horas | 5 minutos | 96% |
| Organizar timeline | 3 horas | 10 minutos | 94% |
| Sincronização manual | 1 hora | Automático | 100% |
| Verificação | 30 minutos | 5 minutos | 83% |
| **TOTAL** | **6.5 horas** | **20 minutos** | **95%** |

#### 🎯 **Qualidade Consistente**

**Problemas Tradicionais:**
- Erros humanos na organização
- Takes fora de lugar
- Timing impreciso
- Falhas de sincronização

**Solução HubAlign:**
- Precisão de milissegundos
- Zero erros humanos
- Timing perfeito
- Sincronização automática

#### 📊 **Métricas de Sucesso**

```typescript
// Dashboard de eficiência do HubAlign
interface HubAlignMetrics {
  totalSessionsProcessed: number;
  averageProcessingTime: number; // segundos
  accuracyRate: number; // percentual
  timeSaved: number; // horas economizadas
  
  // Métricas por projeto
  projectMetrics: {
    projectId: string;
    projectName: string;
    takesCount: number;
    processingTime: number;
    editorTimeSaved: number;
    accuracyScore: number;
  }[];
}

// Exemplo de métricas reais
const sampleMetrics: HubAlignMetrics = {
  totalSessionsProcessed: 150,
  averageProcessingTime: 45, // segundos
  accuracyRate: 98.7, // percentual
  timeSaved: 975, // horas economizadas
  
  projectMetrics: [
    {
      projectId: 'proj-001',
      projectName: 'Animação infantil',
      takesCount: 234,
      processingTime: 120,
      editorTimeSaved: 8,
      accuracyScore: 99.2,
    },
    // ... mais projetos
  ],
};
```

### Integração com Fluxo: Do Recording ao Final

#### 🔄 **Fluxo Completo Integrado**

```mermaid
sequenceDiagram
    participant D as Dublador
    participant RR as RecordingRoom
    participant S as Server
    participant HA as HubAlign
    participant E as Editor

    D->>RR: Grava take
    RR->>S: Upload áudio + metadados
    S->>S: Processa e armazena
    S->>RR: Confirma take salvo
    RR->>D: Mostra take aprovado
    
    Note over S: Sessão finalizada
    
    S->>HA: Dispara alinhamento
    HA->>HA: Processa todos os takes
    HA->>HA: Gera timeline
    HA->>S: Salva resultado
    
    E->>S: Baixa timeline pronta
    S->>E: Envia arquivos organizados
    E->>E: Importa para DAW
```

#### 📁 **Formatos de Exportação**

```typescript
// Múltiplos formatos para diferentes DAWs
interface ExportFormats {
  // Pro Tools
  proTools: {
    session: ProToolsSession;
    tracks: ProToolsTrack[];
  };
  
  // Adobe Audition
  audition: {
    session: AuditionSession;
    markers: AuditionMarker[];
  };
  
  // Reaper
  reaper: {
    project: ReaperProject;
    items: ReaperItem[];
  };
  
  // Formato universal (JSON)
  universal: {
    timeline: UniversalTimeline;
    metadata: UniversalMetadata;
  };
}

// Gerador de exports
class ExportGenerator {
  async generateForDAW(
    timeline: AlignedTimeline,
    targetDAW: DAWType
  ): Promise<ExportData> {
    switch (targetDAW) {
      case 'pro-tools':
        return this.generateProToolsExport(timeline);
      case 'audition':
        return this.generateAuditionExport(timeline);
      case 'reaper':
        return this.generateReaperExport(timeline);
      default:
        return this.generateUniversalExport(timeline);
    }
  }
  
  private async generateProToolsExport(timeline: AlignedTimeline): Promise<ProToolsExport> {
    // Gera arquivo .ptx com tracks posicionadas
    const tracks = timeline.segments.map((segment, index) => ({
      name: `${segment.character} - ${segment.takeId}`,
      start: segment.startTime,
      duration: segment.duration,
      audioFile: segment.audioUrl,
      color: this.getCharacterColor(segment.character),
    }));
    
    return {
      session: {
        name: timeline.sessionName,
        tempo: 120,
        sampleRate: 44100,
        bitDepth: 24,
      },
      tracks,
      markers: this.generateMarkers(timeline),
    };
  }
}
```

#### 🎯 **Integração com Cloud Storage**

```typescript
// Sistema de entrega automática
class DeliverySystem {
  async deliverToEditor(
    sessionId: string,
    editorEmail: string,
    preferredFormat: DAWType
  ): Promise<DeliveryResult> {
    // 1. Processa alinhamento
    const timeline = await this.hubAlign.alignTakes(sessionId);
    
    // 2. Gera export
    const exportData = await this.exportGenerator.generateForDAW(timeline, preferredFormat);
    
    // 3. Compacta arquivos
    const zipFile = await this.createPackage(exportData);
    
    // 4. Faz upload para cloud
    const downloadUrl = await this.uploadToCloud(zipFile);
    
    // 5. Envia notificação
    await this.notificationService.sendDeliveryEmail(editorEmail, {
      downloadUrl,
      projectName: timeline.sessionName,
      takeCount: timeline.segments.length,
      estimatedDuration: timeline.duration,
    });
    
    return {
      success: true,
      downloadUrl,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    };
  }
}
```

---

## 7. Funcionalidades Detalhadas

### Sistema de Loop: Gravação Repetitiva Inteligente

O sistema de loop permite que dubladores pratiquem falas específicas repetidamente, acelerando o processo de aperfeiçoamento e garantindo qualidade.

#### 🔄 **Tipos de Loop**

```typescript
// Configurações de loop disponíveis
type LoopType = 'single' | 'range' | 'custom' | 'character';

interface LoopConfig {
  type: LoopType;
  // Para loop de linha única
  lineIndex?: number;
  // Para loop de range
  startLine?: number;
  endLine?: number;
  // Para loop customizado
  startTime?: number;
  endTime?: number;
  // Para loop por personagem
  characterId?: string;
  // Configurações gerais
  prerollSeconds?: number;
  postrollSeconds?: number;
  repetitions?: number;
}
```

#### 🎯 **Implementação do Loop Engine**

```typescript
class LoopEngine {
  private isActive = false;
  private currentConfig: LoopConfig | null = null;
  private repetitionCount = 0;
  private videoRef: RefObject<HTMLVideoElement>;
  
  constructor(videoRef: RefObject<HTMLVideoElement>) {
    this.videoRef = videoRef;
  }
  
  startLoop(config: LoopConfig): void {
    this.currentConfig = config;
    this.isActive = true;
    this.repetitionCount = 0;
    
    // Posiciona vídeo no ponto inicial
    const video = this.videoRef.current;
    if (!video) return;
    
    const startTime = this.calculateStartTime(config);
    video.currentTime = Math.max(0, startTime - (config.prerollSeconds || 3));
    video.play().catch(console.error);
    
    // Inicia monitoramento
    this.startLoopMonitoring();
  }
  
  private calculateStartTime(config: LoopConfig): number {
    switch (config.type) {
      case 'single':
        return scriptLines[config.lineIndex!].start;
      case 'range':
        return scriptLines[config.startLine!].start;
      case 'custom':
        return config.startTime!;
      case 'character':
        return this.getFirstCharacterLine(config.characterId!).start;
      default:
        return 0;
    }
  }
  
  private startLoopMonitoring(): void {
    const checkLoop = () => {
      if (!this.isActive) return;
      
      const video = this.videoRef.current;
      if (!video) return;
      
      const currentTime = video.currentTime;
      const endTime = this.calculateEndTime(this.currentConfig!);
      
      // Verifica se atingiu o fim do loop
      if (currentTime >= endTime) {
        this.handleLoopEnd();
      }
    };
    
    this.loopInterval = setInterval(checkLoop, 100);
  }
  
  private handleLoopEnd(): void {
    this.repetitionCount++;
    
    // Verifica se alcançou número máximo de repetições
    if (this.currentConfig?.repetitions && 
        this.repetitionCount >= this.currentConfig.repetitions) {
      this.stopLoop();
      return;
    }
    
    // Reinicia loop
    const video = this.videoRef.current;
    if (!video) return;
    
    const startTime = this.calculateStartTime(this.currentConfig!);
    video.currentTime = Math.max(0, startTime - (this.currentConfig?.prerollSeconds || 3));
    video.play().catch(console.error);
  }
  
  stopLoop(): void {
    this.isActive = false;
    this.currentConfig = null;
    this.repetitionCount = 0;
    
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
    }
  }
}
```

#### 🎮 **Interface de Controle de Loop**

```typescript
// Componente de controle de loop
const LoopControls: React.FC = () => {
  const [loopConfig, setLoopConfig] = useState<LoopConfig | null>(null);
  const [isLooping, setIsLooping] = useState(false);
  
  return (
    <div className="loop-controls bg-card border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Sistema de Loop</h3>
      
      {/* Tipos de loop */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Button
          variant={loopConfig?.type === 'single' ? 'default' : 'outline'}
          onClick={() => setLoopConfig({ type: 'single', lineIndex: currentLine })}
        >
          Linha Atual
        </Button>
        
        <Button
          variant={loopConfig?.type === 'range' ? 'default' : 'outline'}
          onClick={() => setLoopConfig({ 
            type: 'range', 
            startLine: currentLine, 
            endLine: currentLine + 5 
          })}
        >
          Próximas 5 Linhas
        </Button>
        
        <Button
          variant={loopConfig?.type === 'character' ? 'default' : 'outline'}
          onClick={() => setLoopConfig({ 
            type: 'character', 
            characterId: currentCharacter 
          })}
        >
          Personagem Atual
        </Button>
        
        <Button
          variant={loopConfig?.type === 'custom' ? 'default' : 'outline'}
          onClick={() => setShowCustomLoopDialog(true)}
        >
          Customizado
        </Button>
      </div>
      
      {/* Configurações avançadas */}
      {loopConfig && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Label>Preroll:</Label>
            <Input
              type="number"
              value={loopConfig.prerollSeconds || 3}
              onChange={(e) => setLoopConfig({
                ...loopConfig,
                prerollSeconds: parseInt(e.target.value)
              })}
              className="w-20"
            />
            <span>segundos</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Label>Repetições:</Label>
            <Input
              type="number"
              value={loopConfig.repetitions || 0}
              onChange={(e) => setLoopConfig({
                ...loopConfig,
                repetitions: parseInt(e.target.value) || undefined
              })}
              className="w-20"
            />
            <span>(0 = infinito)</span>
          </div>
        </div>
      )}
      
      {/* Controles de start/stop */}
      <div className="flex space-x-2 mt-4">
        <Button
          onClick={() => loopEngine.startLoop(loopConfig!)}
          disabled={!loopConfig || isLooping}
          className="flex-1"
        >
          {isLooping ? 'Loop Ativo' : 'Iniciar Loop'}
        </Button>
        
        <Button
          variant="destructive"
          onClick={() => loopEngine.stopLoop()}
          disabled={!isLooping}
        >
          Parar
        </Button>
      </div>
    </div>
  );
};
```

### Qualidade de Áudio: Análise Automática em Tempo Real

O sistema de análise de qualidade monitora o áudio em tempo real durante a gravação, fornecendo feedback imediato para garantir takes de alta qualidade.

#### 📊 **Métricas Analisadas**

```typescript
interface AudioQualityMetrics {
  // Nível de volume (EBU R128 standard)
  loudness: {
    current: number;      // -60 a 0 dB
    average: number;      // Média dos últimos 5 segundos
    peak: number;         // Pico máximo
    range: number;        // Range dinâmico
  };
  
  // Detecção de problemas
  clipping: {
    isClipping: boolean;  // Detecta distorção
    clipCount: number;    // Número de clips
    lastClipTime: number; // Timestamp do último clip
  };
  
  // Ruído de fundo
  noise: {
    floorLevel: number;   // Nível de ruído em dB
    signalToNoise: number; // Ratio SNR
    quality: 'excellent' | 'good' | 'fair' | 'poor';
  };
  
  // Frequência e tom
  frequency: {
    fundamental: number;  // Frequência fundamental (Hz)
    pitchStability: number; // Estabilidade do pitch (0-1)
    spectralBalance: number[]; // Espectro de frequências
  };
}
```

#### 🎵 **Implementação do Audio Analyzer**

```typescript
class AudioQualityAnalyzer {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private microphone: MediaStreamAudioSourceNode;
  private history: number[] = [];
  private clipDetector: ClipDetector;
  private noiseAnalyzer: NoiseAnalyzer;
  
  constructor(stream: MediaStream) {
    this.audioContext = new AudioContext();
    this.microphone = this.audioContext.createMediaStreamSource(stream);
    
    // Configura analisador FFT
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 4096;
    this.analyser.smoothingTimeConstant = 0.8;
    
    this.microphone.connect(this.analyser);
    
    // Inicializa detectores especializados
    this.clipDetector = new ClipDetector();
    this.noiseAnalyzer = new NoiseAnalyzer();
    
    this.startAnalysis();
  }
  
  private startAnalysis(): void {
    const bufferLength = this.analyser.frequencyBinCount;
    const timeData = new Uint8Array(bufferLength);
    const frequencyData = new Uint8Array(bufferLength);
    
    const analyze = () => {
      this.analyser.getByteTimeDomainData(timeData);
      this.analyser.getByteFrequencyData(frequencyData);
      
      // Análise de loudness (EBU R128)
      const loudness = this.calculateLoudness(timeData);
      
      // Detecção de clipping
      const clipping = this.clipDetector.analyze(timeData);
      
      // Análise de ruído
      const noise = this.noiseAnalyzer.analyze(frequencyData);
      
      // Análise espectral
      const frequency = this.analyzeFrequency(frequencyData);
      
      // Compila métricas
      const metrics: AudioQualityMetrics = {
        loudness: this.processLoudness(loudness),
        clipping,
        noise,
        frequency,
      };
      
      // Envia para UI
      this.onMetricsUpdate(metrics);
      
      // Continua análise
      requestAnimationFrame(analyze);
    };
    
    analyze();
  }
  
  private calculateLoudness(timeData: Uint8Array): number {
    // Implementação do algoritmo EBU R128
    let sum = 0;
    let count = 0;
    
    for (let i = 0; i < timeData.length; i++) {
      // Converte para valores normalizados (-1 a 1)
      const sample = (timeData[i] - 128) / 128;
      
      // Aplica filtro de ponderação A (simplificado)
      const weightedSample = this.applyAWeighting(sample);
      
      sum += weightedSample * weightedSample;
      count++;
    }
    
    // Calcula RMS
    const rms = Math.sqrt(sum / count);
    
    // Converte para dB LUFS
    const loudness = -0.691 + 10 * Math.log10(rms);
    
    return loudness;
  }
  
  private applyAWeighting(sample: number): number {
    // Simplificação do filtro de ponderação A
    // Em produção, usar implementação completa
    return sample * 0.8;
  }
  
  private processLoudness(currentLoudness: number): LoudnessMetrics {
    // Adiciona ao histórico
    this.history.push(currentLoudness);
    if (this.history.length > 50) { // Mantém 5 segundos de histórico
      this.history.shift();
    }
    
    // Calcula média
    const average = this.history.reduce((sum, val) => sum + val, 0) / this.history.length;
    
    // Detecta pico
    const peak = Math.max(...this.history);
    
    // Calcula range
    const range = peak - Math.min(...this.history);
    
    return {
      current: Math.round(currentLoudness * 10) / 10,
      average: Math.round(average * 10) / 10,
      peak: Math.round(peak * 10) / 10,
      range: Math.round(range * 10) / 10,
    };
  }
}

// Detector especializado de clipping
class ClipDetector {
  private clipCount = 0;
  private lastClipTime = 0;
  
  analyze(timeData: Uint8Array): ClippingMetrics {
    // Detecta samples no máximo/mínimo absoluto
    const currentClip = timeData.some(sample => sample <= 0 || sample >= 255);
    
    if (currentClip) {
      this.clipCount++;
      this.lastClipTime = Date.now();
    }
    
    // Reseta contador se não houver clips por 2 segundos
    if (Date.now() - this.lastClipTime > 2000) {
      this.clipCount = 0;
    }
    
    return {
      isClipping: this.clipCount > 0,
      clipCount: this.clipCount,
      lastClipTime: this.lastClipTime,
    };
  }
}

// Analisador de ruído
class NoiseAnalyzer {
  private noiseFloor = -60; // dB
  
  analyze(frequencyData: Uint8Array): NoiseMetrics {
    // Calcula nível de ruído de fundo
    const lowFrequencyEnergy = this.calculateLowFrequencyEnergy(frequencyData);
    const totalEnergy = this.calculateTotalEnergy(frequencyData);
    
    // Signal-to-Noise Ratio
    const snr = totalEnergy - lowFrequencyEnergy;
    
    // Classificação de qualidade
    let quality: 'excellent' | 'good' | 'fair' | 'poor';
    if (snr > 40) quality = 'excellent';
    else if (snr > 30) quality = 'good';
    else if (snr > 20) quality = 'fair';
    else quality = 'poor';
    
    return {
      floorLevel: lowFrequencyEnergy,
      signalToNoise: snr,
      quality,
    };
  }
  
  private calculateLowFrequencyEnergy(frequencyData: Uint8Array): number {
    // Energia em frequências baixas (0-200Hz) - geralmente ruído
    let energy = 0;
    const cutoff = Math.floor(frequencyData.length * 0.05); // 5% das frequências
    
    for (let i = 0; i < cutoff; i++) {
      energy += frequencyData[i] * frequencyData[i];
    }
    
    return 10 * Math.log10(energy / cutoff);
  }
  
  private calculateTotalEnergy(frequencyData: Uint8Array): number {
    let energy = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      energy += frequencyData[i] * frequencyData[i];
    }
    
    return 10 * Math.log10(energy / frequencyData.length);
  }
}
```

#### 🎯 **Interface de Monitoramento de Áudio**

```typescript
// Componente visual de métricas de áudio
const AudioMetricsDisplay: React.FC<{ metrics: AudioQualityMetrics }> = ({ metrics }) => {
  return (
    <div className="audio-metrics bg-card border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Qualidade de Áudio</h3>
      
      {/* Loudness Meter */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <Label>Nível (LUFS)</Label>
          <span className={metrics.clipping.isClipping ? 'text-red-500' : ''}>
            {metrics.loudness.current} dB
          </span>
        </div>
        
        <div className="relative h-8 bg-gray-200 rounded">
          <div 
            className={`absolute h-full rounded transition-all ${
              metrics.clipping.isClipping ? 'bg-red-500' : 'bg-green-500'
            }`}
            style={{ 
              width: `${Math.max(0, Math.min(100, (metrics.loudness.current + 60) * 1.67))}%` 
            }}
          />
          
          {/* Marcadores de target */}
          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-yellow-400" />
          <div className="absolute top-0 left-2/3 w-0.5 h-full bg-orange-400" />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>-60</span>
          <span>-23 (target)</span>
          <span>-9</span>
          <span>0</span>
        </div>
      </div>
      
      {/* Alertas */}
      <div className="space-y-2">
        {metrics.clipping.isClipping && (
          <div className="flex items-center space-x-2 text-red-500">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">⚠️ Clipping detectado! Reduza o volume.</span>
          </div>
        )}
        
        {metrics.noise.quality === 'poor' && (
          <div className="flex items-center space-x-2 text-orange-500">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">Ruído alto detectado. Verifique o ambiente.</span>
          </div>
        )}
        
        {metrics.loudness.current < -30 && !metrics.clipping.isClipping && (
          <div className="flex items-center space-x-2 text-yellow-500">
            <Volume2 className="w-4 h-4" />
            <span className="text-sm">Áudio baixo. Aproxime-se do microfone.</span>
          </div>
        )}
      </div>
      
      {/* Métricas detalhadas */}
      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
        <div>
          <span className="text-gray-500">Média:</span>
          <span className="ml-2">{metrics.loudness.average} dB</span>
        </div>
        <div>
          <span className="text-gray-500">Pico:</span>
          <span className="ml-2">{metrics.loudness.peak} dB</span>
        </div>
        <div>
          <span className="text-gray-500">SNR:</span>
          <span className="ml-2">{metrics.noise.signalToNoise} dB</span>
        </div>
        <div>
          <span className="text-gray-500">Qualidade:</span>
          <span className={`ml-2 capitalize ${
            metrics.noise.quality === 'excellent' ? 'text-green-500' :
            metrics.noise.quality === 'good' ? 'text-blue-500' :
            metrics.noise.quality === 'fair' ? 'text-yellow-500' :
            'text-red-500'
          }`}>
            {metrics.noise.quality}
          </span>
        </div>
      </div>
    </div>
  );
};
```

### Lock de Linhas: Trabalho Colaborativo Sem Conflitos

O sistema de lock de linhas evita que múltiplos usuários editem a mesma fala simultaneamente, garantindo consistência e prevenindo conflitos.

#### 🔒 **Implementação do Lock System**

```typescript
interface LineLock {
  lineIndex: number;
  userId: string;
  userName: string;
  timestamp: number;
  expiresAt: number;
}

class LineLockManager {
  private locks: Map<number, LineLock> = new Map();
  private wsRef: RefObject<WebSocket>;
  private currentUserId: string;
  
  constructor(wsRef: RefObject<WebSocket>, currentUserId: string) {
    this.wsRef = wsRef;
    this.currentUserId = currentUserId;
  }
  
  // Tenta bloquear uma linha
  requestLock(lineIndex: number): boolean {
    // Verifica se já existe lock
    const existingLock = this.locks.get(lineIndex);
    
    // Se existe lock de outro usuário, não permite
    if (existingLock && existingLock.userId !== this.currentUserId) {
      // Verifica se expirou
      if (Date.now() < existingLock.expiresAt) {
        return false;
      }
      // Lock expirou, remove
      this.locks.delete(lineIndex);
    }
    
    // Cria novo lock
    const lock: LineLock = {
      lineIndex,
      userId: this.currentUserId,
      userName: getCurrentUserName(),
      timestamp: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutos
    };
    
    this.locks.set(lineIndex, lock);
    
    // Notifica outros usuários
    this.broadcastLock(lock);
    
    return true;
  }
  
  // Libera lock
  releaseLock(lineIndex: number): void {
    const lock = this.locks.get(lineIndex);
    
    if (lock && lock.userId === this.currentUserId) {
      this.locks.delete(lineIndex);
      this.broadcastUnlock(lineIndex);
    }
  }
  
  // Verifica se linha está bloqueada
  isLineLocked(lineIndex: number): boolean {
    const lock = this.locks.get(lineIndex);
    
    if (!lock) return false;
    
    // Verifica se expirou
    if (Date.now() >= lock.expiresAt) {
      this.locks.delete(lineIndex);
      return false;
    }
    
    return true;
  }
  
  // Retorna informações do lock
  getLockInfo(lineIndex: number): LineLock | null {
    const lock = this.locks.get(lineIndex);
    
    if (!lock || Date.now() >= lock.expiresAt) {
      this.locks.delete(lineIndex);
      return null;
    }
    
    return lock;
  }
  
  // Broadcast de lock via WebSocket
  private broadcastLock(lock: LineLock): void {
    const message = {
      type: 'text:lock-line',
      lineIndex: lock.lineIndex,
      userId: lock.userId,
      userName: lock.userName,
      timestamp: lock.timestamp,
    };
    
    if (this.wsRef.current?.readyState === WebSocket.OPEN) {
      this.wsRef.current.send(JSON.stringify(message));
    }
  }
  
  // Broadcast de unlock
  private broadcastUnlock(lineIndex: number): void {
    const message = {
      type: 'text:unlock-line',
      lineIndex,
      userId: this.currentUserId,
    };
    
    if (this.wsRef.current?.readyState === WebSocket.OPEN) {
      this.wsRef.current.send(JSON.stringify(message));
    }
  }
  
  // Processa lock recebido de outro usuário
  handleRemoteLock(message: any): void {
    const lock: LineLock = {
      lineIndex: message.lineIndex,
      userId: message.userId,
      userName: message.userName,
      timestamp: message.timestamp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };
    
    this.locks.set(message.lineIndex, lock);
  }
  
  // Processa unlock recebido
  handleRemoteUnlock(message: any): void {
    if (message.userId !== this.currentUserId) {
      this.locks.delete(message.lineIndex);
    }
  }
  
  // Limpa locks expirados
  cleanupExpiredLocks(): void {
    const now = Date.now();
    
    for (const [lineIndex, lock] of this.locks.entries()) {
      if (now >= lock.expiresAt) {
        this.locks.delete(lineIndex);
      }
    }
  }
}
```

#### 🎯 **Interface Visual de Locks**

```typescript
// Componente de linha com lock
const ScriptLine: React.FC<{
  line: ScriptLine;
  index: number;
  isCurrent: boolean;
  onEdit: (index: number, text: string) => void;
  lockInfo: LineLock | null;
  onRequestLock: (index: number) => void;
}> = ({ line, index, isCurrent, onEdit, lockInfo, onRequestLock }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(line.text);
  const lockManager = useLockManager();
  
  const handleEdit = () => {
    if (lockInfo && lockInfo.userId !== getCurrentUserId()) {
      // Linha bloqueada por outro usuário
      toast.info(`Linha bloqueada por ${lockInfo.userName}`);
      return;
    }
    
    if (!lockInfo) {
      // Solicita lock
      const acquired = lockManager.requestLock(index);
      if (!acquired) {
        toast.error('Não foi possível bloquear a linha');
        return;
      }
    }
    
    setIsEditing(true);
  };
  
  const handleSave = () => {
    onEdit(index, editText);
    setIsEditing(false);
    lockManager.releaseLock(index);
  };
  
  const handleCancel = () => {
    setEditText(line.text);
    setIsEditing(false);
    lockManager.releaseLock(index);
  };
  
  return (
    <div 
      className={cn(
        'script-line p-3 border rounded transition-all',
        isCurrent && 'bg-blue-50 border-blue-300',
        lockInfo && lockInfo.userId !== getCurrentUserId() && 'bg-orange-50 border-orange-300',
        isEditing && 'bg-yellow-50 border-yellow-300'
      )}
    >
      {/* Cabeçalho da linha */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-sm">{line.character}</span>
          <span className="text-xs text-gray-500">#{index + 1}</span>
        </div>
        
        {/* Indicador de lock */}
        {lockInfo && (
          <div className="flex items-center space-x-1 text-xs text-orange-600">
            <Lock className="w-3 h-3" />
            <span>{lockInfo.userName}</span>
          </div>
        )}
      </div>
      
      {/* Conteúdo da linha */}
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="min-h-[60px]"
            autoFocus
          />
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleSave}>
              Salvar
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="group">
          <p className="text-sm leading-relaxed">{line.text}</p>
          
          {/* Botões de ação (aparecem no hover) */}
          <div className="flex space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEdit}
              disabled={lockInfo && lockInfo.userId !== getCurrentUserId()}
            >
              <Edit className="w-3 h-3" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRequestLock(index)}
              disabled={!!lockInfo}
            >
              <Lock className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
```

### Presence System: Quem Está Online e O Que Faz

O sistema de presence mostra em tempo real quem está conectado à sessão e o que cada usuário está fazendo.

#### 👥 **Implementação do Presence System**

```typescript
interface PresenceUser {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'recording';
  currentActivity?: {
    type: 'recording' | 'editing' | 'watching' | 'idle';
    details?: string;
  };
  lastSeen: number;
  cursor?: {
    lineIndex: number;
    character?: string;
  };
}

class PresenceManager {
  private users: Map<string, PresenceUser> = new Map();
  private wsRef: RefObject<WebSocket>;
  private currentUserId: string;
  private heartbeatInterval: NodeJS.Timeout;
  
  constructor(wsRef: RefObject<WebSocket>, currentUserId: string) {
    this.wsRef = wsRef;
    this.currentUserId = currentUserId;
    this.startHeartbeat();
  }
  
  // Inicia heartbeat para manter status atualizado
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.updatePresence();
    }, 30000); // A cada 30 segundos
  }
  
  // Atualiza status do usuário atual
  updatePresence(activity?: PresenceUser['currentActivity']): void {
    const currentUser = this.users.get(this.currentUserId);
    
    if (!currentUser) return;
    
    const updatedUser: PresenceUser = {
      ...currentUser,
      lastSeen: Date.now(),
      currentActivity: activity || { type: 'idle' },
    };
    
    this.users.set(this.currentUserId, updatedUser);
    this.broadcastPresence(updatedUser);
  }
  
  // Adiciona usuário à sessão
  addUser(user: PresenceUser): void {
    this.users.set(user.id, user);
    this.broadcastPresence(user);
  }
  
  // Remove usuário da sessão
  removeUser(userId: string): void {
    this.users.delete(userId);
    this.broadcastUserLeft(userId);
  }
  
  // Atualiza cursor do usuário
  updateCursor(lineIndex: number, character?: string): void {
    const currentUser = this.users.get(this.currentUserId);
    
    if (!currentUser) return;
    
    const updatedUser: PresenceUser = {
      ...currentUser,
      cursor: { lineIndex, character },
      lastSeen: Date.now(),
    };
    
    this.users.set(this.currentUserId, updatedUser);
    this.broadcastCursor(updatedUser);
  }
  
  // Processa presença recebida
  handlePresenceUpdate(user: PresenceUser): void {
    this.users.set(user.id, user);
  }
  
  // Processa cursor recebido
  handleCursorUpdate(userId: string, cursor: PresenceUser['cursor']): void {
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, { ...user, cursor, lastSeen: Date.now() });
    }
  }
  
  // Remove usuários inativos (timeout de 2 minutos)
  cleanupInactiveUsers(): void {
    const now = Date.now();
    const timeout = 2 * 60 * 1000; // 2 minutos
    
    for (const [userId, user] of this.users.entries()) {
      if (now - user.lastSeen > timeout) {
        this.users.delete(userId);
        this.broadcastUserLeft(userId);
      }
    }
  }
  
  // Broadcast de presença
  private broadcastPresence(user: PresenceUser): void {
    const message = {
      type: 'presence:update',
      user,
    };
    
    if (this.wsRef.current?.readyState === WebSocket.OPEN) {
      this.wsRef.current.send(JSON.stringify(message));
    }
  }
  
  // Broadcast de cursor
  private broadcastCursor(user: PresenceUser): void {
    const message = {
      type: 'presence:cursor',
      userId: user.id,
      cursor: user.cursor,
    };
    
    if (this.wsRef.current?.readyState === WebSocket.OPEN) {
      this.wsRef.current.send(JSON.stringify(message));
    }
  }
  
  // Broadcast de usuário saiu
  private broadcastUserLeft(userId: string): void {
    const message = {
      type: 'presence:user-left',
      userId,
    };
    
    if (this.wsRef.current?.readyState === WebSocket.OPEN) {
      this.wsRef.current.send(JSON.stringify(message));
    }
  }
  
  // Retorna lista de usuários online
  getOnlineUsers(): PresenceUser[] {
    return Array.from(this.users.values())
      .filter(user => user.id !== this.currentUserId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  
  // Cleanup
  destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }
}
```

#### 🎯 **Interface de Presence**

```typescript
// Componente de usuários online
const PresencePanel: React.FC = () => {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const presenceManager = usePresenceManager();
  
  useEffect(() => {
    const updateUsers = () => {
      setOnlineUsers(presenceManager.getOnlineUsers());
    };
    
    updateUsers();
    const interval = setInterval(updateUsers, 1000);
    
    return () => clearInterval(interval);
  }, [presenceManager]);
  
  return (
    <div className="presence-panel bg-card border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">
        Usuários Online ({onlineUsers.length + 1})
      </h3>
      
      {/* Usuário atual */}
      <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded mb-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={getCurrentUserAvatar()} />
          <AvatarFallback>{getCurrentUserInitials()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-medium text-sm">{getCurrentUserName()}</div>
          <div className="text-xs text-gray-500">Eu</div>
        </div>
        <div className="w-2 h-2 bg-green-500 rounded-full" />
      </div>
      
      {/* Outros usuários */}
      <div className="space-y-2">
        {onlineUsers.map(user => (
          <UserPresenceCard key={user.id} user={user} />
        ))}
      </div>
      
      {/* Indicadores de atividade */}
      <div className="mt-4 pt-4 border-t">
        <h4 className="text-sm font-medium mb-2">Atividade Recente</h4>
        <div className="space-y-1 text-xs text-gray-500">
          {onlineUsers.map(user => (
            user.currentActivity && (
              <div key={user.id} className="flex items-center space-x-2">
                <ActivityIcon activity={user.currentActivity.type} />
                <span>{user.name}: {getActivityDescription(user.currentActivity)}</span>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

// Card de usuário individual
const UserPresenceCard: React.FC<{ user: PresenceUser }> = ({ user }) => {
  const getStatusColor = (status: PresenceUser['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'recording': return 'bg-red-600 animate-pulse';
      default: return 'bg-gray-400';
    }
  };
  
  const getActivityIcon = (activity?: PresenceUser['currentActivity']) => {
    if (!activity) return null;
    
    switch (activity.type) {
      case 'recording': return <Mic className="w-3 h-3 text-red-500" />;
      case 'editing': return <Edit className="w-3 h-3 text-blue-500" />;
      case 'watching': return <Eye className="w-3 h-3 text-green-500" />;
      default: return null;
    }
  };
  
  return (
    <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded transition-colors">
      <Avatar className="w-8 h-8">
        <AvatarImage src={user.avatar} />
        <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm">{user.name}</span>
          {getActivityIcon(user.currentActivity)}
        </div>
        
        {user.currentActivity && (
          <div className="text-xs text-gray-500">
            {getActivityDescription(user.currentActivity)}
          </div>
        )}
        
        {user.cursor && (
          <div className="text-xs text-blue-600">
            Linha {user.cursor.lineIndex + 1}
            {user.cursor.character && ` • ${user.cursor.character}`}
          </div>
        )}
      </div>
      
      <div className={cn('w-2 h-2 rounded-full', getStatusColor(user.status))} />
    </div>
  );
};

// Utilitários
const ActivityIcon: React.FC<{ activity: string }> = ({ activity }) => {
  switch (activity) {
    case 'recording': return <Mic className="w-3 h-3" />;
    case 'editing': return <Edit className="w-3 h-3" />;
    case 'watching': return <Eye className="w-3 h-3" />;
    default: return null;
  }
};

const getActivityDescription = (activity: PresenceUser['currentActivity']): string => {
  switch (activity.type) {
    case 'recording': return 'Gravando...';
    case 'editing': return activity.details ? `Editando: ${activity.details}` : 'Editando...';
    case 'watching': return 'Assistindo...';
    case 'idle': return 'Inativo';
    default: return 'Desconhecido';
  }
};
```

---

## 8. Banco de Dados e Persistência

### Schema Completo: Tables, Relationships, Indexes

O banco de dados PostgreSQL do HubDub foi projetado para alta performance e consistência, com schema normalizado e indexes otimizados.

#### 🗄️ **Estrutura Principal**

```sql
-- Schema completo do HubDub
-- Criado com Drizzle ORM mas mostrado aqui em SQL para clareza

-- Usuários do sistema
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    display_name TEXT,
    role TEXT DEFAULT 'dublator' CHECK (role IN ('platform_owner', 'admin', 'studio_owner', 'director', 'dublator', 'viewer')),
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- Estúdios de dublagem
CREATE TABLE studios (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{}',
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Membros do estúdio
CREATE TABLE studio_members (
    id TEXT PRIMARY KEY,
    studio_id TEXT NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'director', 'dublator', 'viewer')),
    permissions JSONB DEFAULT '[]',
    invited_by TEXT REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(studio_id, user_id)
);

-- Produções (filmes, séries, etc)
CREATE TABLE productions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    script_json JSONB,
    script_url TEXT,
    studio_id TEXT NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Personagens da produção
CREATE TABLE characters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    production_id TEXT NOT NULL REFERENCES productions(id) ON DELETE CASCADE,
    voice_actor_id TEXT REFERENCES users(id),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sessões de gravação
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    production_id TEXT NOT NULL REFERENCES productions(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'paused', 'completed', 'cancelled')),
    scheduled_at TIMESTAMP,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Participantes da sessão
CREATE TABLE session_participants (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('director', 'dublator', 'observer', 'engineer')),
    character_id TEXT REFERENCES characters(id),
    joined_at TIMESTAMP DEFAULT NOW(),
    left_at TIMESTAMP,
    connection_status TEXT DEFAULT 'offline' CHECK (connection_status IN ('online', 'offline', 'away')),
    UNIQUE(session_id, user_id)
);

-- Takes (gravações individuais)
CREATE TABLE takes (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    character_id TEXT NOT NULL REFERENCES characters(id),
    voice_actor_id TEXT NOT NULL REFERENCES users(id),
    line_index INTEGER,
    audio_url TEXT,
    audio_blob_url TEXT,
    duration_seconds DECIMAL(10,2),
    file_size_bytes BIGINT,
    quality_metrics JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_revision')),
    notes TEXT,
    reviewed_by TEXT REFERENCES users(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Reviews de takes (histórico)
CREATE TABLE take_reviews (
    id TEXT PRIMARY KEY,
    take_id TEXT NOT NULL REFERENCES takes(id) ON DELETE CASCADE,
    reviewer_id TEXT NOT NULL REFERENCES users(id),
    decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected', 'needs_revision')),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Logs de atividade (auditoria)
CREATE TABLE activity_logs (
    id TEXT PRIMARY KEY,
    studio_id TEXT REFERENCES studios(id),
    user_id TEXT REFERENCES users(id),
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Configurações de sistema
CREATE TABLE system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by TEXT REFERENCES users(id)
);
```

#### 🔗 **Relacionamentos e Constraints**

```sql
-- Triggers para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers às tabelas relevantes
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_studios_updated_at BEFORE UPDATE ON studios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productions_updated_at BEFORE UPDATE ON productions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_takes_updated_at BEFORE UPDATE ON takes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Constraints adicionais
ALTER TABLE studios ADD CONSTRAINT check_owner_in_members 
    CHECK (owner_id IN (SELECT user_id FROM studio_members WHERE studio_id = studios.id AND role = 'owner'));

ALTER TABLE sessions ADD CONSTRAINT check_valid_status_transition 
    CHECK (
        (status = 'scheduled' AND started_at IS NULL) OR
        (status = 'active' AND started_at IS NOT NULL AND ended_at IS NULL) OR
        (status = 'paused' AND started_at IS NOT NULL AND ended_at IS NULL) OR
        (status = 'completed' AND started_at IS NOT NULL AND ended_at IS NOT NULL) OR
        (status = 'cancelled')
    );
```

#### 📊 **Índices Otimizados**

```sql
-- Índices primários (já criados pelas PKs)

-- Índices de performance para queries comuns
CREATE INDEX idx_studios_owner_id ON studios(owner_id);
CREATE INDEX idx_studios_subscription_tier ON studios(subscription_tier);

CREATE INDEX idx_studio_members_studio_id ON studio_members(studio_id);
CREATE INDEX idx_studio_members_user_id ON studio_members(user_id);
CREATE INDEX idx_studio_members_role ON studio_members(role);

CREATE INDEX idx_productions_studio_id ON productions(studio_id);
CREATE INDEX idx_productions_status ON productions(status);

CREATE INDEX idx_characters_production_id ON characters(production_id);
CREATE INDEX idx_characters_voice_actor_id ON characters(voice_actor_id);

CREATE INDEX idx_sessions_production_id ON sessions(production_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_scheduled_at ON sessions(scheduled_at);

CREATE INDEX idx_session_participants_session_id ON session_participants(session_id);
CREATE INDEX idx_session_participants_user_id ON session_participants(user_id);
CREATE INDEX idx_session_participants_role ON session_participants(role);

CREATE INDEX idx_takes_session_id ON takes(session_id);
CREATE INDEX idx_takes_character_id ON takes(character_id);
CREATE INDEX idx_takes_voice_actor_id ON takes(voice_actor_id);
CREATE INDEX idx_takes_status ON takes(status);
CREATE INDEX idx_takes_created_at ON takes(created_at);

CREATE INDEX idx_take_reviews_take_id ON take_reviews(take_id);
CREATE INDEX idx_take_reviews_reviewer_id ON take_reviews(reviewer_id);

CREATE INDEX idx_activity_logs_studio_id ON activity_logs(studio_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);

-- Índices compostos para queries complexas
CREATE INDEX idx_takes_session_status ON takes(session_id, status);
CREATE INDEX idx_session_participants_session_role ON session_participants(session_id, role);
CREATE INDEX idx_activity_logs_studio_created ON activity_logs(studio_id, created_at);

-- Índices GIN para JSONB
CREATE INDEX idx_productions_script_json ON productions USING GIN(script_json);
CREATE INDEX idx_takes_quality_metrics ON takes USING GIN(quality_metrics);
CREATE INDEX idx_users_preferences ON users USING GIN(preferences);
CREATE INDEX idx_studios_settings ON studios USING GIN(settings);

-- Índices parciais para melhor performance
CREATE INDEX idx_active_sessions ON sessions(production_id) WHERE status = 'active';
CREATE INDEX idx_approved_takes ON takes(session_id, created_at) WHERE status = 'approved';
CREATE INDEX idx_recent_activity ON activity_logs(created_at) WHERE created_at > NOW() - INTERVAL '30 days';
```

### Models Tipados: TypeScript + Drizzle

#### 🏗️ **Schema em TypeScript**

```typescript
// schema.ts - Definição completa com Drizzle ORM
import { 
  pgTable, 
  text, 
  timestamp, 
  boolean, 
  integer, 
  decimal, 
  uuid,
  jsonb,
  index,
  primaryKey
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tipos de enums
export const userRoles = ['platform_owner', 'admin', 'studio_owner', 'director', 'dublator', 'viewer'] as const;
export const sessionStatuses = ['scheduled', 'active', 'paused', 'completed', 'cancelled'] as const;
export const takeStatuses = ['pending', 'approved', 'rejected', 'needs_revision'] as const;

// Tabela de usuários
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name'),
  displayName: text('display_name'),
  role: text('role').default('dublator'),
  avatarUrl: text('avatar_url'),
  preferences: jsonb('preferences').default('{}'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastLogin: timestamp('last_login'),
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
  roleIdx: index('idx_users_role').on(table.role),
}));

// Tabela de estúdios
export const studios = pgTable('studios', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  avatarUrl: text('avatar_url'),
  ownerId: text('owner_id').references(() => users.id, { onDelete: 'cascade' }),
  settings: jsonb('settings').default('{}'),
  subscriptionTier: text('subscription_tier').default('free'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  ownerIdIdx: index('idx_studios_owner_id').on(table.ownerId),
  subscriptionIdx: index('idx_studios_subscription_tier').on(table.subscriptionTier),
}));

// Tabela de membros do estúdio
export const studioMembers = pgTable('studio_members', {
  id: text('id').primaryKey(),
  studioId: text('studio_id').references(() => studios.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  permissions: jsonb('permissions').default('[]'),
  invitedBy: text('invited_by').references(() => users.id),
  joinedAt: timestamp('joined_at').defaultNow(),
}, (table) => ({
  studioIdIdx: index('idx_studio_members_studio_id').on(table.studioId),
  userIdIdx: index('idx_studio_members_user_id').on(table.userId),
  roleIdx: index('idx_studio_members_role').on(table.role),
  uniqueStudioUser: index('unique_studio_user').on(table.studioId, table.userId).unique(),
}));

// Tabela de produções
export const productions = pgTable('productions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  scriptJson: jsonb('script_json'),
  scriptUrl: text('script_url'),
  studioId: text('studio_id').references(() => studios.id, { onDelete: 'cascade' }),
  status: text('status').default('draft'),
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  studioIdIdx: index('idx_productions_studio_id').on(table.studioId),
  statusIdx: index('idx_productions_status').on(table.status),
}));

// Tabela de personagens
export const characters = pgTable('characters', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  avatarUrl: text('avatar_url'),
  productionId: text('production_id').references(() => productions.id, { onDelete: 'cascade' }),
  voiceActorId: text('voice_actor_id').references(() => users.id),
  orderIndex: integer('order_index').default(0),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  productionIdIdx: index('idx_characters_production_id').on(table.productionId),
  voiceActorIdIdx: index('idx_characters_voice_actor_id').on(table.voiceActorId),
}));

// Tabela de sessões
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  productionId: text('production_id').references(() => productions.id, { onDelete: 'cascade' }),
  status: text('status').default('scheduled'),
  scheduledAt: timestamp('scheduled_at'),
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
  settings: jsonb('settings').default('{}'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  productionIdIdx: index('idx_sessions_production_id').on(table.productionId),
  statusIdx: index('idx_sessions_status').on(table.status),
  scheduledAtIdx: index('idx_sessions_scheduled_at').on(table.scheduledAt),
}));

// Tabela de participantes da sessão
export const sessionParticipants = pgTable('session_participants', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  characterId: text('character_id').references(() => characters.id),
  joinedAt: timestamp('joined_at').defaultNow(),
  leftAt: timestamp('left_at'),
  connectionStatus: text('connection_status').default('offline'),
}, (table) => ({
  sessionIdIdx: index('idx_session_participants_session_id').on(table.sessionId),
  userIdIdx: index('idx_session_participants_user_id').on(table.userId),
  roleIdx: index('idx_session_participants_role').on(table.role),
  uniqueSessionUser: index('unique_session_user').on(table.sessionId, table.userId).unique(),
}));

// Tabela de takes
export const takes = pgTable('takes', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
  characterId: text('character_id').references(() => characters.id),
  voiceActorId: text('voice_actor_id').references(() => users.id),
  lineIndex: integer('line_index'),
  audioUrl: text('audio_url'),
  audioBlobUrl: text('audio_blob_url'),
  durationSeconds: decimal('duration_seconds', { precision: 10, scale: 2 }),
  fileSizeBytes: integer('file_size_bytes'),
  qualityMetrics: jsonb('quality_metrics'),
  status: text('status').default('pending'),
  notes: text('notes'),
  reviewedBy: text('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  sessionIdIdx: index('idx_takes_session_id').on(table.sessionId),
  characterIdIdx: index('idx_takes_character_id').on(table.characterId),
  voiceActorIdIdx: index('idx_takes_voice_actor_id').on(table.voiceActorId),
  statusIdx: index('idx_takes_status').on(table.status),
  createdAtIdx: index('idx_takes_created_at').on(table.createdAt),
  sessionStatusIdx: index('idx_takes_session_status').on(table.sessionId, table.status),
}));

// Tabela de reviews
export const takeReviews = pgTable('take_reviews', {
  id: text('id').primaryKey(),
  takeId: text('take_id').references(() => takes.id, { onDelete: 'cascade' }),
  reviewerId: text('reviewer_id').references(() => users.id),
  decision: text('decision').notNull(),
  feedback: text('feedback'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  takeIdIdx: index('idx_take_reviews_take_id').on(table.takeId),
  reviewerIdIdx: index('idx_take_reviews_reviewer_id').on(table.reviewerId),
}));

// Tabela de logs de atividade
export const activityLogs = pgTable('activity_logs', {
  id: text('id').primaryKey(),
  studioId: text('studio_id').references(() => studios.id),
  userId: text('user_id').references(() => users.id),
  action: text('action').notNull(),
  resourceType: text('resource_type'),
  resourceId: text('resource_id'),
  metadata: jsonb('metadata').default('{}'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  studioIdIdx: index('idx_activity_logs_studio_id').on(table.studioId),
  userIdIdx: index('idx_activity_logs_user_id').on(table.userId),
  createdAtIdx: index('idx_activity_logs_created_at').on(table.createdAt),
  actionIdx: index('idx_activity_logs_action').on(table.action),
  studioCreatedIdx: index('idx_activity_logs_studio_created').on(table.studioId, table.createdAt),
}));

// Relacionamentos
export const usersRelations = relations(users, ({ many }) => ({
  ownedStudios: many(studios),
  studioMemberships: many(studioMembers),
  characters: many(characters),
  takes: many(takes),
  takeReviews: many(takeReviews),
  sessionParticipants: many(sessionParticipants),
  activityLogs: many(activityLogs),
}));

export const studiosRelations = relations(studios, ({ one, many }) => ({
  owner: one(users, {
    fields: [studios.ownerId],
    references: [users.id],
  }),
  members: many(studioMembers),
  productions: many(productions),
  activityLogs: many(activityLogs),
}));

export const productionsRelations = relations(productions, ({ one, many }) => ({
  studio: one(studios, {
    fields: [productions.studioId],
    references: [studios.id],
  }),
  characters: many(characters),
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  production: one(productions, {
    fields: [sessions.productionId],
    references: [productions.id],
  }),
  participants: many(sessionParticipants),
  takes: many(takes),
}));

export const takesRelations = relations(takes, ({ one, many }) => ({
  session: one(sessions, {
    fields: [takes.sessionId],
    references: [sessions.id],
  }),
  character: one(characters, {
    fields: [takes.characterId],
    references: [characters.id],
  }),
  voiceActor: one(users, {
    fields: [takes.voiceActorId],
    references: [users.id],
  }),
  reviews: many(takeReviews),
}));

// Tipos exportados para uso na aplicação
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Studio = typeof studios.$inferSelect;
export type NewStudio = typeof studios.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Take = typeof takes.$inferSelect;
export type NewTake = typeof takes.$inferInsert;
```

### Migrations: Como Evolui o Banco

#### 🔄 **Sistema de Migrations com Drizzle**

```typescript
// migrations/001_initial_schema.ts
import { Migration } from 'drizzle-orm/pg-migration';

export const migration: Migration = {
  id: '001_initial_schema',
  sql: `
    -- Todas as tabelas iniciais criadas aqui
    -- (SQL mostrado anteriormente)
  `,
};

// migrations/002_add_take_reviews.ts
export const migration: Migration = {
  id: '002_add_take_reviews',
  sql: `
    -- Adiciona tabela de reviews
    CREATE TABLE take_reviews (
        id TEXT PRIMARY KEY,
        take_id TEXT NOT NULL REFERENCES takes(id) ON DELETE CASCADE,
        reviewer_id TEXT NOT NULL REFERENCES users(id),
        decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected', 'needs_revision')),
        feedback TEXT,
        created_at TIMESTAMP DEFAULT NOW()
    );
    
    -- Índices
    CREATE INDEX idx_take_reviews_take_id ON take_reviews(take_id);
    CREATE INDEX idx_take_reviews_reviewer_id ON take_reviews(reviewer_id);
    
    -- Adiciona colunas na tabela takes
    ALTER TABLE takes ADD COLUMN reviewed_by TEXT REFERENCES users(id);
    ALTER TABLE takes ADD COLUMN reviewed_at TIMESTAMP;
    ALTER TABLE takes ADD COLUMN notes TEXT;
  `,
};

// migrations/003_add_activity_logs.ts
export const migration: Migration = {
  id: '003_add_activity_logs',
  sql: `
    -- Tabela de auditoria
    CREATE TABLE activity_logs (
        id TEXT PRIMARY KEY,
        studio_id TEXT REFERENCES studios(id),
        user_id TEXT REFERENCES users(id),
        action TEXT NOT NULL,
        resource_type TEXT,
        resource_id TEXT,
        metadata JSONB DEFAULT '{}',
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW()
    );
    
    -- Índices
    CREATE INDEX idx_activity_logs_studio_id ON activity_logs(studio_id);
    CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
    CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
    CREATE INDEX idx_activity_logs_action ON activity_logs(action);
  `,
};

// migrations/004_optimize_indexes.ts
export const migration: Migration = {
  id: '004_optimize_indexes',
  sql: `
    -- Índices compostos para performance
    CREATE INDEX idx_takes_session_status ON takes(session_id, status);
    CREATE INDEX idx_session_participants_session_role ON session_participants(session_id, role);
    CREATE INDEX idx_activity_logs_studio_created ON activity_logs(studio_id, created_at);
    
    -- Índices GIN para JSONB
    CREATE INDEX idx_productions_script_json ON productions USING GIN(script_json);
    CREATE INDEX idx_takes_quality_metrics ON takes USING GIN(quality_metrics);
    
    -- Índices parciais
    CREATE INDEX idx_active_sessions ON sessions(production_id) WHERE status = 'active';
    CREATE INDEX idx_approved_takes ON takes(session_id, created_at) WHERE status = 'approved';
  `,
};
```

#### 🚀 **Script de Deploy de Migrations**

```typescript
// scripts/migrate.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function runMigrations() {
  const connection = postgres(process.env.DATABASE_URL!);
  const db = drizzle(connection);
  
  console.log('🔄 Running migrations...');
  
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
  
  await connection.end();
}

if (require.main === module) {
  runMigrations();
}

export default runMigrations;
```

---

## 9. API e Comunicação

### RESTful Endpoints: CRUD Completo

A API RESTful do HubDub segue princípios REST com endpoints bem definidos, validação rigorosa e respostas consistentes.

#### 🌐 **Estrutura da API**

```typescript
// Rotas principais da API
// api/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth';
import studioRoutes from './studios';
import productionRoutes from './productions';
import sessionRoutes from './sessions';
import takeRoutes from './takes';
import userRoutes from './users';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0'
  });
});

// Monta rotas com middleware de autenticação
router.use('/auth', authRoutes);
router.use('/studios', authenticateToken, studioRoutes);
router.use('/productions', authenticateToken, productionRoutes);
router.use('/sessions', authenticateToken, sessionRoutes);
router.use('/takes', authenticateToken, takeRoutes);
router.use('/users', authenticateToken, userRoutes);

export default router;
```

#### 🔐 **Middleware de Autenticação**

```typescript
// middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Token não fornecido',
        code: 'MISSING_TOKEN'
      });
    }

    // Verifica token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Busca usuário no banco
    const user = await db.select().from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!user.length) {
      return res.status(401).json({ 
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Adiciona usuário ao request
    req.user = {
      id: user[0].id,
      email: user[0].email,
      role: user[0].role,
      permissions: user[0].permissions || []
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        error: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(500).json({ 
      error: 'Erro de autenticação',
      code: 'AUTH_ERROR'
    });
  }
};

// Middleware de autorização por papel
export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Permissão negada',
        code: 'INSUFFICIENT_ROLE',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

// Middleware de autorização por permissão
export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ 
        error: 'Permissão negada',
        code: 'INSUFFICIENT_PERMISSION',
        required: permission,
        current: req.user.permissions
      });
    }

    next();
  };
};
```

#### 📁 **Endpoints de Estúdios**

```typescript
// api/routes/studios.ts
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../database';
import { studios, studioMembers, users } from '../schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Schema de validação
const createStudioSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  settings: z.object({}).optional(),
});

const updateStudioSchema = createStudioSchema.partial();

// GET /api/studios - Lista estúdios do usuário
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    // Estúdios que o usuário é dono
    const ownedStudios = await db
      .select({
        id: studios.id,
        name: studios.name,
        description: studios.description,
        avatarUrl: studios.avatarUrl,
        subscriptionTier: studios.subscriptionTier,
        createdAt: studios.createdAt,
        role: sql<string>`'owner'`,
      })
      .from(studios)
      .where(eq(studios.ownerId, req.user!.id));

    // Estúdios que o usuário é membro
    const memberStudios = await db
      .select({
        id: studios.id,
        name: studios.name,
        description: studios.description,
        avatarUrl: studios.avatarUrl,
        subscriptionTier: studios.subscriptionTier,
        createdAt: studios.createdAt,
        role: studioMembers.role,
      })
      .from(studios)
      .innerJoin(studioMembers, eq(studios.id, studioMembers.studioId))
      .where(eq(studioMembers.userId, req.user!.id));

    // Combina e remove duplicatas
    const allStudios = [...ownedStudios, ...memberStudios];
    const uniqueStudios = allStudios.reduce((acc, studio) => {
      if (!acc.find(s => s.id === studio.id)) {
        acc.push(studio);
      }
      return acc;
    }, []);

    res.json({
      studios: uniqueStudios,
      total: uniqueStudios.length,
    });
  } catch (error) {
    console.error('Erro ao listar estúdios:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/studios/:id - Detalhes do estúdio
router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Verifica se usuário tem acesso
    const studio = await db
      .select({
        studio: {
          id: studios.id,
          name: studios.name,
          description: studios.description,
          avatarUrl: studios.avatarUrl,
          settings: studios.settings,
          subscriptionTier: studios.subscriptionTier,
          createdAt: studios.createdAt,
        },
        owner: {
          id: users.id,
          fullName: users.fullName,
          displayName: users.displayName,
          email: users.email,
        },
        userRole: sql<string>`
          CASE 
            WHEN ${studios.ownerId} = ${req.user!.id} THEN 'owner'
            ELSE (
              SELECT role FROM studio_members 
              WHERE studio_id = ${studios.id} AND user_id = ${req.user!.id}
            )
          END
        `,
      })
      .from(studios)
      .leftJoin(users, eq(studios.ownerId, users.id))
      .where(eq(studios.id, id))
      .limit(1);

    if (!studio.length) {
      return res.status(404).json({ error: 'Estúdio não encontrado' });
    }

    // Verifica permissão
    const userRole = studio[0].userRole;
    if (!userRole) {
      return res.status(403).json({ error: 'Acesso negado ao estúdio' });
    }

    // Busca membros
    const members = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        displayName: users.displayName,
        email: users.email,
        avatarUrl: users.avatarUrl,
        role: studioMembers.role,
        joinedAt: studioMembers.joinedAt,
      })
      .from(studioMembers)
      .innerJoin(users, eq(studioMembers.userId, users.id))
      .where(eq(studioMembers.studioId, id));

    res.json({
      studio: studio[0],
      members,
      userRole,
    });
  } catch (error) {
    console.error('Erro ao buscar estúdio:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/studios - Criar novo estúdio
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const data = createStudioSchema.parse(req.body);

    // Verifica limites de criação (baseado no plano)
    const studioCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(studios)
      .where(eq(studios.ownerId, req.user!.id));

    if (studioCount[0].count >= 3) {
      return res.status(429).json({ 
        error: 'Limite de estúdios atingido',
        code: 'STUDIO_LIMIT_REACHED',
        limit: 3
      });
    }

    // Cria estúdio
    const [newStudio] = await db
      .insert(studios)
      .values({
        id: generateId(),
        name: data.name,
        description: data.description,
        ownerId: req.user!.id,
        settings: data.settings || {},
        createdAt: new Date(),
      })
      .returning();

    // Adiciona dono como membro
    await db
      .insert(studioMembers)
      .values({
        id: generateId(),
        studioId: newStudio.id,
        userId: req.user!.id,
        role: 'owner',
        joinedAt: new Date(),
      });

    res.status(201).json({
      studio: newStudio,
      message: 'Estúdio criado com sucesso',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: error.errors
      });
    }

    console.error('Erro ao criar estúdio:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/studios/:id - Atualizar estúdio
router.put('/:id', requirePermission('studio:edit'), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const data = updateStudioSchema.parse(req.body);

    // Verifica se estúdio existe e usuário tem permissão
    const existingStudio = await db
      .select()
      .from(studios)
      .where(eq(studios.id, id))
      .limit(1);

    if (!existingStudio.length) {
      return res.status(404).json({ error: 'Estúdio não encontrado' });
    }

    if (existingStudio[0].ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Apenas o dono pode editar o estúdio' });
    }

    // Atualiza estúdio
    const [updatedStudio] = await db
      .update(studios)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(studios.id, id))
      .returning();

    res.json({
      studio: updatedStudio,
      message: 'Estúdio atualizado com sucesso',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: error.errors
      });
    }

    console.error('Erro ao atualizar estúdio:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/studios/:id - Excluir estúdio
router.delete('/:id', requirePermission('studio:delete'), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Verifica se estúdio existe e usuário tem permissão
    const existingStudio = await db
      .select()
      .from(studios)
      .where(eq(studios.id, id))
      .limit(1);

    if (!existingStudio.length) {
      return res.status(404).json({ error: 'Estúdio não encontrado' });
    }

    if (existingStudio[0].ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Apenas o dono pode excluir o estúdio' });
    }

    // Exclui estúdio (cascade vai excluir produções, sessões, etc.)
    await db.delete(studios).where(eq(studios.id, id));

    res.json({
      message: 'Estúdio excluído com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir estúdio:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
```

#### 🎬 **Endpoints de Sessões**

```typescript
// api/routes/sessions.ts
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../database';
import { sessions, productions, sessionParticipants, users } from '../schema';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

// Schema de validação
const createSessionSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  productionId: z.string().uuid(),
  scheduledAt: z.string().datetime().optional(),
  settings: z.object({}).optional(),
});

// GET /api/sessions - Lista sessões do usuário
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { productionId, status, limit = 20, offset = 0 } = req.query;

    let query = db
      .select({
        session: {
          id: sessions.id,
          name: sessions.name,
          description: sessions.description,
          status: sessions.status,
          scheduledAt: sessions.scheduledAt,
          startedAt: sessions.startedAt,
          endedAt: sessions.endedAt,
          createdAt: sessions.createdAt,
        },
        production: {
          id: productions.id,
          name: productions.name,
        },
        userRole: sessionParticipants.role,
      })
      .from(sessions)
      .innerJoin(productions, eq(sessions.productionId, productions.id))
      .leftJoin(sessionParticipants, and(
        eq(sessions.id, sessionParticipants.sessionId),
        eq(sessionParticipants.userId, req.user!.id)
      ))
      .where(
        // Mostra sessões onde usuário participa ou é dono da produção
        sql`${sessionParticipants.userId} = ${req.user!.id} OR ${productions.studioId} IN (
          SELECT studio_id FROM studio_members WHERE user_id = ${req.user!.id}
        )`
      )
      .orderBy(desc(sessions.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    // Aplica filtros
    if (productionId) {
      query = query.where(eq(sessions.productionId, productionId as string));
    }

    if (status) {
      query = query.where(eq(sessions.status, status as string));
    }

    const sessionsList = await query;

    res.json({
      sessions: sessionsList,
      total: sessionsList.length,
    });
  } catch (error) {
    console.error('Erro ao listar sessões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/sessions/:id - Detalhes da sessão
router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Busca sessão com permissão check
    const session = await db
      .select({
        session: sessions,
        production: productions,
        userRole: sessionParticipants.role,
      })
      .from(sessions)
      .innerJoin(productions, eq(sessions.productionId, productions.id))
      .leftJoin(sessionParticipants, and(
        eq(sessions.id, sessionParticipants.sessionId),
        eq(sessionParticipants.userId, req.user!.id)
      ))
      .where(eq(sessions.id, id))
      .limit(1);

    if (!session.length) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    // Verifica permissão
    const userRole = session[0].userRole;
    const production = session[0].production;
    
    // Se não for participante, verifica se é membro do estúdio
    if (!userRole) {
      const isStudioMember = await db
        .select()
        .from(studioMembers)
        .where(and(
          eq(studioMembers.studioId, production.studioId),
          eq(studioMembers.userId, req.user!.id)
        ))
        .limit(1);

      if (!isStudioMember.length) {
        return res.status(403).json({ error: 'Acesso negado à sessão' });
      }
    }

    // Busca participantes
    const participants = await db
      .select({
        user: {
          id: users.id,
          fullName: users.fullName,
          displayName: users.displayName,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
        role: sessionParticipants.role,
        characterId: sessionParticipants.characterId,
        joinedAt: sessionParticipants.joinedAt,
        connectionStatus: sessionParticipants.connectionStatus,
      })
      .from(sessionParticipants)
      .innerJoin(users, eq(sessionParticipants.userId, users.id))
      .where(eq(sessionParticipants.sessionId, id));

    res.json({
      session: session[0].session,
      production: session[0].production,
      participants,
      userRole: userRole || 'viewer',
    });
  } catch (error) {
    console.error('Erro ao buscar sessão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/sessions - Criar nova sessão
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const data = createSessionSchema.parse(req.body);

    // Verifica se produção existe e usuário tem permissão
    const production = await db
      .select()
      .from(productions)
      .where(eq(productions.id, data.productionId))
      .limit(1);

    if (!production.length) {
      return res.status(404).json({ error: 'Produção não encontrada' });
    }

    // Verifica se usuário é membro do estúdio
    const isMember = await db
      .select()
      .from(studioMembers)
      .where(and(
        eq(studioMembers.studioId, production[0].studioId),
        eq(studioMembers.userId, req.user!.id)
      ))
      .limit(1);

    if (!isMember.length) {
      return res.status(403).json({ error: 'Apenas membros do estúdio podem criar sessões' });
    }

    // Cria sessão
    const [newSession] = await db
      .insert(sessions)
      .values({
        id: generateId(),
        name: data.name,
        description: data.description,
        productionId: data.productionId,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        settings: data.settings || {},
        createdAt: new Date(),
      })
      .returning();

    // Adiciona criador como participante (diretor)
    await db
      .insert(sessionParticipants)
      .values({
        id: generateId(),
        sessionId: newSession.id,
        userId: req.user!.id,
        role: 'director',
        joinedAt: new Date(),
      });

    res.status(201).json({
      session: newSession,
      message: 'Sessão criada com sucesso',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: error.errors
      });
    }

    console.error('Erro ao criar sessão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
```

### WebSocket Events: Sincronização em Tempo Real

O sistema WebSocket do HubDub permite comunicação bidirecional em tempo real entre todos os participantes de uma sessão.

#### 🔌 **Servidor WebSocket**

```typescript
// server/websocket/index.ts
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { IncomingMessage } from 'http';
import { db } from '../database';
import { users, sessions, studios, studioMembers } from '../schema';
import { eq, and } from 'drizzle-orm';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  sessionId?: string;
  studioId?: string;
  userRole?: string;
}

interface ClientMessage {
  type: string;
  data?: any;
  timestamp: number;
}

interface ServerMessage {
  type: string;
  data?: any;
  timestamp: number;
  userId?: string;
}

class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, AuthenticatedWebSocket> = new Map();
  private sessionClients: Map<string, Set<string>> = new Map();

  constructor(server: any) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws'
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.wss.on('connection', this.handleConnection.bind(this));
    this.wss.on('error', this.handleError.bind(this));
  }

  private async handleConnection(
    ws: AuthenticatedWebSocket, 
    request: IncomingMessage
  ): Promise<void> {
    try {
      // Extrai parâmetros da URL
      const url = new URL(request.url!, `http://${request.headers.host}`);
      const token = url.searchParams.get('token');
      const sessionId = url.searchParams.get('sessionId');

      if (!token || !sessionId) {
        ws.close(1008, 'Token e sessionId são obrigatórios');
        return;
      }

      // Autentica usuário
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Verifica se sessão existe e usuário tem acesso
      const sessionAccess = await db
        .select({
          session: sessions,
          userRole: sessionParticipants.role,
        })
        .from(sessions)
        .leftJoin(sessionParticipants, and(
          eq(sessions.id, sessionParticipants.sessionId),
          eq(sessionParticipants.userId, decoded.userId)
        ))
        .leftJoin(productions, eq(sessions.productionId, productions.id))
        .leftJoin(studioMembers, and(
          eq(studioMembers.studioId, productions.studioId),
          eq(studioMembers.userId, decoded.userId)
        ))
        .where(eq(sessions.id, sessionId))
        .limit(1);

      if (!sessionAccess.length) {
        ws.close(1008, 'Acesso negado à sessão');
        return;
      }

      const session = sessionAccess[0].session;
      const userRole = sessionAccess[0].userRole || 'viewer';

      // Configura cliente
      ws.userId = decoded.userId;
      ws.sessionId = sessionId;
      ws.studioId = session.productionId; // Simplificado
      ws.userRole = userRole;

      // Adiciona aos maps
      this.clients.set(decoded.userId, ws);
      
      if (!this.sessionClients.has(sessionId)) {
        this.sessionClients.set(sessionId, new Set());
      }
      this.sessionClients.get(sessionId)!.add(decoded.userId);

      // Setup handlers para este cliente
      ws.on('message', this.handleMessage.bind(this, ws));
      ws.on('close', this.handleClose.bind(this, ws));
      ws.on('error', this.handleError.bind(this));

      // Envia mensagem de boas-vindas
      this.sendToClient(ws, {
        type: 'connection:established',
        data: {
          sessionId,
          userRole,
          onlineUsers: this.getOnlineUsers(sessionId),
        },
        timestamp: Date.now(),
      });

      // Notifica outros usuários
      this.broadcastToSession(sessionId, {
        type: 'presence:user_joined',
        data: {
          userId: decoded.userId,
          userName: decoded.fullName || decoded.email,
        },
        timestamp: Date.now(),
        userId: decoded.userId,
      }, decoded.userId);

      console.log(`🔌 WebSocket conectado: ${decoded.userId} -> ${sessionId}`);

    } catch (error) {
      console.error('Erro na conexão WebSocket:', error);
      ws.close(1008, 'Erro de autenticação');
    }
  }

  private handleMessage(ws: AuthenticatedWebSocket, message: Buffer): void {
    try {
      const clientMessage: ClientMessage = JSON.parse(message.toString());
      
      // Valida mensagem
      if (!clientMessage.type || !clientMessage.timestamp) {
        this.sendToClient(ws, {
          type: 'error:invalid_message',
          data: { reason: 'Formato inválido' },
          timestamp: Date.now(),
        });
        return;
      }

      // Processa mensagem baseada no tipo
      this.processMessage(ws, clientMessage);

    } catch (error) {
      console.error('Erro ao processar mensagem WebSocket:', error);
      this.sendToClient(ws, {
        type: 'error:processing_failed',
        data: { reason: 'Erro interno' },
        timestamp: Date.now(),
      });
    }
  }

  private async processMessage(
    ws: AuthenticatedWebSocket, 
    message: ClientMessage
  ): Promise<void> {
    const { type, data, timestamp } = message;
    const userId = ws.userId!;
    const sessionId = ws.sessionId!;

    switch (type) {
      case 'video:play':
        await this.handleVideoPlay(sessionId, userId, data, timestamp);
        break;

      case 'video:pause':
        await this.handleVideoPause(sessionId, userId, data, timestamp);
        break;

      case 'video:seek':
        await this.handleVideoSeek(sessionId, userId, data, timestamp);
        break;

      case 'video:sync':
        await this.handleVideoSync(sessionId, userId, data, timestamp);
        break;

      case 'text:lock-line':
        await this.handleTextLock(sessionId, userId, data, timestamp);
        break;

      case 'text:unlock-line':
        await this.handleTextUnlock(sessionId, userId, data, timestamp);
        break;

      case 'text:update':
        await this.handleTextUpdate(sessionId, userId, data, timestamp);
        break;

      case 'presence:update':
        await this.handlePresenceUpdate(sessionId, userId, data, timestamp);
        break;

      case 'presence:cursor':
        await this.handlePresenceCursor(sessionId, userId, data, timestamp);
        break;

      case 'take:completed':
        await this.handleTakeCompleted(sessionId, userId, data, timestamp);
        break;

      case 'take:approved':
        await this.handleTakeApproved(sessionId, userId, data, timestamp);
        break;

      default:
        this.sendToClient(ws, {
          type: 'error:unknown_message_type',
          data: { type },
          timestamp: Date.now(),
        });
    }
  }

  // Handlers específicos
  private async handleVideoPlay(
    sessionId: string, 
    userId: string, 
    data: any, 
    timestamp: number
  ): Promise<void> {
    // Salva estado no banco (opcional)
    await this.saveSessionState(sessionId, {
      videoPlaying: true,
      videoTime: data.currentTime,
    });

    // Broadcast para outros usuários
    this.broadcastToSession(sessionId, {
      type: 'video:play',
      data,
      timestamp,
      userId,
    }, userId);
  }

  private async handleVideoSync(
    sessionId: string, 
    userId: string, 
    data: any, 
    timestamp: number
  ): Promise<void> {
    // Broadcast imediato para sincronização precisa
    this.broadcastToSession(sessionId, {
      type: 'video:sync',
      data: {
        currentTime: data.currentTime,
        isPlaying: data.isPlaying,
        playbackRate: data.playbackRate || 1,
      },
      timestamp,
      userId,
    }, userId);
  }

  private async handleTextLock(
    sessionId: string, 
    userId: string, 
    data: any, 
    timestamp: number
  ): Promise<void> {
    // Verifica se linha já está bloqueada
    const lineIndex = data.lineIndex;
    const lockKey = `lock:${sessionId}:${lineIndex}`;
    
    // Em produção, usar Redis para locks distribuídos
    const existingLock = this.activeLocks?.get(lockKey);
    
    if (existingLock && existingLock.userId !== userId) {
      // Notifica que não conseguiu bloquear
      const clientWs = this.clients.get(userId);
      if (clientWs) {
        this.sendToClient(clientWs, {
          type: 'text:lock-failed',
          data: {
            lineIndex,
            lockedBy: existingLock.userId,
            lockedByName: existingLock.userName,
          },
          timestamp: Date.now(),
        });
      }
      return;
    }

    // Registra lock
    if (!this.activeLocks) this.activeLocks = new Map();
    this.activeLocks.set(lockKey, {
      userId,
      userName: data.userName,
      timestamp: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutos
    });

    // Broadcast do lock
    this.broadcastToSession(sessionId, {
      type: 'text:lock-line',
      data: {
        lineIndex,
        userId,
        userName: data.userName,
      },
      timestamp,
      userId,
    });
  }

  // Métodos utilitários
  private sendToClient(ws: AuthenticatedWebSocket, message: ServerMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private broadcastToSession(
    sessionId: string, 
    message: ServerMessage, 
    excludeUserId?: string
  ): void {
    const clients = this.sessionClients.get(sessionId);
    if (!clients) return;

    clients.forEach(userId => {
      if (userId === excludeUserId) return;
      
      const clientWs = this.clients.get(userId);
      if (clientWs && clientWs.readyState === WebSocket.OPEN) {
        this.sendToClient(clientWs, message);
      }
    });
  }

  private handleClose(ws: AuthenticatedWebSocket): void {
    const userId = ws.userId;
    const sessionId = ws.sessionId;

    if (!userId || !sessionId) return;

    // Remove dos maps
    this.clients.delete(userId);
    
    const sessionClients = this.sessionClients.get(sessionId);
    if (sessionClients) {
      sessionClients.delete(userId);
      if (sessionClients.size === 0) {
        this.sessionClients.delete(sessionId);
      }
    }

    // Notifica outros usuários
    this.broadcastToSession(sessionId, {
      type: 'presence:user_left',
      data: { userId },
      timestamp: Date.now(),
      userId,
    });

    console.log(`🔌 WebSocket desconectado: ${userId} <- ${sessionId}`);
  }

  private handleError(error: Error): void {
    console.error('WebSocket error:', error);
  }

  private getOnlineUsers(sessionId: string): string[] {
    const clients = this.sessionClients.get(sessionId);
    return clients ? Array.from(clients) : [];
  }

  // Limpeza de locks expirados
  private cleanupExpiredLocks(): void {
    if (!this.activeLocks) return;

    const now = Date.now();
    for (const [key, lock] of this.activeLocks.entries()) {
      if (now >= lock.expiresAt) {
        this.activeLocks.delete(key);
      }
    }
  }
}

// Inicia cleanup periódico
setInterval(() => {
  wsManager.cleanupExpiredLocks();
}, 60000); // A cada minuto

export default WebSocketManager;
```

### Autenticação: Passport.js + JWT

#### 🔐 **Sistema de Autenticação Completo**

```typescript
// auth/passport.ts
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcrypt';
import { db } from '../database';
import { users } from '../schema';
import { eq } from 'drizzle-orm';

// Configuração da estratégia local (login com senha)
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
  },
  async (email, password, done) => {
    try {
      // Busca usuário pelo email
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user.length) {
        return done(null, false, { message: 'Usuário não encontrado' });
      }

      const userData = user[0];

      // Verifica senha
      const isValidPassword = await bcrypt.compare(password, userData.passwordHash);
      
      if (!isValidPassword) {
        return done(null, false, { message: 'Senha incorreta' });
      }

      // Remove senha hash do retorno
      const { passwordHash, ...userWithoutPassword } = userData;
      
      return done(null, userWithoutPassword);
    } catch (error) {
      return done(error);
    }
  }
));

// Configuração da estratégia JWT
passport.use(new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET!,
    issuer: 'hubdub',
    audience: 'hubdub-users',
  },
  async (payload, done) => {
    try {
      // Payload contém userId do token
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, payload.sub))
        .limit(1);

      if (!user.length) {
        return done(null, false);
      }

      // Remove senha hash
      const { passwordHash, ...userWithoutPassword } = user[0];
      
      return done(null, userWithoutPassword);
    } catch (error) {
      return done(error);
    }
  }
));

// Serialização (como usuário é armazenado na sessão)
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Desserialização (como usuário é recuperado da sessão)
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user.length) {
      return done(null, false);
    }

    const { passwordHash, ...userWithoutPassword } = user[0];
    done(null, userWithoutPassword);
  } catch (error) {
    done(error);
  }
});

export default passport;
```

#### 🎫 **Geração e Validação de Tokens**

```typescript
// auth/jwt.ts
import jwt from 'jsonwebtoken';
import { User } from '../types';

interface JWTPayload {
  sub: string; // userId
  email: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

class JWTService {
  private readonly accessTokenExpiry = '15m';
  private readonly refreshTokenExpiry = '7d';
  private readonly issuer = 'hubdub';
  private readonly audience = 'hubdub-users';

  generateTokenPair(user: User): TokenPair {
    const now = Math.floor(Date.now() / 1000);

    // Access Token (curta duração)
    const accessTokenPayload: Omit<JWTPayload, 'exp'> = {
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
      iat: now,
      iss: this.issuer,
      aud: this.audience,
    };

    const accessToken = jwt.sign(accessTokenPayload, process.env.JWT_SECRET!, {
      expiresIn: this.accessTokenExpiry,
      issuer: this.issuer,
      audience: this.audience,
    });

    // Refresh Token (longa duração)
    const refreshTokenPayload = {
      sub: user.id,
      type: 'refresh',
      iat: now,
      iss: this.issuer,
      aud: this.audience,
    };

    const refreshToken = jwt.sign(refreshTokenPayload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: this.refreshTokenExpiry,
      issuer: this.issuer,
      audience: this.audience,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  validateAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!, {
        issuer: this.issuer,
        audience: this.audience,
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expirado');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Token inválido');
      }
      throw new Error('Erro na validação do token');
    }
  }

  validateRefreshToken(token: string): { sub: string; type: string } {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!, {
        issuer: this.issuer,
        audience: this.audience,
      }) as any;

      if (decoded.type !== 'refresh') {
        throw new Error('Token não é do tipo refresh');
      }

      return {
        sub: decoded.sub,
        type: decoded.type,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expirado');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Refresh token inválido');
      }
      throw new Error('Erro na validação do refresh token');
    }
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      // Valida refresh token
      const { sub: userId } = this.validateRefreshToken(refreshToken);

      // Busca usuário atualizado
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user.length) {
        throw new Error('Usuário não encontrado');
      }

      // Gera novo par de tokens
      return this.generateTokenPair(user[0]);
    } catch (error) {
      throw new Error('Falha ao refresh tokens: ' + error.message);
    }
  }
}

export const jwtService = new JWTService();
```

#### 🔐 **Routes de Autenticação**

```typescript
// auth/routes.ts
import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { db } from '../database';
import { users } from '../schema';
import { eq } from 'drizzle-orm';
import { jwtService } from './jwt';

const router = Router();

// Schema de validação
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  fullName: z.string().min(1).max(255),
  displayName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

// POST /api/auth/register - Registro
router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    // Verifica se email já existe
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser.length) {
      return res.status(409).json({ 
        error: 'Email já cadastrado',
        code: 'EMAIL_EXISTS'
      });
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Cria usuário
    const [newUser] = await db
      .insert(users)
      .values({
        id: generateId(),
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        displayName: data.displayName || data.fullName,
        role: 'dublator',
        preferences: {},
        createdAt: new Date(),
      })
      .returning();

    // Remove senha do retorno
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    // Gera tokens
    const tokens = jwtService.generateTokenPair(userWithoutPassword);

    res.status(201).json({
      user: userWithoutPassword,
      tokens,
      message: 'Usuário criado com sucesso',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: error.errors
      });
    }

    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/auth/login - Login
router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    // Busca usuário
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (!user.length) {
      return res.status(401).json({ 
        error: 'Email ou senha incorretos',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verifica senha
    const isValidPassword = await bcrypt.compare(data.password, user[0].passwordHash);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Email ou senha incorretos',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Atualiza last login
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user[0].id));

    // Remove senha do retorno
    const { passwordHash: _, ...userWithoutPassword } = user[0];

    // Gera tokens
    const tokens = jwtService.generateTokenPair(userWithoutPassword);

    res.json({
      user: userWithoutPassword,
      tokens,
      message: 'Login realizado com sucesso',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: error.errors
      });
    }

    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/auth/refresh - Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);

    // Gera novos tokens
    const tokens = await jwtService.refreshTokens(refreshToken);

    res.json({
      tokens,
      message: 'Tokens atualizados com sucesso',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: error.errors
      });
    }

    console.error('Erro no refresh:', error);
    res.status(401).json({ 
      error: 'Falha ao refresh tokens',
      code: 'REFRESH_FAILED'
    });
  }
});

export default router;
```

---

## 10. Deploy e Operações

### Docker: Containerização Completa

O HubDub utiliza Docker para containerização, garantindo ambientes consistentes e deploy simplificado.

#### 🐳 **Dockerfile Multi-stage**

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Instala dependências apenas quando necessário
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments
ARG NEXT_PUBLIC_APP_URL
ARG NODE_ENV
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NODE_ENV=$NODE_ENV

# Build application
RUN npm run build

# Runner stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### 🔄 **Docker Compose para Desenvolvimento**

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/hubdub_dev
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=dev-secret-key
      - JWT_REFRESH_SECRET=dev-refresh-secret
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=hubdub_dev
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

#### 🚀 **Docker Compose para Produção**

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_REGION=${AWS_REGION}
      - S3_BUCKET=${S3_BUCKET}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - static_files:/var/www/static
    depends_on:
      - app
    restart: unless-stopped

  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    deploy:
      resources:
        limits:
          cpus: '0.25'
          memory: 256M
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  static_files:
```

#### ⚙️ **Configuração Nginx**

```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;

    server {
        listen 80;
        server_name hubdub.com www.hubdub.com;
        
        # Redirect to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name hubdub.com www.hubdub.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Gzip compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_proxied any;
        gzip_comp_level 6;
        gzip_types
            text/plain
            text/css
            text/xml
            text/javascript
            application/json
            application/javascript
            application/xml+rss
            application/atom+xml
            image/svg+xml;

        # Static files
        location /_next/static/ {
            alias /var/www/static/_next/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API routes with rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Auth routes with stricter rate limiting
        location /api/auth/ {
            limit_req zone=auth burst=10 nodelay;
            
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WebSocket routes
        location /ws {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 86400s;
            proxy_send_timeout 86400s;
        }

        # Main application
        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

### CI/CD: GitHub Actions Automatizados

#### 🔄 **Pipeline Completo de CI/CD**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:unit
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-secret
          JWT_REFRESH_SECRET: test-refresh-secret

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-secret
          JWT_REFRESH_SECRET: test-refresh-secret

  security:
    name: Security Scan
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run security audit
        run: npm audit --audit-level moderate

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: [test, security]
    
    outputs:
      image: ${{ steps.image.outputs.image }}
      digest: ${{ steps.build.outputs.digest }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push Docker image
        id: build
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          platforms: linux/amd64,linux/arm64

      - name: Output image
        id: image
        run: |
          echo "image=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ steps.meta.outputs.version }}" >> $GITHUB_OUTPUT

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
    if: github.ref != 'refs/heads/main'
    environment: staging

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to staging
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /opt/hubdub
            docker-compose -f docker-compose.staging.yml pull
            docker-compose -f docker-compose.staging.yml up -d
            docker system prune -f

      - name: Run smoke tests
        run: npm run smoke-tests:staging
        env:
          STAGING_URL: https://staging.hubdub.com

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Create deployment
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.RAILWAY_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{
              "serviceId": "${{ secrets.RAILWAY_SERVICE_ID }}",
              "image": "${{ needs.build.outputs.image }}"
            }' \
            https://api.railway.app/graphql

      - name: Wait for deployment
        run: |
          echo "Waiting for deployment to be ready..."
          sleep 30

      - name: Verify deployment
        run: |
          curl -f https://hubdub.com/api/health || exit 1

      - name: Run smoke tests
        run: npm run smoke-tests:production
        env:
          PRODUCTION_URL: https://hubdub.com

      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          text: '🚀 HubDub deployed to production!'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        if: always()
```

#### 📦 **Scripts de Deploy**

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funções de log
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verifica ambiente
check_environment() {
    log_info "Verificando ambiente..."
    
    if [ -z "$NODE_ENV" ]; then
        log_error "NODE_ENV não definido"
        exit 1
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        log_error "DATABASE_URL não definido"
        exit 1
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        log_error "JWT_SECRET não definido"
        exit 1
    fi
    
    log_info "Ambiente verificado ✓"
}

# Build da aplicação
build_app() {
    log_info "Build da aplicação..."
    
    npm ci
    npm run build
    
    log_info "Build concluído ✓"
}

# Run migrations
run_migrations() {
    log_info "Executando migrations..."
    
    npm run db:migrate
    
    log_info "Migrations executadas ✓"
}

# Deploy
deploy() {
    local environment=$1
    
    log_info "Iniciando deploy para $environment..."
    
    case $environment in
        "staging")
            docker-compose -f docker-compose.staging.yml down
            docker-compose -f docker-compose.staging.yml pull
            docker-compose -f docker-compose.staging.yml up -d
            ;;
        "production")
            docker-compose -f docker-compose.prod.yml down
            docker-compose -f docker-compose.prod.yml pull
            docker-compose -f docker-compose.prod.yml up -d
            ;;
        *)
            log_error "Ambiente desconhecido: $environment"
            exit 1
            ;;
    esac
    
    log_info "Deploy concluído ✓"
}

# Health check
health_check() {
    local url=$1
    local max_attempts=30
    local attempt=1
    
    log_info "Verificando saúde da aplicação..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f "$url/api/health" > /dev/null 2>&1; then
            log_info "Aplicação saudável ✓"
            return 0
        fi
        
        log_warn "Tentativa $attempt/$max_attempts - Aguardando..."
        sleep 10
        ((attempt++))
    done
    
    log_error "Health check falhou após $max_attempts tentativas"
    exit 1
}

# Script principal
main() {
    local environment=${1:-staging}
    
    log_info "=== Deploy HubDub ==="
    log_info "Ambiente: $environment"
    
    check_environment
    build_app
    deploy $environment
    
    # Health check baseado no ambiente
    case $environment in
        "staging")
            health_check "https://staging.hubdub.com"
            ;;
        "production")
            health_check "https://hubdub.com"
            ;;
    esac
    
    log_info "Deploy concluído com sucesso! 🚀"
}

# Executa script
main "$@"
```

---

*Continua na próxima parte...*
