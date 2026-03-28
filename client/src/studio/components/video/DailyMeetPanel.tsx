import { useEffect, useRef, useState, useCallback, type TouchEvent } from "react";
import DailyIframe from "@daily-co/daily-js";
import { Video, VideoOff, Mic, MicOff, PhoneOff, RefreshCw, ChevronUp, ChevronDown } from "lucide-react";
import { authFetch } from "@studio/lib/auth-fetch";
import { motion, AnimatePresence } from "framer-motion";

interface DailyMeetPanelProps {
  sessionId: string;
  zIndexBase?: number;
  open?: boolean;
  onOpenChange?: (next: boolean) => void;
  mode?: "floating" | "embedded";
}

export function DailyMeetPanel({ sessionId, zIndexBase = 1150, open, onOpenChange, mode = "floating" }: DailyMeetPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchLastYRef = useRef<number | null>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [status, setStatus] = useState<"conectando" | "conectado" | "desconectado">("conectando");
  const [roomUrl, setRoomUrl] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const isOpen = open ?? internalOpen;

  // 🔥 AUTO-RESIZE RESPONSIVE
  const updateViewport = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    setViewport({ 
      width: rect.width, 
      height: rect.height 
    });
  }, []);

  useEffect(() => {
    updateViewport();
    const resizeObserver = new ResizeObserver(updateViewport);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [updateViewport]);

  // 🔥 CUSTOM STYLING FOR DAILY.IFRAME
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .daily-co-iframe {
        border: none !important;
        background: transparent !important;
        border-radius: 8px !important;
      }
      .daily-co-container {
        background: transparent !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const setOpen = (next: boolean) => {
    if (onOpenChange) onOpenChange(next);
    else setInternalOpen(next);
  };

  useEffect(() => {
    const syncViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  useEffect(() => {
    let mounted = true;
    const setupDaily = async () => {
      try {
        setStatus("conectando");
        const room = await authFetch("/api/create-room", {
          method: "POST",
          body: JSON.stringify({ sessionId }),
        });
        if (!mounted) return;
        setRoomUrl(room.url);

        const frame = DailyIframe.createFrame(containerRef.current!, {
          iframeStyle: { width: "100%", height: "100%", border: "0", borderRadius: "0" },
          showLeaveButton: false,
          showFullscreenButton: true,
        });
        callRef.current = frame;

        frame.on("joined-meeting", () => setStatus("conectado"));
        frame.on("left-meeting", () => setStatus("desconectado"));
        frame.on("error", (ev: any) => {
          setStatus("desconectado");
          setErrorMsg(ev?.errorMsg || "Falha na conexão Daily");
          if (reconnectTimeoutRef.current) window.clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = window.setTimeout(() => {
            frame.join({ url: room.url }).catch(() => {});
          }, 2000);
        });

        await frame.join({ url: room.url });
      } catch (err: any) {
        if (!mounted) return;
        setStatus("desconectado");
        setErrorMsg(String(err?.message || err));
      }
    };

    setupDaily();
    return () => {
      mounted = false;
      if (reconnectTimeoutRef.current) window.clearTimeout(reconnectTimeoutRef.current);
      const call = callRef.current;
      callRef.current = null;
      if (call) {
        call.leave().catch(() => {});
        call.destroy().catch(() => {});
      }
    };
  }, [sessionId]);

  useEffect(() => {
    const call = callRef.current;
    if (!call) return;
    if (isMinimized) {
      call.setLocalVideo(false).catch(() => {});
      return;
    }
    if (!isVideoOff) {
      call.setLocalVideo(true).catch(() => {});
    }
  }, [isMinimized, isVideoOff]);

  const isMobile = viewport.width < 1024;

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const y = event.touches[0]?.clientY;
    if (typeof y !== "number") return;
    touchStartYRef.current = y;
    touchLastYRef.current = y;
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const y = event.touches[0]?.clientY;
    if (typeof y !== "number") return;
    touchLastYRef.current = y;
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    const start = touchStartYRef.current;
    const end = touchLastYRef.current;
    touchStartYRef.current = null;
    touchLastYRef.current = null;
    if (typeof start !== "number" || typeof end !== "number") return;
    const delta = end - start;
    if (delta > 35) setIsMinimized(true);
    if (delta < -35) setIsMinimized(false);
  };

  const floatingSize = isMobile
    ? { width: Math.max(220, viewport.width * 0.94), height: isMinimized ? 48 : Math.max(260, viewport.height * 0.3) }
    : { width: isMinimized ? 360 : Math.min(760, Math.round(viewport.width * 0.6)), height: isMinimized ? 48 : 400 };

  return (
    <AnimatePresence>
      {(isOpen || mode === "embedded") && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={mode === "embedded" ? "w-full h-full flex flex-col" : "fixed bottom-0 right-0 p-4 md:p-6"}
          style={mode === "embedded" ? undefined : { zIndex: zIndexBase }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <motion.div
            ref={panelRef}
            layout
            initial={false}
            animate={
              mode === "embedded"
                ? { width: "100%", height: "100%" }
                : { width: floatingSize.width, height: floatingSize.height }
            }
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`bg-card border border-border flex flex-col overflow-hidden ${mode === "embedded" ? "rounded-none h-full" : "rounded-2xl shadow-xl"}`}
            data-testid="daily-meet-popup"
          >
            {/* Minimal header bar */}
            <div className="h-10 px-3 border-b border-border/60 flex items-center justify-between bg-muted/30 shrink-0">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  status === "conectado" ? "bg-emerald-500" : status === "conectando" ? "bg-amber-500 animate-pulse" : "bg-red-500"
                }`} />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Voice & Video
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { const c = callRef.current; if (c) { c.setLocalAudio(isMuted).catch(() => {}); setIsMuted(p => !p); } }}
                  className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isMuted ? "text-red-500 bg-red-500/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}
                  title={isMuted ? "Ligar microfone" : "Desligar microfone"}
                >
                  {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { const c = callRef.current; if (c) { c.setLocalVideo(isVideoOff).catch(() => {}); setIsVideoOff(p => !p); } }}
                  className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isVideoOff ? "text-red-500 bg-red-500/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}
                  title={isVideoOff ? "Ligar câmera" : "Desligar câmera"}
                >
                  {isVideoOff ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { const c = callRef.current; if (c && roomUrl) c.join({ url: roomUrl }).catch(() => {}); }}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  title="Reconectar"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsMinimized(v => !v)}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  title={isMinimized ? "Expandir" : "Minimizar"}
                >
                  {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {mode !== "embedded" && (
                  <button
                    onClick={() => setOpen(false)}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Sair da chamada"
                  >
                    <PhoneOff className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Daily.co iframe fills all remaining space */}
            {!isMinimized && (
              <div className="relative flex-1 min-h-0 bg-black">
                <div ref={containerRef} className="absolute inset-0" />
                {errorMsg && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm p-6 text-center z-10">
                    <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center text-red-500 mb-3">
                      <PhoneOff className="w-5 h-5" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium mb-3">{errorMsg}</p>
                    <button
                      onClick={() => { const c = callRef.current; if (c && roomUrl) c.join({ url: roomUrl }).catch(() => {}); }}
                      className="text-xs bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-md transition-colors border border-border"
                    >
                      Tentar novamente
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
