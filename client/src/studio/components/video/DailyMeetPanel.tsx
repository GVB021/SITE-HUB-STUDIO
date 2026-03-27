import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Video } from "lucide-react";
import { authFetch } from "@studio/lib/auth-fetch";
import { cn } from "@studio/lib/utils";

interface DailyMeetPanelProps {
  sessionId: string;
  className?: string;
}

export function DailyMeetPanel({ sessionId, className }: DailyMeetPanelProps) {
  const [roomUrl, setRoomUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const loadDailyRoom = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await authFetch("/api/create-room", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
      });
      const url = String(data?.url || "");
      if (!url) throw new Error("Sala Daily indisponível");
      setRoomUrl(url);
    } catch (err: any) {
      setError(String(err?.message || "Falha ao conectar com Daily.co"));
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadDailyRoom();
  }, [loadDailyRoom]);

  return (
    <section className={cn("flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-black/20", className)}>
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-border/70 px-4">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Daily.co</span>
        <button
          type="button"
          onClick={loadDailyRoom}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          aria-label="Atualizar sala Daily"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="relative flex-1 min-h-0 bg-black">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
        {error && !isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/80 px-6 text-center">
            <Video className="h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{error}</span>
            <button onClick={loadDailyRoom} className="vhub-btn-xs vhub-btn-primary" type="button">
              Tentar novamente
            </button>
          </div>
        )}
        <div className="h-full w-full">
          {roomUrl ? (
            <iframe
              src={roomUrl}
              title={`Daily Room ${sessionId}`}
              className="h-full w-full border-0"
              allow="camera; microphone; fullscreen; display-capture; autoplay"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Video className="h-6 w-6" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
