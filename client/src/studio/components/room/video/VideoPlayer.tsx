import { forwardRef } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@studio/lib/utils";

interface VideoPlayerProps {
  src?: string | null;
  isMuted: boolean;
  onMuteToggle: () => void;
  onPlay: () => void;
  onPause: () => void;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  countdownValue?: number;
  volumeOverlay?: number | null;
  loopInfo?: string | null;
  height?: string;
  className?: string;
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(({
  src,
  isMuted,
  onMuteToggle,
  onPlay,
  onPause,
  onTimeUpdate,
  onDurationChange,
  onTouchStart,
  onTouchMove,
  countdownValue = 0,
  volumeOverlay = null,
  loopInfo = null,
  height,
  className,
}, ref) => {
  return (
    <div
      className={cn("relative overflow-hidden bg-black flex items-center justify-center", className)}
      style={height ? { height } : undefined}
    >
      {src ? (
        <video
          ref={ref}
          src={src}
          className="w-full h-full object-contain touch-none"
          onPlay={onPlay}
          onPause={onPause}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTimeUpdate={(e) => onTimeUpdate((e.target as HTMLVideoElement).currentTime)}
          onDurationChange={(e) => onDurationChange((e.target as HTMLVideoElement).duration)}
          muted={isMuted}
          playsInline
          disablePictureInPicture
          controls={false}
          controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white/30">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/5">
            <Play className="w-7 h-7" />
          </div>
          <p className="text-xs">Nenhum vídeo anexado a esta produção</p>
        </div>
      )}

      {/* Countdown overlay */}
      {countdownValue > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="w-24 h-24 rounded-full bg-black/70 backdrop-blur flex items-center justify-center border-2 border-primary shadow-xl shadow-primary/30">
            <span className="text-5xl font-black text-white tabular-nums">{countdownValue}</span>
          </div>
        </div>
      )}

      {/* Volume overlay */}
      <AnimatePresence>
        {volumeOverlay !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 bg-black/60 backdrop-blur px-4 py-3 rounded-2xl border border-white/10 z-20 pointer-events-none"
          >
            <Volume2 className="w-6 h-6 text-primary" />
            <span className="text-xs font-bold font-mono tracking-widest">{volumeOverlay}%</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mute button */}
      <button
        onClick={onMuteToggle}
        className="absolute top-4 right-4 p-3 rounded-xl bg-black/60 backdrop-blur text-white/80 hover:text-white transition-all hover:bg-black/80 border border-white/20 hover:scale-110 hover:border-white/30 z-20"
        aria-label={isMuted ? "Ativar som" : "Desativar som"}
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>

      {/* Loop indicator */}
      {loopInfo && (
        <div className="absolute top-4 left-4 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 px-4 flex items-center text-[11px] text-indigo-100 z-30 backdrop-blur-md">
          {loopInfo}
        </div>
      )}
    </div>
  );
});

VideoPlayer.displayName = "VideoPlayer";
