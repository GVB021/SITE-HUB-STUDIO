import { Mic, Square, Loader2 } from "lucide-react";
import { cn } from "@studio/lib/utils";

interface RecordingControlsProps {
  status: "idle" | "countdown" | "recording" | "stopped" | "recorded";
  countdownValue: number;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export function RecordingControls({
  status,
  countdownValue,
  onStart,
  onStop,
  disabled = false
}: RecordingControlsProps) {
  const isRecording = status === "recording" || status === "countdown";
  
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative group">
        <button
          onClick={isRecording ? onStop : onStart}
          disabled={disabled || status === "stopped"}
          className={cn(
            "relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
            disabled ? "opacity-50 cursor-not-allowed room-bg-surface border border-border" :
            status === "countdown" ? "bg-amber-500 text-white scale-110 shadow-amber-500/50" :
            status === "recording" ? "bg-red-500 text-white scale-110 shadow-red-500/50 animate-pulse-slow" :
            status === "stopped" ? "room-bg-surface room-text-muted border border-border" :
            "bg-red-500 text-white hover:bg-red-600 hover:scale-105 shadow-red-500/30"
          )}
        >
          {status === "countdown" ? (
            <span className="text-3xl sm:text-4xl font-black">{countdownValue}</span>
          ) : status === "recording" ? (
            <Square className="w-6 h-6 sm:w-8 sm:h-8 fill-current animate-in zoom-in" />
          ) : status === "stopped" ? (
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" />
          ) : (
            <Mic className="w-6 h-6 sm:w-8 sm:h-8" />
          )}

          {/* Efeito de anel pulsante quando gravando */}
          {status === "recording" && (
            <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-75" style={{ animationDuration: '2s' }} />
          )}
        </button>
      </div>

      <div className="h-4 flex items-center justify-center">
        {status === "countdown" && <span className="text-xs font-medium text-amber-500 uppercase tracking-widest animate-pulse">Preparando...</span>}
        {status === "recording" && <span className="text-xs font-medium text-red-500 uppercase tracking-widest flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Gravando</span>}
        {status === "stopped" && <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Processando...</span>}
        {status === "recorded" && <span className="text-xs font-medium text-primary uppercase tracking-widest">Take Salvo</span>}
      </div>
    </div>
  );
}
