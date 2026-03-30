import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Eye, EyeOff, Loader2, AlertCircle, Mic } from 'lucide-react';
import { useAuth } from '@studio/hooks/use-auth';
import { useToast } from '@studio/hooks/use-toast';
import { canEditLoginTextByEmail } from '../../lib/login-editor-access';

// Login text configuration types
interface LoginTextConfig {
  mainTitle: string;
  subTitle: string;
  quoteText: string;
  quoteAuthor: string;
}

const LOGIN_TEXT_STORAGE_KEY = "vhub_login_text_config_v1";

const defaultLoginTextConfig: LoginTextConfig = {
  mainTitle: "Seu estúdio.",
  subTitle: "Em qualquer lugar.",
  quoteText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  quoteAuthor: "Fictionalname",
};

function cleanSingleLine(v: unknown, fallback: string, max = 100) {
  const s = String(v ?? "").replace(/\s+/g, " ").trim();
  return (s || fallback).slice(0, max);
}

function normalizeLoginTextConfig(input: unknown): LoginTextConfig {
  const obj = typeof input === "object" && input ? (input as Record<string, unknown>) : {};
  return {
    mainTitle: cleanSingleLine(obj.mainTitle, defaultLoginTextConfig.mainTitle, 50),
    subTitle: cleanSingleLine(obj.subTitle, defaultLoginTextConfig.subTitle, 50),
    quoteText: cleanSingleLine(obj.quoteText, defaultLoginTextConfig.quoteText, 200),
    quoteAuthor: cleanSingleLine(obj.quoteAuthor, defaultLoginTextConfig.quoteAuthor, 50),
  };
}

function loadLoginTextConfig(): LoginTextConfig {
  try { 
    return normalizeLoginTextConfig(JSON.parse(localStorage.getItem(LOGIN_TEXT_STORAGE_KEY) || "{}")); 
  } catch { 
    return defaultLoginTextConfig; 
  }
}

// SVG Audio Waveform with 40 bars
function AudioWaveform() {
  const heights = [20,35,50,80,60,90,40,70,55,85,45,75,30,65,95,50,40,70,60,80,35,55,90,45,75,50,85,40,65,95,30,70,55,80,45,60,90,35,75,50];
  
  return (
    <div className="flex items-end justify-center gap-1 h-32">
      {heights.map((height, i) => (
        <div
          key={i}
          className="w-1 rounded-full"
          style={{ 
            height: `${height}px`,
            background: `linear-gradient(to top, #1e3a8a, #2563eb)`,
            opacity: 0.5 + (i % 5) * 0.1
          }}
        />
      ))}
    </div>
  );
}

// Google icon SVG
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// Floating Label Input Component
function FloatingInput({
  label,
  type,
  value,
  onChange,
  onBlur,
  error,
  touched,
  showPasswordToggle,
  showPassword,
  onTogglePassword,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  error: string | null;
  touched: boolean;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  autoComplete?: string;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  const isActive = isFocused || hasValue;
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;
  const hasError = touched && error;

  return (
    <div className="relative">
      <input
        type={inputType}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          onBlur();
        }}
        autoComplete={autoComplete}
        className={`w-full h-12 rounded-xl px-4 pt-4 pb-1 text-gray-900 transition-all outline-none ${
          hasError
            ? 'border border-red-400 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
            : isFocused
            ? 'border border-blue-500 bg-white ring-2 ring-blue-100'
            : 'border border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
        }`}
      />
      <label
        className={`absolute left-4 transition-all pointer-events-none ${
          isActive
            ? 'top-1 text-xs text-gray-500'
            : 'top-1/2 -translate-y-1/2 text-sm text-gray-400'
        } ${hasError ? 'text-red-500' : isFocused ? 'text-blue-600' : ''}`}
      >
        {label}
      </label>
      {showPasswordToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem("thehub_login_email") || "";
    } catch {
      return "";
    }
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirectToAfterAuth, setRedirectToAfterAuth] = useState<string | null>(null);

  // Login text editor states
  const [textConfig, setTextConfig] = useState<LoginTextConfig>(() => loadLoginTextConfig());
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const { user, login, isLoggingIn } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const canEditLoginText = canEditLoginTextByEmail(user?.email);

  // Save text config to localStorage when changed
  useEffect(() => {
    localStorage.setItem(LOGIN_TEXT_STORAGE_KEY, JSON.stringify(textConfig));
  }, [textConfig]);

  // Keyboard shortcut for editor (Ctrl+Shift+E)
  useEffect(() => {
    if (!canEditLoginText) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setIsEditorOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canEditLoginText]);

  // Close editor when user loses edit permission
  useEffect(() => {
    if (!canEditLoginText) setIsEditorOpen(false);
  }, [canEditLoginText]);

  useEffect(() => {
    if (user && !isLoggingIn) {
      const timer = setTimeout(() => {
        setLocation(redirectToAfterAuth || "/hub-dub/studios", { replace: true });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, setLocation, isLoggingIn, redirectToAfterAuth]);

  const emailError = !email.trim() ? "Email é obrigatório" : 
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? "Email inválido" : null;

  const passwordError = !password ? "Senha é obrigatória" : 
    password.length < 4 ? "Mínimo de 4 caracteres" : null;

  const canSubmit = !emailError && !passwordError && !isLoggingIn && !isSuccess;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (emailError || passwordError) return;

    login(
      { email: email.trim(), password },
      {
        onSuccess: (data: any) => {
          setRedirectToAfterAuth(data?.redirectTo);
          setIsSuccess(true);
          toast({ title: "Bem-vindo de volta!" });
        },
        onError: (err: any) => {
          toast({
            title: "Falha no login",
            description: String(err?.message || "Credenciais inválidas."),
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="h-screen flex">
      {/* LEFT PANEL - w-2/5 bg-gray-950 */}
      <div className="hidden md:flex md:w-2/5 bg-gray-950 flex-col p-12">
        {/* Top: Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-white" />
          <span className="text-lg font-semibold text-white">HubDub</span>
        </Link>

        {/* Center: Tagline + Waveform */}
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-white">{textConfig.mainTitle}</h2>
          <h2 className="text-3xl font-bold text-white">{textConfig.subTitle}</h2>
          
          <div className="mt-8">
            <AudioWaveform />
          </div>
        </div>

        {/* Bottom: Quote Card */}
        <div className="bg-gray-900 rounded-xl p-4">
          <p className="italic text-gray-300 text-sm">
            "{textConfig.quoteText}"
          </p>
          <p className="text-gray-500 text-xs mt-2">{textConfig.quoteAuthor}</p>
        </div>
      </div>

      {/* RIGHT PANEL - flex-1 bg-white */}
      <div className="flex-1 bg-white flex items-center justify-center px-6">
        <div className="max-w-sm w-full">
          {/* Header */}
          <p className="text-sm text-gray-500">Bem-vindo de volta</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">Entrar na sua conta</h1>

          {/* Form */}
          <form onSubmit={submit} className="mt-6 space-y-4">
            {/* Email */}
            <div>
              <FloatingInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                error={emailError}
                touched={touched.email}
                autoComplete="email"
              />
              {touched.email && emailError && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                  <AlertCircle className="w-4 h-4" />{emailError}
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <FloatingInput
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                error={passwordError}
                touched={touched.password}
                showPasswordToggle
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                autoComplete="current-password"
              />
              {touched.password && passwordError && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                  <AlertCircle className="w-4 h-4" />{passwordError}
                </div>
              )}
            </div>

            {/* Forgot password */}
            <div className="text-right">
              <button type="button" className="text-blue-600 text-sm hover:text-blue-700 transition-colors">
                Esqueci minha senha
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full h-12 rounded-xl font-semibold transition-colors flex items-center justify-center ${
                isLoggingIn || !canSubmit
                  ? 'bg-blue-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLoggingIn ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : "Entrar"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mt-6">
            <hr className="flex-1 border-gray-200" />
            <span className="text-sm text-gray-400">ou</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          {/* Google button */}
          <button className="w-full h-12 border border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors mt-4">
            <GoogleIcon />
            <span className="text-gray-700 text-sm">Entrar com Google</span>
          </button>

          {/* Bottom link */}
          <p className="text-center mt-6 text-sm">
            <span className="text-gray-500">Não tem conta? </span>
            <Link href="/auth/signup" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>

      {/* Login Text Editor - Only visible to admin */}
      {canEditLoginText && (
        <button
          type="button"
          onClick={() => setIsEditorOpen((v) => !v)}
          className="fixed right-4 bottom-4 z-30 rounded-full border border-gray-600 bg-gray-900/90 backdrop-blur px-4 h-9 text-xs font-semibold text-white hover:bg-gray-800/90 transition-colors"
          data-testid="button-login-text-editor"
        >
          Editar textos
        </button>
      )}

      {canEditLoginText && isEditorOpen && (
        <div className="fixed right-4 bottom-16 z-30 w-[min(92vw,460px)] rounded-2xl border border-gray-600 bg-gray-900/95 backdrop-blur p-4 shadow-2xl space-y-3">
          <div className="text-white text-sm font-semibold mb-2">Editar textos do login</div>
          
          <input 
            className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 h-9 text-sm text-white placeholder-gray-400" 
            value={textConfig.mainTitle} 
            onChange={(e) => setTextConfig((c) => ({ ...c, mainTitle: cleanSingleLine(e.target.value, c.mainTitle, 50) }))} 
            placeholder="Título principal" 
          />
          
          <input 
            className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 h-9 text-sm text-white placeholder-gray-400" 
            value={textConfig.subTitle} 
            onChange={(e) => setTextConfig((c) => ({ ...c, subTitle: cleanSingleLine(e.target.value, c.subTitle, 50) }))} 
            placeholder="Subtítulo" 
          />
          
          <textarea
            className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm min-h-20 text-white placeholder-gray-400"
            value={textConfig.quoteText}
            onChange={(e) => setTextConfig((c) => ({ ...c, quoteText: cleanSingleLine(e.target.value, c.quoteText, 200) }))}
            placeholder="Texto do quote"
          />
          
          <input 
            className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 h-9 text-sm text-white placeholder-gray-400" 
            value={textConfig.quoteAuthor} 
            onChange={(e) => setTextConfig((c) => ({ ...c, quoteAuthor: cleanSingleLine(e.target.value, c.quoteAuthor, 50) }))} 
            placeholder="Autor do quote" 
          />
          
          <div className="flex justify-between gap-2">
            <button 
              type="button" 
              className="rounded-md border border-gray-600 px-3 h-9 text-xs text-white hover:bg-gray-800 transition-colors" 
              onClick={() => setTextConfig(defaultLoginTextConfig)}
            >
              Resetar
            </button>
            <button 
              type="button" 
              className="rounded-md border border-gray-600 px-3 h-9 text-xs text-white hover:bg-gray-800 transition-colors" 
              onClick={() => setIsEditorOpen(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
