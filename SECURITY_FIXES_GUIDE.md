# Guia de Implementação - Correções de Segurança Críticas (P0)

**Prioridade:** CRÍTICA - Implementar antes de lançar em produção  
**Tempo Estimado:** 23 horas  
**Status:** Pendente

---

## 1. Remover Senha Hardcoded e Implementar Autenticação Real

### Problema Atual

```typescript
// ❌ VULNERÁVEL - src/pages/AdminPanel.tsx:54
if (password === 'pipoca') {
  setIsAuthenticated(true);
}
```

**Riscos:**
- Senha visível no código-fonte (bundle JavaScript)
- Qualquer pessoa pode descobrir a senha inspecionando o código
- Sem proteção contra força bruta

### Solução: Autenticação via Variável de Ambiente (Solução Temporária)

**Passo 1:** Adicionar variável de ambiente

```bash
# .env.local (NÃO commitar este arquivo)
VITE_ADMIN_PASSWORD_HASH=5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5
# Hash SHA-256 de "SuaSenhaSegura123!"
```

**Passo 2:** Atualizar AdminPanel.tsx

```typescript
import { useState } from 'react';

// Função para hash SHA-256
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    const hashedInput = await hashPassword(password);
    const expectedHash = import.meta.env.VITE_ADMIN_PASSWORD_HASH;
    
    if (hashedInput === expectedHash) {
      setIsAuthenticated(true);
      setPassword(''); // Limpar senha da memória
    } else {
      setLoginAttempts(prev => prev + 1);
      if (loginAttempts >= 4) {
        setIsLocked(true);
        setTimeout(() => setIsLocked(false), 15 * 60 * 1000); // 15 min
        alert('Conta bloqueada por 15 minutos devido a múltiplas tentativas incorretas.');
      } else {
        alert(`Senha incorreta. ${5 - loginAttempts - 1} tentativas restantes.`);
      }
    }
  } catch (error) {
    console.error('Erro ao autenticar:', error);
    alert('Erro de autenticação. Tente novamente.');
  } finally {
    setIsLoading(false);
  }
};
```

**Passo 3:** Adicionar state de proteção

```typescript
const [loginAttempts, setLoginAttempts] = useState(0);
const [isLocked, setIsLocked] = useState(false);
const [isLoading, setIsLoading] = useState(false);

// No formulário
<button 
  type="submit" 
  disabled={isLocked || isLoading}
  className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
>
  {isLoading ? 'Verificando...' : isLocked ? 'Bloqueado (15 min)' : 'Acessar'}
</button>
```

**Passo 4:** Gerar hash da senha

```bash
# Executar no console do navegador ou Node.js
async function generateHash(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

generateHash('SuaSenhaSegura123!').then(console.log);
```

### Solução Definitiva: Backend com JWT (Recomendado para Produção)

**Arquivo:** `server/routes/auth.js`

```javascript
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Mock de admin (em produção, usar banco de dados)
const ADMIN_USER = {
  username: 'admin',
  passwordHash: '$2b$10$...', // bcrypt hash
};

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Validações
  if (!username || !password) {
    return res.status(400).json({ error: 'Credenciais ausentes' });
  }
  
  // Verificar credenciais
  if (username !== ADMIN_USER.username) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  
  const isValid = await bcrypt.compare(password, ADMIN_USER.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  
  // Gerar JWT
  const token = jwt.sign(
    { username, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  
  res.json({ token, expiresIn: 28800 }); // 8 horas em segundos
});

router.post('/logout', (req, res) => {
  // Em produção: invalidar token em blacklist
  res.json({ message: 'Logout realizado' });
});

module.exports = router;
```

**Middleware de autenticação:**

```javascript
// server/middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token ausente' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

module.exports = { authenticateAdmin };
```

**Frontend - src/services/authService.ts:**

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const authService = {
  async login(username: string, password: string): Promise<string> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao fazer login');
    }
    
    const { token } = await response.json();
    localStorage.setItem('adminToken', token);
    return token;
  },
  
  logout() {
    localStorage.removeItem('adminToken');
  },
  
  getToken(): string | null {
    return localStorage.getItem('adminToken');
  },
  
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
};
```

---

## 2. Sanitizar HTML para Prevenir XSS

### Problema Atual

```typescript
// ❌ VULNERÁVEL - src/pages/Home.tsx:32
<h1 dangerouslySetInnerHTML={{ __html: settings.heroTitle }} />
```

**Risco:** Execução de JavaScript malicioso se admin digitar:
```html
Sua voz, sua <img src=x onerror="alert(document.cookie)">
```

### Solução: DOMPurify

**Passo 1:** Instalar dependência

```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

**Passo 2:** Criar hook customizado

```typescript
// src/hooks/useSanitizedHTML.ts
import { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
}

export const useSanitizedHTML = (
  html: string, 
  options: SanitizeOptions = {}
) => {
  return useMemo(() => {
    const config = {
      ALLOWED_TAGS: options.allowedTags || ['span', 'em', 'strong', 'br'],
      ALLOWED_ATTR: options.allowedAttributes || { span: ['class'] },
      KEEP_CONTENT: true,
    };
    
    return DOMPurify.sanitize(html, config);
  }, [html, options]);
};
```

**Passo 3:** Atualizar componentes

```typescript
// src/pages/Home.tsx
import { useSanitizedHTML } from '../hooks/useSanitizedHTML';

export default function Home() {
  const settings = useSettingsStore(state => state.settings);
  
  const sanitizedHeroTitle = useSanitizedHTML(settings.heroTitle, {
    allowedTags: ['span', 'em', 'strong'],
    allowedAttributes: { span: ['class'] }
  });
  
  return (
    <h1 
      className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
      dangerouslySetInnerHTML={{ __html: sanitizedHeroTitle }}
    />
  );
}
```

**Passo 4:** Adicionar aviso no admin

```typescript
// src/pages/AdminPanel.tsx
<div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Título Principal
    <span className="text-xs text-gray-500 ml-2">
      (Suporta HTML limitado: &lt;span class=""&gt;, &lt;em&gt;, &lt;strong&gt;)
    </span>
  </label>
  <input
    type="text"
    value={editingSettings.heroTitle}
    onChange={e => setEditingSettings({...editingSettings, heroTitle: e.target.value})}
    className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
    placeholder='Exemplo: Sua voz, sua <span class="text-indigo-400">carreira</span>'
  />
  <p className="text-xs text-yellow-600 mt-1">
    ⚠️ Scripts e tags perigosas serão removidas automaticamente.
  </p>
</div>
```

---

## 3. Validar Upload de Imagens

### Problema Atual

```typescript
// ❌ SEM VALIDAÇÃO - src/pages/AdminPanel.tsx:61-72
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
  const file = e.target.files?.[0];
  if (file) {
    const compressedBase64 = await compressImage(file);
    callback(compressedBase64);
  }
};
```

**Riscos:**
- Upload de arquivos gigantes (10 GB) → crash do navegador
- Upload de arquivos não-imagem (PDFs, vídeos) → erro
- Imagens malformadas → corrupção

### Solução Completa

```typescript
// src/utils/imageValidation.ts
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_DIMENSION = 5000; // pixels

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateImageFile = (file: File): ValidationResult => {
  // Validar tipo MIME
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipo de arquivo inválido. Use: ${ALLOWED_TYPES.join(', ')}`
    };
  }
  
  // Validar tamanho
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    return {
      isValid: false,
      error: `Arquivo muito grande (${sizeMB} MB). Máximo: 10 MB`
    };
  }
  
  return { isValid: true };
};

export const validateImageDimensions = async (file: File): Promise<ValidationResult> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
        resolve({
          isValid: false,
          error: `Dimensões muito grandes (${img.width}x${img.height}). Máximo: ${MAX_DIMENSION}px`
        });
      } else if (img.width < 200 || img.height < 200) {
        resolve({
          isValid: false,
          error: `Imagem muito pequena (${img.width}x${img.height}). Mínimo: 200x200px`
        });
      } else {
        resolve({ isValid: true });
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        isValid: false,
        error: 'Arquivo de imagem corrompido ou inválido'
      });
    };
    
    img.src = url;
  });
};
```

**Atualizar handleImageUpload:**

```typescript
// src/pages/AdminPanel.tsx
import { validateImageFile, validateImageDimensions } from '../utils/imageValidation';

const handleImageUpload = async (
  e: React.ChangeEvent<HTMLInputElement>, 
  callback: (base64: string) => void
) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  // Resetar input para permitir re-upload do mesmo arquivo
  e.target.value = '';
  
  try {
    // Validação 1: Tipo e tamanho
    const fileValidation = validateImageFile(file);
    if (!fileValidation.isValid) {
      alert(fileValidation.error);
      return;
    }
    
    // Validação 2: Dimensões
    const dimensionValidation = await validateImageDimensions(file);
    if (!dimensionValidation.isValid) {
      alert(dimensionValidation.error);
      return;
    }
    
    // Comprimir e converter
    const compressedBase64 = await compressImage(file);
    
    // Validação 3: Tamanho final do Base64
    const base64SizeKB = Math.round((compressedBase64.length * 3) / 4 / 1024);
    if (base64SizeKB > 500) {
      alert(`Imagem comprimida ainda muito grande (${base64SizeKB} KB). Use uma imagem menor ou de menor qualidade.`);
      return;
    }
    
    callback(compressedBase64);
  } catch (error) {
    console.error('Erro ao processar imagem:', error);
    alert('Erro ao processar a imagem. Tente outro arquivo.');
  }
};
```

---

## 4. Tratar QuotaExceededError do LocalForage

### Problema Atual

```typescript
// ❌ SEM TRATAMENTO - src/store/courseStore.ts:43-46
const addCourse = async (course) => {
  const newCourses = [...get().courses, course];
  await localforage.setItem('courses', newCourses);
  set({ courses: newCourses });
};
```

**Risco:** Se quota exceder, promise rejeita e app quebra sem aviso

### Solução

```typescript
// src/store/courseStore.ts
import { create } from 'zustand';
import localforage from 'localforage';
import { courses as initialCourses, Course } from '../data/courses';

const STORAGE_LIMIT_MB = 50; // Limite sugerido

const estimateStorageSize = (data: any): number => {
  return new Blob([JSON.stringify(data)]).size;
};

const checkStorageQuota = async (newData: any): Promise<boolean> => {
  const estimatedSize = estimateStorageSize(newData);
  const limitBytes = STORAGE_LIMIT_MB * 1024 * 1024;
  
  if (estimatedSize > limitBytes) {
    throw new Error(
      `Limite de armazenamento atingido (${Math.round(estimatedSize / 1024 / 1024)} MB / ${STORAGE_LIMIT_MB} MB). ` +
      'Considere: 1) Excluir cursos antigos, 2) Usar imagens menores, 3) Migrar para CDN.'
    );
  }
  
  return true;
};

interface CourseState {
  courses: Course[];
  isLoading: boolean;
  storageError: string | null;
  loadCourses: () => Promise<void>;
  addCourse: (course: Course) => Promise<void>;
  updateCourse: (course: Course) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  clearStorageError: () => void;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  isLoading: true,
  storageError: null,
  
  clearStorageError: () => set({ storageError: null }),
  
  loadCourses: async () => {
    try {
      const storedCourses = await localforage.getItem<Course[]>('courses');
      
      if (storedCourses && storedCourses.length > 0) {
        const storedIds = new Set(storedCourses.map(c => c.id));
        const newHardcodedCourses = initialCourses.filter(c => !storedIds.has(c.id));
        
        if (newHardcodedCourses.length > 0) {
          const combinedCourses = [...storedCourses, ...newHardcodedCourses];
          await checkStorageQuota(combinedCourses);
          await localforage.setItem('courses', combinedCourses);
          set({ courses: combinedCourses, isLoading: false });
        } else {
          set({ courses: storedCourses, isLoading: false });
        }
      } else {
        await checkStorageQuota(initialCourses);
        await localforage.setItem('courses', initialCourses);
        set({ courses: initialCourses, isLoading: false });
      }
    } catch (error: any) {
      console.error('Failed to load courses:', error);
      
      if (error.name === 'QuotaExceededError' || error.message?.includes('quota')) {
        set({ 
          storageError: 'Armazenamento local cheio. Limpe dados do navegador ou use menos cursos.',
          courses: initialCourses,
          isLoading: false 
        });
      } else {
        set({ 
          courses: initialCourses, 
          isLoading: false,
          storageError: error.message 
        });
      }
    }
  },
  
  addCourse: async (course) => {
    try {
      const newCourses = [...get().courses, course];
      await checkStorageQuota(newCourses);
      await localforage.setItem('courses', newCourses);
      set({ courses: newCourses, storageError: null });
    } catch (error: any) {
      console.error('Failed to add course:', error);
      set({ storageError: error.message });
      throw error;
    }
  },
  
  updateCourse: async (updatedCourse) => {
    try {
      const newCourses = get().courses.map(c => 
        c.id === updatedCourse.id ? updatedCourse : c
      );
      await checkStorageQuota(newCourses);
      await localforage.setItem('courses', newCourses);
      set({ courses: newCourses, storageError: null });
    } catch (error: any) {
      console.error('Failed to update course:', error);
      set({ storageError: error.message });
      throw error;
    }
  },
  
  deleteCourse: async (id) => {
    try {
      const newCourses = get().courses.filter(c => c.id !== id);
      await localforage.setItem('courses', newCourses);
      set({ courses: newCourses, storageError: null });
    } catch (error: any) {
      console.error('Failed to delete course:', error);
      set({ storageError: error.message });
      throw error;
    }
  }
}));
```

**Exibir erro no AdminPanel:**

```typescript
// src/pages/AdminPanel.tsx
const storageError = useCourseStore(state => state.storageError);
const clearStorageError = useCourseStore(state => state.clearStorageError);

// No início do JSX
{storageError && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
    <div className="text-red-600 text-sm flex-grow">
      <p className="font-bold mb-1">⚠️ Erro de Armazenamento</p>
      <p>{storageError}</p>
      <button 
        onClick={clearStorageError}
        className="mt-2 text-xs underline hover:no-underline"
      >
        Dispensar
      </button>
    </div>
  </div>
)}
```

---

## 5. Adicionar Confirmação ao Excluir Aula

### Problema Atual

```typescript
// ❌ SEM CONFIRMAÇÃO - src/pages/AdminPanel.tsx:318-326
<button 
  onClick={() => {
    const newLessons = [...editingCourse.lessons];
    newLessons.splice(index, 1);
    setEditingCourse({...editingCourse, lessons: newLessons});
  }}
>
  <Trash2 className="w-4 h-4" />
</button>
```

**Risco:** Fácil excluir aula acidentalmente (sem confirmação)

### Solução

```typescript
// src/pages/AdminPanel.tsx
<button 
  onClick={() => {
    const lesson = editingCourse.lessons[index];
    const hasContent = lesson.content.length > 50;
    
    const message = hasContent
      ? `Tem certeza que deseja excluir a aula "${lesson.title}"? Ela contém ${lesson.content.length} caracteres de conteúdo.`
      : `Excluir a aula "${lesson.title}"?`;
    
    if (confirm(message)) {
      const newLessons = [...editingCourse.lessons];
      newLessons.splice(index, 1);
      setEditingCourse({...editingCourse, lessons: newLessons});
    }
  }}
  className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-lg"
  aria-label={`Excluir aula ${lesson.title}`}
>
  <Trash2 className="w-4 h-4" />
</button>
```

**Solução Melhor: Modal de Confirmação Customizado**

```typescript
// src/components/ConfirmDialog.tsx
import { X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDangerous = false
}: ConfirmDialogProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3 pr-8">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-4 py-2 rounded-lg font-medium text-white ${
              isDangerous 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Uso no AdminPanel:**

```typescript
const [confirmDialog, setConfirmDialog] = useState<{
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}>({
  isOpen: false,
  title: '',
  message: '',
  onConfirm: () => {}
});

// Ao excluir aula
<button 
  onClick={() => {
    const lesson = editingCourse.lessons[index];
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Aula',
      message: `Tem certeza que deseja excluir "${lesson.title}"? Esta ação não pode ser desfeita.`,
      onConfirm: () => {
        const newLessons = [...editingCourse.lessons];
        newLessons.splice(index, 1);
        setEditingCourse({...editingCourse, lessons: newLessons});
      }
    });
  }}
>
  <Trash2 className="w-4 h-4" />
</button>

// No final do JSX
<ConfirmDialog
  {...confirmDialog}
  onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
  confirmText="Excluir"
  isDangerous
/>
```

---

## 6. Implementar Rate Limiting de Login (Frontend)

### Solução Simples (LocalStorage)

```typescript
// src/utils/rateLimiter.ts
interface LoginAttempt {
  timestamp: number;
  ip?: string;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutos
const ATTEMPTS_WINDOW = 30 * 60 * 1000; // 30 minutos

export class LoginRateLimiter {
  private storageKey = 'admin_login_attempts';
  
  private getAttempts(): LoginAttempt[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
  
  private saveAttempts(attempts: LoginAttempt[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(attempts));
  }
  
  recordAttempt(): void {
    const attempts = this.getAttempts();
    attempts.push({ timestamp: Date.now() });
    this.saveAttempts(attempts);
  }
  
  clearAttempts(): void {
    localStorage.removeItem(this.storageKey);
  }
  
  isLocked(): boolean {
    const attempts = this.getAttempts();
    const now = Date.now();
    
    // Remover tentativas antigas
    const recentAttempts = attempts.filter(
      a => now - a.timestamp < ATTEMPTS_WINDOW
    );
    this.saveAttempts(recentAttempts);
    
    // Verificar se há bloqueio ativo
    if (recentAttempts.length >= MAX_ATTEMPTS) {
      const lastAttempt = recentAttempts[recentAttempts.length - 1];
      const lockoutEnds = lastAttempt.timestamp + LOCKOUT_DURATION;
      return now < lockoutEnds;
    }
    
    return false;
  }
  
  getRemainingAttempts(): number {
    const attempts = this.getAttempts();
    const now = Date.now();
    const recentAttempts = attempts.filter(
      a => now - a.timestamp < ATTEMPTS_WINDOW
    );
    return Math.max(0, MAX_ATTEMPTS - recentAttempts.length);
  }
  
  getLockoutRemaining(): number {
    const attempts = this.getAttempts();
    if (attempts.length < MAX_ATTEMPTS) return 0;
    
    const lastAttempt = attempts[attempts.length - 1];
    const lockoutEnds = lastAttempt.timestamp + LOCKOUT_DURATION;
    const remaining = Math.max(0, lockoutEnds - Date.now());
    return Math.ceil(remaining / 1000 / 60); // minutos
  }
}
```

**Usar no AdminPanel:**

```typescript
import { LoginRateLimiter } from '../utils/rateLimiter';

const rateLimiter = new LoginRateLimiter();

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Verificar se está bloqueado
  if (rateLimiter.isLocked()) {
    const minutesRemaining = rateLimiter.getLockoutRemaining();
    alert(`Muitas tentativas incorretas. Tente novamente em ${minutesRemaining} minutos.`);
    return;
  }
  
  setIsLoading(true);
  
  try {
    const hashedInput = await hashPassword(password);
    const expectedHash = import.meta.env.VITE_ADMIN_PASSWORD_HASH;
    
    if (hashedInput === expectedHash) {
      rateLimiter.clearAttempts();
      setIsAuthenticated(true);
      setPassword('');
    } else {
      rateLimiter.recordAttempt();
      const remaining = rateLimiter.getRemainingAttempts();
      
      if (remaining === 0) {
        alert('Conta bloqueada por 15 minutos devido a múltiplas tentativas incorretas.');
      } else {
        alert(`Senha incorreta. ${remaining} tentativa(s) restante(s).`);
      }
    }
  } catch (error) {
    console.error('Erro ao autenticar:', error);
    alert('Erro de autenticação. Tente novamente.');
  } finally {
    setIsLoading(false);
  }
};

// Exibir status no formulário
{rateLimiter.isLocked() && (
  <div className="text-red-600 text-sm text-center mb-4">
    🔒 Conta bloqueada por {rateLimiter.getLockoutRemaining()} minutos
  </div>
)}
```

---

## 7. Usar UUID em Vez de Timestamp

### Problema Atual

```typescript
// ❌ PODE COLIDIR - src/pages/AdminPanel.tsx:76, 90
id: `course-${Date.now()}`
id: `lesson-${Date.now()}`
```

### Solução: nanoid

**Instalar:**

```bash
npm install nanoid
```

**Usar:**

```typescript
// src/pages/AdminPanel.tsx
import { nanoid } from 'nanoid';

const createNewCourse = () => {
  const newCourse: Course = {
    id: `course-${nanoid(10)}`, // course-V1StGXR8_Z
    title: 'Novo Curso',
    // ...
  };
  setEditingCourse(newCourse);
};

const addLesson = () => {
  const newLesson: Lesson = {
    id: `lesson-${nanoid(10)}`, // lesson-n5zA7ycUqJ
    title: 'Nova Aula',
    // ...
  };
  setEditingCourse({
    ...editingCourse,
    lessons: [...editingCourse.lessons, newLesson]
  });
};
```

**Vantagem:** IDs únicos garantidos, até 1 milhão de IDs por segundo sem colisão

---

## 8. Validar Featured Course Antes de Excluir

### Problema Atual

```typescript
// ❌ NÃO VALIDA - src/pages/AdminPanel.tsx:409-415
<button onClick={() => {
  if (confirm('Tem certeza?')) {
    deleteCourse(course.id);
  }
}}>
  Excluir
</button>
```

**Risco:** Excluir curso que está em destaque → homepage quebra

### Solução

```typescript
// src/pages/AdminPanel.tsx
import { useSettingsStore } from '../store/settingsStore';

const settings = useSettingsStore(state => state.settings);

<button onClick={() => {
  // Validar se é o curso em destaque
  if (course.id === settings.featuredCourseId) {
    alert(
      '⚠️ Este curso está definido como DESTAQUE na página inicial.\n\n' +
      'Para excluí-lo, primeiro vá em "Página Inicial" e escolha outro curso como destaque.'
    );
    return;
  }
  
  // Validar se tem aulas
  const lessonCount = course.lessons.length;
  const message = lessonCount > 0
    ? `Tem certeza que deseja excluir "${course.title}"?\n\nEste curso possui ${lessonCount} aula(s) que serão perdidas permanentemente.`
    : `Excluir o curso "${course.title}"?`;
  
  if (confirm(message)) {
    deleteCourse(course.id);
  }
}}>
  Excluir
</button>
```

**Validação adicional no store:**

```typescript
// src/store/courseStore.ts
deleteCourse: async (id) => {
  // Validar featured course
  const settings = useSettingsStore.getState().settings;
  if (settings.featuredCourseId === id) {
    throw new Error('Não é possível excluir o curso em destaque. Altere a configuração da homepage primeiro.');
  }
  
  const newCourses = get().courses.filter(c => c.id !== id);
  await localforage.setItem('courses', newCourses);
  set({ courses: newCourses, storageError: null });
}
```

---

## Checklist de Implementação

- [ ] **1. Autenticação**
  - [ ] Implementar hash SHA-256 de senha
  - [ ] Adicionar variável de ambiente
  - [ ] Implementar rate limiting
  - [ ] Adicionar loading state
  - [ ] (Opcional) Backend com JWT

- [ ] **2. Sanitização XSS**
  - [ ] Instalar DOMPurify
  - [ ] Criar hook useSanitizedHTML
  - [ ] Atualizar Home.tsx
  - [ ] Adicionar aviso no admin

- [ ] **3. Validação de Upload**
  - [ ] Criar imageValidation.ts
  - [ ] Validar tipo MIME
  - [ ] Validar tamanho do arquivo
  - [ ] Validar dimensões
  - [ ] Validar tamanho Base64 final

- [ ] **4. Tratamento de Quota**
  - [ ] Adicionar estimateStorageSize
  - [ ] Adicionar checkStorageQuota
  - [ ] Atualizar todos os métodos do store
  - [ ] Exibir erro no admin

- [ ] **5. Confirmação de Exclusão**
  - [ ] Adicionar confirm() em excluir aula
  - [ ] (Opcional) Criar ConfirmDialog component
  - [ ] Verificar conteúdo antes de confirmar

- [ ] **6. Rate Limiting**
  - [ ] Criar LoginRateLimiter class
  - [ ] Integrar no handleLogin
  - [ ] Exibir status de bloqueio
  - [ ] Testar bloqueio após 5 tentativas

- [ ] **7. IDs Únicos**
  - [ ] Instalar nanoid
  - [ ] Substituir Date.now() em courses
  - [ ] Substituir Date.now() em lessons

- [ ] **8. Validar Featured Course**
  - [ ] Adicionar validação antes de excluir
  - [ ] Adicionar validação no store
  - [ ] Testar exclusão do curso em destaque

---

## Testando as Correções

### Teste 1: Autenticação

```
1. Fazer logout
2. Tentar login com senha errada 5 vezes
3. Verificar: bloqueio de 15 minutos
4. Aguardar 15 min ou limpar localStorage
5. Login com senha correta
```

### Teste 2: XSS

```
1. Admin → Página Inicial
2. Hero Title: Sua voz, sua <script>alert('XSS')</script>
3. Salvar
4. Ir para homepage
5. Verificar: script não executa, tag removida
```

### Teste 3: Upload

```
1. Tentar upload de PDF (deve rejeitar)
2. Tentar upload de imagem 20 MB (deve rejeitar)
3. Tentar upload de imagem 50x50px (deve rejeitar)
4. Upload de JPEG 2000x1000 válido (deve aceitar)
```

### Teste 4: Quota

```
1. Criar 50 cursos com imagens grandes
2. Verificar: aviso de limite ao atingir 50 MB
3. Deletar alguns cursos
4. Tentar salvar novamente
```

---

## Próximos Passos (P1 - P2)

Após implementar as correções P0, considere:

1. **Backend API** (P1) - Migrar de LocalForage para PostgreSQL
2. **CDN de Imagens** (P1) - Cloudinary ou imgix
3. **Logs de Auditoria** (P1) - Rastrear todas as ações admin
4. **Backup Automático** (P1) - Export JSON diário
5. **Drag & Drop** (P2) - Reordenar aulas
6. **Preview de Markdown** (P2) - Editor WYSIWYG

---

**Documento criado por:** Cascade AI  
**Última atualização:** 28/03/2026  
**Versão:** 1.0
