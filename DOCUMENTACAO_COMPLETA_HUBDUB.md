# Documentação Completa do Sistema HubDub

**Versão do Documento:** 1.0  
**Data:** 17 de Março de 2026  
**Status:** Produção

---

## 1. Visão Geral e Proposta
O **HubDub** é uma plataforma profissional de **dublagem remota em tempo real**. Ela foi desenhada para resolver o problema de latência e desorganização em gravações à distância, permitindo que diretores, dubladores e engenheiros de áudio trabalhem juntos como se estivessem no mesmo estúdio físico.

### Diferenciais Chave
- **Sincronia Absoluta:** O vídeo roda na tela do dublador exatamente no mesmo frame que na tela do diretor.
- **Takes na Nuvem:** Assim que o dublador grava, o áudio vai para o servidor. Nada de enviar arquivos por WeTransfer ou e-mail.
- **Room Integrada:** Vídeo, Script (Roteiro) e Comunicação (Videochamada) na mesma tela.
- **HubAlign:** Ferramenta de organização pós-gravação que gera timelines prontas para editores.

---

## 2. Arquitetura e Tecnologias
O sistema é construído sobre uma stack moderna, priorizando performance e baixa latência.

### Frontend (Interface do Usuário)
- **Framework:** React 18
- **Build Tool:** Vite (para alta performance de carregamento)
- **Estilização:** TailwindCSS + Shadcn/UI (Design System consistente e responsivo)
- **Comunicação de Áudio/Vídeo:** Daily.co (WebRTC para chamadas com latência < 200ms)
- **Estado Global:** TanStack Query (Gerenciamento de cache e requisições)
- **Roteamento:** Wouter (Leve e eficiente)

### Backend (Servidor e API)
- **Runtime:** Node.js
- **Framework Web:** Express.js
- **Protocolo de Tempo Real:** WebSocket Nativo (`ws`) para sincronia de eventos de vídeo e texto.
- **Autenticação:** Passport.js (Estratégia Local + Sessões persistentes)

### Infraestrutura de Dados
- **Banco de Dados:** PostgreSQL (Relacional)
- **ORM:** Drizzle ORM (Camada de acesso a dados tipada e segura)
- **Armazenamento de Arquivos (Storage):** Supabase Storage (Para armazenar os arquivos `.wav` dos takes e vídeos originais).

---

## 3. Estrutura do Projeto e Caminhos Principais

### Organização de Pastas
- `/client`: Código fonte do frontend React.
  - `/src/studio/pages/room.tsx`: **Coração do sistema.** A sala de gravação.
  - `/src/pages/hub-align.tsx`: O módulo de montagem de timeline.
- `/server`: Código fonte do backend API.
  - `routes.ts`: Definição de todas as rotas da API REST.
  - `video-sync.ts`: Lógica do servidor WebSocket para sincronia de salas.
  - `hubalign-routes.ts`: Lógica específica para gestão de timelines.
- `/shared`: Tipos TypeScript compartilhados entre front e back (Schema do banco de dados).

### Rotas Importantes (URLs)
- `/studio/room/:sessionId`: A sala de gravação onde a dublagem acontece.
- `/hub-align`: Painel de organização de takes pós-gravação.
- `/admin`: Painel administrativo para gestão de usuários e estúdios.

---

## 4. Funcionalidades Detalhadas

### A. Sala de Gravação (The Room)
É o ambiente principal.
- **Sincronia de Vídeo:** O diretor controla o player (play/pause/seek) e todos na sala obedecem instantaneamente.
- **Script Interativo:** O roteiro rola automaticamente ou manualmente. O diretor pode editar o texto ao vivo e a alteração aparece para o dublador na hora.
- **Gravação de Takes:**
  1. Diretor seleciona o trecho (Loop).
  2. Diretor inicia a gravação.
  3. Dublador recebe contagem regressiva (3, 2, 1...).
  4. Gravação ocorre.
  5. Arquivo é enviado automaticamente.
- **Revisão Imediata:** O diretor pode dar play no take recém-gravado para aprovar ou descartar.

### B. Gestão de Takes
- Todos os áudios são salvos com metadados: Personagem, Timecode, Usuário e Sessão.
- Status do Take: `Pendente` -> `Aprovado` ou `Descartado`.

### C. HubAlign (Timeline Manager)
Módulo refatorado para pós-produção.
- Permite selecionar takes aprovados de diferentes personagens.
- Monta uma **Timeline Lógica** sequencial.
- Gera um relatório (JSON) que serve de guia para o editor final montar o episódio.
- **Nota:** Não realiza processamento destrutivo de áudio, garantindo a qualidade original do arquivo gravado (`.wav`).

---

## 5. Manual de Uso Unificado

### Para o Administrador
1. **Criar Estúdio:** Acesse o painel Admin -> Estúdios -> Novo.
2. **Adicionar Usuários:** Convide diretores e dubladores por e-mail. Defina os papéis corretamente.
3. **Criar Projeto:** Dentro do estúdio, crie o projeto (ex: "Série X - Temp 1").
4. **Agendar Sessão:** Crie uma "Sessão" dentro do projeto, definindo data, vídeo e roteiro. Convide os participantes.

### Para o Diretor
1. **Entrar na Sala:** No horário agendado, entre na sessão.
2. **Checar Presença:** Verifique se o dublador está online no painel lateral.
3. **Operar:**
   - Use a barra de espaço para Play/Pause.
   - Clique e arraste na timeline para definir o ponto de entrada.
   - Clique em **"Gravar (REC)"** para iniciar um take.
4. **Avaliar:** Na aba "Takes", ouça o resultado e clique no "Check" (Aprovar) ou "Lixeira" (Descartar).

### Para o Dublador
1. **Preparação:** Use fones de ouvido (obrigatório) e esteja em um local silencioso.
2. **Na Sala:**
   - Aceite as permissões de microfone.
   - Você **não** precisa dar play no vídeo. Apenas aguarde o comando do diretor.
   - Quando ver a contagem regressiva, prepare-se para atuar.
3. **Script:** Acompanhe o texto na tela. Se precisar de ajuste de tamanho da fonte, use os controles no topo do script.

### Para o Editor (HubAlign)
1. Acesse `/hub-align`.
2. Selecione o projeto.
3. Busque pelos takes aprovados (filtre por personagem se quiser).
4. Selecione os melhores takes e clique em **"MONTAR TIMELINE"**.
5. O sistema salvará a versão da timeline para você consultar a ordem correta dos arquivos.

---

## 6. Segurança e Confiabilidade
- **Rede:** Testado e validado para funcionar mesmo com múltiplos usuários na mesma rede Wi-Fi (WebSocket isolado).
- **Dados:** Backups automáticos das timelines do HubAlign.
- **Áudio:** Gravação local no navegador em alta qualidade (WAV) antes do upload, prevenindo perdas por oscilação de internet durante a fala.

---

**Fim da Documentação.**
Este documento consolida todo o conhecimento técnico e operacional do sistema HubDub na sua versão atual.
