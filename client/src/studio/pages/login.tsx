import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAuth } from "@studio/hooks/use-auth";
import { Input } from "@studio/components/ui/input";
import { useToast } from "@studio/hooks/use-toast";
import { AppHeader } from "@/components/nav/AppHeader";
import { MeshGradient } from "@/components/landing/MeshGradient";

export default function Login() {
  const [lang, setLang] = useState<"en" | "pt">(() => {
    const saved = localStorage.getItem("vhub_language");
    return saved === "pt" ? "pt" : "en";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { user, login, isLoggingIn } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem("vhub_language", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (user) {
      setLocation("/hub-dub/studios", { replace: true });
    }
  }, [user, setLocation]);

  const tutorials = useMemo(() => {
    if (lang === "en") {
      return [
        {
          title: "Fast start in a session",
          items: [
            "Use SPACE to play/pause and keep your hand off the mouse.",
            "Use L to toggle loop on the current line and repeat takes faster.",
            "Use ←/→ to jump 2s for micro-adjustments.",
          ],
        },
        {
          title: "Best practices (quality + speed)",
          items: [
            "Record in headphones to avoid bleed and keep alignment clean.",
            "Keep input gain stable; avoid clipping and extreme fixes later.",
            "Prefer short loops over long playback to keep momentum.",
          ],
        },
        {
          title: "Text + timing workflow",
          items: [
            "If you can't click lines, ask for Text Control authorization.",
            "Edit only what’s necessary and keep the original intent consistent.",
            "Work line-by-line and avoid random seeking.",
          ],
        },
      ];
    }
    return [
      {
        title: "Começo rápido na sessão",
        items: [
          "Use SPACE para play/pause e reduza o uso do mouse.",
          "Use L para alternar loop na fala atual e acelerar a repetição de takes.",
          "Use ←/→ para saltar 2s e fazer microajustes.",
        ],
      },
      {
        title: "Melhores práticas (qualidade + velocidade)",
        items: [
          "Grave com fones para evitar vazamento e manter o alinhamento limpo.",
          "Mantenha o ganho estável; evite clip e correções agressivas depois.",
          "Prefira loops curtos em vez de rodar trechos longos para manter o ritmo.",
        ],
      },
      {
        title: "Fluxo texto + timing",
        items: [
          "Se você não consegue clicar nas falas, peça autorização de Controle de Texto.",
          "Edite apenas o essencial; mantenha consistência entre takes e revisões.",
          "Trabalhe fala a fala; evite buscar aleatoriamente no vídeo.",
        ],
      },
    ];
  }, [lang]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const safeEmail = email.trim();
    if (!safeEmail || !password) {
      toast({ title: lang === "en" ? "Missing fields" : "Campos obrigatórios", variant: "destructive" });
      return;
    }
    login(
      { email: safeEmail, password },
      {
        onSuccess: () => {
          toast({ title: lang === "en" ? "Signed in" : "Login realizado" });
          setLocation("/hub-dub/studios", { replace: true });
        },
        onError: (err: any) => {
          toast({
            title: lang === "en" ? "Login failed" : "Falha no login",
            description: String(err?.message || (lang === "en" ? "Try again." : "Tente novamente.")),
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader lang={lang} setLang={setLang} />

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="opacity-35 dark:opacity-100">
          <MeshGradient />
        </div>
        <div className="absolute inset-0 bg-white/60 dark:bg-black/35 backdrop-blur-[2px]" />
      </div>

      <main className="relative z-10 pt-[60px]">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <section className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                {lang === "en" ? "Work faster. Sound better." : "Trabalhe mais rápido. Soe melhor."}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {lang === "en"
                  ? "Mini tutorials to help you get maximum performance from the dubbing workflow."
                  : "Mini tutoriais para extrair o máximo de desempenho do fluxo de dublagem."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {tutorials.map((block) => (
                <motion.div
                  key={block.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl p-5"
                >
                  <div className="text-xs font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                    {block.title}
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-foreground/90">
                    {block.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-foreground/35 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="lg:sticky lg:top-[92px]">
            <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl p-6 md:p-7">
              <div className="space-y-2 mb-6">
                <div className="text-xs font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                  {lang === "en" ? "Login" : "Login"}
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {lang === "en" ? "Access your workspace" : "Acesse seu workspace"}
                </h2>
              </div>

              <form onSubmit={submit} className="space-y-4" data-testid="form-login">
                <div className="space-y-1.5">
                  <label htmlFor="login-email" className="text-xs text-muted-foreground">{lang === "en" ? "Email" : "Email"}</label>
                  <Input
                    id="login-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={lang === "en" ? "you@studio.com" : "voce@estudio.com"}
                    autoComplete="email"
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="login-password" className="text-xs text-muted-foreground">{lang === "en" ? "Password" : "Senha"}</label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={lang === "en" ? "Password" : "Senha"}
                    autoComplete="current-password"
                    data-testid="input-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full h-11 rounded-xl bg-foreground text-background font-semibold text-sm transition-opacity disabled:opacity-60"
                  data-testid="button-submit-login"
                >
                  {isLoggingIn ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {lang === "en" ? "Signing in..." : "Entrando..."}
                    </span>
                  ) : (
                    <span>{lang === "en" ? "Sign in" : "Entrar"}</span>
                  )}
                </button>
              </form>

              <div className="mt-5 text-xs text-muted-foreground leading-relaxed">
                {lang === "en"
                  ? "Tip: if you can’t control the script, ask a director/admin to grant Text Control."
                  : "Dica: se você não consegue controlar o roteiro, peça para diretor/admin liberar o Controle de Texto."}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

