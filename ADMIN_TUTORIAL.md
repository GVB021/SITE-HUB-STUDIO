# Tutorial do Administrador - Voz & Carreira
**Guia Completo de Gerenciamento da Plataforma**

---

## 📖 Índice

1. [Acesso ao Painel](#acesso-ao-painel)
2. [Gerenciamento de Cursos](#gerenciamento-de-cursos)
3. [Gerenciamento de Aulas](#gerenciamento-de-aulas)
4. [Configurações da Página Inicial](#configurações-da-página-inicial)
5. [Boas Práticas](#boas-práticas)
6. [Solução de Problemas](#solução-de-problemas)
7. [Segurança](#segurança)

---

## 🔐 Acesso ao Painel

### 1. Acessando o Painel Administrativo

**URL:** `https://seu-dominio.com/admin`

### 2. Tela de Login

Você verá um formulário com:
- **Campo "Senha Master"**
- **Botão "Acessar"**

#### Sistema de Segurança

**⚠️ Proteção contra Força Bruta:**
- Máximo **5 tentativas** de login
- Após 5 tentativas incorretas: **bloqueio de 15 minutos**
- Contador de tentativas restantes é exibido

**Exemplo de tentativas:**
```
Tentativa 1: ❌ Senha incorreta. 4 tentativa(s) restante(s).
Tentativa 2: ❌ Senha incorreta. 3 tentativa(s) restante(s).
...
Tentativa 5: 🔒 Conta bloqueada por 15 minutos
```

### 3. Senha Padrão

**Senha inicial:** `SuaSenhaSegura123!`

**⚠️ IMPORTANTE:** Altere esta senha IMEDIATAMENTE após o primeiro acesso!

### 4. Alterando a Senha

#### Passo a Passo:

**1. Gerar Hash da Nova Senha**

Abra o Console do Navegador (F12) e execute:

```javascript
async function generateHash(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Substitua 'MinhaNovaSenh@2026' pela sua senha
generateHash('MinhaNovaSenh@2026').then(console.log);
```

**2. Copiar o Hash Gerado**

Exemplo de output:
```
7a3d8f2e1b4c9a6e5d8f3b2c1a9e8d7f6b5c4a3d2e1f9b8c7a6d5e4f3b2a1
```

**3. Atualizar Variável de Ambiente**

Edite o arquivo `.env` (ou configure no servidor):

```bash
VITE_ADMIN_PASSWORD_HASH=seu_hash_copiado_aqui
```

**4. Reiniciar Aplicação**

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

**5. Testar Nova Senha**

- Acesse `/admin`
- Digite a nova senha
- Verifique se o login funciona

---

## 📚 Gerenciamento de Cursos

### Interface do Painel

Após o login, você verá:

#### Abas Superiores
```
┌─────────────────────────────────────┐
│ [📖 Cursos]  [🎨 Página Inicial]   │
└─────────────────────────────────────┘
```

#### Alerta de Armazenamento (se houver)
```
⚠️ Erro de Armazenamento
Limite de armazenamento atingido (52 MB / 50 MB).
Considere: 1) Excluir cursos antigos, 2) Usar imagens menores, 3) Migrar para CDN.
[Dispensar]
```

### Visualizando Cursos

#### Grid de Cursos

Cada cartão mostra:
- **Imagem de capa**
- **Título**
- **Descrição (prévia)**
- **Número de aulas**
- **Botões:**
  - 🔵 **Editar** - Modificar curso
  - 🔴 **Excluir** - Remover curso

### Criando Novo Curso

#### 1. Clique em "Novo Curso"

Botão no canto superior direito:
```
➕ Novo Curso
```

#### 2. Formulário de Edição

Você verá campos para:

**Informações Básicas:**

| Campo | Descrição | Obrigatório |
|-------|-----------|-------------|
| **Título do Curso** | Nome do curso | ✅ Sim |
| **Categoria** | Dublagem / Fonoaudiologia / Carreira | ✅ Sim |
| **Descrição** | Texto explicativo do curso | ✅ Sim |
| **Nível** | Iniciante / Intermediário / Avançado / Todos | ✅ Sim |
| **Imagem de Capa** | Thumb do curso | ✅ Sim |

**Exemplo de Preenchimento:**
```
Título: Técnicas Avançadas de Dublagem
Categoria: Dublagem
Descrição: Curso completo sobre técnicas profissionais de dublagem, incluindo interpretação, timing e direção de voz.
Nível: Avançado
Imagem: [Upload de imagem 1200x800]
```

#### 3. Upload de Imagem

**Clique em "Fazer Upload"**

**Validações Automáticas:**

✅ **Tipos Aceitos:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- GIF (.gif)

✅ **Tamanho Máximo:** 10 MB

✅ **Dimensões:**
- Mínimo: 200 x 200 pixels
- Máximo: 5000 x 5000 pixels

✅ **Tamanho Final Comprimido:** Máx 500 KB

**❌ Mensagens de Erro:**

Se a imagem não atender aos requisitos:
```
"Tipo de arquivo inválido. Use: JPEG, PNG, WebP ou GIF"
"Arquivo muito grande (15.5 MB). Máximo: 10 MB"
"Dimensões muito grandes (6000x4000). Máximo: 5000px"
"Imagem muito pequena (100x100). Mínimo: 200x200px"
"Imagem comprimida ainda muito grande (650 KB). Use uma imagem menor"
```

**💡 Dicas de Imagem:**
- Use imagens em **paisagem** (16:9 ideal)
- Resolução recomendada: **1200 x 800 pixels**
- Formato JPEG com qualidade 80-90%
- Evite imagens muito detalhadas (comprimem mal)

#### 4. Adicionar Aulas

Veja seção [Gerenciamento de Aulas](#gerenciamento-de-aulas)

#### 5. Salvar Curso

**Clique no botão verde:**
```
💾 Salvar
```

**Validações Antes de Salvar:**
- ✅ Título não pode estar vazio
- ✅ Descrição não pode estar vazia

**Mensagens:**
- ✅ Sucesso: "Curso salvo com sucesso!"
- ❌ Erro: "O título do curso não pode estar vazio."
- ❌ Erro: "Erro ao salvar curso: [detalhes do erro]"

### Editando Curso Existente

#### 1. Clique em "Editar" no cartão do curso

#### 2. Modifique os campos desejados

Todos os campos são editáveis:
- Título
- Categoria
- Descrição
- Nível
- Imagem de capa
- Aulas (adicionar, editar, remover)

#### 3. Salve as Alterações

```
💾 Salvar
```

### Excluindo Curso

#### 1. Clique em "Excluir" no cartão do curso

#### 2. Validação de Curso em Destaque

Se o curso estiver configurado como **destaque na homepage**:

```
⚠️ Este curso está definido como DESTAQUE na página inicial.

Para excluí-lo, primeiro vá em "Página Inicial" e escolha 
outro curso como destaque.
```

**Ação:** Primeiro altere o curso em destaque, depois exclua.

#### 3. Confirmação de Exclusão

Se o curso tiver aulas:

```
Tem certeza que deseja excluir "Técnicas Avançadas"?

Este curso possui 12 aula(s) que serão perdidas permanentemente.

[Cancelar] [OK]
```

**⚠️ ATENÇÃO:** Exclusão é **permanente** e **irreversível**!

#### 4. Curso Excluído

Após confirmação, o curso é removido imediatamente.

---

## 🎓 Gerenciamento de Aulas

### Visualizando Aulas do Curso

Ao editar um curso, role até a seção:

```
┌────────────────────────────────────────┐
│ Aulas (5)                  ➕ Adicionar Aula │
└────────────────────────────────────────┘
```

### Adicionando Nova Aula

#### 1. Clique em "Adicionar Aula"

#### 2. Preencha os Campos

**Formulário de Aula:**

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| **Título da Aula** | Nome da aula | "Introdução à Dublagem" |
| **Duração** | Tempo estimado | "15 min" |
| **Conteúdo** | Texto da aula (Markdown) | Ver abaixo |
| **Imagem do Slide** | Background da aula | Upload 1600x900 |

#### 3. Formatação do Conteúdo

O campo **Conteúdo** suporta **Markdown**:

```markdown
# Título Principal

## Subtítulo

**Negrito** e *itálico*

- Item de lista 1
- Item de lista 2
- Item de lista 3

1. Passo 1
2. Passo 2
3. Passo 3

[Link para site](https://exemplo.com)

![Imagem](url-da-imagem.jpg)
```

**Exemplo de Conteúdo:**

```markdown
# Bem-vindo à Aula de Técnicas Vocais

Nesta aula, você vai aprender:

- **Aquecimento vocal** - Exercícios preparatórios
- **Projeção de voz** - Como alcançar volume sem forçar
- **Articulação** - Dicção clara e precisa

## Exercício Prático

1. Respire profundamente pelo nariz
2. Expire lentamente pela boca
3. Repita 5 vezes

**Importante:** Nunca force a voz além do confortável!
```

#### 4. Upload de Imagem do Slide

Mesmas validações do upload de imagem de curso.

**Dica:** Use imagens **paisagem** 16:9 (ex: 1600x900)

### Editando Aula Existente

#### Modificar Campos

Cada aula mostra todos os campos editáveis:
- Título
- Duração
- Conteúdo
- Imagem do slide

**Edite diretamente** e depois salve o curso.

### Reordenando Aulas

**Atualmente:** Não há drag & drop

**Solução Temporária:**
1. Anote a ordem desejada
2. Copie o conteúdo das aulas
3. Exclua as aulas
4. Recrie na ordem correta

**💡 Melhoria Futura:** Drag & drop será implementado em P2

### Excluindo Aula

#### 1. Clique no ícone de lixeira 🗑️

No canto superior direito de cada aula.

#### 2. Confirmação

**Se a aula tiver conteúdo (>50 caracteres):**

```
Tem certeza que deseja excluir a aula "Introdução"?
Ela contém 1234 caracteres de conteúdo.

[Cancelar] [OK]
```

**Se a aula tiver pouco conteúdo:**

```
Excluir a aula "Nova Aula"?

[Cancelar] [OK]
```

#### 3. Aula Removida

Após confirmação, a aula é removida da lista.

**⚠️ Lembre-se:** Você ainda precisa **salvar o curso** para confirmar a exclusão!

---

## 🎨 Configurações da Página Inicial

### Acessando Configurações

Clique na aba **"Página Inicial"** no topo do painel.

### Seção Principal (Hero)

#### Campos Editáveis:

**1. Título Principal**

- **Suporta HTML limitado:** `<span>`, `<em>`, `<strong>`
- **Atributos permitidos:** `class` em `<span>`
- **Sanitização automática:** Scripts e tags perigosas são removidos

**Exemplo de Uso:**
```html
Sua voz, sua <span class="text-indigo-400">carreira</span>
```

**Resultado:**
```
Sua voz, sua carreira
         (em destaque azul)
```

**⚠️ Segurança:**
Tags como `<script>`, `<iframe>`, `<object>` são **automaticamente removidas**.

**2. Subtítulo**

- **Texto puro** (sem HTML)
- Descrição da plataforma

**Exemplo:**
```
Plataforma de minicursos gratuitos de dublagem, 
fonoaudiologia e plano de carreira para dubladores.
```

**3. Imagem de Fundo (Hero)**

- **Upload de imagem** com mesmas validações
- Aparece como **fundo semitransparente** no topo da página
- Resolução recomendada: **1920 x 1080**

### Seção de Destaque

#### Campos Editáveis:

**1. Título do Destaque (Badge)**

- Texto do badge amarelo
- Padrão: "Em Destaque"

**Exemplo:**
```
🌟 Curso Especial
```

**2. Subtítulo do Destaque (Imagem)**

- Legenda da imagem do curso
- Aparece sobreposto na imagem

**Exemplo:**
```
Plano de Carreira Completo
```

**3. Curso em Destaque**

- **Dropdown** com todos os cursos disponíveis
- Selecione qual curso aparecerá em destaque

**⚠️ IMPORTANTE:**
- Não é possível excluir um curso que está em destaque
- Primeiro altere o curso em destaque, depois exclua

### Salvando Configurações

**Clique no botão verde:**
```
💾 Salvar Alterações
```

**Confirmação:**
```
Configurações salvas com sucesso!
```

---

## ✅ Boas Práticas

### Organização de Cursos

#### Nomenclatura Clara

**Bom:**
```
✅ "Dublagem para Iniciantes - Módulo 1"
✅ "Técnicas Vocais Avançadas"
✅ "Networking para Dubladores"
```

**Ruim:**
```
❌ "Curso 1"
❌ "Teste"
❌ "aaaaa"
```

#### Descrições Completas

**Inclua:**
- O que o aluno vai aprender
- Pré-requisitos (se houver)
- Duração total estimada
- Público-alvo

**Exemplo:**
```
Aprenda técnicas profissionais de dublagem, desde 
interpretação até sincronia labial. Ideal para quem 
já tem conhecimento básico de locução. Duração: 2 horas.
```

### Estruturação de Aulas

#### Ordem Lógica

```
1. Introdução
2. Conceitos Fundamentais
3. Prática Guiada
4. Exercícios
5. Revisão e Conclusão
```

#### Duração Realista

- **Curta:** 5-10 min (conceitos rápidos)
- **Média:** 15-20 min (aulas teóricas)
- **Longa:** 25-30 min (práticas detalhadas)

**Evite:** Aulas com mais de 40 min (cansativo)

### Qualidade de Imagens

#### Resolução Recomendada

| Tipo | Resolução | Proporção |
|------|-----------|-----------|
| **Capa de Curso** | 1200 x 800 | 3:2 |
| **Slide de Aula** | 1600 x 900 | 16:9 |
| **Hero Background** | 1920 x 1080 | 16:9 |

#### Otimização

**Antes do upload:**
1. **Redimensione** para a resolução recomendada
2. **Comprima** com qualidade 80-90%
3. **Converta** para JPEG (menor tamanho)

**Ferramentas Recomendadas:**
- [TinyPNG](https://tinypng.com/) - Compressão online
- [Squoosh](https://squoosh.app/) - Editor online
- [GIMP](https://www.gimp.org/) - Editor offline gratuito

### Conteúdo das Aulas

#### Markdown Eficiente

**Use:**
- **Títulos** para estruturar (`#`, `##`, `###`)
- **Listas** para enumerar (`-`, `1.`)
- **Negrito** para destacar (`**texto**`)
- **Itálico** para ênfase (`*texto*`)
- **Links** para referências (`[texto](url)`)

**Evite:**
- Parágrafos muito longos
- Excesso de formatação
- Imagens muito pesadas

#### Exemplo de Aula Bem Estruturada

```markdown
# Técnicas de Respiração

## Objetivos da Aula

Ao final desta aula, você será capaz de:
- Controlar a respiração durante a dublagem
- Evitar sons indesejados ao respirar
- Manter energia vocal por períodos prolongados

## Técnica 1: Respiração Diafragmática

**O que é:**
Respiração profunda usando o diafragma.

**Como fazer:**
1. Coloque uma mão no peito, outra no abdômen
2. Inspire pelo nariz (abdômen sobe, peito parado)
3. Expire pela boca lentamente
4. Repita 10 vezes

**Importante:** Pratique diariamente!

## Técnica 2: Respiração Intercostal

[Continue com outras técnicas...]

## Exercício Prático

Grave-se lendo um texto de 2 minutos aplicando 
as técnicas aprendidas. Ouça e identifique melhorias.

## Recursos Adicionais

- [Vídeo sobre Respiração](https://exemplo.com)
- [Artigo Científico](https://exemplo.com)
```

---

## 🔧 Solução de Problemas

### Problema 1: Não Consigo Fazer Login

**Sintomas:**
- "Senha incorreta" mesmo com senha correta
- Conta bloqueada

**Soluções:**

**A. Verificar Senha**
```
1. Confirme a senha correta
2. Verifique se Caps Lock está desligado
3. Tente copiar/colar a senha
```

**B. Aguardar Desbloqueio**
```
Se bloqueado: aguarde 15 minutos completos
```

**C. Verificar Variável de Ambiente**
```bash
# Verifique se VITE_ADMIN_PASSWORD_HASH está configurado
echo $VITE_ADMIN_PASSWORD_HASH
```

**D. Regenerar Hash**
```javascript
// Console do navegador
async function generateHash(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
generateHash('SuaSenhaSegura123!').then(console.log);
```

---

### Problema 2: Upload de Imagem Falha

**Sintomas:**
- "Tipo de arquivo inválido"
- "Arquivo muito grande"
- "Dimensões muito grandes"

**Soluções:**

**A. Verificar Tipo de Arquivo**
```
✅ Aceitos: .jpg, .jpeg, .png, .webp, .gif
❌ Rejeitados: .pdf, .mp4, .psd, .svg
```

**B. Reduzir Tamanho**
```
1. Abra a imagem em editor
2. Salvar Como → JPEG
3. Qualidade: 80-90%
4. Tente novamente
```

**C. Redimensionar**
```
1. Redimensione para 1200x800 (curso) ou 1600x900 (aula)
2. Salve e tente novamente
```

**D. Usar Ferramenta Online**
```
TinyPNG.com → Upload → Download → Upload no painel
```

---

### Problema 3: Erro de Armazenamento

**Sintomas:**
```
⚠️ Erro de Armazenamento
Limite de armazenamento atingido (52 MB / 50 MB)
```

**Causas:**
- Muitos cursos com imagens grandes
- Armazenamento LocalForage cheio

**Soluções:**

**A. Excluir Cursos Antigos**
```
1. Identifique cursos desatualizados
2. Exclua os desnecessários
3. Tente salvar novamente
```

**B. Otimizar Imagens**
```
1. Edite cursos existentes
2. Re-upload imagens comprimidas (menor qualidade)
3. Salve
```

**C. Limpar Cache do Navegador**
```
1. Configurações → Privacidade → Limpar Dados
2. Selecione "Armazenamento Local"
3. Limpar
4. ⚠️ ATENÇÃO: Perde dados não salvos em backend
```

**D. Migrar para CDN** (P1)
```
Considere implementar CDN para armazenar imagens 
externamente (Cloudinary, imgix, etc.)
```

---

### Problema 4: Curso Não Salva

**Sintomas:**
- Clica em "Salvar" mas nada acontece
- Erro: "O título do curso não pode estar vazio"

**Soluções:**

**A. Validar Campos Obrigatórios**
```
✅ Título preenchido
✅ Descrição preenchida
```

**B. Verificar Console do Navegador**
```
F12 → Console → Procurar erros em vermelho
```

**C. Recarregar Página**
```
F5 ou Ctrl+R → Tente novamente
```

**D. Verificar Limite de Armazenamento**
```
Se aparecer erro de quota, veja "Problema 3"
```

---

### Problema 5: Não Consigo Excluir Curso

**Sintomas:**
```
⚠️ Este curso está definido como DESTAQUE na página inicial
```

**Solução:**

```
1. Vá para aba "Página Inicial"
2. Seção "Curso em Destaque"
3. Selecione OUTRO curso no dropdown
4. Salvar Alterações
5. Volte para aba "Cursos"
6. Agora pode excluir
```

---

## 🔒 Segurança

### Proteções Implementadas

#### 1. Autenticação Segura

- ✅ Senha em hash SHA-256
- ✅ Não armazenada em texto claro
- ✅ Variável de ambiente

#### 2. Rate Limiting

- ✅ Máx 5 tentativas de login
- ✅ Bloqueio de 15 minutos
- ✅ Contador de tentativas

#### 3. Sanitização XSS

- ✅ HTML sanitizado automaticamente
- ✅ Tags perigosas removidas
- ✅ Proteção contra scripts maliciosos

#### 4. Validação de Uploads

- ✅ Tipo de arquivo validado
- ✅ Tamanho limitado (10 MB)
- ✅ Dimensões validadas
- ✅ Tamanho final limitado (500 KB)

#### 5. Proteção de Dados

- ✅ Tratamento de erros de quota
- ✅ Validações antes de salvar
- ✅ Confirmações de exclusão

### Recomendações de Segurança

#### Para Administradores

**1. Senha Forte**
```
✅ Mínimo 12 caracteres
✅ Letras maiúsculas e minúsculas
✅ Números e símbolos
✅ Não use palavras do dicionário
✅ Não compartilhe com ninguém
```

**Exemplo de senha forte:**
```
D#u8bL@g3m2026!PL
```

**2. Trocar Senha Regularmente**
```
- Recomendado: A cada 90 dias
- Após suspeita de vazamento: Imediatamente
```

**3. Manter Navegador Atualizado**
```
- Chrome, Firefox, Safari, Edge
- Versões mais recentes
- Correções de segurança aplicadas
```

**4. Logout Após Uso**
```
Atualmente: Não há botão de logout

Solução temporária:
1. Fechar aba do navegador
2. Ou recarregar e bloqueio automático após timeout
```

**💡 Melhoria Futura:** Botão de logout (P1)

#### Para Produção

**1. HTTPS Obrigatório**
```
✅ Certificado SSL válido
✅ Redirecionamento HTTP → HTTPS
✅ HSTS habilitado
```

**2. Variáveis de Ambiente Seguras**
```bash
# NÃO commitar .env no Git
# Adicionar ao .gitignore:
.env
.env.local
.env.production
```

**3. Backup Regular**
```
- Frequência: Diária
- Armazenamento: Externo seguro
- Testes de recuperação: Mensais
```

**4. Monitoramento**
```
- Logs de acesso administrativo
- Alertas de tentativas de invasão
- Monitoramento de erros (Sentry/Rollbar)
```

---

## 📊 Limites e Capacidades

### Limites de Armazenamento

| Item | Limite |
|------|--------|
| **Total LocalForage** | 50 MB (configurável) |
| **Tamanho de Imagem (upload)** | 10 MB |
| **Tamanho de Imagem (comprimida)** | 500 KB |
| **Cursos Estimados** | ~100 cursos com imagens |

### Limites de Navegador

| Navegador | Limite IndexedDB |
|-----------|------------------|
| Chrome | ~1 GB (dinâmico) |
| Firefox | Máx 2 GB |
| Safari | 1 GB |
| Edge | ~1 GB (dinâmico) |

### Recomendações de Escala

**Pequena Plataforma (< 20 cursos):**
- ✅ LocalForage suficiente
- ✅ Sem necessidade de backend

**Média Plataforma (20-50 cursos):**
- ⚠️ Monitorar uso de armazenamento
- 🔵 Considerar otimização de imagens

**Grande Plataforma (> 50 cursos):**
- 🔴 Migrar para backend + CDN (P1)
- 🔴 Implementar banco de dados
- 🔴 Imagens em CDN (Cloudinary)

---

## 🎓 Fluxo de Trabalho Recomendado

### Adicionando Novo Curso Completo

```
1️⃣ Preparar Conteúdo
   ├─ Escrever descrição do curso
   ├─ Criar outline das aulas
   ├─ Preparar material (textos, imagens)
   └─ Otimizar imagens

2️⃣ Criar Curso no Painel
   ├─ Login no /admin
   ├─ Clicar "Novo Curso"
   ├─ Preencher informações básicas
   ├─ Upload imagem de capa
   └─ Salvar (ainda sem aulas)

3️⃣ Adicionar Aulas
   ├─ Editar curso criado
   ├─ Para cada aula:
   │  ├─ Clicar "Adicionar Aula"
   │  ├─ Preencher título e duração
   │  ├─ Escrever conteúdo (Markdown)
   │  ├─ Upload imagem do slide
   │  └─ (Repetir para próxima aula)
   └─ Salvar curso completo

4️⃣ Revisar e Testar
   ├─ Acessar site público
   ├─ Navegar até o curso
   ├─ Testar cada aula
   ├─ Verificar formatação
   └─ Corrigir erros se necessário

5️⃣ Publicar
   ├─ (Opcional) Definir como destaque
   ├─ Compartilhar com usuários
   └─ Monitorar feedback
```

---

## 📞 Suporte Técnico

### Encontrou um Bug?

**Reporte com:**
1. Descrição do problema
2. Passos para reproduzir
3. Mensagem de erro (se houver)
4. Navegador e versão
5. Screenshot (se aplicável)

### Precisa de Ajuda?

**Recursos:**
- 📄 **Documentação:** Este tutorial
- 📊 **Relatório Técnico:** `ADMIN_PANEL_ANALYSIS.md`
- 🔧 **Guia de Correções:** `SECURITY_FIXES_GUIDE.md`
- 📝 **Relatório de Implementação:** `IMPLEMENTATION_REPORT.md`

---

## ✨ Dicas Avançadas

### Produtividade

**1. Atalhos de Teclado** (futuro - P2)
```
Ctrl+S → Salvar
Esc → Cancelar edição
```

**2. Duplicar Curso** (futuro - P2)
```
Útil para criar variações de cursos existentes
```

**3. Importar/Exportar JSON** (futuro - P2)
```
Backup manual de todos os cursos
```

### Organização

**1. Convenção de Nomenclatura**
```
[Categoria] - [Nível] - [Tema]

Exemplo:
"Dublagem - Iniciante - Fundamentos"
"Fonoaudiologia - Avançado - Patologias"
"Carreira - Todos - Networking"
```

**2. Numeração de Aulas**
```
Aula 1: Introdução
Aula 2: Conceitos Básicos
Aula 3: Prática Inicial
...
```

**3. Tags no Conteúdo** (use no Markdown)
```markdown
**Nível:** Iniciante
**Duração:** 15 min
**Pré-requisitos:** Nenhum
```

---

## 🎉 Conclusão

Parabéns! Agora você domina o painel administrativo do **Voz & Carreira**.

**Lembre-se:**
- ✅ Mantenha a senha segura
- ✅ Otimize imagens antes do upload
- ✅ Valide conteúdo antes de publicar
- ✅ Faça backups regulares
- ✅ Monitore o uso de armazenamento

**Bom trabalho! 🚀**

---

**Versão do Tutorial:** 1.0  
**Última Atualização:** 28/03/2026  
**Desenvolvedor:** Cascade AI  
**Plataforma:** Voz & Carreira - Portal de Dublagem
