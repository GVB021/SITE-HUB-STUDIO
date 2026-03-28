import { useParams, Link, useLocation } from "wouter";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { authFetch } from "@studio/lib/auth-fetch";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Settings,
  Monitor,
  User,
  Edit3,
  ListMusic,
  Video,
} from "lucide-react";
import { HardwareSetupDialog } from "@studio/components/hardware/HardwareSetupDialog";
import { useHardwareControl } from "@studio/hooks/use-hardware-control";
import {
  useSessionData,
  useProductionScript,
  useCharactersList,
  useTakesList,
  useRecordingsList,
} from "@studio/hooks/room";
import { useStudioRole } from "@studio/hooks/use-studio-role";
import SessionBlockedScreen from "@studio/pages/admin/components/SessionBlockedScreen";
import { useToast } from "@studio/hooks/use-toast";
import { useAuth } from "@studio/hooks/use-auth";
import {
  requestMicrophone,
  releaseMicrophone,
  setGain,
  getEstimatedInputLatencyMs,
  type MicrophoneState,
  type VoiceCaptureMode,
} from "@studio/lib/audio/microphoneManager";

export type { MicrophoneState, VoiceCaptureMode };
import {
  startCapture,
  stopCapture,
  playCountdownBeep,
} from "@studio/lib/audio/recordingEngine";
import {
  encodeWav,
  wavToBlob,
} from "@studio/lib/audio/wavEncoder";
import { analyzeTakeQuality } from "@studio/lib/audio/qualityAnalysis";
import { DeviceSettingsPanel } from "@studio/components/audio/DeviceSettingsPanel";
import { cn } from "@studio/lib/utils";
import {
  parseTimecode,
  formatTimecodeByFormat,
  parseUniversalTimecodeToSeconds,
} from "@studio/lib/timecode";
import {
  buildScrollAnchors,
  interpolateScrollTop,
  computeAdaptiveMaxSpeedPxPerSec,
  smoothScrollStep,
} from "@studio/lib/script-scroll-sync";
import { DailyMeetPanel } from "@studio/components/video/DailyMeetPanel";
import { VideoPlayer } from "@studio/components/room/video/VideoPlayer";
import { DirectorReview, ShortcutsDialog, DiscardTakeModal, TextControlPopup } from "@studio/components/room/modals";
import { RoomHeader } from "@studio/components/room/header/RoomHeader";
import { RoomHeaderActions } from "@studio/components/room/header/RoomHeaderActions";
import { MobileMenu, MobileScriptDrawer, MobileFooterControls } from "@studio/components/room/mobile";
import { DesktopScriptColumn, ScriptLineRow } from "@studio/components/room/script";
import { DesktopControlsBar } from "@studio/components/room/controls";
import { CountdownOverlay, DirectorConsole, DirectorEntryModal } from "@studio/components/room/overlays";
import { RecordingsPanel } from "@studio/components/room/recordings";
import { RecordingProfilePanel } from "@studio/components/room/profile";
import {
  DEFAULT_SHORTCUTS,
  SHORTCUT_LABELS,
  UI_LAYER_BASE,
  keyLabel,
  normalizeRoomRole,
  resolveUiRole,
  hasUiPermission,
  canReceiveTextControl,
} from "@studio/lib/room-utils";

export interface ScriptLine {
  character: string;
  start: number;
  end: number;
  text: string;
}

type ScriptLineOverride = {
  character?: string;
  text?: string;
  start?: number;
};

export type RecordingStatus =
  | "idle"
  | "countdown"
  | "recording"
  | "stopped"
  | "recorded"
  | "previewing";

export interface RecordingResult {
  samples: Float32Array;
  durationSeconds: number;
  sampleRate: number;
}

export interface QualityMetrics {
  score: number;
  clipping: boolean;
  loudness: number;
  noiseFloor: number;
}

export interface DeviceSettings {
  inputDeviceId: string;
  outputDeviceId: string;
  inputGain: number;
  monitorVolume: number;
  voiceCaptureMode: VoiceCaptureMode;
}

export interface Shortcuts {
  playPause: string;
  record: string;
  stop: string;
  back: string;
  forward: string;
  loop: string;
}

export interface ScrollAnchor {
  time: number;
  scrollTop: number;
}

export type RecordingAvailabilityState = "available" | "loading" | "error";

export interface RecordingProfile {
  actorName: string;
  characterId: string;
  characterName: string;
  voiceActorId: string;
  voiceActorName: string;
}

export default function RecordingRoom() {
  const { studioId, sessionId } = useParams<{ studioId: string; sessionId: string }>();
  const { role: studioRole, isDirector } = useStudioRole(studioId || "");
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [directorControlConfirmed, setDirectorControlConfirmed] = useState(false);
  const [hardwareDialogOpen, setHardwareDialogOpen] = useState(false);
  
  const {
    requestMicrophoneAccess,
    hasPermission,
  } = useHardwareControl(sessionId || "");
  
  // Se for diretor, só libera quando confirmar. Se não for, libera direto.
  const isControlBlocked = isDirector && !directorControlConfirmed;

  // Recordings pagination and filtering
  const [recordingsPage, setRecordingsPage] = useState(1);
  const [recordingsSearch, setRecordingsSearch] = useState("");
  const [recordingsScope, setRecordingsScope] = useState<"all" | "mine">("mine");
  const [recordingsDateFrom, setRecordingsDateFrom] = useState("");
  const [recordingsDateTo, setRecordingsDateTo] = useState("");
  const [recordingsSortBy, setRecordingsSortBy] = useState<"createdAt" | "durationSeconds" | "lineIndex" | "characterName">("createdAt");
  const [recordingsSortDir, setRecordingsSortDir] = useState<"asc" | "desc">("desc");

  // Modal state
  const [discardModalTake, setDiscardModalTake] = useState<any>(null);
  const [discardFinalStep, setDiscardFinalStep] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const desktopVideoTextContainerRef = useRef<HTMLDivElement>(null);
  const scriptViewportRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const scrollAnchorsRef = useRef<ScrollAnchor[]>([]);
  const scrollSyncRafRef = useRef<number | null>(null);
  const scrollSyncLastTsRef = useRef<number | null>(null);
  const scrollSyncCurrentRef = useRef<number>(0);
  const scrollSyncLastVideoTimeRef = useRef<number>(0);
  const loopSilenceTimeoutRef = useRef<number | null>(null);
  const loopSilenceLockRef = useRef<boolean>(false);
  const previewAudioRef = useRef<HTMLAudioElement>(null);
  const recordingsPreviewAudioRef = useRef<HTMLAudioElement>(null);
  const recordingRowAudioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const controlsTimeoutRef = useRef<number | null>(null);
  const cachedRecordingBlobUrlsRef = useRef<Record<string, string>>({});

  // Additional state
  const [recordingsPreviewId, setRecordingsPreviewId] = useState<string | null>(null);
  const [recordingsPlaybackRate, setRecordingsPlaybackRate] = useState(1.0);
  const [desktopVideoTextSplit, setDesktopVideoTextSplit] = useState(60);
  const [isDraggingVideoTextSplit, setIsDraggingVideoTextSplit] = useState(false);
  const [sideScriptWidth, setSideScriptWidth] = useState(320);
  const [isDraggingSideScript, setIsDraggingSideScript] = useState(false);
  const [optimisticRemovingTakeIds, setOptimisticRemovingTakeIds] = useState<Set<string>>(new Set());
  const [recordingAvailability, setRecordingAvailability] = useState<Record<string, RecordingAvailabilityState>>({});
  const [recordingPlayableUrls, setRecordingPlayableUrls] = useState<Record<string, string>>({});

  // WebSocket state
  const [roomUsers, setRoomUsers] = useState<any[]>([]);
  const [presenceUsers, setPresenceUsers] = useState<any[]>([]);
  const [lockedLines, setLockedLines] = useState<Record<number, any>>({});
  const [liveDrafts, setLiveDrafts] = useState<Record<number, string>>({});
  const queryClient = useQueryClient();
  const [lastUploadedTakeId, setLastUploadedTakeId] = useState<string | null>(null);
  const [isWaitingReview, setIsWaitingReview] = useState(false);

  // Data fetching hooks
  const { data: session, isLoading: sessionLoading, error: sessionError } = useSessionData(studioId || "", sessionId || "");
  const { data: production, isLoading: productionLoading } = useProductionScript(studioId || "", session?.productionId);
  const { data: charactersList = [] } = useCharactersList(session?.productionId);

  // UI state
  const [isMobile, setIsMobile] = useState(false);
  const [scriptOpen, setScriptOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [textControlPopupOpen, setTextControlPopupOpen] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [deviceSettingsOpen, setDeviceSettingsOpen] = useState(false);
  const [recordingsOpen, setRecordingsOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  // Session access state
  const [sessionAccessStatus, setSessionAccessStatus] = useState<{
    canAccess: boolean;
    scheduledAt?: Date;
    minutesUntilStart?: number;
    sessionTitle?: string;
    hasSpecialAccess?: boolean;
  } | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [scriptAutoFollow, setScriptAutoFollow] = useState(() => {
    try {
      const saved = sessionStorage.getItem(`vhub_script_follow_${sessionId}`);
      return saved ? saved === "auto" : true;
    } catch {
      return true;
    }
  });

  // Script editing state
  const [lineOverrides, setLineOverrides] = useState<Record<number, ScriptLineOverride>>({});
  const [lineEditHistory, setLineEditHistory] = useState<Record<number, Array<{ field: string; before: string; after: string; by: string }>>>({});
  const [editingField, setEditingField] = useState<{ lineIndex: number; field: "character" | "text" | "timecode" } | null>(null);
  const [editingDraftValue, setEditingDraftValue] = useState("");
  const [currentLine, setCurrentLine] = useState(0);
  const [charSelectorOpen, setCharSelectorOpen] = useState(false);
  const [onlySelectedCharacter, setOnlySelectedCharacter] = useState(false);

  // Recording state
  const [recordingProfile, setRecordingProfile] = useState<RecordingProfile | null>(null);
  
  // Carregar perfil persistido ao iniciar
  useEffect(() => {
    const saved = localStorage.getItem(`recording_profile_${sessionId}`);
    if (saved) {
      try {
        setRecordingProfile(JSON.parse(saved));
      } catch (e) {
        console.warn("Failed to load saved recording profile");
      }
    }
  }, [sessionId]);
  const [micReady, setMicReady] = useState(false);
  const [micInitializing, setMicInitializing] = useState(false);
  const [micState, setMicState] = useState<any>(null);
  const [recordingStatus, setRecordingStatus] = useState<"idle" | "countdown" | "recording" | "stopped" | "recorded">("idle");
  const [countdownValue, setCountdownValue] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingTake, setPendingTake] = useState<any>(null);
  const [reviewingTake, setReviewingTake] = useState<any>(null);
  const [recordingsIsLoading, setRecordingsIsLoading] = useState<Set<string>>(new Set());
  const loopPreparationTimeoutRef = useRef<any>(null);
  const countdownTimerRef = useRef<any>(null);
  const [loopAnchorIndex, setLoopAnchorIndex] = useState<number | null>(null);
  const [textControllerUserIds, setTextControllerUserIds] = useState<Set<string>>(new Set());
  const [recordingsPlayerOpenId, setRecordingsPlayerOpenId] = useState<string | null>(null);

  // Loop state
  const [isLooping, setIsLooping] = useState(false);
  const [customLoop, setCustomLoop] = useState<{ start: number; end: number } | null>(null);
  const [loopSelectionMode, setLoopSelectionMode] = useState<"idle" | "selecting-start" | "selecting-end">("idle");
  const [loopPreparing, setLoopPreparing] = useState(false);
  const [loopSilenceActive, setLoopSilenceActive] = useState(false);

  // Device settings
  const [deviceSettings, setDeviceSettings] = useState<DeviceSettings>({
    voiceCaptureMode: "high-fidelity",
    inputDeviceId: "default",
    inputGain: 1.0,
    outputDeviceId: "default",
    monitorVolume: 1.0,
  });
  const [dailyMeetOpen, setDailyMeetOpen] = useState(false);
  const [loopRangeMeta, setLoopRangeMeta] = useState<{ startIndex: number; endIndex: number } | null>(null);

  // Shortcuts
  const [shortcuts, setShortcuts] = useState<Shortcuts>(() => {
    try {
      const saved = localStorage.getItem("vhub_shortcuts");
      return saved ? { ...DEFAULT_SHORTCUTS, ...JSON.parse(saved) } : DEFAULT_SHORTCUTS;
    } catch {
      return DEFAULT_SHORTCUTS;
    }
  });
  const [pendingShortcuts, setPendingShortcuts] = useState<Shortcuts>(shortcuts);
  const [listeningFor, setListeningFor] = useState<keyof Shortcuts | null>(null);

  const logAudioStep = useCallback((step: string, payload?: Record<string, unknown>) => {
    console.info(`[AudioPipeline][Room] ${step}`, payload || {});
  }, []);

  const logFeatureAudit = useCallback((feature: string, action: string, details?: Record<string, unknown>) => {
    console.info(`[Audit][${feature}] ${action}`, details || {});
  }, []);

  // Permission calculations - moved here to be used in useEffect
  const uiRole = resolveUiRole(studioRole, textControllerUserIds.has(String(user?.id ?? "")));
  const canTextControl = hasUiPermission(uiRole, "text_control");
  console.log("[Room] uiRole debug:", { studioRole, myId: user?.id, controllers: Array.from(textControllerUserIds), uiRole, canTextControl });
  const canManageAudio = hasUiPermission(uiRole, "audio_control");
  const canApproveTake = hasUiPermission(uiRole, "approve_take");
  const canViewOnlineUsers = hasUiPermission(uiRole, "presence_view");
  // Only director or text_controller (dubber with text released) can control video
  const canControlVideo = isDirector || uiRole === "text_controller";

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // WebSocket ref
  const wsRef = useRef<WebSocket | null>(null);
  const wsIntentionalClose = useRef(false);
  const wsReconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wsReconnectAttempts = useRef(0);
  const [wsConnected, setWsConnected] = useState(false);

  // Session access verification
  const checkSessionAccess = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const response = await authFetch(`/api/sessions/${sessionId}/status`);
      if (!response.canAccess) {
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const scheduledAt = new Date(response.scheduledAt);
        
        // Converter para o fuso horário do usuário
        const localScheduledAt = new Date(scheduledAt.toLocaleString("en-US", { timeZone: userTimezone }));
        
        setSessionAccessStatus({
          canAccess: false,
          scheduledAt: localScheduledAt,
          minutesUntilStart: response.minutesUntilStart,
          sessionTitle: response.sessionTitle,
          hasSpecialAccess: response.hasSpecialAccess
        });
      } else {
        setSessionAccessStatus({ canAccess: true });
      }
    } catch (err) {
      console.error('Erro ao verificar acesso à sessão:', err);
      // Se der erro, permitir acesso (fallback)
      setSessionAccessStatus({ canAccess: true });
    }
  }, [sessionId]);

  // Check session access on mount and periodically
  useEffect(() => {
    if (!sessionId) return;
    
    checkSessionAccess();
    
    // Verificar a cada 30 segundos se estiver bloqueado
    const interval = setInterval(() => {
      if (sessionAccessStatus?.canAccess === false) {
        checkSessionAccess();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [sessionId, checkSessionAccess, sessionAccessStatus?.canAccess]);

  useEffect(() => {
    const initializeHardware = async () => {
      setMicInitializing(true);
      
      // Aguardar um pouco para garantir que o componente está montado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        await requestMicrophoneAccess();
        const nextMicState = await requestMicrophone(deviceSettings.voiceCaptureMode, deviceSettings.inputDeviceId === "default" ? undefined : deviceSettings.inputDeviceId);
        setMicState(nextMicState);
        setGain(nextMicState, deviceSettings.inputGain);
        setMicReady(true);
        
        // Mostrar dialog de configuração na primeira vez
        const hasConfigured = localStorage.getItem(`hardware_configured_${sessionId}`);
        if (!hasConfigured && hasPermission) {
          setHardwareDialogOpen(true);
          localStorage.setItem(`hardware_configured_${sessionId}`, "true");
        }
      } catch (error) {
        console.error("Falha ao inicializar hardware:", error);
        setMicState(null);
        setMicReady(false);
        toast({ title: "Configuração de Hardware", description: "Configure seu microfone para melhor experiência.", variant: "default" });
      } finally {
        setMicInitializing(false);
      }
    };

    if (sessionId && user) {
      initializeHardware();
    }
    return () => {
      releaseMicrophone();
      setMicState(null);
      setMicReady(false);
    };
  }, [sessionId, user, requestMicrophoneAccess, hasPermission, toast, deviceSettings.voiceCaptureMode, deviceSettings.inputDeviceId, deviceSettings.inputGain]);
  const emitVideoEvent = useCallback((type: string, data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: `video:${type}`, ...data }));
    }
  }, []);

  const emitTextControlEvent = useCallback((type: string, data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, ...data }));
    }
  }, [presenceUsers]);

  const handleCharacterChange = useCallback((character: any) => {
    const updated = { 
      ...recordingProfile, 
      characterId: character.id, 
      characterName: character.name,
      actorName: recordingProfile?.actorName || user?.displayName || user?.fullName || 'Ator',
      voiceActorId: user?.id || '',
      voiceActorName: user?.displayName || user?.fullName || 'Ator'
    };
    setRecordingProfile(updated);
    localStorage.setItem(`recording_profile_${sessionId}`, JSON.stringify(updated));
    // Sincronizar via WebSocket
    emitVideoEvent("character-selected", { characterId: character.id, userId: user?.id });
    logAudioStep("character-selected", { characterId: character.id, characterName: character.name });
  }, [recordingProfile, sessionId, user?.id, emitVideoEvent, logAudioStep]);

  const applyScriptLinePatch = useCallback((lineIndex: number, patch: ScriptLineOverride) => {
    if (!Number.isInteger(lineIndex) || lineIndex < 0) return;
    setLineOverrides((prev) => {
      const current = prev[lineIndex] || {};
      return {
        ...prev,
        [lineIndex]: { ...current, ...patch },
      };
    });
  }, []);

  const pushEditHistory = useCallback((lineIndex: number, field: "character" | "text" | "timecode", before: string, after: string, by: string) => {
    if (before === after) return;
    const entry = {
      id: `${lineIndex}_${field}_${Date.now()}`,
      field,
      before,
      after,
      at: new Date().toISOString(),
      by,
    };
    setLineEditHistory((prev) => {
      const list = prev[lineIndex] || [];
      return {
        ...prev,
        [lineIndex]: [entry, ...list].slice(0, 25),
      };
    });
  }, []);

  // WebSocket connection
  useEffect(() => {
    if (!sessionId || !studioId) return;
    wsIntentionalClose.current = false;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const ws = new WebSocket(`${protocol}//${host}/ws/video-sync?studioId=${encodeURIComponent(studioId)}&sessionId=${encodeURIComponent(sessionId)}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          console.log("[Room] WS message received:", msg.type, msg);
          if (msg.type === "text-control:state" || msg.type === "text-control:set-controllers") {
            console.log("[Room] Text control update before state change:", { currentControllers: Array.from(textControllerUserIds), myId: user?.id });
          }
          if (msg.type === "video:sync") {
          const video = videoRef.current;
          if (video) {
            const diff = Math.abs(video.currentTime - msg.currentTime);
            if (diff > 0.3) video.currentTime = msg.currentTime;
            if (msg.isPlaying && video.paused) video.play().catch(() => {});
            else if (!msg.isPlaying && !video.paused) video.pause();
          }
        } else if (msg.type === "video:play") {
          const video = videoRef.current;
          if (video) {
            if (typeof msg.currentTime === "number" && Number.isFinite(msg.currentTime)) {
              const drift = Math.abs(video.currentTime - msg.currentTime);
              if (drift > 0.12) {
                video.currentTime = msg.currentTime;
              }
            }
            if (video.paused) {
              video.play().catch((e) => console.error("[WS] Erro ao dar play:", e));
            } else {
            }
            // Enviar ACK de confirmação
            emitVideoEvent("ack", { command: "play", userId: user?.id });
          } else {
            console.warn("[WS] Elemento de vídeo não encontrado!");
          }
        } else if (msg.type === "video:pause") {
          const video = videoRef.current;
          if (video) {
            if (typeof msg.currentTime === "number" && Number.isFinite(msg.currentTime)) {
              video.currentTime = msg.currentTime;
            }
            if (!video.paused) video.pause();
            // Enviar ACK de confirmação
            emitVideoEvent("ack", { command: "pause", userId: user?.id });
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
        } else if (msg.type === "video:seek") {
          if (videoRef.current && typeof msg.currentTime === "number") {
            videoRef.current.currentTime = msg.currentTime;
          }
        } else if (msg.type === "video:countdown" || msg.type === "video:countdown-start" || msg.type === "video:countdown-tick") {
          setCountdownValue(msg.count);
          if (msg.count > 0) {
            try {
              const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
              if (audioContext.state !== "closed") {
                playCountdownBeep(audioContext);
              }
            } catch (error) {
              console.warn("[Room] Failed to create AudioContext for countdown beep:", error);
            }
          }
        } else if (msg.type === "video:loop-preparing") {
          setLoopPreparing(true);
          const delayMs = Number(msg.delayMs || 3000);
          window.setTimeout(() => setLoopPreparing(false), delayMs);
        } else if (msg.type === "video:loop-silence-window") {
          setLoopSilenceActive(true);
          const delayMs = Number(msg.delayMs || 3000);
          window.setTimeout(() => setLoopSilenceActive(false), delayMs);
        } else if (msg.type === "video:sync-loop") {
          if (msg.loopRange && typeof msg.loopRange.start === "number" && typeof msg.loopRange.end === "number") {
            setCustomLoop({ start: msg.loopRange.start, end: msg.loopRange.end });
            setIsLooping(true);
          } else {
            setCustomLoop(null);
            setIsLooping(false);
          }
        } else if (msg.type === "text-control:update-line") {
          const patch: ScriptLineOverride = {};
          if (typeof msg.text === "string") patch.text = msg.text;
          if (typeof msg.character === "string") patch.character = msg.character;
          if (typeof msg.start === "number" && Number.isFinite(msg.start)) patch.start = msg.start;
          applyScriptLinePatch(msg.lineIndex, patch);
          if (msg.history && typeof msg.history === "object") {
            pushEditHistory(
              msg.lineIndex,
              msg.history.field,
              String(msg.history.before ?? ""),
              String(msg.history.after ?? ""),
              String(msg.history.by || "Usuário")
            );
          }
        } else if (msg.type === "text-control:set-controllers" || msg.type === "text-control:state") {
          const ids = Array.isArray(msg.targetUserIds) ? msg.targetUserIds : msg.controllerUserIds;
          console.log("[Room] text-control state received:", { type: msg.type, ids, myId: user?.id });
          const nextSet = new Set(Array.from(new Set(ids || []))) as Set<string>;
          setTextControllerUserIds(nextSet);
          // Log immediately with the new state
          console.log("[Room] After text-control update:", { 
            controllers: Array.from(nextSet), 
            myId: user?.id,
            hasPermission: nextSet.has(String(user?.id ?? "")),
            studioRole,
            willHaveTextControl: hasUiPermission(resolveUiRole(studioRole, nextSet.has(String(user?.id ?? ""))), "text_control")
          });
        } else if (msg.type === "presence:update" || msg.type === "presence-sync") {
          setPresenceUsers(msg.users);
        } else if (msg.type === "video:take-ready-for-review") {
          // Se eu sou aprovador, recebo o take para revisar
          if (canApproveTake && msg.takeId && msg.audioUrl) {
            setReviewingTake({
              takeId: msg.takeId,
              audioUrl: msg.audioUrl,
              duration: msg.duration || 0,
              metrics: msg.metrics || {},
              lineIndex: msg.lineIndex || 0,
              userId: msg.userId || "",
              characterName: msg.character || "Desconhecido",
              startTimeSeconds: msg.start || 0,
            });
            
            toast({
              title: "Novo Take para Revisão",
              description: `${msg.character || "Desconhecido"} enviou uma gravação.`,
              action: (
                <button 
                  onClick={() => {
                    // Scroll para o popup de revisão
                    const popup = document.querySelector('[data-testid="director-review-popup"]');
                    if (popup) {
                      popup.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Revisar Agora
                </button>
              ),
              duration: 10000, // 10 segundos para dar tempo de clicar
            });
          }
        } else if (msg.type === "video:take-decision") {
          // Se a decisão for sobre um take meu
          if (msg.takeId === lastUploadedTakeId) {
            setIsWaitingReview(false);
            if (msg.decision === "approved") {
              toast({ title: "Take Aprovado!", description: "O diretor aprovou seu take.", variant: "default" });
              // Limpa estado local se ainda estiver pendente (embora upload já tenha ocorrido)
              setPendingTake(null);
              setRecordingStatus("idle");
            } else {
              toast({ title: "Take Rejeitado", description: "O diretor solicitou uma nova gravação.", variant: "destructive" });
              // Mantém o estado para regravação rápida ou limpa? Vamos limpar para forçar nova gravação
              setPendingTake(null);
              setRecordingStatus("idle");
            }
          }
          // Se eu sou o diretor que estava revisando, limpo meu estado
          if (reviewingTake?.takeId === msg.takeId) {
            setReviewingTake(null);
          }
        } else if (msg.type === "video:take-status") {
          if (String(msg.targetUserId || "") !== String(user?.id || "")) return;
          if (msg.status === "deleted") {
            toast({ title: "Um take seu foi excluído pelo diretor", variant: "destructive" });
          }
        }
      } catch (err) {
        console.error("Failed to parse WS message", err);
      }
    };

    ws.onopen = () => {
      console.log("[Room] WebSocket connected");
      setWsConnected(true);
      wsReconnectAttempts.current = 0;
    };

    ws.onclose = () => {
      setWsConnected(false);
      console.log("[Room] WebSocket disconnected");
      if (wsIntentionalClose.current) return;
      // Auto-reconnect with exponential backoff
      const attempt = wsReconnectAttempts.current;
      const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
      wsReconnectAttempts.current = attempt + 1;
      console.log(`[Room] Reconnecting in ${delay}ms (attempt ${attempt + 1})`);
      wsReconnectTimeout.current = setTimeout(() => {
        if (!wsIntentionalClose.current && sessionId && studioId) {
          const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
          const host = window.location.host;
          const newWs = new WebSocket(`${protocol}//${host}/ws/video-sync?studioId=${encodeURIComponent(studioId)}&sessionId=${encodeURIComponent(sessionId)}`);
          wsRef.current = newWs;
          newWs.onopen = ws.onopen;
          newWs.onmessage = ws.onmessage;
          newWs.onerror = ws.onerror;
          newWs.onclose = ws.onclose;
        }
      }, delay);
    };

    ws.onerror = (err) => {
      console.error("[Room] WebSocket error", err);
    };

    return () => {
      wsIntentionalClose.current = true;
      if (wsReconnectTimeout.current) clearTimeout(wsReconnectTimeout.current);
      ws.close();
    };
  }, [sessionId, studioId, micState, user?.id, toast, applyScriptLinePatch, pushEditHistory, canApproveTake, lastUploadedTakeId, reviewingTake]);

  const baseScriptLines: ScriptLine[] = useMemo(() => {
    if (!production?.scriptJson) return [];
    try {
      const parsed = JSON.parse(production.scriptJson);
      let rawLines: Array<any>;
      if (Array.isArray(parsed)) {
        rawLines = parsed;
      } else if (parsed.lines && Array.isArray(parsed.lines)) {
        rawLines = parsed.lines;
      } else {
        return [];
      }
      const toSeconds3 = (seconds: number) => Math.round(seconds * 1000) / 1000;
      const normalized = rawLines.map((line: any) => {
        const character = line.character || line.personagem || line.char || "";
        const text = line.text || line.fala || line.dialogue || line.dialog || "";
        if (typeof line.tempoEmSegundos === "number" && Number.isFinite(line.tempoEmSegundos)) {
          return { character, start: toSeconds3(line.tempoEmSegundos), text };
        }
        const rawTime = line.tempo ?? line.start ?? line.timecode ?? line.tc ?? "00:00:00";
        try {
          return { character, start: toSeconds3(parseUniversalTimecodeToSeconds(rawTime, 24)), text };
        } catch {
          return { character, start: toSeconds3(parseTimecode(rawTime)), text };
        }
      });
      const sorted = [...normalized].sort((a, b) => a.start - b.start);
      return sorted.map((line, i) => ({
        ...line,
        end: Math.max(sorted[i + 1]?.start ?? (line.start + 10), line.start + 0.001),
      }));
    } catch (e) {
      console.error("[Room] Failed to parse scriptJson:", e);
      return [];
    }
  }, [production?.scriptJson]);

  useEffect(() => {
    setLineOverrides({});
    setLineEditHistory({});
    setEditingField(null);
    setEditingDraftValue("");
  }, [production?.id, production?.scriptJson]);

  const scriptLines: ScriptLine[] = useMemo(() => {
    const merged = baseScriptLines.map((line, index) => {
      const override = lineOverrides[index];
      return {
        character: override?.character ?? line.character,
        text: override?.text ?? line.text,
        start: typeof override?.start === "number" ? override.start : line.start,
        end: line.end,
      };
    });
    return merged.map((line, index) => {
      const next = merged[index + 1];
      return {
        ...line,
        end: Math.max(next?.start ?? (line.start + 10), line.start + 0.001),
      };
    });
  }, [baseScriptLines, lineOverrides]);

  const currentScriptLine = scriptLines[currentLine];
  const formatLiveTimecode = useCallback((seconds: number) => {
    return formatTimecodeByFormat(seconds, "HH:MM:SS", 24);
  }, []);

  const displayedScriptLines = useMemo(() => {
    return scriptLines
      .map((line, originalIndex) => ({ ...line, originalIndex }))
      .filter((line) => {
        if (!onlySelectedCharacter) return true;
        const selectedCharacter = recordingProfile?.characterName?.trim().toLowerCase();
        if (!selectedCharacter) return true;
        return line.character.trim().toLowerCase() === selectedCharacter;
      });
  }, [scriptLines, onlySelectedCharacter, recordingProfile?.characterName]);

  const { data: takesList = [] } = useTakesList(sessionId);
  const {
    data: recordingsResponse,
    error: recordingsError,
    isError: hasRecordingsError,
  } = useRecordingsList(sessionId, {
    page: recordingsPage,
    pageSize: 20,
    search: recordingsSearch,
    userId: recordingsScope === "all" ? undefined : String(user?.id || ""),
    from: recordingsDateFrom || undefined,
    to: recordingsDateTo || undefined,
    sortBy: recordingsSortBy,
    sortDir: recordingsSortDir,
  });
  const recordingsList = recordingsResponse?.items || [];

  const savedTakes = useMemo(() => {
    const s = new Set<number>();
    takesList.forEach((t: any) => {
      if (t.isDone || t.isPreferred) s.add(t.lineIndex);
    });
    return s;
  }, [takesList]);
  useEffect(() => {
    if (!hasRecordingsError) return;
    toast({ title: "Falha de conexão com o banco de áudio", description: String((recordingsError as any)?.message || "Não foi possível carregar os takes"), variant: "destructive" });
  }, [hasRecordingsError, recordingsError, toast]);

  const handleDiscardTake = useCallback(async (take: any) => {
    const takeId = String(take.id);
    const rawRole = String(user?.role || "").trim().toLowerCase();
    const canDeletePermanently = rawRole === "platform_owner" || rawRole === "master";
    const takesQueryKey = ["/api/sessions", sessionId, "takes"] as const;
    const recordingsQueryKey = ["/api/sessions", sessionId, "recordings"] as const;
    const previousTakes = queryClient.getQueryData(takesQueryKey);
    setOptimisticRemovingTakeIds((prev) => { const next = new Set(prev); next.add(takeId); return next; });
    queryClient.setQueryData(takesQueryKey, (current: any) =>
      Array.isArray(current) ? current.filter((item: any) => String(item?.id || "") !== takeId) : current
    );
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 260));
      if (canDeletePermanently) {
        await authFetch(`/api/takes/${takeId}`, { method: "DELETE" });
      } else {
        await authFetch(`/api/takes/${takeId}/discard`, {
          method: "POST",
          body: JSON.stringify({ confirm: true }),
        });
      }
      await queryClient.invalidateQueries({ queryKey: takesQueryKey });
      await queryClient.invalidateQueries({ queryKey: recordingsQueryKey, exact: false });
      await logFeatureAudit("room.take", canDeletePermanently ? "deleted" : "discarded", { takeId });
      toast({ title: canDeletePermanently ? "Take excluído permanentemente" : "Take descartado" });
      setDiscardModalTake(null);
      setDiscardFinalStep(false);
    } catch (error: any) {
      queryClient.setQueryData(takesQueryKey, previousTakes);
      toast({ title: canDeletePermanently ? "Falha ao excluir take" : "Falha ao descartar take", description: error?.message || "Tente novamente", variant: "destructive" });
    } finally {
      setOptimisticRemovingTakeIds((prev) => { const next = new Set(prev); next.delete(takeId); return next; });
    }
  }, [queryClient, sessionId, toast, logFeatureAudit, user?.role]);

  useEffect(() => {
    if (!scriptAutoFollow || !scriptViewportRef.current || isPlaying === false) return;
    
    const viewport = scriptViewportRef.current;
    const scrollHeight = viewport.scrollHeight;
    const clientHeight = viewport.clientHeight;
    const maxScroll = scrollHeight - clientHeight;
    
    if (maxScroll <= 0 || videoDuration <= 0) return;

    // Teleprompter: Rolagem suave contínua baseada no tempo do vídeo e velocidade ajustável
    const scrollPos = (videoTime / videoDuration) * maxScroll;
    
    viewport.scrollTo({
      top: scrollPos,
      behavior: "smooth"
    });
  }, [videoTime, videoDuration, scriptAutoFollow, isPlaying]);

  useEffect(() => {
    const handleActivity = () => {
      setControlsVisible(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = window.setTimeout(() => {
        setControlsVisible(false);
      }, 3000) as unknown as number;
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("mousedown", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("mousedown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isDraggingVideoTextSplit || isMobile) return;
    const handlePointerMove = (event: PointerEvent) => {
      const container = desktopVideoTextContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const localY = event.clientY - rect.top;
      const next = (localY / rect.height) * 100;
      // Script height = 100 - next. Se scriptHeight <= 50%, então next >= 50%.
      // Mínimo 30% para o daily.co, logo next <= 70%.
      const constrained = Math.max(50, Math.min(70, next));
      setDesktopVideoTextSplit(constrained);
      localStorage.setItem("vhub_desktop_video_text_split", String(constrained));
    };
    const handlePointerUp = () => setIsDraggingVideoTextSplit(false);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDraggingVideoTextSplit, isMobile]);

  useEffect(() => {
    if (!isDraggingSideScript || isMobile) return;
    const handlePointerMove = (event: PointerEvent) => {
      // Limites: 15% min, 50% max da largura da tela
      const min = Math.max(300, window.innerWidth * 0.15);
      const max = window.innerWidth * 0.5;
      const nextWidth = window.innerWidth - event.clientX;
      const constrained = Math.max(min, Math.min(max, nextWidth));
      setSideScriptWidth(constrained);
      localStorage.setItem("vhub_side_script_width", String(constrained));
    };
    const handlePointerUp = () => setIsDraggingSideScript(false);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDraggingSideScript, isMobile]);

  const [scriptFontSize, setScriptFontSize] = useState(16);

  const changeScriptFontSize = useCallback((delta: number) => {
    setScriptFontSize(prev => {
      const next = prev + delta;
      const constrained = Math.max(10, Math.min(36, next));
      localStorage.setItem("vhub_script_font_size", String(constrained));
      return constrained;
    });
  }, []);

  const setScriptFontSizeExact = useCallback((size: number) => {
    setScriptFontSize(size);
    localStorage.setItem("vhub_script_font_size", String(size));
  }, []);

  const mySessionRole = useMemo(() => {
    const participantRole = session?.participants?.find((p: any) => p.userId === user?.id)?.role;
    if (participantRole) return normalizeRoomRole(participantRole);
    return normalizeRoomRole(user?.role);
  }, [session?.participants, user?.id, user?.role]);
  const isPlatformOwner = useMemo(() => {
    const rawRole = String(user?.role || "").trim().toLowerCase();
    return rawRole === "platform_owner" || rawRole === "master" || rawRole === "admin";
  }, [user?.role]);
  const canDiscardTake = isPlatformOwner;
  const canAccessDashboard = hasUiPermission(uiRole, "dashboard_access");
  const isPrivileged = canManageAudio || canTextControl;
  const scopedRecordings = useMemo(() => {
    const source = Array.isArray(recordingsList) ? recordingsList : [];
    return [...source].sort((a: any, b: any) => new Date(String(b.createdAt || 0)).getTime() - new Date(String(a.createdAt || 0)).getTime());
  }, [recordingsList]);
  useEffect(() => {
    setRecordingAvailability((prev) => {
      const next: Record<string, RecordingAvailabilityState> = {};
      scopedRecordings.forEach((take: any) => {
        const id = String(take?.id || "");
        if (!id) return;
        next[id] = prev[id] || (take?.audioUrl || take?.id ? "available" : "error");
      });
      return next;
    });
  }, [scopedRecordings]);
  useEffect(() => {
    setRecordingsPage(1);
  }, [recordingsScope, recordingsSearch, recordingsDateFrom, recordingsDateTo, recordingsSortBy, recordingsSortDir]);
  useEffect(() => {
    const currentId = String(recordingsPlayerOpenId || "");
    if (!currentId) return;
    const audio = recordingRowAudioRefs.current[currentId];
    if (!audio) return;
    audio.playbackRate = recordingsPlaybackRate;
  }, [recordingsPlayerOpenId, recordingsPlaybackRate]);
  useEffect(() => {
    return () => {
      Object.values(cachedRecordingBlobUrlsRef.current).forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      });
      cachedRecordingBlobUrlsRef.current = {};
      
      // Limpar o cache de mídia do navegador se necessário (opcional, dependendo da política de cache)
      // caches.delete("vhub_audio_takes_v1");
    };
  }, []);

  const isApproverRole = useCallback((role: string | undefined | null) => {
    if (!role) return false;
    return hasUiPermission(resolveUiRole(role, false), "approve_take");
  }, []);
  const hasApproverPresent = useMemo(() => {
    return presenceUsers.some((p: any) => isApproverRole(p?.role) && p?.userId !== user?.id);
  }, [presenceUsers, isApproverRole, user?.id]);
  const onlineRosterForCurrentRole = useMemo(() => {
    if (!canViewOnlineUsers) return [];
    const map = new Map<string, any>();
    presenceUsers.forEach((presence) => {
      if (!presence?.userId) return;
      map.set(String(presence.userId), presence);
    });
    return Array.from(map.values());
  }, [presenceUsers, canViewOnlineUsers]);
  const textControlCandidates = useMemo(() => {
    // Try to get candidates from presence users first
    let candidates = presenceUsers.length > 0 
      ? presenceUsers.filter((presence: any) => canReceiveTextControl(presence?.role))
      : [];
    
    // If no presence users, fall back to room users
    if (candidates.length === 0 && roomUsers.length > 0) {
      candidates = roomUsers.filter((user: any) => canReceiveTextControl(user?.role));
    }
    
    return candidates;
  }, [presenceUsers, roomUsers, user]);

  const mobileMenuItems = useMemo(() => [
    {
      icon: <Monitor className="w-5 h-5" />,
      iconBg: "bg-blue-500/10 text-blue-500",
      title: "Dispositivos",
      subtitle: "Configurar Áudio",
      onClick: () => { setDeviceSettingsOpen(true); setMobileMenuOpen(false); },
    },
    {
      icon: <User className="w-5 h-5" />,
      iconBg: "bg-purple-500/10 text-purple-500",
      title: "Perfil de Gravação",
      subtitle: "Ator & Personagem",
      onClick: () => { setShowProfilePanel(true); setMobileMenuOpen(false); },
    },
    {
      icon: <ListMusic className="w-5 h-5" />,
      iconBg: "bg-emerald-500/10 text-emerald-400",
      title: "Gravações",
      subtitle: "Takes da Sessão",
      onClick: () => { setRecordingsOpen(true); setMobileMenuOpen(false); },
    },
    {
      icon: <Edit3 className="w-5 h-5" />,
      iconBg: "bg-indigo-500/10 text-indigo-300",
      title: "Permitir Controle",
      subtitle: "Controle de texto e vídeo",
      onClick: () => { setTextControlPopupOpen(true); setMobileMenuOpen(false); },
      visible: canTextControl,
    },
    {
      icon: <Settings className="w-5 h-5" />,
      iconBg: "bg-amber-500/10 text-amber-300",
      title: "Atalhos do Teclado",
      subtitle: "Configurações rápidas",
      onClick: () => { setIsCustomizing(true); setMobileMenuOpen(false); },
      testId: "button-mobile-open-shortcuts",
    },
    {
      icon: <Monitor className="w-5 h-5" />,
      iconBg: "bg-sky-500/10 text-sky-300",
      title: "Painel",
      subtitle: "Voltar ao dashboard",
      onClick: () => { logFeatureAudit("room.panel", "redirect", { studioId }); setMobileMenuOpen(false); },
      href: `/hub-dub/studio/${studioId}/dashboard`,
      testId: "button-mobile-room-panel",
      visible: canAccessDashboard,
    },
    {
      icon: <Video className="w-5 h-5" />,
      iconBg: "bg-green-500/10 text-green-400",
      title: "Vídeo & Voz",
      subtitle: "Chat da equipe",
      onClick: () => { setDailyMeetOpen(true); setMobileMenuOpen(false); },
    },
  ], [canTextControl, canAccessDashboard, studioId]);

  const loopInfo = useMemo((): string | null => {
    if (!customLoop && loopSelectionMode === "idle" && !loopPreparing && !loopSilenceActive) return null;
    if (loopPreparing) return "Preparando loop... (3s)";
    if (loopSilenceActive) return "Silêncio entre loops... (3s)";
    if (loopSelectionMode === "selecting-start") return "Loop: selecione a primeira fala";
    if (loopSelectionMode === "selecting-end") return "Loop: selecione a última fala";
    if (customLoop) {
      const range = loopRangeMeta ? ` · Linhas ${loopRangeMeta.startIndex + 1}-${loopRangeMeta.endIndex + 1}` : "";
      return `Loop ativo ${formatLiveTimecode(customLoop.start)} - ${formatLiveTimecode(customLoop.end)}${range}`;
    }
    return null;
  }, [customLoop, loopSelectionMode, loopPreparing, loopSilenceActive, loopRangeMeta, formatLiveTimecode]);

  // Note: applyScriptLinePatch and pushEditHistory moved above to avoid hoisting issues

  const rebuildScrollAnchors = useCallback(() => {
    const viewport = scriptViewportRef.current;
    if (!viewport || !scriptLines.length) return;
    const lineOffsets: number[] = [];
    const lineHeights: number[] = [];
    const lineStarts: number[] = [];
    for (let i = 0; i < scriptLines.length; i++) {
      const el = lineRefs.current[i];
      if (!el) continue;
      lineOffsets.push(el.offsetTop);
      lineHeights.push(el.offsetHeight || 1);
      lineStarts.push(scriptLines[i].start);
    }
    scrollAnchorsRef.current = buildScrollAnchors({
      lineStarts,
      lineOffsets,
      lineHeights,
      viewportHeight: viewport.clientHeight,
      maxScrollTop: viewport.scrollHeight - viewport.clientHeight,
    });
    scrollSyncCurrentRef.current = viewport.scrollTop;
  }, [scriptLines]);

  useEffect(() => {
    const viewport = scriptViewportRef.current;
    if (!viewport) return;
    rebuildScrollAnchors();
    const onResize = () => rebuildScrollAnchors();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [rebuildScrollAnchors]);

  useEffect(() => {
    try {
      sessionStorage.setItem(`vhub_script_follow_${sessionId}`, scriptAutoFollow ? "auto" : "manual");
    } catch {}
  }, [scriptAutoFollow, sessionId]);

  const syncScrollToCurrentVideoTime = useCallback(() => {
    const viewport = scriptViewportRef.current;
    if (!viewport || !scrollAnchorsRef.current.length) return;
    const t = videoRef.current?.currentTime ?? 0;
    const target = interpolateScrollTop(scrollAnchorsRef.current, t);
    scrollSyncCurrentRef.current = target;
    viewport.scrollTop = target;
  }, []);

  useEffect(() => {
    const viewport = scriptViewportRef.current;
    const video = videoRef.current;
    if (!viewport || !video) return;
    if (!scriptAutoFollow) return;

    let mounted = true;
    const tick = (ts: number) => {
      if (!mounted) return;
      const dt = scrollSyncLastTsRef.current === null ? 1 / 60 : (ts - scrollSyncLastTsRef.current) / 1000;
      scrollSyncLastTsRef.current = ts;

      const currentVideoTime = video.currentTime;
      const previousVideoTime = scrollSyncLastVideoTimeRef.current;
      const seeking = Math.abs(currentVideoTime - previousVideoTime) > 0.9;
      scrollSyncLastVideoTimeRef.current = currentVideoTime;

      const target = interpolateScrollTop(scrollAnchorsRef.current, currentVideoTime);
      const maxSpeed = computeAdaptiveMaxSpeedPxPerSec({
        contentHeight: viewport.scrollHeight,
        viewportHeight: viewport.clientHeight,
        videoDuration: videoDuration || video.duration || 0,
        lineCount: scriptLines.length,
        seeking,
      });

      const next = smoothScrollStep({
        current: scrollSyncCurrentRef.current,
        target,
        dtSeconds: dt,
        maxSpeedPxPerSec: maxSpeed,
        response: video.paused ? 18 : 11,
      });
      scrollSyncCurrentRef.current = next;
      viewport.scrollTop = next;
      scrollSyncRafRef.current = window.requestAnimationFrame(tick);
    };

    scrollSyncRafRef.current = window.requestAnimationFrame(tick);
    return () => {
      mounted = false;
      if (scrollSyncRafRef.current !== null) window.cancelAnimationFrame(scrollSyncRafRef.current);
      scrollSyncRafRef.current = null;
      scrollSyncLastTsRef.current = null;
    };
  }, [scriptAutoFollow, scriptLines.length, videoDuration]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      const time = video.currentTime;
      setVideoTime(time);

      const lineIndex = scriptLines.findIndex((l, i) => {
        const nextStart = scriptLines[i + 1]?.start ?? Infinity;
        return time >= l.start && time < nextStart;
      });

      if (lineIndex !== -1 && lineIndex !== currentLine) {
        setCurrentLine(lineIndex);
      }

      if (isLooping && customLoop && !loopPreparing && !loopSilenceLockRef.current) {
        const range = { start: Math.max(0, customLoop.start), end: Math.max(customLoop.start, customLoop.end) };
        if (time >= range.end) {
          loopSilenceLockRef.current = true;
          setLoopSilenceActive(true);
          video.pause();
          emitVideoEvent("pause", { currentTime: video.currentTime });
          emitVideoEvent("loop-silence-window", { start: range.start, end: range.end, delayMs: 3000 });
          if (loopSilenceTimeoutRef.current) window.clearTimeout(loopSilenceTimeoutRef.current);
          loopSilenceTimeoutRef.current = window.setTimeout(() => {
            const node = videoRef.current;
            if (!node) return;
            // Restart 2s before the loop start for preroll
            const restartAt = Math.max(0, range.start - 2);
            node.currentTime = restartAt;
            emitVideoEvent("seek", { currentTime: restartAt });
            node.play().catch(() => {});
            emitVideoEvent("play", { currentTime: restartAt });
            setLoopSilenceActive(false);
            loopSilenceLockRef.current = false;
          }, 3000);
        }
      }
    };

    const onDurationChange = () => setVideoDuration(video.duration);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
    };
  }, [scriptLines, currentLine, isLooping, customLoop, emitVideoEvent, loopPreparing]);

  useEffect(() => {
    try {
      localStorage.setItem("vhub_device_settings", JSON.stringify(deviceSettings));
    } catch {}
  }, [deviceSettings]);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const mobileDetected = /iphone|ipad|ipod|android/.test(ua);
    if (!mobileDetected) return;
    if (deviceSettings.voiceCaptureMode !== "original") return;
    setDeviceSettings((prev) => ({ ...prev, voiceCaptureMode: "high-fidelity" }));
    toast({ title: "Modo lossless ativado", description: "Captura em alta fidelidade habilitada por padrão no dispositivo móvel." });
  }, [deviceSettings.voiceCaptureMode, toast]);

  useEffect(() => {
    const targetSinkId = String(deviceSettings.outputDeviceId || "").trim() || "default";
    const applySink = async () => {
      const mediaTargets = [
        previewAudioRef.current as HTMLMediaElement | null,
        recordingsPreviewAudioRef.current as HTMLMediaElement | null,
        videoRef.current as HTMLMediaElement | null,
      ];
      for (const media of mediaTargets) {
        if (!media) continue;
        const sinkCapable = media as HTMLMediaElement & { setSinkId?: (id: string) => Promise<void> };
        if (typeof sinkCapable.setSinkId !== "function") continue;
        try {
          await sinkCapable.setSinkId(targetSinkId);
        } catch (error) {
          logAudioStep("sink-apply-error", { message: String((error as any)?.message || error), outputDeviceId: targetSinkId });
          toast({ title: "Saída de áudio não aplicada", description: "Seu navegador não permitiu selecionar este dispositivo de saída.", variant: "destructive" });
          break;
        }
      }
    };
    void applySink();
  }, [deviceSettings.outputDeviceId, logAudioStep, toast]);

  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        window.clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, []);

  const pendingUploadStorageKey = `vhub_pending_takes_${sessionId}`;

  const blobToBase64 = useCallback(async (blob: Blob) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Falha ao converter áudio para cache local"));
      reader.readAsDataURL(blob);
    });
  }, []);

  const dataUrlToBlob = useCallback((dataUrl: string) => {
    const [meta, base64] = String(dataUrl || "").split(",");
    const match = /data:(.*?);base64/.exec(meta || "");
    const mime = match?.[1] || "audio/wav";
    const binary = atob(base64 || "");
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }, []);

  const enqueuePendingUpload = useCallback(async (input: {
    dataUrl: string;
    characterId: string;
    voiceActorId: string;
    lineIndex: number;
    durationSeconds: number;
    startTimeSeconds: number;
    qualityScore: number | null;
    isPreferred: boolean;
  }) => {
    try {
      const existingRaw = localStorage.getItem(pendingUploadStorageKey);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const next = [input, ...existing].slice(0, 20);
      localStorage.setItem(pendingUploadStorageKey, JSON.stringify(next));
    } catch {}
  }, [pendingUploadStorageKey]);

  const flushPendingUploads = useCallback(async () => {
    let pending: any[] = [];
    try {
      const raw = localStorage.getItem(pendingUploadStorageKey);
      pending = raw ? JSON.parse(raw) : [];
    } catch {
      pending = [];
    }
    if (!pending.length) return;
    const stillPending: any[] = [];
    for (const item of pending) {
      try {
        const formData = new FormData();
        formData.append("audio", dataUrlToBlob(item.dataUrl), `take_retry_${sessionId}_${Date.now()}.wav`);
        formData.append("characterId", String(item.characterId));
        formData.append("voiceActorId", String(item.voiceActorId));
        formData.append("lineIndex", String(item.lineIndex));
        formData.append("durationSeconds", String(item.durationSeconds));
        formData.append("startTimeSeconds", String(item.startTimeSeconds));
        formData.append("isPreferred", String(Boolean(item.isPreferred)));
        if (item.qualityScore !== null && item.qualityScore !== undefined) {
          formData.append("qualityScore", String(item.qualityScore));
        }
        await authFetch(`/api/sessions/${sessionId}/takes`, { method: "POST", body: formData });
      } catch {
        stillPending.push(item);
      }
    }
    try {
      localStorage.setItem(pendingUploadStorageKey, JSON.stringify(stillPending));
    } catch {}
    await queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "takes"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "recordings"] });
  }, [pendingUploadStorageKey, dataUrlToBlob, sessionId, queryClient]);

  useEffect(() => {
    flushPendingUploads().catch(() => {});
    const onOnline = () => { flushPendingUploads().catch(() => {}); };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [flushPendingUploads]);

  const uploadTakeForDirector = useCallback(async (input: {
    wavBlob: Blob;
    durationSeconds: number;
    qualityScore: number | null;
    autoApprove: boolean;
    lineIndex: number;
    startTimeSeconds: number;
  }) => {
    if (!recordingProfile) {
      throw new Error("Perfil de gravação não configurado.");
    }
    logAudioStep("upload-started", { lineIndex: input.lineIndex, durationSeconds: input.durationSeconds, autoApprove: input.autoApprove });
    const lineText = scriptLines[input.lineIndex]?.text || "";
    const charName = recordingProfile.characterName || "personagem";
    const cleanText = lineText.replace(/[^\w\sáéíóúàèìòùâêîôûãõç]/gi, "").trim().slice(0, 40).replace(/\s+/g, "_");
    const filename = `${charName}_${cleanText || `linha${input.lineIndex}`}_${Date.now()}.wav`;
    const formData = new FormData();
    formData.append("audio", input.wavBlob, filename);
    formData.append("lineText", lineText.slice(0, 200));
    formData.append("characterId", recordingProfile.characterId);
    formData.append("voiceActorId", user?.id || recordingProfile.voiceActorId || "");
    formData.append("lineIndex", String(input.lineIndex));
    formData.append("durationSeconds", String(input.durationSeconds));
    formData.append("startTimeSeconds", String(input.startTimeSeconds));
    if (input.qualityScore !== null && input.qualityScore !== undefined) {
      formData.append("qualityScore", String(input.qualityScore));
    }
    formData.append("isPreferred", String(input.autoApprove));
    const take = await authFetch(`/api/sessions/${sessionId}/takes`, {
      method: "POST",
      body: formData,
    });
    if (!take?.id || !take?.audioUrl) {
      throw new Error("Persistência inválida: resposta de take incompleta.");
    }
    setLastUploadedTakeId(take.id);
    logAudioStep("upload-created", { takeId: take.id, audioUrl: take.audioUrl, lineIndex: input.lineIndex });
    const localRecord = {
      ...take,
      characterName: recordingProfile.characterName || null,
      voiceActorName: recordingProfile.voiceActorName || user?.displayName || user?.fullName || null,
      status: "approved",
      takeVersion: 1,
      createdAt: take.createdAt || new Date().toISOString(),
    };
    queryClient.setQueryData(["/api/sessions", sessionId, "recordings"], (prev: any) => {
      const list = Array.isArray(prev) ? prev : [];
      const without = list.filter((item: any) => item.id !== localRecord.id);
      return [localRecord, ...without];
    });
    queryClient.setQueryData(["/api/sessions", sessionId, "takes"], (prev: any) => {
      const list = Array.isArray(prev) ? prev : [];
      const without = list.filter((item: any) => item.id !== take.id);
      return [take, ...without];
    });
    await queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "takes"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "recordings"] });
    const recordingsAfterSave = await authFetch(`/api/sessions/${sessionId}/recordings`);
    const persisted = Array.isArray(recordingsAfterSave) && recordingsAfterSave.some((item: any) => item.id === take.id);
    logAudioStep("upload-integrity-check", { takeId: take.id, persisted });
    if (!persisted) {
      throw new Error("Persistência inválida: take não encontrado na aba de gravações.");
    }
    setRecordingAvailability((prev) => ({ ...prev, [String(take.id || "")]: "available" }));
    return take;
  }, [recordingProfile, sessionId, scriptLines, user?.id, user?.displayName, user?.fullName, queryClient, logAudioStep]);

  const startCountdown = useCallback(() => {
    if (recordingStatus !== "idle") {
      toast({ title: "Gravação em andamento", description: "Pare a gravação atual antes de iniciar outra.", variant: "destructive" });
      return;
    }
    
    if (!micState) {
      toast({ title: "Microfone não inicializado", description: "Configure ou reconecte seu microfone antes de gravar.", variant: "destructive" });
      return;
    }
    
    // Permitir gravação mesmo sem personagem selecionado
    if (!recordingProfile) {
      toast({ title: "Nenhum personagem selecionado", description: "Gravando como 'Sem Personagem'.", variant: "default" });
    }
    
    const video = videoRef.current;
    if (!video) {
      toast({ title: "Erro de reprodução", description: "Elemento de vídeo não encontrado.", variant: "destructive" });
      return;
    }
    
    const currentLineTime = scriptLines[currentLine]?.start || 0;
    // 2-second preroll: seek 2s before the line
    const prerollSeconds = 2;
    const prerollStart = Math.max(0, currentLineTime - prerollSeconds);
    
    video.currentTime = prerollStart;
    emitVideoEvent("seek", { currentTime: prerollStart });
    logAudioStep("countdown-started", { initiatorUserId: user?.id, startTime: prerollStart, lineTime: currentLineTime });
    
    // Start UI countdown and play video
    setCountdownValue(3);
    setRecordingStatus("recording");
    
    video.play().catch((error) => {
      console.error("Erro ao reproduzir vídeo", error);
      toast({ title: "Erro na reprodução", description: "Não foi possível reproduzir o vídeo.", variant: "destructive" });
    });
    
    emitVideoEvent("play", { currentTime: prerollStart });
    emitVideoEvent("countdown-start", { initiatorUserId: user?.id, count: 3 });
    
    if (micState?.audioContext) playCountdownBeep(micState.audioContext);
    
    // Audio starts at second 1 of preroll (1s after preroll begins)
    const captureDelay = prerollStart < currentLineTime ? 1000 : 0;
    const captureTimeout = window.setTimeout(() => {
      if (micState) {
        startCapture(micState);
      } else {
        console.warn("Iniciando gravação sem micState - pode não funcionar");
      }
    }, captureDelay);
    
    if (countdownTimerRef.current) window.clearInterval(countdownTimerRef.current);
    let count = 3;
    
    countdownTimerRef.current = window.setInterval(() => {
      count -= 1;
      setCountdownValue(Math.max(0, count));
      emitVideoEvent("countdown-tick", { count: Math.max(0, count), initiatorUserId: user?.id });
      
      if (count > 0 && micState?.audioContext) {
        playCountdownBeep(micState.audioContext);
      }
      
      if (count <= 0 && countdownTimerRef.current) {
        window.clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    }, 1000);
    
    // Store timeout so we can cancel it if recording is stopped early
    (countdownTimerRef as any)._captureTimeout = captureTimeout;
  }, [recordingStatus, micState, micReady, micInitializing, emitVideoEvent, logAudioStep, user?.id, recordingProfile, currentLine, scriptLines, mySessionRole]);

  const handleDirectorApprove = useCallback(async () => {
    if (!reviewingTake) return;
    try {
      setIsSaving(true);
      // Opcional: Marcar como preferred no backend se necessário
      await authFetch(`/api/takes/${reviewingTake.takeId}/preferred`, { method: "PUT" });
      
      emitVideoEvent("take-decision", { takeId: reviewingTake.takeId, decision: "approved", userId: user?.id });
      
      toast({ title: "Take Aprovado", description: "O dublador foi notificado." });
      setReviewingTake(null);
    } catch (err) {
      toast({ title: "Erro ao aprovar", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [reviewingTake, emitVideoEvent, user?.id, toast]);

  const handleDirectorReject = useCallback(async () => {
    if (!reviewingTake) return;
    try {
      setIsSaving(true);
      await authFetch(`/api/takes/${reviewingTake.takeId}`, { method: "DELETE" });
      
      emitVideoEvent("take-decision", { takeId: reviewingTake.takeId, decision: "rejected", userId: user?.id });
      
      toast({ title: "Take Rejeitado", description: "O take foi excluído." });
      setReviewingTake(null);
    } catch (err) {
      toast({ title: "Erro ao rejeitar", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [reviewingTake, emitVideoEvent, user?.id, toast]);

  const handleStopRecording = useCallback(async () => {
    if (recordingStatus !== "recording" || !micState) return;
    if (countdownTimerRef.current) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdownValue(0);
    logAudioStep("stop-requested", { state: micState });
    const result = await stopCapture(micState as any);
    if (!result.samples.length) {
      toast({ title: "Sem áudio capturado", description: "Nenhum sample foi registrado. Verifique microfone e ganho.", variant: "destructive" });
      setRecordingStatus("idle");
      logAudioStep("stop-empty-buffer");
      return;
    }
    
    if (videoRef.current) {
      videoRef.current.pause();
      emitVideoEvent("pause", { currentTime: videoRef.current.currentTime });
    }

    const metrics = analyzeTakeQuality(result.samples);
    logAudioStep("quality-analyzed", { score: metrics.score, clipping: metrics.clipping, loudness: metrics.loudness, noiseFloor: metrics.noiseFloor, sampleRate: result.sampleRate });
    
    if (isLooping && customLoop) {
      const expectedDuration = customLoop.end - Math.max(0, customLoop.start - 3);
      if (result.durationSeconds + 0.15 < expectedDuration) {
        toast({ title: "Loop incompleto", description: "A última fala do loop não foi gravada por completo.", variant: "destructive" });
        setRecordingStatus("idle");
        return;
      }
    }

    // Gerar blob local para preview imediato do dublador
    const wavBuffer = encodeWav(result.samples);
    const wavBlob = wavToBlob(wavBuffer);
    const objectUrl = URL.createObjectURL(wavBlob);

    const localTakeData = {
      samples: result.samples,
      durationSeconds: result.durationSeconds,
      sampleRate: result.sampleRate,
      metrics,
      blob: wavBlob,
      url: objectUrl,
      lineIndex: currentLine,
      startTimeSeconds: Number(videoRef.current?.currentTime || 0),
    };

    setPendingTake(localTakeData);
    setRecordingStatus("recorded");

    // Upload Automático para o Diretor
    setIsSaving(true);
    setIsWaitingReview(true);
    
    try {
      const uploadedTake = await uploadTakeForDirector({ wavBlob, durationSeconds: result.durationSeconds, qualityScore: metrics.score, autoApprove: false, lineIndex: currentLine, startTimeSeconds: Number(videoRef.current?.currentTime || 0) });

      emitVideoEvent("take-ready-for-review", { takeId: uploadedTake.id, audioUrl: uploadedTake.audioUrl, duration: result.durationSeconds, metrics, lineIndex: currentLine, userId: user?.id, character: recordingProfile?.characterName || "Personagem", start: Number(videoRef.current?.currentTime || 0) });
      
      toast({ title: "Enviado para revisão", description: "Aguardando aprovação do diretor..." });
    } catch (error: any) {
      console.error("Auto-upload failed:", error);
      toast({ title: "Falha no envio automático", description: "Tente enviar manualmente.", variant: "destructive" });
      setIsWaitingReview(false);
      // Mantém o pendingTake para retry manual se necessário
    } finally {
      setIsSaving(false);
    }
  }, [recordingStatus, micState, emitVideoEvent, logAudioStep, toast, isLooping, customLoop, currentLine, uploadTakeForDirector, user?.id, recordingProfile]);

  const handleApproveTake = useCallback(async () => {
    if (!pendingTake) return;
    try {
      setIsSaving(true);
      const startedAt = performance.now();
      await uploadTakeForDirector({ wavBlob: pendingTake.blob, durationSeconds: pendingTake.durationSeconds, qualityScore: pendingTake.metrics.score, autoApprove: true, lineIndex: pendingTake.lineIndex, startTimeSeconds: pendingTake.startTimeSeconds });
      const elapsedMs = performance.now() - startedAt;
      if (elapsedMs > 3000) {
        toast({ title: "Salvamento acima da meta", description: `${Math.round(elapsedMs)}ms`, variant: "destructive" });
      }
      toast({ title: "Take gravado com sucesso" });
      await logFeatureAudit("room.take", "auto_saved", { lineIndex: pendingTake.lineIndex });
      
      // Cleanup
      URL.revokeObjectURL(pendingTake.url);
      setPendingTake(null);
      setRecordingStatus("idle");
    } catch (err: any) {
      logAudioStep("upload-error", { message: String(err?.message || err) });
      try {
        await enqueuePendingUpload({ dataUrl: await blobToBase64(pendingTake.blob), characterId: recordingProfile?.characterId || "", voiceActorId: user?.id || recordingProfile?.voiceActorId || "", lineIndex: pendingTake.lineIndex, durationSeconds: pendingTake.durationSeconds, startTimeSeconds: pendingTake.startTimeSeconds, qualityScore: pendingTake.metrics.score, isPreferred: !hasApproverPresent && !isPrivileged });
        toast({ title: "Sem conexão. Take salvo no cache local para reenvio automático.", variant: "destructive" });
        
        URL.revokeObjectURL(pendingTake.url);
        setPendingTake(null);
        setRecordingStatus("idle");
      } catch {}
      toast({ title: "Erro ao enviar take", description: String(err?.message || err), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [pendingTake, uploadTakeForDirector, toast, logFeatureAudit, enqueuePendingUpload, blobToBase64, recordingProfile, user?.id, hasApproverPresent, isPrivileged, logAudioStep]);

  const handlePlayPause = useCallback(() => {
    if (!canControlVideo) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      if (isLooping && customLoop) {
        // Play 2 seconds before the loop start timecode (preroll)
        const loopPrerollSeconds = 2;
        const loopStart = Math.max(0, customLoop.start - loopPrerollSeconds);
        video.pause();
        video.currentTime = loopStart;
        emitVideoEvent("seek", { currentTime: loopStart });
        if (loopPreparationTimeoutRef.current) window.clearTimeout(loopPreparationTimeoutRef.current);
        setLoopPreparing(true);
        emitVideoEvent("loop-preparing", { loopStart, delayMs: 3000 });
        loopPreparationTimeoutRef.current = window.setTimeout(() => {
          const node = videoRef.current;
          if (!node) return;
          node.currentTime = loopStart;
          emitVideoEvent("seek", { currentTime: loopStart });
          node.play().catch(() => {});
          emitVideoEvent("play", { currentTime: loopStart });
          setLoopPreparing(false);
        }, 3000);
        return;
      }
      video.play().catch(() => {});
      emitVideoEvent("play", { currentTime: video.currentTime });
    } else {
      video.pause();
      emitVideoEvent("pause", { currentTime: video.currentTime });
    }
  }, [canControlVideo, emitVideoEvent, isLooping, customLoop]);

  const handleStopPlayback = useCallback(() => {
    if (!canControlVideo) return;
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = currentScriptLine?.start || 0;
    emitVideoEvent("pause", { currentTime: video.currentTime });
  }, [canControlVideo, currentScriptLine, emitVideoEvent]);

  const seek = useCallback((delta: number) => {
    if (!canControlVideo) return;
    const video = videoRef.current;
    if (!video) return;
    const next = Math.max(0, Math.min(video.duration, video.currentTime + delta));
    video.currentTime = next;
    emitVideoEvent("seek", { currentTime: next });
  }, [canControlVideo, emitVideoEvent]);

  const scrub = useCallback((percent: number) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const next = video.duration * percent;
    video.currentTime = next;
    emitVideoEvent("seek", { currentTime: next });
  }, [emitVideoEvent]);

  const handleLineClick = useCallback((index: number) => {
    if (!canTextControl) return;
    const line = scriptLines[index];
    if (!line) return;

    if (loopSelectionMode === "selecting-start") {
      setCustomLoop({ start: line.start, end: line.end || (line.start + 2) });
      setLoopAnchorIndex(index);
      setLoopSelectionMode("selecting-end");
      toast({ title: "Inicio selecionado", description: "Clique na fala final do loop." });
    } else if (loopSelectionMode === "selecting-end") {
      const startIndex = loopAnchorIndex ?? index;
      const normalizedStartIndex = Math.min(startIndex, index);
      const normalizedEndIndex = Math.max(startIndex, index);
      const startLine = scriptLines[normalizedStartIndex] || line;
      const endLine = scriptLines[normalizedEndIndex] || line;
      const start = startLine.start;
      const baseEnd = endLine.end || (endLine.start + 2);
      const nextLine = scriptLines[normalizedEndIndex + 1];
      const secondNextLine = scriptLines[normalizedEndIndex + 2];
      const calculatedPostRoll = nextLine && secondNextLine
        ? Math.max(0.25, secondNextLine.start - nextLine.start)
        : 1;
      const end = baseEnd + calculatedPostRoll;
      setCustomLoop({ start, end });
      setLoopRangeMeta({ startIndex: normalizedStartIndex, endIndex: normalizedEndIndex });
      setLoopSelectionMode("idle");
      setIsLooping(true);
      toast({ title: "Loop definido", description: "Preroll de 3s e posroll adaptativo aplicados." });
      emitVideoEvent("sync-loop", { loopRange: { start, end } });
      logFeatureAudit("room.loop", "defined", { start, end, startLineIndex: normalizedStartIndex, endLineIndex: normalizedEndIndex });
    } else {
      const video = videoRef.current;
      if (video) {
        video.currentTime = line.start;
        emitVideoEvent("seek", { currentTime: line.start });
      }
      setCurrentLine(index);
    }
  }, [canTextControl, scriptLines, loopSelectionMode, toast, emitVideoEvent, loopAnchorIndex, logFeatureAudit]);

  const handleLoopButton = useCallback(async () => {
    if (!canControlVideo) return;
    if (loopSelectionMode !== "idle" || customLoop) {
      setLoopSelectionMode("idle");
      setIsLooping(false);
      setCustomLoop(null);
      setLoopRangeMeta(null);
      setLoopAnchorIndex(null);
      await logFeatureAudit("room.loop", "cleared");
      return;
    }
    setLoopSelectionMode("selecting-start");
    setCustomLoop(null);
    setLoopRangeMeta(null);
    setLoopAnchorIndex(null);
    await logFeatureAudit("room.loop", "selection_started");
    toast({ title: "Selecione a primeira fala do loop" });
  }, [loopSelectionMode, customLoop, logFeatureAudit, toast]);

  const handleBack = useCallback(() => {
    if (recordingStatus === "recording" && !window.confirm("Você tem uma gravação em andamento. Deseja realmente sair?")) return;
    setLocation(`/hub-dub/studio/${studioId}/dashboard`);
  }, [recordingStatus, studioId, setLocation]);

  const handleToggleAutoFollow = useCallback(() => {
    const next = !scriptAutoFollow;
    setScriptAutoFollow(next);
    if (next) syncScrollToCurrentVideoTime();
    logFeatureAudit("room.scroll", "mode_changed", { mode: next ? "automatic" : "manual" });
  }, [scriptAutoFollow, syncScrollToCurrentVideoTime, logFeatureAudit]);

  const handleToggleCharacterFilter = useCallback(() => {
    const next = !onlySelectedCharacter;
    setOnlySelectedCharacter(next);
    logFeatureAudit("room.character_filter", "toggled", { enabled: next, character: recordingProfile?.characterName || null });
  }, [onlySelectedCharacter, recordingProfile, logFeatureAudit]);

  const handleShortcutsApply = useCallback((pending: typeof shortcuts) => {
    setShortcuts(pending);
    setIsCustomizing(false);
    toast({ title: "Atalhos atualizados (apenas nesta sessão)" });
  }, [toast]);

  const handleShortcutsSaveDefault = useCallback((pending: typeof shortcuts) => {
    setShortcuts(pending);
    localStorage.setItem("vhub_shortcuts", JSON.stringify(pending));
    setIsCustomizing(false);
    toast({ title: "Atalhos salvos como padrão" });
  }, [toast]);

  const handleShortcutsClose = useCallback(() => {
    setIsCustomizing(false);
    setPendingShortcuts(shortcuts);
    setListeningFor(null);
  }, [shortcuts]);

  const handleRecordOrStop = useCallback(() => {
    if (recordingStatus === "recording") handleStopRecording();
    else startCountdown();
  }, [recordingStatus, handleStopRecording, startCountdown]);

  const handleDiscardModalCancel = useCallback(() => {
    setDiscardModalTake(null);
    setDiscardFinalStep(false);
  }, []);

  const handleDiscardModalConfirm = useCallback(async () => {
    if (!discardFinalStep) { setDiscardFinalStep(true); return; }
    await handleDiscardTake(discardModalTake);
    emitVideoEvent("take-status", { status: "deleted", takeId: discardModalTake.id, targetUserId: discardModalTake.voiceActorId });
  }, [discardFinalStep, discardModalTake, handleDiscardTake, emitVideoEvent]);

  // Debounce para live updates de texto
  useEffect(() => {
    if (!editingField) return;
    const handler = setTimeout(() => {
      emitTextControlEvent("text:live-change", { lineIndex: editingField.lineIndex, text: editingDraftValue });
    }, 500);
    return () => clearTimeout(handler);
  }, [editingDraftValue, editingField, emitTextControlEvent]);

  const startInlineEdit = useCallback((lineIndex: number, field: "character" | "text" | "timecode") => {
    // Verificar lock
    const lock = lockedLines[lineIndex];
    if (lock && lock.userId !== user?.id) {
      toast({ title: "Linha bloqueada", description: "Outro usuário está editando esta linha.", variant: "destructive" });
      return;
    }

    const line = scriptLines[lineIndex];
    if (!line) return;
    const initial = field === "character" ? line.character : field === "text" ? line.text : formatTimecodeByFormat(line.start, "HH:MM:SS", 24);
    setEditingField({ lineIndex, field });
    setEditingDraftValue(initial);
    
    // Emitir lock
    emitTextControlEvent("text:lock-line", { lineIndex, userId: user?.id });
  }, [scriptLines, lockedLines, user?.id, emitTextControlEvent, toast]);

  const cancelInlineEdit = useCallback(() => {
    if (editingField) {
      emitTextControlEvent("text:unlock-line", { lineIndex: editingField.lineIndex });
    }
    setEditingField(null);
    setEditingDraftValue("");
  }, [editingField, emitTextControlEvent]);

  const saveInlineEdit = useCallback(() => {
    if (!editingField) return;
    const line = scriptLines[editingField.lineIndex];
    if (!line) return;
    const by = String(user?.displayName || user?.fullName || "Usuário");
    const patch: ScriptLineOverride = {};
    let before = "";
    let after = "";
    if (editingField.field === "character") {
      before = line.character;
      after = editingDraftValue.trim();
      if (!after) {
        toast({ title: "Nome do personagem inválido", variant: "destructive" });
        return;
      }
      patch.character = after;
    } else if (editingField.field === "text") {
      before = line.text;
      after = editingDraftValue.trim();
      if (!after) {
        toast({ title: "Texto da fala inválido", variant: "destructive" });
        return;
      }
      patch.text = after;
    } else {
      const candidate = editingDraftValue.trim();
      if (!/^\d{2}:[0-5]\d:[0-5]\d$/.test(candidate)) {
        toast({ title: "Timecode inválido", description: "Use o formato HH:MM:SS.", variant: "destructive" });
        return;
      }
      before = formatTimecodeByFormat(line.start, "HH:MM:SS", 24);
      after = candidate;
      patch.start = parseTimecode(candidate);
    }
    applyScriptLinePatch(editingField.lineIndex, patch);
    pushEditHistory(editingField.lineIndex, editingField.field, before, after, by);
    
    emitTextControlEvent("text-control:update-line", { lineIndex: editingField.lineIndex, ...patch, history: { field: editingField.field, before, after, by } });
    
    // Unlock ao salvar
    emitTextControlEvent("text:unlock-line", { lineIndex: editingField.lineIndex });

    setEditingField(null);
    setEditingDraftValue("");
    toast({ title: "Alteração salva", description: `${editingField.field} atualizado com sucesso.` });
  }, [editingField, scriptLines, user?.displayName, user?.fullName, editingDraftValue, toast, applyScriptLinePatch, pushEditHistory, emitTextControlEvent]);

  const toggleUserTextControl = useCallback((targetUserId: string) => {
    if (!canTextControl) return;
    const hasPermission = textControllerUserIds.has(targetUserId);
    // Optimistic UI update: toggle immediately
    const next = new Set(textControllerUserIds);
    if (hasPermission) {
      next.delete(targetUserId);
    } else {
      next.add(targetUserId);
    }
    setTextControllerUserIds(next);
    emitTextControlEvent(hasPermission ? "text-control:revoke-controller" : "text-control:grant-controller", { targetUserId });
  }, [canTextControl, textControllerUserIds, emitTextControlEvent]);

  const getTakeStreamUrl = useCallback((take: any) => {
    const takeId = String(take?.id || "").trim();
    if (!takeId) return "";
    return `/api/takes/${takeId}/stream`;
  }, []);

  const validateTakeAudioBlob = useCallback(async (take: any, blob: Blob) => {
    if (!blob || blob.size <= 0) {
      throw new Error("Arquivo vazio.");
    }
    const maxBytes = 100 * 1024 * 1024;
    if (blob.size > maxBytes) {
      throw new Error("Arquivo excede o limite de 100MB.");
    }
    const name = String(take?.fileName || take?.audioUrl || "").toLowerCase();
    const ext = name.includes(".") ? `.${name.split(".").pop()}` : "";
    const type = String(blob.type || "").toLowerCase();
    const validExt = [".mp3", ".wav", ".m4a"].includes(ext);
    const validType = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/mp4", "audio/m4a", "audio/x-m4a"].some((item) => type.startsWith(item));
    if (!validExt && !validType) {
      throw new Error("Formato de áudio não suportado.");
    }
    const duration = await new Promise<number>((resolve, reject) => {
      const probeUrl = URL.createObjectURL(blob);
      const probeAudio = new Audio();
      const timeout = window.setTimeout(() => {
        probeAudio.src = "";
        URL.revokeObjectURL(probeUrl);
        reject(new Error("Tempo limite ao validar metadados do áudio."));
      }, 12000);
      probeAudio.preload = "metadata";
      probeAudio.onloadedmetadata = () => {
        window.clearTimeout(timeout);
        const value = Number(probeAudio.duration || 0);
        probeAudio.src = "";
        URL.revokeObjectURL(probeUrl);
        resolve(value);
      };
      probeAudio.onerror = () => {
        window.clearTimeout(timeout);
        probeAudio.src = "";
        URL.revokeObjectURL(probeUrl);
        reject(new Error("Arquivo de áudio corrompido ou inválido."));
      };
      probeAudio.src = probeUrl;
    });
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error("Duração inválida do arquivo de áudio.");
    }
  }, []);

  const resolveTakePlayableUrl = useCallback(async (take: any, opts?: { prefetch?: boolean }) => {
    const takeId = String(take?.id || "");
    if (!takeId) throw new Error("Take inválido.");
    const inMemory = cachedRecordingBlobUrlsRef.current[takeId];
    if (inMemory) return inMemory;
    const streamUrl = getTakeStreamUrl(take);
    if (!streamUrl) throw new Error("URL de stream indisponível.");
    
    setRecordingsIsLoading((prev) => { const next = new Set(prev); next.add(takeId); return next; });
    setRecordingAvailability((prev) => ({ ...prev, [takeId]: "loading" }));

    try {
      const cacheStorage = typeof window !== "undefined" && "caches" in window ? await caches.open("vhub_audio_takes_v1").catch(() => null) : null;
      const cacheRequest = new Request(streamUrl, { credentials: "include" });
      if (cacheStorage) {
        const cachedResponse = await cacheStorage.match(cacheRequest);
        if (cachedResponse?.ok) {
          const blob = await cachedResponse.blob();
          await validateTakeAudioBlob(take, blob);
          const objectUrl = URL.createObjectURL(blob);
          cachedRecordingBlobUrlsRef.current[takeId] = objectUrl;
          setRecordingPlayableUrls((prev) => ({ ...prev, [takeId]: objectUrl }));
          setRecordingAvailability((prev) => ({ ...prev, [takeId]: "available" }));
          return objectUrl;
        }
      }

      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), opts?.prefetch ? 15000 : 30000);
      const startedAt = performance.now();
      try {
        const response = await fetch(streamUrl, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Arquivo inacessível (${response.status})`);
        }
        const blob = await response.blob();
        await validateTakeAudioBlob(take, blob);
        if (cacheStorage) {
          await cacheStorage.put(cacheRequest, new Response(blob, { headers: { "content-type": blob.type || "audio/wav" } })).catch(() => {});
        }
        const objectUrl = URL.createObjectURL(blob);
        cachedRecordingBlobUrlsRef.current[takeId] = objectUrl;
        setRecordingPlayableUrls((prev) => ({ ...prev, [takeId]: objectUrl }));
        setRecordingAvailability((prev) => ({ ...prev, [takeId]: "available" }));
        console.info("[Room][Audio] take carregado", { takeId, bytes: blob.size, contentType: blob.type || null, elapsedMs: Math.round(performance.now() - startedAt) });
        return objectUrl;
      } catch (error: any) {
        setRecordingAvailability((prev) => ({ ...prev, [takeId]: "error" }));
        throw new Error(error?.name === "AbortError" ? "Tempo limite ao carregar áudio." : String(error?.message || error));
      } finally {
        window.clearTimeout(timeout);
      }
    } finally {
      setRecordingsIsLoading((prev) => { const next = new Set(prev); next.delete(takeId); return next; });
    }
  }, [getTakeStreamUrl, validateTakeAudioBlob]);

  useEffect(() => {
    if (!recordingsOpen) return;
    const targets = scopedRecordings.slice(0, 4);
    if (targets.length === 0) return;
    let cancelled = false;
    const run = async () => {
      for (const take of targets) {
        if (cancelled) break;
        const id = String(take?.id || "");
        const availability = recordingAvailability[id];
        if (!id || availability === "available" || availability === "loading" || availability === "error") continue;
        try {
          await resolveTakePlayableUrl(take, { prefetch: true });
        } catch {}
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [recordingsOpen, scopedRecordings, resolveTakePlayableUrl, recordingAvailability]);

  const handleDownloadTake = useCallback(async (take: any) => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 45000);
    try {
      const takeId = String(take?.id || "");
      if (!takeId) throw new Error("Take inválido.");
      const response = await fetch(`/api/takes/${takeId}/download`, {
        credentials: "include",
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`Falha ao baixar take (${response.status})`);
      }
      const blob = await response.blob();
      if (!blob || blob.size <= 0) {
        throw new Error("Arquivo vazio ou indisponível.");
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = take?.fileName || `take_${take.characterName}_${take.lineIndex}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (err) {
      toast({ title: "Erro ao baixar take", description: String((err as any)?.message || err), variant: "destructive" });
      throw err;
    } finally {
      window.clearTimeout(timeout);
    }
  }, [toast]);

  const handlePlayRecordingTake = useCallback(async (take: any) => {
    const audio = recordingsPreviewAudioRef.current;
    if (!audio) return;
    const takeId = String(take?.id || "");
    if (!takeId) return;
    if (recordingsPreviewId === take.id && !recordingsPlayerOpenId) {
      audio.pause();
      setRecordingsPreviewId(null);
      setRecordingsPlayerOpenId(null);
      return;
    }
    try {
      setRecordingsIsLoading((prev) => new Set(prev).add(takeId));
      const streamUrl = await getTakeStreamUrl(take.id);
      if (streamUrl) {
        audio.src = streamUrl;
        await audio.play();
        setRecordingsPreviewId(String(take.id));
        setRecordingsPlayerOpenId(String(take.id));
        setRecordingPlayableUrls((prev) => ({ ...prev, [takeId]: streamUrl }));
        setRecordingAvailability((prev) => ({ ...prev, [takeId]: "available" }));
      }
    } catch (error) {
      console.error("Failed to play audio:", error);
      setRecordingAvailability((prev) => ({ ...prev, [takeId]: "error" }));
    } finally {
      setRecordingsIsLoading((prev) => { const next = new Set(prev); next.delete(takeId); return next; });
    }
  }, [recordingsPreviewId, recordingsPlayerOpenId, getTakeStreamUrl]);

  const handleDownloadRecordingTake = useCallback(async (take: any) => {
    const takeId = String(take?.id || "");
    if (!takeId) return;
    try {
      setRecordingsIsLoading((prev) => new Set(prev).add(takeId));
      await handleDownloadTake(take);
    } catch (error) {
      console.error("Failed to download take:", error);
      toast({ title: "Erro ao baixar", description: "Não foi possível baixar a gravação.", variant: "destructive" });
    } finally {
      setRecordingsIsLoading((prev) => { const next = new Set(prev); next.delete(takeId); return next; });
      setRecordingAvailability((prev) => ({ ...prev, [String(take.id || "")]: "error" }));
    }
  }, [handleDownloadTake, toast]);

  const handleDiscardRecordingTake = useCallback((take: any) => {
    setDiscardModalTake(take);
    setDiscardFinalStep(false);
  }, []);

  const handleRecordingLoadedMetadata = useCallback((tid: string, rate: number, el: HTMLAudioElement) => {
    el.playbackRate = rate;
    setRecordingAvailability((prev) => ({ ...prev, [tid]: "available" }));
  }, []);

  const handleRecordingAudioError = useCallback((tid: string) => {
    setRecordingAvailability((prev) => ({ ...prev, [tid]: "error" }));
  }, []);

  const handleRecordingsAudioEnded = useCallback(() => {
    setRecordingsPreviewId(null);
    setRecordingsPlayerOpenId(null);
  }, []);

  const handleSaveProfile = useCallback((profile: RecordingProfile) => {
    setRecordingProfile(profile);
    localStorage.setItem(`vhub_rec_profile_${sessionId}`, JSON.stringify(profile));
    setShowProfilePanel(false);
  }, [sessionId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const code = e.code;
      if (code === shortcuts.playPause) { e.preventDefault(); handlePlayPause(); }
      else if (code === shortcuts.record) { e.preventDefault(); if (recordingStatus === "idle") startCountdown(); }
      else if (code === shortcuts.stop) { e.preventDefault(); if (recordingStatus === "recording") handleStopRecording(); else handleStopPlayback(); }
      else if (code === shortcuts.back) { e.preventDefault(); seek(-2); }
      else if (code === shortcuts.forward) { e.preventDefault(); seek(2); }
      else if (code === shortcuts.loop) { e.preventDefault(); void handleLoopButton(); }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, handlePlayPause, handleStopRecording, handleStopPlayback, recordingStatus, startCountdown, seek, handleLoopButton]);

  useEffect(() => {
    if (isLooping) return;
    setLoopPreparing(false);
    setLoopSilenceActive(false);
    loopSilenceLockRef.current = false;
    if (loopPreparationTimeoutRef.current) {
      window.clearTimeout(loopPreparationTimeoutRef.current);
      loopPreparationTimeoutRef.current = null;
    }
    if (loopSilenceTimeoutRef.current) {
      window.clearTimeout(loopSilenceTimeoutRef.current);
      loopSilenceTimeoutRef.current = null;
    }
  }, [isLooping]);

  useEffect(() => {
    return () => {
      if (loopPreparationTimeoutRef.current) window.clearTimeout(loopPreparationTimeoutRef.current);
      if (loopSilenceTimeoutRef.current) window.clearTimeout(loopSilenceTimeoutRef.current);
      
      // Limpar todos os Object URLs criados para evitar memory leaks
      Object.values(cachedRecordingBlobUrlsRef.current).forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          console.warn("[Room] Falha ao revogar URL no cleanup:", e);
        }
      });
      cachedRecordingBlobUrlsRef.current = {};
      
      if (pendingTake?.url) {
        URL.revokeObjectURL(pendingTake.url);
      }
    };
  }, [pendingTake?.url]);

  if (sessionLoading || productionLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Sincronizando estúdio...</p>
        </div>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-sm font-medium text-foreground">Erro ao carregar sessao</p>
          <p className="text-xs text-muted-foreground">Verifique se voce tem acesso a este estudio e sessao.</p>
          <Link to={`/hub-dub/studio/${studioId}/sessions`}>
            <button className="mt-2 vhub-btn-sm vhub-btn-primary" data-testid="button-go-sessions">
              Ir para Sessoes
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="recording-room h-screen w-screen overflow-hidden flex flex-col select-none relative bg-background text-foreground"
      onClickCapture={(event) => {
        const target = event.target as HTMLElement | null;
        const button = target?.closest?.("button") as HTMLButtonElement | null;
        if (!button) return;
        button.classList.remove("rr-click-blink");
        void button.offsetWidth;
        button.classList.add("rr-click-blink");
        window.setTimeout(() => button.classList.remove("rr-click-blink"), 300);
      }}
    >
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/12 via-background to-background"></div>
        <div className="absolute -top-28 right-[-12rem] w-[34rem] h-[34rem] rounded-full bg-primary/10 blur-3xl opacity-70" />
        <div className="absolute -bottom-24 left-[-8rem] w-[26rem] h-[26rem] rounded-full bg-primary/8 blur-3xl opacity-70" />
      </div>

      {isCustomizing && (
        <ShortcutsDialog
          shortcuts={shortcuts}
          pendingShortcuts={pendingShortcuts}
          listeningFor={listeningFor}
          shortcutLabels={SHORTCUT_LABELS}
          defaultShortcuts={DEFAULT_SHORTCUTS}
          keyLabel={keyLabel}
          onSetPending={setPendingShortcuts}
          onSetListeningFor={setListeningFor}
          onApply={handleShortcutsApply}
          onSaveDefault={handleShortcutsSaveDefault}
          onClose={handleShortcutsClose}
        />
      )}

      <DeviceSettingsPanel
        open={deviceSettingsOpen}
        onClose={() => setDeviceSettingsOpen(false)}
        settings={deviceSettings}
        onSettingsChange={setDeviceSettings}
        micState={micState}
      />

      {showProfilePanel && session?.productionId && (
        <RecordingProfilePanel
          characters={charactersList || []}
          user={user}
          sessionId={sessionId}
          productionId={session.productionId}
          onSave={handleSaveProfile}
          onClose={() => setShowProfilePanel(false)}
          existingProfile={recordingProfile}
        />
      )}

      {textControlPopupOpen && canTextControl && (
        <TextControlPopup
          authorizedCount={textControllerUserIds.size}
          candidates={textControlCandidates}
          authorizedIds={textControllerUserIds}
          zIndex={UI_LAYER_BASE.modalOverlay}
          normalizeRole={normalizeRoomRole}
          onToggle={(uid) => toggleUserTextControl(uid)}
          onClose={() => setTextControlPopupOpen(false)}
        />
      )}

      {recordingsOpen && (
        <RecordingsPanel
          zIndex={UI_LAYER_BASE.modalOverlay}
          isPrivileged={isPrivileged}
          canViewOnlineUsers={canViewOnlineUsers}
          canDiscardTake={canDiscardTake}
          recordingsScope={recordingsScope}
          recordingsSearch={recordingsSearch}
          recordingsSortBy={recordingsSortBy}
          recordingsSortDir={recordingsSortDir}
          recordingsPlaybackRate={recordingsPlaybackRate}
          recordingsDateFrom={recordingsDateFrom}
          recordingsDateTo={recordingsDateTo}
          recordingsResponse={recordingsResponse}
          scopedRecordings={scopedRecordings}
          recordingAvailability={recordingAvailability}
          recordingsIsLoading={recordingsIsLoading}
          recordingsPreviewId={recordingsPreviewId}
          recordingsPlayerOpenId={recordingsPlayerOpenId}
          recordingPlayableUrls={recordingPlayableUrls}
          optimisticRemovingTakeIds={optimisticRemovingTakeIds}
          onlineRosterForCurrentRole={onlineRosterForCurrentRole}
          audioRef={recordingsPreviewAudioRef}
          rowAudioRefs={recordingRowAudioRefs}
          getTakeStreamUrl={getTakeStreamUrl}
          onClose={() => setRecordingsOpen(false)}
          onScopeToggle={() => setRecordingsScope((v) => (v === "all" ? "mine" : "all"))}
          onSearchChange={setRecordingsSearch}
          onSortByChange={(v) => setRecordingsSortBy(v as any)}
          onSortDirChange={(v) => setRecordingsSortDir(v as any)}
          onPlaybackRateChange={setRecordingsPlaybackRate}
          onDateFromChange={setRecordingsDateFrom}
          onDateToChange={setRecordingsDateTo}
          onPagePrev={() => setRecordingsPage((p) => Math.max(1, p - 1))}
          onPageNext={() => setRecordingsPage((p) => Math.min(recordingsResponse?.pageCount || 1, p + 1))}
          onPlayTake={handlePlayRecordingTake}
          onDownloadTake={handleDownloadRecordingTake}
          onDiscardTake={handleDiscardRecordingTake}
          onLoadedMetadata={handleRecordingLoadedMetadata}
          onAudioError={handleRecordingAudioError}
        />
      )}

      <DiscardTakeModal
        take={discardModalTake}
        isFinalStep={discardFinalStep}
        zIndex={UI_LAYER_BASE.confirmationModal}
        onCancel={handleDiscardModalCancel}
        onConfirm={handleDiscardModalConfirm}
      />

      <audio ref={previewAudioRef} preload="none" />
      <audio
        ref={recordingsPreviewAudioRef}
        preload="none"
        onEnded={handleRecordingsAudioEnded}
      />

      <RoomHeader
        isMobile={isMobile}
        productionName={production?.name || "Sessão"}
        sessionTitle={session?.title}
        sideScriptWidth={sideScriptWidth}
        recordingProfile={recordingProfile}
        charSelectorOpen={charSelectorOpen}
        setCharSelectorOpen={setCharSelectorOpen}
        charactersList={charactersList || []}
        handleCharacterChange={handleCharacterChange}
        onBack={handleBack}
        scriptAutoFollow={scriptAutoFollow}
        onToggleAutoFollow={handleToggleAutoFollow}
        onlySelectedCharacter={onlySelectedCharacter}
        onToggleCharacterFilter={handleToggleCharacterFilter}
        rightSlot={
          <div className="flex items-center gap-2">
            <span
              title={wsConnected ? "Conectado" : "Reconectando..."}
              className={cn("w-2 h-2 rounded-full shrink-0 transition-colors", wsConnected ? "bg-green-500" : "bg-yellow-400 animate-pulse")}
            />
            <RoomHeaderActions
              isMobile={isMobile}
              recordingStatus={recordingStatus}
              canViewOnlineUsers={canViewOnlineUsers}
              canTextControl={canTextControl}
              canAccessDashboard={canAccessDashboard}
              roomUsers={roomUsers}
              studioId={studioId}
              onRecordOrStop={handleRecordOrStop}
              onOpenMenu={() => setMobileMenuOpen(true)}
              onOpenRecordings={() => setRecordingsOpen(true)}
              onOpenTextControl={() => setTextControlPopupOpen(true)}
              onOpenDeviceSettings={() => setDeviceSettingsOpen(true)}
              onOpenShortcuts={() => setIsCustomizing(true)}
              onPanelClick={() => logFeatureAudit("room.panel", "redirect", { studioId })}
            />
          </div>
        }
      />

      {isMobile && (
        <DailyMeetPanel
          sessionId={sessionId}
          zIndexBase={UI_LAYER_BASE.chatPanel}
          open={dailyMeetOpen}
          onOpenChange={setDailyMeetOpen}
          mode="floating"
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div 
          className={cn(
            "flex-1 grid overflow-hidden transition-[grid-template-columns] duration-75",
            isMobile ? "grid-cols-1" : "lg:grid-cols-[1fr_auto]"
          )}
          style={isMobile ? undefined : { gridTemplateColumns: `1fr ${sideScriptWidth}px` }}
        >
          {/* Coluna Principal: Video + Texto Sincronizado */}
          <div ref={desktopVideoTextContainerRef} className="flex flex-col min-h-0 relative bg-black/40">
            <VideoPlayer
              ref={videoRef}
              src={production?.videoUrl}
              isMuted={isMuted}
              onMuteToggle={() => setIsMuted((m) => !m)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={setVideoTime}
              onDurationChange={setVideoDuration}
              countdownValue={countdownValue}
              volumeOverlay={null}
              loopInfo={loopInfo}
              className="min-h-[220px]"
              height={isMobile ? undefined : `${desktopVideoTextSplit}%`}
            />

            {!isMobile && (
              <DesktopControlsBar
                isPlaying={isPlaying}
                isLooping={isLooping}
                recordingStatus={recordingStatus}
                micReady={micReady}
                isSaving={isSaving}
                micInitializing={micInitializing}
                videoTime={videoTime}
                videoDuration={videoDuration}
                formatTimecode={formatLiveTimecode}
                onSeekBack={() => seek(-2)}
                onPlayPause={handlePlayPause}
                onSeekForward={() => seek(2)}
                onScrub={scrub}
                onLoop={handleLoopButton}
                onRecord={startCountdown}
                onStopRecord={handleStopRecording}
                canControlVideo={canControlVideo}
              />
            )}

            {!isMobile && (
              <div
                onPointerDown={() => setIsDraggingVideoTextSplit(true)}
                className={cn(
                  "h-2 w-full cursor-row-resize flex items-center justify-center transition-all group z-30 relative",
                  isDraggingVideoTextSplit ? "bg-primary" : "room-bg-surface hover:bg-primary/50"
                )}
                aria-label="Redimensionar roteiro (máx 50%)"
                data-testid="video-text-resizer"
              >
                <div className={cn(
                  "w-12 h-0.5 rounded-full transition-all",
                  isDraggingVideoTextSplit ? "bg-white" : "bg-muted-foreground/30 group-hover:bg-white"
                )} />
                {isDraggingVideoTextSplit && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-lg">
                    {Math.round(100 - desktopVideoTextSplit)}%
                  </div>
                )}
              </div>
            )}
            {!isMobile && (
              <div
                className="border-t border-border min-h-[220px] room-bg-subtle"
                style={{ height: `${100 - desktopVideoTextSplit}%` }}
              >
                <DailyMeetPanel
                  sessionId={sessionId}
                  open={dailyMeetOpen}
                  onOpenChange={setDailyMeetOpen}
                  mode="embedded"
                />
              </div>
            )}

          </div>

          {/* Coluna do Roteiro (Opcional/Lateral no Desktop) */}
          {!isMobile && (
            <DesktopScriptColumn
              viewportRef={scriptViewportRef}
              onScroll={() => { scrollSyncCurrentRef.current = scriptViewportRef.current?.scrollTop || 0; }}
              isDragging={isDraggingSideScript}
              sideScriptWidth={sideScriptWidth}
              onResizePointerDown={() => setIsDraggingSideScript(true)}
              lineCount={scriptLines.length}
              scriptFontSize={scriptFontSize}
              onFontSizeChange={changeScriptFontSize}
              onFontSizeExact={setScriptFontSizeExact}
              lineKeys={displayedScriptLines.map((l) => l.originalIndex)}
              renderLine={(i) => {
                const line = displayedScriptLines.find((l) => l.originalIndex === i);
                if (!line) return null;
                return (
                  <ScriptLineRow
                    key={i}
                    line={line}
                    currentLine={currentLine}
                    savedTakes={savedTakes}
                    customLoop={customLoop}
                    lockedLines={lockedLines}
                    liveDrafts={liveDrafts}
                    presenceUsers={presenceUsers}
                    userId={user?.id}
                    canTextControl={canTextControl}
                    scriptFontSize={scriptFontSize}
                    formatTimecode={formatLiveTimecode}
                    editingField={editingField}
                    editingDraftValue={editingDraftValue}
                    lineEditHistory={lineEditHistory}
                    lineRef={(el) => { lineRefs.current[i] = el; }}
                    onLineClick={handleLineClick}
                    onEditDraftChange={setEditingDraftValue}
                    onStartEdit={startInlineEdit}
                    onCancelEdit={cancelInlineEdit}
                    onSaveEdit={saveInlineEdit}
                  />
                );
              }}
            />
          )}
        </div>

        {/* 🎙️ Popup de Revisão do Diretor — apenas diretor vê */}
        <AnimatePresence>
          {reviewingTake && canApproveTake && (
            <DirectorReview
              mode="director"
              take={reviewingTake}
              isSaving={isSaving}
              isWaitingReview={isWaitingReview}
              onApprove={handleDirectorApprove}
              onReject={handleDirectorReject}
            />
          )}
        </AnimatePresence>

        {/* Rodapé de Controles (Apenas Mobile) */}
        {isMobile && (
          <MobileFooterControls
            controlsVisible={controlsVisible}
            isLooping={isLooping}
            isPlaying={isPlaying}
            recordingStatus={recordingStatus}
            micReady={micReady}
            isSaving={isSaving}
            loopSelectionMode={loopSelectionMode}
            customLoop={customLoop}
            videoTime={videoTime}
            videoDuration={videoDuration}
            formatTimecode={formatLiveTimecode}
            onVisibilityChange={setControlsVisible}
            onSeekBack={() => seek(-2)}
            onRecordOrStop={handleRecordOrStop}
            onPlayPause={handlePlayPause}
            onScrub={scrub}
            onLoop={handleLoopButton}
            onRecord={startCountdown}
            onStopRecord={handleStopRecording}
          />
        )}
        </div>

      <AnimatePresence>
        {isMobile && (
          <>
            <MobileMenu
              open={mobileMenuOpen}
              onOpenChange={setMobileMenuOpen}
              overlayZIndex={UI_LAYER_BASE.mobileDrawerOverlay}
              contentZIndex={UI_LAYER_BASE.mobileDrawerContent}
              items={mobileMenuItems}
            />

            <button
              onClick={() => setScriptOpen(true)}
              className="fixed bottom-20 left-5 h-12 w-12 rounded-full flex items-center justify-center shadow-lg z-[90] room-bg-elevated backdrop-blur-md border border-border room-text-primary"
            >
              <Edit3 className="w-5 h-5" />
            </button>

            <MobileScriptDrawer
              open={scriptOpen}
              onOpenChange={setScriptOpen}
              lines={displayedScriptLines}
              currentLine={currentLine}
              scriptFontSize={scriptFontSize}
              onFontSizeChange={changeScriptFontSize}
              savedTakes={savedTakes}
              lockedLines={lockedLines}
              liveDrafts={liveDrafts}
              userId={user?.id}
              presenceUsers={presenceUsers}
              canTextControl={canTextControl}
              formatTimecode={formatLiveTimecode}
              onLineClick={handleLineClick}
              onEditField={startInlineEdit}
            />
          </>
        )}
      </AnimatePresence>

      {/* Session Access Blocking */}
      {sessionAccessStatus && !sessionAccessStatus.canAccess && sessionAccessStatus.scheduledAt && (
        <SessionBlockedScreen
          scheduledAt={sessionAccessStatus.scheduledAt}
          minutesUntilStart={sessionAccessStatus.minutesUntilStart || 0}
          sessionTitle={sessionAccessStatus.sessionTitle || ""}
          productionName={production?.name}
        />
      )}

      {/* Director Entry Modal and Blocking Overlay */}
      {isDirector && !directorControlConfirmed && (
        <DirectorEntryModal
          isOpen={true}
          studioId={studioId}
          onConfirm={() => setDirectorControlConfirmed(true)}
        />
      )}
      
      {isControlBlocked && (
        <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-2">Aguardando Confirmação</h2>
            <p>O diretor precisa confirmar o controle antes de prosseguir.</p>
          </div>
        </div>
      )}

      {/* 🎙️ Hardware Setup Dialog */}
      <HardwareSetupDialog
        open={hardwareDialogOpen}
        onOpenChange={setHardwareDialogOpen}
        sessionId={sessionId || ""}
      />

    </div>
  );
}
