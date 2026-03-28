# Guia de Migração e Configuração no Railway

Este documento detalha os passos para conectar o repositório atualizado ao Railway e garantir que o deploy funcione corretamente com todas as novas funcionalidades (Director Console, Sincronia de Texto, RLS).

## 1. Status do Repositório
Todo o código atualizado foi enviado para o branch `production-v1` do repositório:
*   **URL:** `https://github.com/GVB021/TESTANDOULTIMAVEZJURO.git`
*   **Branch:** `production-v1`
*   **Último Commit:** `feat: Director Console, Text Sync, and RLS improvements`

## 2. Configuração no Railway

### A. Trocar Repositório (Se necessário)
1.  Acesse o dashboard do seu projeto no [Railway](https://railway.app/).
2.  Vá em **Settings**.
3.  Na seção **Git Repository**, clique em **Disconnect** (se estiver conectado a outro repo).
4.  Conecte novamente usando o repositório `GVB021/TESTANDOULTIMAVEZJURO`.
5.  **Importante:** Certifique-se de que o **Branch** configurado para deploy seja `production-v1`.

### B. Variáveis de Ambiente
Verifique se as seguintes variáveis estão definidas no Railway (aba **Variables**):

*   `DATABASE_URL`: URL de conexão do PostgreSQL.
*   `SESSION_SECRET`: Chave secreta para sessões.
*   `SUPABASE_URL`: URL do seu projeto Supabase.
*   `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço do Supabase (necessária para storage).
*   `DAILY_API_KEY`: Chave da API Daily.co para vídeo chamadas.
*   `PORT`: `5002` (ou deixe vazio para o Railway atribuir automaticamente, mas o código ouve na 5002 se não definido).
*   `NODE_ENV`: `production`

### C. Build e Deploy
1.  O Railway deve detectar automaticamente o `package.json` e o `nixpacks.toml`.
2.  Vá para a aba **Deployments**.
3.  Se o deploy não iniciou automaticamente após o push, clique em **Redeploy**.
4.  Acompanhe os logs de build. O script `scripts/check-env.js` rodará antes do start para validar as variáveis.

## 3. Verificação Pós-Deploy

Após o deploy ficar "Active" (Verde):

1.  **Acesse a URL do app:** `https://seu-projeto.up.railway.app`
2.  **Teste o Console do Diretor:**
    *   Logue como Diretor/Admin.
    *   Entre em uma sala de estúdio.
    *   Verifique se o ícone do "Console do Diretor" (monitor com ponto vermelho) aparece no canto superior direito.
3.  **Teste de Sincronia:**
    *   Peça para outro usuário (Dublador) entrar.
    *   Dê Play no vídeo.
    *   Verifique se o status do Dublador no seu console pisca em **verde** (ACK recebido).

## 4. Limpeza (Opcional)
Se este repositório for o definitivo, você pode arquivar ou renomear repositórios antigos no GitHub para evitar confusão futura.
