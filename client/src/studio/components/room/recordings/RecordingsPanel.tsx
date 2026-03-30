import { type RefObject } from "react";
import { Play, Pause, Download, Loader2, X } from "lucide-react";
import { cn } from "@studio/lib/utils";
import { type RecordingAvailabilityState } from "@studio/pages/room";
import { type RecordingsResponse } from "@studio/hooks/room";

interface Take {
  id: string | number;
  lineIndex: number;
  characterName?: string;
  voiceActorName?: string;
  durationSeconds?: number;
  voiceActorId?: string;
}

interface RecordingsPanelProps {
  zIndex: number;
  recordingsResponse: RecordingsResponse | undefined;
  scopedRecordings: Take[];
  recordingAvailability: Record<string, RecordingAvailabilityState>;
  recordingsIsLoading: Set<string>;
  recordingsPreviewId: string | number | null;
  recordingsPlayerOpenId: string | number | null;
  recordingPlayableUrls: Record<string, string>;
  optimisticRemovingTakeIds: Set<string>;
  audioRef: RefObject<HTMLAudioElement>;
  rowAudioRefs: RefObject<Record<string, HTMLAudioElement | null>>;
  getTakeStreamUrl: (takeId: any) => string | Promise<string>;
  onClose: () => void;
  onPlayTake: (take: Take) => void;
  onDownloadTake: (take: Take) => void;
  onLoadedMetadata: (takeId: string, rate: number, el: HTMLAudioElement) => void;
  onAudioError: (takeId: string) => void;
}

export function RecordingsPanel({
  zIndex,
  recordingsResponse,
  scopedRecordings,
  recordingAvailability,
  recordingsIsLoading,
  recordingsPreviewId,
  recordingsPlayerOpenId,
  recordingPlayableUrls,
  optimisticRemovingTakeIds,
  audioRef,
  rowAudioRefs,
  getTakeStreamUrl,
  onClose,
  onPlayTake,
  onDownloadTake,
  onLoadedMetadata,
  onAudioError,
}: RecordingsPanelProps) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-md"
      style={{ zIndex }}
    >
      <div className="rounded-2xl w-[calc(100vw-32px)] max-w-[720px] overflow-hidden border border-border/70 bg-card/95 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/70">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-foreground">Gravações</span>
            <span className="text-[10px] px-2 py-1 rounded-full border bg-muted/60 text-muted-foreground">
              {recordingsResponse?.total || scopedRecordings.length || 0} takes
            </span>
          </div>
          <button onClick={onClose} className="transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Table */}
        <div className="px-6 py-4 max-h-[420px] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-12 text-[10px] uppercase text-muted-foreground tracking-wider pb-2 border-b border-border/60">
            <span className="col-span-2">Linha</span>
            <span className="col-span-3">Personagem</span>
            <span className="col-span-2">Dublador</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-1 text-right">Duração</span>
            <span className="col-span-2 text-right">Ações</span>
          </div>
          <div className="space-y-1 mt-2">
            {scopedRecordings.map((take) => {
              const tid = String(take.id || "");
              const avail = recordingAvailability[tid];
              const isLoading = recordingsIsLoading.has(tid);
              const isRemoved = optimisticRemovingTakeIds.has(tid);
              const isPreviewActive = recordingsPreviewId === take.id;
              const isPlayerOpen = recordingsPlayerOpenId === take.id;
              return (
                <div
                  key={take.id}
                  className={cn(
                    "rounded-md hover:bg-muted/40 px-2 py-2 transition-all duration-300",
                    isRemoved && "opacity-0 -translate-y-2 scale-[0.98] pointer-events-none"
                  )}
                >
                  <div className="grid grid-cols-12 items-center text-xs">
                    <span className="col-span-2 font-mono text-muted-foreground">#{take.lineIndex}</span>
                    <span className="col-span-3 truncate">{take.characterName || "-"}</span>
                    <span className="col-span-2 font-mono">{take.voiceActorName || "N/A"}</span>
                    <span className={cn("col-span-2 flex items-center gap-1.5", "text-emerald-500")}>
                      <span>Salvo</span>
                      <span className={cn(
                        "inline-flex h-1.5 w-1.5 rounded-full",
                        avail === "error" ? "bg-red-500" : avail === "loading" ? "bg-amber-500" : "bg-emerald-500"
                      )} />
                      <span className={cn(
                        "text-[10px] inline-flex items-center gap-1",
                        avail === "error" ? "text-red-500" : avail === "loading" ? "text-amber-500" : "text-emerald-500"
                      )}>
                        {avail === "loading" && <Loader2 className="w-3 h-3 animate-spin" />}
                        {avail === "error" ? "Mídia indisponível" : avail === "loading" ? "Carregando mídia" : "Mídia disponível"}
                      </span>
                    </span>
                    <span className="col-span-1 text-right font-mono text-muted-foreground">
                      {take.durationSeconds ? `${Number(take.durationSeconds).toFixed(1)}s` : "-"}
                    </span>
                    <div className="col-span-2 flex items-center justify-end gap-1.5">
                      <button
                        disabled={isLoading}
                        onClick={() => onPlayTake(take)}
                        className={cn(
                          "w-7 h-7 rounded-md flex items-center justify-center transition-all",
                          isPreviewActive && !recordingsPlayerOpenId
                            ? "bg-primary/20 text-primary hover:bg-primary/30"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                          isLoading && "opacity-50 cursor-not-allowed"
                        )}
                        title={isPreviewActive ? "Pausar" : "Tocar"}
                      >
                        {isLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : isPreviewActive && isPlayerOpen ? (
                          <Pause className="w-3 h-3" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        disabled={isLoading}
                        onClick={() => onDownloadTake(take)}
                        className="w-7 h-7 rounded-md bg-muted/70 text-foreground hover:bg-muted flex items-center justify-center"
                        title="Baixar take"
                        data-testid={`button-download-recording-${take.id}`}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {isPlayerOpen && (
                    <div className="mt-2 pl-[16.8%]">
                      <audio
                        ref={(node) => { if (rowAudioRefs.current) rowAudioRefs.current[tid] = node; }}
                        controls
                        className="w-full h-8"
                        src={recordingPlayableUrls[tid] || (getTakeStreamUrl(take) as string)}
                        preload="none"
                        onLoadedMetadata={(e) => onLoadedMetadata(tid, 1, e.currentTarget)}
                        onError={() => onAudioError(tid)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
            {scopedRecordings.length === 0 && (
              <div className="text-sm text-center py-10 text-muted-foreground">
                Nenhuma gravação encontrada
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
