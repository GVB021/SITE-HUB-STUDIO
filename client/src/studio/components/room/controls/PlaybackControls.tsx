import { Play, Pause, Square, SkipBack, RotateCcw } from "lucide-react";
import { cn } from "@studio/lib/utils";

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  onRewind: () => void;
  onRestart: () => void;
  disabled?: boolean;
}

export function PlaybackControls({
  isPlaying,
  onPlayPause,
  onStop,
  onRewind,
  onRestart,
  disabled = false
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        className="w-9 h-9 room-rounded flex items-center justify-center room-button-secondary room-transition disabled:opacity-40"
        onClick={onRewind}
        disabled={disabled}
        title="Voltar 5 segundos"
      >
        <SkipBack className="w-4 h-4" />
      </button>

      <button
        className={cn(
          "w-11 h-11 room-rounded flex items-center justify-center room-transition disabled:opacity-40",
          isPlaying ? "room-button-primary" : "room-button-secondary"
        )}
        onClick={onPlayPause}
        disabled={disabled}
        title={isPlaying ? "Pausar" : "Reproduzir"}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5" />
        )}
      </button>

      <button
        className="w-9 h-9 room-rounded flex items-center justify-center room-button-secondary room-transition disabled:opacity-40"
        onClick={onStop}
        disabled={disabled || !isPlaying}
        title="Parar"
      >
        <Square className="w-4 h-4" />
      </button>

      <button
        className="w-9 h-9 room-rounded flex items-center justify-center room-button-secondary room-transition disabled:opacity-40"
        onClick={onRestart}
        disabled={disabled}
        title="Voltar ao início"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );
}
