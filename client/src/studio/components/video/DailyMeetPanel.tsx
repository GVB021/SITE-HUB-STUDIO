import { useEffect, useRef, useState, useCallback } from "react";
import DailyIframe from "@daily-co/daily-js";
import { PhoneOff } from "lucide-react";
import { authFetch } from "@studio/lib/auth-fetch";
import { motion, AnimatePresence } from "framer-motion";

interface DailyMeetPanelProps {
  sessionId: string;
  zIndexBase?: number;
  open?: boolean;
  onOpenChange?: (next: boolean) => void;
  mode?: "floating" | "embedded";
  onStatusChange?: (status: "conectando" | "conectado" | "desconectado") => void;
}

export function DailyMeetPanel({ sessionId, zIndexBase = 1150, open, onOpenChange, mode = "floating", onStatusChange }: DailyMeetPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [status, setStatus] = useState<"conectando" | "conectado" | "desconectado">("conectando");
  const [roomUrl, setRoomUrl] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  
  // Estados para redimensionamento
  const [isResizing, setIsResizing] = useState(false);
  const [panelHeight, setPanelHeight] = useState(400);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(400);
  
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
        // Validar container antes de prosseguir
        if (!containerRef.current) {
          console.warn("DailyMeetPanel: Container não disponível");
          return;
        }

        setStatus("conectando");
        const room = await authFetch("/api/create-room", {
          method: "POST",
          body: JSON.stringify({ sessionId }),
        });
        if (!mounted) return;
        setRoomUrl(room.url);

        // Validar container novamente antes de criar frame
        if (!containerRef.current) {
          console.warn("DailyMeetPanel: Container perdido durante setup");
          return;
        }

        const frame = DailyIframe.createFrame(containerRef.current, {
          iframeStyle: { width: "100%", height: "100%", border: "0", borderRadius: "0" },
          showLeaveButton: false,
          showFullscreenButton: true,
        });
        callRef.current = frame;

        frame.on("joined-meeting", () => { setStatus("conectado"); onStatusChange?.("conectado"); });
        frame.on("left-meeting", () => { setStatus("desconectado"); onStatusChange?.("desconectado"); });
        frame.on("error", (ev: any) => {
          console.error("DailyMeetPanel error:", ev);
          setStatus("desconectado"); onStatusChange?.("desconectado");
          setErrorMsg(ev?.errorMsg || "Falha na conexão Daily");
          if (reconnectTimeoutRef.current) window.clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = window.setTimeout(() => {
            if (callRef.current && roomUrl) {
              callRef.current.join({ url: roomUrl }).catch((err: any) => {
                console.error("DailyMeetPanel reconnect error:", err);
              });
            }
          }, 2000);
        });

        // Adicionar validação antes do join
        if (!frame || !room.url) {
          throw new Error("Frame ou URL da sala não disponível");
        }

        await frame.join({ url: room.url });
      } catch (err: any) {
        console.error("DailyMeetPanel setup error:", err);
        if (!mounted) return;
        setStatus("desconectado");
        setErrorMsg(String(err?.message || err));
      }
    };

    // Adicionar delay para garantir que o container esteja no DOM
    const timeoutId = setTimeout(setupDaily, 100);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      if (reconnectTimeoutRef.current) window.clearTimeout(reconnectTimeoutRef.current);
      const call = callRef.current;
      callRef.current = null;
      if (call) {
        call.leave().catch(() => {});
        call.destroy().catch(() => {});
      }
    };
  }, [sessionId]);

  // Handlers de redimensionamento
  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartY(clientY);
    setStartHeight(panelHeight);
  };

  const handleResizeMove = useCallback((e: MouseEvent | globalThis.TouchEvent) => {
    if (!isResizing) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - startY;
    const newHeight = Math.max(200, Math.min(600, startHeight - deltaY));
    setPanelHeight(newHeight);
  }, [isResizing, startY, startHeight]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Event listeners para redimensionamento
  useEffect(() => {
    if (!isResizing) return;
    
    const handleMouseMove = (e: MouseEvent) => handleResizeMove(e);
    const handleTouchMove = (e: globalThis.TouchEvent) => handleResizeMove(e);
    const handleEnd = () => handleResizeEnd();
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleEnd);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  const isMobile = viewport.width < 1024;

  const floatingSize = isMobile
    ? { width: Math.max(220, viewport.width * 0.94), height: Math.max(260, Math.min(600, panelHeight)) }
    : { width: Math.min(760, Math.round(viewport.width * 0.6)), height: Math.max(200, Math.min(600, panelHeight)) };

  return (
    <AnimatePresence>
      {(isOpen || mode === "embedded") && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={mode === "embedded" ? "w-full h-full" : "fixed bottom-0 right-0 p-4 md:p-6"}
          style={mode === "embedded" ? undefined : { 
            zIndex: zIndexBase,
            width: floatingSize.width,
            height: floatingSize.height
          }}
        >
          <motion.div
            ref={panelRef}
            className={`bg-black border border-border overflow-hidden relative ${
              mode === "embedded" ? "rounded-none w-full h-full" : "rounded-2xl shadow-xl w-full h-full"
            }`}
            data-testid="daily-meet-popup"
          >
            {/* Daily.co iframe - 100% do espaço */}
            <div className="relative w-full h-full">
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
            
            {/* Resize handle - apenas modo floating */}
            {mode !== "embedded" && (
              <div
                className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize bg-border/20 hover:bg-border/40 transition-colors z-20"
                onMouseDown={handleResizeStart}
                onTouchStart={handleResizeStart}
              >
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-1 bg-border/60 rounded-full" />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
