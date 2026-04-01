import { useCallback, useEffect, useState } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

interface TourStep {
  target: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface RoomTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "[data-testid='video-player']",
    title: "Player de Vídeo",
    description: "Aqui você assiste ao vídeo de referência sincronizado com todos os participantes da sessão.",
    position: "bottom",
  },
  {
    target: "[data-testid='script-viewport']",
    title: "Roteiro Sincronizado",
    description: "O roteiro acompanha o vídeo automaticamente. Diretores podem clicar nas linhas para navegar.",
    position: "left",
  },
  {
    target: "[data-testid='button-record']",
    title: "Gravação de Takes",
    description: "Dubladores usam este botão para gravar suas falas. O sistema faz contagem regressiva de 3 segundos.",
    position: "top",
  },
  {
    target: "[data-testid='button-open-text-control']",
    title: "Controle de Texto",
    description: "Diretores podem liberar permissão para alunos/dubladores editarem o roteiro.",
    position: "bottom",
  },
  {
    target: "[data-testid='button-open-takes']",
    title: "Lista de Takes",
    description: "Visualize todos os takes gravados na sessão, com status de aprovação do diretor.",
    position: "bottom",
  },
  {
    target: "[data-testid='playback-controls']",
    title: "Controles de Reprodução",
    description: "Play, pause, stop e navegação pelo vídeo. Sincronizado entre todos os participantes.",
    position: "top",
  },
];

export function RoomTour({ onComplete, onSkip }: RoomTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const updateTargetPosition = useCallback(() => {
    const step = TOUR_STEPS[currentStep];
    const element = document.querySelector(step.target);
    if (element) {
      setTargetRect(element.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    updateTargetPosition();
    const timer = setInterval(updateTargetPosition, 100);
    window.addEventListener("resize", updateTargetPosition);
    window.addEventListener("scroll", updateTargetPosition, true);
    return () => {
      clearInterval(timer);
      window.removeEventListener("resize", updateTargetPosition);
      window.removeEventListener("scroll", updateTargetPosition, true);
    };
  }, [updateTargetPosition]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = TOUR_STEPS[currentStep];
  if (!targetRect) return null;

  const position = step.position || "bottom";
  let tooltipStyle: React.CSSProperties = { position: "fixed" };

  switch (position) {
    case "top":
      tooltipStyle = {
        ...tooltipStyle,
        left: targetRect.left + targetRect.width / 2,
        top: targetRect.top - 16,
        transform: "translate(-50%, -100%)",
      };
      break;
    case "bottom":
      tooltipStyle = {
        ...tooltipStyle,
        left: targetRect.left + targetRect.width / 2,
        top: targetRect.bottom + 16,
        transform: "translateX(-50%)",
      };
      break;
    case "left":
      tooltipStyle = {
        ...tooltipStyle,
        left: targetRect.left - 16,
        top: targetRect.top + targetRect.height / 2,
        transform: "translate(-100%, -50%)",
      };
      break;
    case "right":
      tooltipStyle = {
        ...tooltipStyle,
        left: targetRect.right + 16,
        top: targetRect.top + targetRect.height / 2,
        transform: "translateY(-50%)",
      };
      break;
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[9998]"
        style={{
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
        }}
        onClick={onSkip}
      />

      <div
        className="fixed z-[9999] pointer-events-none"
        style={{
          left: targetRect.left - 8,
          top: targetRect.top - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
          boxShadow: "0 0 0 4px rgba(251, 191, 36, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.7)",
          borderRadius: "12px",
          transition: "all 0.3s ease",
        }}
      />

      <div
        className="z-[10000] w-[320px] rounded-xl shadow-2xl"
        style={{
          ...tooltipStyle,
          background: "rgba(15, 15, 30, 0.98)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(251, 191, 36, 0.3)",
          transition: "all 0.3s ease",
        }}
      >
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "hsl(var(--primary))" }}>
                Passo {currentStep + 1} de {TOUR_STEPS.length}
              </div>
              <h3 className="text-base font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                {step.title}
              </h3>
            </div>
            <button
              onClick={onSkip}
              className="transition-colors ml-2"
              style={{ color: "hsl(var(--muted-foreground) / 0.7)" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm mb-4" style={{ color: "hsl(var(--foreground) / 0.8)" }}>
            {step.description}
          </p>
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                color: "hsl(var(--foreground) / 0.8)",
              }}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Anterior
            </button>
            <div className="flex gap-1">
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{
                    background: i === currentStep ? "hsl(var(--primary))" : "rgba(255, 255, 255, 0.2)",
                  }}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors font-medium"
              style={{
                background: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
              }}
            >
              {currentStep === TOUR_STEPS.length - 1 ? "Concluir" : "Próximo"}
              {currentStep < TOUR_STEPS.length - 1 && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
