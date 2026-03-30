import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Eye, EyeOff, Loader2, AlertCircle, Mic, Check } from 'lucide-react';
import { useAuth } from '@studio/hooks/use-auth';
import { useToast } from '@studio/hooks/use-toast';

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

// Password Strength Bar
function PasswordStrength({ password }: { password: string }) {
  const getStrength = (pwd: string): number => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  
  const getColor = (index: number) => {
    if (strength === 0) return 'bg-gray-200';
    if (index >= strength) return 'bg-gray-200';
    if (strength === 1) return 'bg-red-400';
    if (strength === 2 || strength === 3) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  return (
    <div className="flex gap-1 mt-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={`h-1 flex-1 rounded-full ${getColor(i)}`} />
      ))}
    </div>
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

export default function Signup() {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({ fullName: false, email: false, password: false, confirmPassword: false });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirectToAfterAuth, setRedirectToAfterAuth] = useState<string | null>(null);

  const { user, register, isRegistering } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !isRegistering) {
      const timer = setTimeout(() => setLocation(redirectToAfterAuth || "/hub-dub/studios", { replace: true }), 1000);
      return () => clearTimeout(timer);
    }
  }, [user, setLocation, isRegistering, redirectToAfterAuth]);

  const fullNameError = !formData.fullName.trim() ? "Nome completo é obrigatório" : formData.fullName.trim().length < 3 ? "Mínimo de 3 caracteres" : null;
  const emailError = !formData.email.trim() ? "Email é obrigatório" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) ? "Email inválido" : null;
  const passwordError = !formData.password ? "Senha é obrigatória" : formData.password.length < 4 ? "Mínimo de 4 caracteres" : null;
  const confirmPasswordError = !formData.confirmPassword ? "Confirme sua senha" : formData.password !== formData.confirmPassword ? "As senhas não coincidem" : null;

  const canSubmit = !fullNameError && !emailError && !passwordError && !confirmPasswordError && agreedToTerms && !isRegistering && !isSuccess;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true });
    if (fullNameError || emailError || passwordError || confirmPasswordError) return;
    if (!agreedToTerms) {
      toast({ title: "Termos de uso", description: "Você precisa concordar com os Termos de Uso e Política de Privacidade.", variant: "destructive" });
      return;
    }

    register(
      { email: formData.email.trim(), fullName: formData.fullName.trim(), password: formData.password },
      {
        onSuccess: (data: any) => {
          setRedirectToAfterAuth(data?.redirectTo);
          setIsSuccess(true);
          toast({ title: "Conta criada com sucesso!" });
        },
        onError: (err: any) => toast({ title: "Falha no cadastro", description: String(err?.message || "Erro ao criar conta"), variant: "destructive" }),
      }
    );
  };

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, [field]: e.target.value }));
  const handleBlur = (field: keyof typeof touched) => () => setTouched(prev => ({ ...prev, [field]: true }));

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
          <h2 className="text-3xl font-bold text-white">Seu estúdio.</h2>
          <h2 className="text-3xl font-bold text-white">Em qualquer lugar.</h2>
          
          <div className="mt-8">
            <AudioWaveform />
          </div>
        </div>

        {/* Bottom: Quote Card */}
        <div className="bg-gray-900 rounded-xl p-4">
          <p className="italic text-gray-300 text-sm">
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
          </p>
          <p className="text-gray-500 text-xs mt-2">Fictionalname</p>
        </div>
      </div>

      {/* RIGHT PANEL - flex-1 bg-white */}
      <div className="flex-1 bg-white flex items-center justify-center px-6 py-8 overflow-y-auto">
        <div className="max-w-sm w-full">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900">Crie sua conta</h1>

          {/* Form */}
          <form onSubmit={submit} className="mt-6 space-y-4">
            {/* Full Name */}
            <div>
              <FloatingInput
                label="Nome completo"
                type="text"
                value={formData.fullName}
                onChange={handleInputChange('fullName')}
                onBlur={handleBlur('fullName')}
                error={fullNameError}
                touched={touched.fullName}
                autoComplete="name"
              />
              {touched.fullName && fullNameError && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                  <AlertCircle className="w-4 h-4" />{fullNameError}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <FloatingInput
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                onBlur={handleBlur('email')}
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
                value={formData.password}
                onChange={handleInputChange('password')}
                onBlur={handleBlur('password')}
                error={passwordError}
                touched={touched.password}
                showPasswordToggle
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                autoComplete="new-password"
              />
              {touched.password && passwordError && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                  <AlertCircle className="w-4 h-4" />{passwordError}
                </div>
              )}
              <PasswordStrength password={formData.password} />
            </div>

            {/* Confirm Password */}
            <div>
              <FloatingInput
                label="Confirmar senha"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                error={confirmPasswordError}
                touched={touched.confirmPassword}
                showPasswordToggle
                showPassword={showConfirmPassword}
                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                autoComplete="new-password"
              />
              {touched.confirmPassword && confirmPasswordError && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                  <AlertCircle className="w-4 h-4" />{confirmPasswordError}
                </div>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2 mt-4">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 border border-gray-300 rounded mt-0.5 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                Concordo com os <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Termos de Uso</a> e <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Política de Privacidade</a>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full h-12 rounded-xl font-semibold transition-colors flex items-center justify-center ${
                isRegistering || !canSubmit
                  ? 'bg-blue-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isRegistering ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : "Criar conta grátis"}
            </button>
          </form>

          {/* Bottom link */}
          <p className="text-center mt-6 text-sm">
            <span className="text-gray-500">Já tem conta? </span>
            <Link href="/auth/login" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
