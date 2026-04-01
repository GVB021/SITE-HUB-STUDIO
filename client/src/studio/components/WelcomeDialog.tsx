import { Sparkles, Play, X } from "lucide-react";

interface WelcomeDialogProps {
  onStartTour: () => void;
  onSkip: () => void;
}

export function WelcomeDialog({ onStartTour, onSkip }: WelcomeDialogProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
      <div className="rounded-2xl w-[calc(100vw-32px)] max-w-[480px] animate-in fade-in zoom-in-95 duration-300" style={{ background: "rgba(15,15,30,0.98)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid hsl(var(--border))", boxShadow: "0 12px 48px rgba(0,0,0,0.5)" }}>
        <div className="p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.6) 100%)" }}>
              <Sparkles className="w-8 h-8" style={{ color: "hsl(var(--primary-foreground))" }} />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-3" style={{ color: "hsl(var(--foreground))" }}>
            Bem-vindo à Sala de Dublagem!
          </h2>
          
          <p className="text-sm mb-6" style={{ color: "hsl(var(--foreground) / 0.7)" }}>
            Primeira vez por aqui? Que tal fazer um tour rápido pela interface? 
            Vamos te mostrar onde estão as principais funcionalidades.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onSkip}
              className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-white/10"
              style={{ 
                background: "rgba(255, 255, 255, 0.05)",
                color: "hsl(var(--foreground) / 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)"
              }}
            >
              Pular Tutorial
            </button>
            <button
              onClick={onStartTour}
              className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:brightness-110 flex items-center gap-2 justify-center"
              style={{ 
                background: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
              }}
            >
              <Play className="w-4 h-4" />
              Iniciar Tour
            </button>
          </div>

          <button
            onClick={onSkip}
            className="mt-6 text-xs transition-colors"
            style={{ color: "hsl(var(--muted-foreground) / 0.6)" }}
          >
            Não mostrar novamente
          </button>
        </div>
      </div>
    </div>
  );
}
