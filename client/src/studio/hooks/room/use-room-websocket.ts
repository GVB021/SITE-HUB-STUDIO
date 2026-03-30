import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@studio/hooks/use-toast";
import { type ScriptLineOverride } from "./types";

export function useRoomWebSocket(
  studioId: string | undefined,
  sessionId: string | undefined,
  userId: string | undefined,
  callbacks?: {
    onSyncVideo?: (currentTime: number, isPlaying: boolean) => void;
    onVideoPlay?: (currentTime?: number) => void;
    onVideoPause?: (currentTime?: number) => void;
    onSeek?: (currentTime: number) => void;
    onCountdown?: (count: number) => void;
    onLoopPreparing?: (delayMs: number) => void;
    onLoopSilenceWindow?: (delayMs: number) => void;
    onSyncLoop?: (loopRange?: { start: number; end: number }) => void;
    onUpdateLine?: (lineIndex: number, patch: ScriptLineOverride, history?: any) => void;
    onTakeReadyForReview?: (take: any) => void;
    onTakeDecision?: (takeId: string, decision: string) => void;
    onTakeStatus?: (targetUserId: string, status: string) => void;
  }
) {
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  
  const [wsConnected, setWsConnected] = useState(false);
  const [roomUsers, setRoomUsers] = useState<any[]>([]);
  const [presenceUsers, setPresenceUsers] = useState<any[]>([]);
  const [clientAcks, setClientAcks] = useState<Record<string, any>>({});
  const [lockedLines, setLockedLines] = useState<Record<number, any>>({});
  const [liveDrafts, setLiveDrafts] = useState<Record<number, string>>({});
  const [textControllerUserIds, setTextControllerUserIds] = useState<Set<string>>(new Set());

  const emitVideoEvent = useCallback((type: string, data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: `video:${type}`, ...data }));
    }
  }, []);

  const emitTextControlEvent = useCallback((type: string, data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, ...data }));
    }
  }, []);

  useEffect(() => {
    if (!sessionId || !studioId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const ws = new WebSocket(`${protocol}//${host}/ws/video-sync?studioId=${encodeURIComponent(studioId)}&sessionId=${encodeURIComponent(sessionId)}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log("[WS] Recebido:", msg);
        
        if (msg.type === "presence-sync") {
          setRoomUsers(msg.users || []);
        } else if (msg.type === "video:sync" && callbacks?.onSyncVideo) {
          callbacks.onSyncVideo(msg.currentTime, msg.isPlaying);
        } else if (msg.type === "video:play" && callbacks?.onVideoPlay) {
          callbacks.onVideoPlay(msg.currentTime);
          emitVideoEvent("ack", { command: "play", userId });
        } else if (msg.type === "video:pause" && callbacks?.onVideoPause) {
          callbacks.onVideoPause(msg.currentTime);
          emitVideoEvent("ack", { command: "pause", userId });
        } else if (msg.type === "video:ack") {
          if (msg.userId) {
            setClientAcks(prev => ({
              ...prev,
              [msg.userId!]: { lastAck: Date.now(), command: msg.command || "unknown" }
            }));
          }
        } else if (msg.type === "text:lock-line") {
          if (typeof msg.lineIndex === "number" && msg.userId) {
            setLockedLines(prev => ({
              ...prev,
              [msg.lineIndex!]: { userId: msg.userId!, at: Date.now() }
            }));
          }
        } else if (msg.type === "text:unlock-line") {
          if (typeof msg.lineIndex === "number") {
            setLockedLines(prev => {
              const next = { ...prev };
              delete next[msg.lineIndex!];
              return next;
            });
          }
        } else if (msg.type === "text:live-change") {
          if (typeof msg.lineIndex === "number" && typeof msg.text === "string") {
            setLiveDrafts(prev => ({
              ...prev,
              [msg.lineIndex!]: msg.text!
            }));
          }
        } else if (msg.type === "video:seek" && callbacks?.onSeek) {
          if (typeof msg.currentTime === "number") {
            callbacks.onSeek(msg.currentTime);
          }
        } else if ((msg.type === "video:countdown" || msg.type === "video:countdown-start" || msg.type === "video:countdown-tick") && callbacks?.onCountdown) {
          callbacks.onCountdown(msg.count);
        } else if (msg.type === "video:loop-preparing" && callbacks?.onLoopPreparing) {
          callbacks.onLoopPreparing(Number(msg.delayMs || 3000));
        } else if (msg.type === "video:loop-silence-window" && callbacks?.onLoopSilenceWindow) {
          callbacks.onLoopSilenceWindow(Number(msg.delayMs || 3000));
        } else if (msg.type === "video:sync-loop" && callbacks?.onSyncLoop) {
          if (msg.loopRange && typeof msg.loopRange.start === "number" && typeof msg.loopRange.end === "number") {
            callbacks.onSyncLoop({ start: msg.loopRange.start, end: msg.loopRange.end });
          } else {
            callbacks.onSyncLoop(undefined);
          }
        } else if (msg.type === "text-control:update-line" && callbacks?.onUpdateLine) {
          const patch: ScriptLineOverride = {};
          if (typeof msg.text === "string") patch.text = msg.text;
          if (typeof msg.character === "string") patch.character = msg.character;
          if (typeof msg.start === "number" && Number.isFinite(msg.start)) patch.start = msg.start;
          callbacks.onUpdateLine(msg.lineIndex, patch, msg.history);
        } else if (msg.type === "text-control:set-controllers" || msg.type === "text-control:state") {
          const ids = Array.isArray(msg.targetUserIds) ? msg.targetUserIds : msg.controllerUserIds;
          setTextControllerUserIds(new Set(Array.from(new Set(ids || []))));
        } else if (msg.type === "presence:update" || msg.type === "presence-sync") {
          setPresenceUsers(msg.users);
        } else if (msg.type === "video:take-ready-for-review" && callbacks?.onTakeReadyForReview) {
          callbacks.onTakeReadyForReview(msg);
        } else if (msg.type === "video:take-decision" && callbacks?.onTakeDecision) {
          callbacks.onTakeDecision(msg.takeId, msg.decision);
        } else if (msg.type === "video:take-status" && callbacks?.onTakeStatus) {
          callbacks.onTakeStatus(msg.targetUserId, msg.status);
        }
      } catch (err) {
        console.error("Failed to parse WS message", err);
      }
    };

    ws.onopen = () => {
      console.log("[Room] WebSocket connected");
      setWsConnected(true);
    };

    ws.onclose = () => {
      console.log("[Room] WebSocket disconnected");
      setWsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [sessionId, studioId, userId, emitVideoEvent, callbacks]);

  return {
    wsConnected,
    roomUsers,
    presenceUsers,
    clientAcks,
    lockedLines,
    liveDrafts,
    textControllerUserIds,
    emitVideoEvent,
    emitTextControlEvent,
  };
}
