import { Mic, Play, Pause, RotateCcw, Square, Repeat, Loader2 } from "lucide-react";
import { cn } from "@studio/lib/utils";
import { type RecordingStatus } from "@studio/pages/room";

interface CustomLoop {
  start: number;
  end: number;
}

interface MobileFooterControlsProps {
  controlsVisible: boolean;
  isLooping: boolean;
  isPlaying: boolean;
  recordingStatus: RecordingStatus;
  micReady: boolean;
  isSaving: boolean;
  loopSelectionMode: string;
  customLoop: CustomLoop | null;
  videoTime: number;
  videoDuration: number;
  formatTimecode: (t: number) => string;
  onVisibilityChange: (visible: boolean) => void;
  onSeekBack: () => void;
  onRecordOrStop: () => void;
  onPlayPause: () => void;
  onScrub: (ratio: number) => void;
  onLoop: () => void;
  onRecord: () => void;
  onStopRecord: () => void;
}

export function MobileFooterControls({
  controlsVisible,
  isLooping,
  isPlaying,
  recordingStatus,
  micReady,
  isSaving,
  loopSelectionMode,
  customLoop,
  videoTime,
  videoDuration,
  formatTimecode,
  onVisibilityChange,
  onSeekBack,
  onRecordOrStop,
  onPlayPause,
  onScrub,
  onLoop,
  onRecord,
  onStopRecord,
}: MobileFooterControlsProps) {
  const isRecording = recordingStatus === "recording";
  const canRecord = recordingStatus === "idle" || recordingStatus === "recorded";

  return (
    <footer
      className={cn(
        "h-24 room-controls flex flex-col sm:flex-row items-center px-6 gap-4 sm:gap-8 transition-all duration-300 ease-in-out z-50",
        !controlsVisible && "translate-y-full opacity-0 pointer-events-none"
      )}
      onMouseEnter={() => { if (!isLooping) onVisibilityChange(true); }}
      onMouseLeave={() => { if (!isLooping) onVisibilityChange(false); }}
    >
      {/* Quick transport row */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSeekBack}
          className="w-9 h-9 room-rounded flex items-center justify-center room-button-secondary room-transition"
          title="Recuar 2s"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={onRecordOrStop}
          className={cn(
            "w-14 h-14 room-rounded-full flex items-center justify-center transition-all",
            isRecording
              ? "room-status-recording animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.6)] hover:scale-110 active:scale-95"
              : "room-button-primary hover:scale-105 active:scale-95"
          )}
        >
          {isRecording ? <Square className="w-7 h-7 text-white fill-white" /> : <Mic className="w-7 h-7" />}
        </button>
        <button
          onClick={onPlayPause}
          className={cn(
            "w-9 h-9 room-rounded flex items-center justify-center room-transition",
            isPlaying ? "room-button-primary" : "room-button-secondary"
          )}
          title={isPlaying ? "Pausar" : "Reproduzir"}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>

      {/* Progress scrubber */}
      <div className="flex-1 w-full flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-white/40 px-1">
          <span>{formatTimecode(videoTime)}</span>
          <span>{formatTimecode(videoDuration)}</span>
        </div>
        <div
          className="relative h-2 rounded-full cursor-pointer group bg-white/10 overflow-hidden"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            onScrub((e.clientX - rect.left) / rect.width);
          }}
        >
          <div
            className="absolute top-0 bottom-0 rounded-full bg-primary transition-all duration-100"
            style={{ width: `${videoDuration > 0 ? (videoTime / videoDuration) * 100 : 0}%` }}
          />
          {customLoop && videoDuration > 0 && (
            <>
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-indigo-400 z-10"
                style={{ left: `${Math.max(0, Math.min(100, (customLoop.start / videoDuration) * 100))}%` }}
              />
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-indigo-400 z-10"
                style={{ left: `${Math.max(0, Math.min(100, (customLoop.end / videoDuration) * 100))}%` }}
              />
              <div
                className="absolute top-0 bottom-0 bg-indigo-500/20"
                style={{
                  left: `${Math.max(0, Math.min(100, (customLoop.start / videoDuration) * 100))}%`,
                  width: `${Math.max(0, Math.min(100, ((customLoop.end - customLoop.start) / videoDuration) * 100))}%`,
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Loop + record buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={onLoop}
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all border shadow-lg",
            loopSelectionMode !== "idle" || isLooping
              ? "bg-indigo-500/30 border-indigo-400/60 text-indigo-200 shadow-indigo-500/20"
              : "bg-white/10 border-white/20 text-white/80 hover:text-white hover:bg-white/20 hover:scale-105"
          )}
          aria-label="Configurar loop"
        >
          <Repeat className="w-6 h-6" />
        </button>

        {canRecord ? (
          <button
            onClick={onRecord}
            disabled={!micReady || isSaving}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all border shadow-2xl",
              isSaving
                ? "opacity-50 cursor-not-allowed bg-white/5 border-white/10 text-white/20"
                : "bg-gradient-to-br from-red-500 to-red-600 border-red-400/30 text-white hover:from-red-600 hover:to-red-700 hover:scale-110 active:scale-95 shadow-red-500/25"
            )}
          >
            {isSaving ? <Loader2 className="w-7 h-7 animate-spin" /> : <Mic className="w-7 h-7" />}
          </button>
        ) : (
          <button
            onClick={onStopRecord}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-all bg-gradient-to-br from-red-600 to-red-700 shadow-[0_0_30px_rgba(239,68,68,0.6)] animate-pulse hover:scale-110 active:scale-95"
          >
            <Square className="w-7 h-7 text-white fill-white" />
          </button>
        )}
      </div>

      {/* Auto-save toast */}
      {recordingStatus === "recorded" && (
        <div className="absolute bottom-full left-0 right-0 mb-4 px-6 pointer-events-none">
          <div className="max-w-md mx-auto h-12 rounded-2xl room-bg-elevated border border-border shadow-2xl flex items-center justify-between px-4 text-xs room-text-primary pointer-events-auto backdrop-blur-xl">
            <span>Take salvo automaticamente.</span>
          </div>
        </div>
      )}
    </footer>
  );
}
