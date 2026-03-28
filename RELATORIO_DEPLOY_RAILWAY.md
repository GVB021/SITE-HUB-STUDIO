# Guia de Deploy no Railway

Este documento contém todas as instruções necessárias para colocar o HubDub no ar usando o Railway.

## 1. Garantia de Funcionamento
Sim, garantimos o funcionamento no Railway. O projeto foi configurado com um arquivo `nixpacks.toml` que instrui o servidor a instalar automaticamente:
- **Node.js v20** (Backend/Frontend)
- **Python 3.11** (Pipelines de Áudio)
- **FFmpeg** (Processamento de Mídia)

Sem essa configuração especial, as funcionalidades de processamento de áudio falhariam. Agora elas vão funcionar nativamente.

## 2. Passo a Passo para Deploy

1. Crie uma conta no [Railway.app](https://railway.app/).
2. Clique em **"New Project"** -> **"Deploy from GitHub repo"**.
3. Selecione o repositório `GVB021/TESTANDOULTIMAVEZJURO`.
4. **IMPORTANTE:** O Railway vai detectar o arquivo `nixpacks.toml` automaticamente.

## 3. Variáveis de Ambiente (Obrigatório)
Antes do site funcionar, você precisa ir na aba **"Variables"** do seu projeto no Railway e adicionar as seguintes chaves. Sem elas, o site dará erro 500.

### Banco de Dados (PostgreSQL)
O Railway geralmente cria um plugin de Postgres automaticamente. Se criar, ele preenche a variável `DATABASE_URL` sozinho. Se não:
- `DATABASE_URL`: `postgres://usuario:senha@host:porta/database`

### Armazenamento e Auth (Supabase)
Você precisa pegar isso no painel do seu projeto Supabase:
- `SUPABASE_URL`: `https://sua-id.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY`: `eyJh...` (Chave secreta `service_role`, não a `anon`!)

### Autenticação do App
- `SESSION_SECRET`: Crie uma senha longa e aleatória (ex: `batata-frita-com-queijo-123456`)

### Integração de Vídeo (Daily.co) - CRÍTICO 🎥
Para que a sala de vídeo funcione, você precisa de uma conta no Daily.co.
1. Crie uma conta em [daily.co](https://daily.co).
2. Vá em "Developers" e copie sua API Key.
3. Adicione no Railway:
   - `DAILY_API_KEY`: `sua_chave_aqui`

### Configurações Opcionais (Mas recomendadas)
- `NODE_ENV`: `production` (Já deve vir padrão)
- `PORT`: O Railway define isso sozinho (geralmente 3000 ou 8080). Não precisa mexer.

## 4. Domínios
Depois do deploy terminar (leva uns 3-5 minutos), vá em **Settings** -> **Domains** e gere um domínio `up.railway.app` para acessar seu site.

## 5. Monitoramento
Se algo der errado, clique no bloco do serviço e vá em **Deploy Logs**.
Lá você verá mensagens como `[startup] Banco de dados indisponível` se faltar alguma variável.
