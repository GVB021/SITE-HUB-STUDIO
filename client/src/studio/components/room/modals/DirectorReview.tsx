import { motion } from "framer-motion";
import { Check, X, Download, Loader2, Monitor, Mic } from "lucide-react";
import { cn } from "@studio/lib/utils";

interface DirectorReviewProps {
  mode: "director" | "dubber";
  take: any;
  isSaving?: boolean;
  isWaitingReview?: boolean;
  onApprove: () => void;
  onReject?: () => void;
  onDiscard?: () => void;
}

export function DirectorReview({
  mode,
  take,
  isSaving = false,
  isWaitingReview = false,
  onApprove,
  onReject,
  onDiscard,
}: DirectorReviewProps) {
  const isDirector = mode === "director";
  const duration = (take?.duration ?? take?.durationSeconds ?? 0).toFixed(2);
  const score = take?.metrics?.score ?? take?.metrics?.score ?? 0;
  const loudness = ((take?.metrics?.loudness ?? 0) * 100).toFixed(0);
  const clipping = ((take?.metrics?.clippingRatio ?? 0) * 100).toFixed(1);
  const audioUrl = take?.audioUrl ?? take?.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-[420px] z-50"
      data-testid="director-review-popup"
    >
      <div className="room-popup room-rounded-2xl p-4 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 room-rounded-full flex items-center justify-center room-bg-surface",
              isDirector ? "border border-primary/30" : "border border-emerald-500/30"
            )}>
              {isDirector ? (
                <Monitor className="w-6 h-6 text-primary" />
              ) : (
                <Mic className="w-6 h-6 text-emerald-400" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold room-text-primary">
                {isDirector ? "👨‍💼 Revisão do Diretor" : "🎙️ Preview da Gravação"}
              </h3>
              <p className="text-[10px] room-text-muted uppercase tracking-widest font-mono">
                {duration}s • {score}% Qualidade
              </p>
            </div>
          </div>
          <div className={cn(
            "w-3 h-3 rounded-full animate-pulse",
            isDirector ? "room-status-online" : "room-status-recording"
          )} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mb-4">
          {isDirector ? (
            <>
              <button
                onClick={onApprove}
                disabled={isSaving}
                className="flex-1 h-10 room-button-primary room-rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 room-transition"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Aprovar
              </button>
              {onReject && (
                <button
                  onClick={onReject}
                  disabled={isSaving}
                  className="flex-1 h-10 room-button-secondary room-text-primary border border-destructive room-rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 room-transition hover:bg-destructive/10"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                  Rejeitar
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={onApprove}
                disabled={isSaving || isWaitingReview}
                className="flex-1 h-10 room-button-primary room-rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 room-transition"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isWaitingReview ? "Enviado..." : "Enviar"}
              </button>
              {onDiscard && (
                <button
                  onClick={onDiscard}
                  className="h-10 px-4 room-button-secondary room-rounded-lg font-medium flex items-center justify-center gap-2 room-transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <div className="room-bg-surface room-rounded-2xl p-3 flex items-center gap-4 mb-4">
            <audio
              src={audioUrl}
              controls
              className="w-full h-10 accent-primary"
              controlsList="nodownload noplaybackrate"
              preload="metadata"
            />
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="room-bg-surface room-rounded-xl p-2 text-center">
            <p className="text-[9px] room-text-subtle uppercase font-bold">Loudness</p>
            <p className="text-xs font-mono room-text-primary">{loudness}%</p>
          </div>
          <div className="room-bg-surface room-rounded-xl p-2 text-center">
            <p className="text-[9px] room-text-subtle uppercase font-bold">Score</p>
            <p className="text-xs font-mono room-text-primary">{score}%</p>
          </div>
          <div className="room-bg-surface room-rounded-xl p-2 text-center">
            <p className="text-[9px] room-text-subtle uppercase font-bold">Clipping</p>
            <p className="text-xs font-mono room-text-primary">{clipping}%</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
