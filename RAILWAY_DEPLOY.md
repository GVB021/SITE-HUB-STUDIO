# Deploy no Railway - Voz & Carreira

Guia completo para deploy da aplicação no Railway.

---

## 📋 Pré-requisitos

- Conta no Railway: https://railway.app
- Railway CLI (opcional): `npm install -g @railway/cli`
- Git instalado
- Node.js >= 22.0.0 (ou Node 20.x com warning)

---

## 🚀 Deploy via Interface Web

### 1. Criar Novo Projeto

1. Acesse https://railway.app
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Autorize Railway a acessar seu repositório
5. Selecione o repositório do projeto

### 2. Configurar Variáveis de Ambiente

No painel do Railway, vá em **Variables** e adicione:

#### Variáveis Obrigatórias

```bash
# Hash da senha do admin (SHA-256)
VITE_ADMIN_PASSWORD_HASH=5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5

# Ambiente de produção
NODE_ENV=production

# Porta (Railway injeta automaticamente, mas pode definir)
PORT=3000
```

#### Como Gerar Nova Senha

Abra o console do navegador (F12) e execute:

```javascript
async function generateHash(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Substitua pela sua senha forte
generateHash('MinhaSenh@Segur@2026!').then(console.log);
// Copie o hash gerado e use como VITE_ADMIN_PASSWORD_HASH
```

**⚠️ IMPORTANTE:** A senha padrão `SuaSenhaSegura123!` (hash fornecido acima) deve ser alterada antes do deploy!

### 3. Verificar Configuração de Build

O Railway detectará automaticamente o `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Não é necessário modificar** - a configuração já está correta.

### 4. Deploy Automático

1. Commit e push para o repositório
2. Railway detectará automaticamente o push
3. Build iniciará automaticamente
4. Após conclusão, a aplicação estará disponível

### 5. Verificar Deploy

Acesse a URL fornecida pelo Railway (formato: `seu-app.up.railway.app`)

**Endpoints para testar:**

```bash
# Health check
https://seu-app.up.railway.app/api/health
# Resposta esperada: {"status":"ok"}

# Home
https://seu-app.up.railway.app/

# Admin (teste login)
https://seu-app.up.railway.app/admin
```

---

## 🖥️ Deploy via Railway CLI

### 1. Instalar Railway CLI

```bash
npm install -g @railway/cli
```

### 2. Login

```bash
railway login
```

### 3. Inicializar Projeto

Na pasta do projeto:

```bash
railway init
```

Selecione ou crie um novo projeto.

### 4. Configurar Variáveis

```bash
# Definir variáveis uma por vez
railway variables set VITE_ADMIN_PASSWORD_HASH=seu_hash_aqui
railway variables set NODE_ENV=production

# Ou criar arquivo .env e usar
railway variables set --from-file .env
```

### 5. Deploy

```bash
railway up
```

### 6. Ver Logs

```bash
railway logs
```

### 7. Abrir no Navegador

```bash
railway open
```

---

## 🔧 Configuração de Domínio Customizado

### Via Interface Web

1. No projeto Railway, clique em **Settings**
2. Vá em **Networking** → **Public Networking**
3. Clique em **Generate Domain** (domínio gratuito .up.railway.app)
4. Ou adicione **Custom Domain**:
   - Digite seu domínio (ex: `app.seudominio.com`)
   - Adicione registro CNAME no seu provedor DNS:
     ```
     CNAME app.seudominio.com → seu-app.up.railway.app
     ```
   - Railway gerará certificado SSL automaticamente

---

## 📊 Monitoramento e Logs

### Ver Logs em Tempo Real

**Via Interface:**
- Painel do Railway → **Deployments** → Clique no deploy → **View Logs**

**Via CLI:**
```bash
railway logs --tail
```

### Métricas de Performance

No painel do Railway, vá em **Metrics** para ver:
- CPU Usage
- Memory Usage
- Network Traffic
- Request Count

---

## 🔄 Rollback e Redeploy

### Rollback para Deploy Anterior

1. No painel Railway, vá em **Deployments**
2. Encontre o deploy anterior que funcionava
3. Clique nos 3 pontinhos → **Redeploy**

### Forçar Redeploy

**Via Interface:**
- **Deployments** → **Redeploy** (último deploy)

**Via CLI:**
```bash
railway up --detach
```

---

## ⚙️ Configurações Avançadas

### Health Checks

Railway já monitora automaticamente. O endpoint `/api/health` retorna status.

**Configurar health check customizado (se necessário):**

```json
{
  "deploy": {
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300
  }
}
```

### Auto-Scaling (Planos Pagos)

Railway escala automaticamente conforme tráfego nos planos Pro/Team.

### Persistência de Dados

⚠️ **IMPORTANTE:** Railway é **efêmero** - dados locais são perdidos em redeploys!

**Solução:** Use Railway Database Services para dados permanentes:
- PostgreSQL
- MySQL
- MongoDB
- Redis

Para este projeto (usa LocalForage no navegador):
- Dados são armazenados **no navegador do cliente**
- Não há persistência no servidor
- Cada usuário mantém seus próprios dados localmente

---

## 🛡️ Checklist de Segurança

Antes do deploy em produção:

- [ ] ✅ Senha de admin alterada (não usar padrão)
- [ ] ✅ VITE_ADMIN_PASSWORD_HASH configurado
- [ ] ✅ NODE_ENV=production definido
- [ ] ✅ Testes passando (46/46)
- [ ] ✅ Build sem erros
- [ ] ✅ Health check respondendo
- [ ] ✅ HTTPS habilitado (automático no Railway)
- [ ] ✅ Domínio configurado (se aplicável)

---

## 🧪 Validação Pós-Deploy

Execute estes testes após deploy:

### 1. Health Check

```bash
curl https://seu-app.up.railway.app/api/health
```

**Esperado:** `{"status":"ok"}`

### 2. Página Inicial

Visite: `https://seu-app.up.railway.app/`

**Validar:**
- ✅ Página carrega
- ✅ Cursos são exibidos
- ✅ Navegação funciona

### 3. Login Admin

Visite: `https://seu-app.up.railway.app/admin`

**Validar:**
- ✅ Formulário de login aparece
- ✅ Senha correta permite acesso
- ✅ Rate limiting funciona (5 tentativas)

### 4. Upload de Imagem

No admin, teste upload:

**Validar:**
- ✅ Upload de JPEG/PNG funciona
- ✅ Rejeita PDF/MP4
- ✅ Rejeita arquivos > 10 MB
- ✅ Valida dimensões

### 5. XSS Protection

No admin, edite Hero Title com:

```html
Teste <script>alert('XSS')</script>
```

**Validar:**
- ✅ Script é removido automaticamente
- ✅ Apenas tags permitidas são mantidas

### 6. CRUD de Cursos

**Validar:**
- ✅ Criar curso
- ✅ Editar curso
- ✅ Adicionar aulas
- ✅ Excluir curso (com confirmação)

---

## 📱 Variáveis de Ambiente - Referência Completa

| Variável | Obrigatória | Padrão | Descrição |
|----------|-------------|---------|-----------|
| `VITE_ADMIN_PASSWORD_HASH` | ✅ Sim | - | Hash SHA-256 da senha de admin |
| `NODE_ENV` | ✅ Sim | `development` | Ambiente (`production`) |
| `PORT` | ❌ Não | `3000` | Porta do servidor (Railway injeta) |
| `GEMINI_API_KEY` | ❌ Não | - | API Key do Gemini (se usar) |

---

## 🐛 Troubleshooting

### Problema: Build Falha

**Sintomas:** Deploy falha durante build

**Soluções:**

1. **Verificar Node Version:**
   ```bash
   # Adicionar .nvmrc no projeto
   echo "20" > .nvmrc
   ```

2. **Limpar Cache:**
   - Railway Dashboard → **Settings** → **Clear Build Cache**

3. **Ver logs detalhados:**
   ```bash
   railway logs
   ```

### Problema: App Não Inicia

**Sintomas:** Build OK, mas app não responde

**Soluções:**

1. **Verificar PORT:**
   - Railway injeta `PORT` automaticamente
   - `server.ts` já está configurado: `Number(process.env.PORT) || 3000`

2. **Verificar Start Command:**
   - Deve ser: `npm start`
   - Verifica em `railway.json` → `deploy.startCommand`

3. **Ver logs de runtime:**
   ```bash
   railway logs --tail
   ```

### Problema: 502 Bad Gateway

**Sintomas:** App responde com erro 502

**Causas comuns:**
- App crashando ao iniciar
- Porta incorreta
- Timeout no startup

**Soluções:**

1. **Aumentar timeout:**
   ```json
   {
     "deploy": {
       "healthcheckTimeout": 600
     }
   }
   ```

2. **Verificar se app está ouvindo:**
   - Logs devem mostrar: `Server running on http://localhost:3000`

### Problema: Login Admin Não Funciona

**Sintomas:** Senha correta não permite login

**Soluções:**

1. **Verificar variável de ambiente:**
   ```bash
   railway variables
   ```

   Confirmar que `VITE_ADMIN_PASSWORD_HASH` está definido.

2. **Regenerar hash:**
   ```javascript
   // No console do navegador
   async function generateHash(password) {
     const encoder = new TextEncoder();
     const data = encoder.encode(password);
     const hashBuffer = await crypto.subtle.digest('SHA-256', data);
     const hashArray = Array.from(new Uint8Array(hashBuffer));
     return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
   }
   generateHash('SuaSenhaSegura123!').then(console.log);
   ```

3. **Redeploy após alterar variáveis:**
   ```bash
   railway up
   ```

### Problema: Assets Não Carregam (404)

**Sintomas:** CSS/JS não carregam, página sem estilo

**Soluções:**

1. **Verificar build:**
   ```bash
   npm run build
   ls -la dist/
   ```

   Confirmar que `dist/` contém `index.html` e pasta `assets/`.

2. **Verificar configuração Express:**
   - `server.ts` deve servir `dist/` em produção
   - Já configurado corretamente no projeto

---

## 📈 Otimizações Recomendadas

### 1. Code Splitting

O bundle atual é grande (858 KB). Considere:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['lucide-react', 'motion'],
          'state': ['zustand', 'localforage']
        }
      }
    }
  }
});
```

### 2. Compressão

Railway já aplica gzip, mas você pode habilitar explicitamente:

```typescript
// server.ts
import compression from 'compression';
app.use(compression());
```

### 3. Cache de Assets

```typescript
// server.ts (produção)
app.use(express.static(distPath, {
  maxAge: '1y',
  immutable: true
}));
```

---

## 💰 Custos Railway

### Plano Hobby (Gratuito)

- **$5 de crédito grátis/mês**
- **$0.000231/GB-hora** de RAM
- **$0.000463/vCPU-hora**

**Estimativa para este app:**
- ~100-200 MB RAM
- ~0.1 vCPU em média
- **Custo estimado:** $2-4/mês (dentro do free tier)

### Plano Pro ($20/mês)

- **$10 de crédito incluído**
- Mesmos preços de recursos
- Prioridade em build
- Suporte prioritário

---

## 🎯 Comandos Úteis

### Deploy
```bash
# Via CLI
railway up

# Forçar redeploy
railway up --detach

# Deploy de branch específico
railway up --branch main
```

### Logs
```bash
# Ver logs recentes
railway logs

# Seguir logs em tempo real
railway logs --tail

# Logs de deployment específico
railway logs --deployment <deployment-id>
```

### Variáveis
```bash
# Listar variáveis
railway variables

# Definir variável
railway variables set KEY=value

# Deletar variável
railway variables delete KEY
```

### Projeto
```bash
# Abrir dashboard
railway open

# Ver status
railway status

# Linkar a projeto existente
railway link
```

---

## 📞 Suporte

**Documentação Railway:**
- https://docs.railway.app

**Discord Railway:**
- https://discord.gg/railway

**Status Page:**
- https://status.railway.app

---

## ✅ Checklist Final de Deploy

### Antes do Deploy

- [ ] Senha de admin alterada e hash gerado
- [ ] Testes executados e passando (46/46)
- [ ] Build local sem erros
- [ ] Lint sem warnings
- [ ] `.env.example` atualizado
- [ ] Documentação revisada

### Durante o Deploy

- [ ] Variáveis de ambiente configuradas no Railway
- [ ] Deploy iniciado (automático ou manual)
- [ ] Build completado sem erros
- [ ] App iniciado com sucesso
- [ ] Health check respondendo

### Após o Deploy

- [ ] Página inicial acessível
- [ ] Admin login funcional
- [ ] Upload de imagem validado
- [ ] XSS sanitização ativa
- [ ] Rate limiting testado
- [ ] CRUD de cursos funcional
- [ ] SSL/HTTPS ativo

---

## 🎉 Deploy Bem-Sucedido!

Sua aplicação está pronta e segura para produção.

**URL de Produção:** `https://seu-app.up.railway.app`

**Próximos Passos:**
1. Configurar domínio customizado (opcional)
2. Monitorar logs e métricas
3. Implementar melhorias P1/P2 (conforme necessário)

**Mantenha Seguro:**
- Atualize dependências regularmente
- Monitore vulnerabilidades
- Faça backups dos dados importantes
- Revise logs periodicamente

---

**Versão:** 1.0  
**Última Atualização:** 28/03/2026  
**Desenvolvedor:** Cascade AI  
**Plataforma:** Railway
