import React from "react";
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
  const isRecording = recordingStatus === "recording" || recordingStatus === "countdown";
  const canRecord = recordingStatus === "idle" || recordingStatus === "recorded";

  const handleScrubTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0] || e.changedTouches[0];
    if (!touch) return;
    const rect = e.currentTarget.getBoundingClientRect();
    onScrub(Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width)));
  };

  return (
    <div
      className={cn(
        "room-controls shrink-0 flex flex-col px-4 pt-2 pb-1 gap-2 transition-all duration-200 z-50",
        "landscape:px-3 landscape:py-1",
        !controlsVisible && "landscape:opacity-0 landscape:pointer-events-none"
      )}
      style={{ paddingBottom: "max(4px, env(safe-area-inset-bottom))" }}
    >
      {/* Scrubber row */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-white/40 px-0.5">
          <span>{formatTimecode(videoTime)}</span>
          <span>{formatTimecode(videoDuration)}</span>
        </div>
        <div
          className="relative h-3 rounded-full cursor-pointer bg-white/10 overflow-hidden touch-none"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            onScrub((e.clientX - rect.left) / rect.width);
          }}
          onTouchStart={handleScrubTouch}
          onTouchMove={handleScrubTouch}
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

      {/* Controls row: seek-back | play/pause | REC/STOP (large) | loop */}
      <div className="flex items-center justify-between gap-2">
        {/* Seek back */}
        <button
          onClick={onSeekBack}
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl flex items-center justify-center room-button-secondary active:scale-95 transition-all"
          title="Recuar 2s"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Play / Pause */}
        <button
          onClick={onPlayPause}
          className={cn(
            "min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95",
            isPlaying ? "room-button-primary" : "room-button-secondary"
          )}
          title={isPlaying ? "Pausar" : "Reproduzir"}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        {/* REC / STOP — prominent centre button */}
        {canRecord ? (
          <button
            onClick={onRecord}
            disabled={!micReady || isSaving}
            className={cn(
              "min-w-[60px] min-h-[60px] w-15 h-15 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-2xl border",
              isSaving
                ? "opacity-50 cursor-not-allowed bg-white/5 border-white/10 text-white/20"
                : "bg-gradient-to-br from-red-500 to-red-600 border-red-400/30 text-white hover:from-red-600 hover:to-red-700 hover:scale-105 shadow-red-500/40"
            )}
            style={{ width: 60, height: 60 }}
          >
            {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Mic className="w-6 h-6" />}
          </button>
        ) : (
          <button
            onClick={onStopRecord}
            className="rounded-full flex items-center justify-center transition-all active:scale-95 bg-gradient-to-br from-red-600 to-red-700 shadow-[0_0_24px_rgba(239,68,68,0.6)] animate-pulse"
            style={{ width: 60, height: 60 }}
          >
            <Square className="w-6 h-6 text-white fill-white" />
          </button>
        )}

        {/* Loop */}
        <button
          onClick={onLoop}
          className={cn(
            "min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95 border",
            loopSelectionMode !== "idle" || isLooping
              ? "bg-indigo-500/30 border-indigo-400/60 text-indigo-200"
              : "room-button-secondary"
          )}
          aria-label="Loop"
        >
          <Repeat className="w-5 h-5" />
        </button>
      </div>

      {/* Saving indicator */}
      {isSaving && (
        <div className="flex items-center justify-center gap-2 text-[11px] text-white/60 py-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Enviando take...</span>
        </div>
      )}
    </div>
  );
}
