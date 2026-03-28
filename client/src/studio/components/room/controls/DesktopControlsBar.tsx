import { Mic, Play, Pause, RotateCcw, Square, Repeat, Loader2 } from "lucide-react";
import { cn } from "@studio/lib/utils";
import { type RecordingStatus } from "@studio/pages/room";

interface DesktopControlsBarProps {
  isPlaying: boolean;
  isLooping: boolean;
  recordingStatus: RecordingStatus;
  micReady: boolean;
  isSaving: boolean;
  micInitializing: boolean;
  videoTime: number;
  videoDuration: number;
  formatTimecode: (t: number) => string;
  onSeekBack: () => void;
  onPlayPause: () => void;
  onSeekForward: () => void;
  onScrub: (ratio: number) => void;
  onLoop: () => void;
  onRecord: () => void;
  onStopRecord: () => void;
  canControlVideo?: boolean;
}

export function DesktopControlsBar({
  isPlaying,
  isLooping,
  recordingStatus,
  micReady,
  isSaving,
  micInitializing,
  videoTime,
  videoDuration,
  formatTimecode,
  onSeekBack,
  onPlayPause,
  onSeekForward,
  onScrub,
  onLoop,
  onRecord,
  onStopRecord,
  canControlVideo = true,
}: DesktopControlsBarProps) {
  const isRecording = recordingStatus === "recording";
  const canRecord = recordingStatus === "idle" || recordingStatus === "recorded";

  return (
    <div className="shrink-0 h-20 flex items-center px-8 gap-6 z-40 bg-background/80 backdrop-blur-md border-t border-border/60">
      <div className="flex items-center gap-2">
        <button
          onClick={onSeekBack}
          disabled={!canControlVideo}
          className={cn("w-9 h-9 rounded-xl flex items-center justify-center bg-muted/40 border border-border/60 transition-all", canControlVideo ? "text-muted-foreground hover:text-foreground" : "opacity-30 cursor-not-allowed")}
          title={canControlVideo ? "Recuar 2s" : "Sem permissão"}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={onPlayPause}
          disabled={!canControlVideo}
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center transition-all",
            !canControlVideo
              ? "bg-muted/20 border border-border/40 text-muted-foreground/30 cursor-not-allowed"
              : isPlaying
              ? "bg-primary text-primary-foreground hover:brightness-110"
              : "bg-muted/40 border border-border/60 text-muted-foreground hover:text-foreground"
          )}
          title={canControlVideo ? (isPlaying ? "Pausar" : "Reproduzir") : "Sem permissão"}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <button
          onClick={onSeekForward}
          disabled={!canControlVideo}
          className={cn("w-9 h-9 rounded-xl flex items-center justify-center bg-muted/40 border border-border/60 transition-all", canControlVideo ? "text-muted-foreground hover:text-foreground" : "opacity-30 cursor-not-allowed")}
          title={canControlVideo ? "Avançar 2s" : "Sem permissão"}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex justify-between text-[10px] font-mono uppercase tracking-tighter">
          <span className="text-muted-foreground/50">{formatTimecode(videoTime)}</span>
          <span className="text-muted-foreground/50">{formatTimecode(videoDuration)}</span>
        </div>
        <div
          className="relative h-1.5 rounded-full bg-muted/40 cursor-pointer overflow-hidden"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            onScrub((e.clientX - rect.left) / rect.width);
          }}
        >
          <div
            className="absolute top-0 bottom-0 bg-primary transition-all duration-100"
            style={{ width: `${videoDuration > 0 ? (videoTime / videoDuration) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onLoop}
          disabled={!canControlVideo}
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center border transition-all",
            !canControlVideo
              ? "opacity-30 cursor-not-allowed bg-muted/40 border-border/60"
              : isLooping
              ? "bg-primary/10 border-primary/20 text-primary"
              : "bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground"
          )}
          title={canControlVideo ? "Configurar Loop" : "Sem permissão"}
        >
          <Repeat className="w-4 h-4" />
        </button>

        {canRecord ? (
          <button
            onClick={onRecord}
            disabled={!micReady || isSaving || micInitializing}
            className={cn(
              "w-11 h-11 rounded-full flex items-center justify-center transition-all",
              micInitializing
                ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-300 animate-pulse"
                : !micReady
                ? "bg-red-500/20 border-red-500/40 text-red-300"
                : "bg-muted/50 border-border/60 text-foreground hover:bg-muted/80"
            )}
            title={
              micInitializing
                ? "Inicializando microfone..."
                : !micReady
                ? "Microfone não disponível"
                : "Gravar"
            }
          >
            {isSaving || micInitializing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
        ) : isRecording ? (
          <button
            onClick={onStopRecord}
            className="w-11 h-11 rounded-full flex items-center justify-center bg-red-500 animate-pulse"
            title="Parar Gravação"
          >
            <Square className="w-5 h-5 text-white fill-white" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
