import { useParams, Link, useLocation } from "wouter";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  Mic,
  PhoneCall,
  Check,
  X,
  Home,
  Film,
  MessageSquare,
  Wrench,
  CreditCard,
  ChevronRight,
  RotateCcw,
  Plus,
  Send,
  Users,
  Play,
  Pause,
  Square,
  Repeat,
  SkipBack,
  SkipForward,
  Clock,
  ChevronUp,
  ChevronDown,
  Scroll,
  Edit,
  Filter,
} from "lucide-react";
import { HardwareSetupDialog } from "@studio/components/hardware/HardwareSetupDialog";
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
import { useRoomLogger } from "@studio/hooks/useRoomLogger";
import { useRoomPermissions } from "@studio/hooks/useRoomPermissions";
import { useWebSocketRoom } from "@studio/hooks/useWebSocketRoom";
import { TIMING, THRESHOLDS, VALIDATION } from "@studio/constants/timing";
import { validateMicrophoneBeforeRecording } from "@studio/lib/audio/microphoneValidation";
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
import { SimpleAudioSettings } from "@studio/components/audio/SimpleAudioSettings";
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
import { SafeDailyMeetPanel } from "@studio/components/video/SafeDailyMeetPanel";
import { VideoPlayer } from "@studio/components/room/video/VideoPlayer";
import { DirectorReview, ShortcutsDialog, DiscardTakeModal, TextControlPopup } from "@studio/components/room/modals";
import { RoomHeader } from "@studio/components/room/header/RoomHeader";
import { RoomHeaderActions } from "@studio/components/room/header/RoomHeaderActions";
import { MobileMenu, MobileScriptDrawer } from "@studio/components/room/mobile";
import { ScriptLineRow } from "@studio/components/room/script";
import { CountdownOverlay, DirectorConsole } from "@studio/components/room/overlays";
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
  getUserPermissions,
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
  | "stopping"
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
  
  const logger = useRoomLogger({
    sessionId: sessionId || "",
    userId: user?.id || "",
    studioId: studioId || ""
  });
  
  logger.info("RecordingRoom initialized", {
    sessionId,
    studioId,
    userId: user?.id,
    userRole: user?.role,
    studioRole,
    isDirector
  });
  const [, setLocation] = useLocation();
  const [hardwareDialogOpen, setHardwareDialogOpen] = useState(false);
  
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
  const { data: production, isLoading: productionLoading, error: productionError } = useProductionScript(session?.productionId || "");
  const { data: charactersList, isLoading: charactersLoading } = useCharactersList(session?.productionId || "");
  const { data: takes, isLoading: takesLoading } = useTakesList(sessionId || "");
  
  if (sessionError) {
    logger.error("Failed to load session data", { error: sessionError });
  }
  if (productionError) {
    logger.error("Failed to load production data", { error: productionError });
  }
  
  // useRecordingsList movido para abaixo com parâmetros corretos
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [textControlPopupOpen, setTextControlPopupOpen] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [deviceSettingsOpen, setDeviceSettingsOpen] = useState(false);
  const [recordingsOpen, setRecordingsOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("communication");

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
  
  // Carregar perfil persistido ao iniciar — key unificada: vhub_rec_profile_${sessionId}
  // actorName é sempre resetado para "" — o dublador deve digitar o nome manualmente em cada sessão
  useEffect(() => {
    const saved = localStorage.getItem(`vhub_rec_profile_${sessionId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRecordingProfile({ ...parsed, actorName: "", voiceActorName: "" });
        logger.debug("Loaded saved recording profile", { characterId: parsed.characterId });
      } catch (e) {
        logger.warn("Failed to load saved recording profile", { error: e });
      }
    }
  }, [sessionId]);
  const [micReady, setMicReady] = useState(false);
  const [micInitializing, setMicInitializing] = useState(false);
  const [micState, setMicState] = useState<any>(null);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>("idle");
  const [countdownValue, setCountdownValue] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirectorSaving, setIsDirectorSaving] = useState(false);
  const [pendingTake, setPendingTake] = useState<any>(null);
  const [reviewingTake, setReviewingTake] = useState<any>(null);
  const [directorReviewModalOpen, setDirectorReviewModalOpen] = useState(false);
  const [recordingsIsLoading, setRecordingsIsLoading] = useState<Set<string>>(new Set());
  const loopPreparationTimeoutRef = useRef<any>(null);
  const countdownTimerRef = useRef<any>(null);
  const [loopAnchorIndex, setLoopAnchorIndex] = useState<number | null>(null);
  const [textControllerUserIds, setTextControllerUserIds] = useState<Set<string>>(new Set());
  const [recordingsPlayerOpenId, setRecordingsPlayerOpenId] = useState<string | null>(null);
  const statusInfo = useMemo(() => {
    switch (recordingStatus) {
      case "countdown":
        return { label: "Contagem", badge: "bg-amber-500/15 text-amber-300 border border-amber-500/30" };
      case "recording":
        return { label: "GRAVANDO", badge: "bg-red-500/15 text-red-400 border border-red-500/30" };
      case "stopping":
        return { label: "Parando...", badge: "bg-orange-500/15 text-orange-300 border border-orange-500/30" };
      case "recorded":
        return { label: "Take registrado", badge: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" };
      default:
        return { label: "Aguardando", badge: "bg-muted/30 text-muted-foreground border border-white/10" };
    }
  }, [recordingStatus]);

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
  const [dailyStatus, setDailyStatus] = useState<"conectando" | "conectado" | "desconectado">("desconectado");
  const [loopRangeMeta, setLoopRangeMeta] = useState<{ startIndex: number; endIndex: number } | null>(null);
  
  // Estados de controle do script
  const [isEditingScript, setIsEditingScript] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string>("todos");
  
  // Estados do dropdown de takes
  const [takesDropdownOpen, setTakesDropdownOpen] = useState(false);

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

  // Permission calculations - usando função centralizada
  const hasTextControl = textControllerUserIds.has(String(user?.id ?? ""));
  const permissions = getUserPermissions(user, studioRole, hasTextControl, isDirector);
  
  // Extrair permissões individuais para compatibilidade com código existente
  const { 
    isPrivileged, 
    isDubber,
    canControlVideo, 
    canTextControl, 
    canManageAudio, 
    canApproveTake, 
    canViewOnlineUsers, 
    canAccessDashboard,
    canEditScript,
    canGrantTextControl,
    canNavigateScript,
    canSelectLoop,
    uiRole 
  } = permissions;
  
  const isDubberView = isDubber;
  const isDirectorView = !isDubberView;
  
  logger.debug("Permissions check", { 
    studioRole, 
    myId: user?.id, 
    hasTextControl, 
    isPrivileged,
    canControlVideo,
    canTextControl 
  });

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
      logger.error('Failed to verify session access', { error: err });
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
    return () => {
      releaseMicrophone();
      setMicState(null);
      setMicReady(false);
    };
  }, []);

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

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((msg: any) => {
    logger.debug("WS message received", { type: msg.type, data: msg });
          if (msg.type === "text-control:state" || msg.type === "text-control:set-controllers") {
            logger.debug("Text control update before state change", { currentControllers: Array.from(textControllerUserIds), myId: user?.id });
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
              video.play().catch((e) => logger.error("Failed to play video from WS", { error: e }));
            } else {
            }
            // Enviar ACK de confirmação
            emitVideoEvent("ack", { command: "play", userId: user?.id });
          } else {
            logger.warn("Video element not found");
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
                playCountdownBeep(audioContext, { volume: 0.15 });
              }
            } catch (error) {
              logger.warn("Failed to create AudioContext for countdown beep", { error });
            }
          } else if (msg.count === 0) {
            try {
              const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
              if (audioContext.state !== "closed") {
                playCountdownBeep(audioContext, { frequency: 660, duration: 0.18, volume: 0.10, type: "triangle" });
              }
            } catch (error) {
              logger.warn("Failed to create AudioContext for countdown final beep", { error });
            }
          }
        } else if (msg.type === "video:loop-preparing") {
          setLoopPreparing(true);
          const delayMs = Number(msg.delayMs || TIMING.LOOP_PREPARATION_MS);
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
          logger.debug("Text control state received", { type: msg.type, ids, myId: user?.id });
          const nextSet = new Set(Array.from(new Set(ids || []))) as Set<string>;
          setTextControllerUserIds(nextSet);
          // Log immediately with the new state
          logger.debug("After text-control update", { 
            controllers: Array.from(nextSet), 
            myId: user?.id,
            hasPermission: nextSet.has(String(user?.id ?? "")),
            studioRole,
            willHaveTextControl: hasUiPermission(resolveUiRole(studioRole, nextSet.has(String(user?.id ?? ""))), "text_control")
          });
        } else if (msg.type === "presence:update" || msg.type === "presence-sync") {
          // B1: Deduplicate by userId to prevent duplicates in TextControlPopup
          const deduped = Array.isArray(msg.users)
            ? Array.from(new Map(msg.users.map((u: any) => [String(u?.userId ?? u?.id ?? ""), u])).values())
            : [];
          setPresenceUsers(deduped);
        } else if (msg.type === "video:take-ready-for-review") {
          // Se sou diretor, abrir modal para revisão
          if (isDirector && msg.takeId && msg.audioUrl) {
            const reviewData = {
              id: msg.takeId,
              audioUrl: msg.audioUrl,
              duration: msg.duration,
              metrics: msg.metrics,
              lineIndex: msg.lineIndex,
              userId: msg.userId,
              character: msg.character,
              start: msg.start,
              isPreview: msg.isPreview || false,
              voiceActorId: msg.userId
            };
            setReviewingTake(reviewData);
            setDirectorReviewModalOpen(true);
            toast({ title: "Take para revisão", description: "Um novo take está pronto para sua aprovação." });
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
  }, [logger, textControllerUserIds, user?.id, setCountdownValue, setLockedLines, setLiveDrafts, setLoopPreparing, setLoopSilenceActive, setCustomLoop, setIsLooping, applyScriptLinePatch, pushEditHistory, setTextControllerUserIds, studioRole, setPresenceUsers, isDirector, setReviewingTake, setDirectorReviewModalOpen, toast, lastUploadedTakeId, setIsWaitingReview, setPendingTake, setRecordingStatus, reviewingTake]);

  // WebSocket connection using hook
  const { isConnected: wsConnected, send: wsSend } = useWebSocketRoom({
    sessionId: sessionId || "",
    studioId: studioId || "",
    userId: user?.id || "",
    onMessage: handleWebSocketMessage,
    enabled: Boolean(sessionId && studioId),
  });

  const emitVideoEvent = useCallback((type: string, data: any) => {
    wsSend({ type: `video:${type}`, ...data });
  }, [wsSend]);

  const emitTextControlEvent = useCallback((type: string, data: any) => {
    wsSend({ type, ...data });
  }, [wsSend]);

  const handleCharacterChange = useCallback((character: any) => {
    const updated = { 
      ...recordingProfile, 
      characterId: character.id, 
      characterName: character.name,
      actorName: recordingProfile?.actorName || "",
      voiceActorId: user?.id || '',
      voiceActorName: recordingProfile?.voiceActorName || "",
    };
    setRecordingProfile(updated);
    localStorage.setItem(`vhub_rec_profile_${sessionId}`, JSON.stringify(updated));
    emitVideoEvent("character-selected", { characterId: character.id, userId: user?.id });
    logAudioStep("character-selected", { characterId: character.id, characterName: character.name });
  }, [recordingProfile, sessionId, user?.id, emitVideoEvent, logAudioStep]);

  // Cleanup loop selection on unmount
  useEffect(() => {
    return () => {
      setLoopSelectionMode("idle");
    };
  }, []);

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

  // Obter personagens únicos do script
  const uniqueCharacters = useMemo(() => {
    const characters = new Set<string>();
    displayedScriptLines.forEach(line => {
      if (line.character && line.character.trim()) {
        characters.add(line.character.trim());
      }
    });
    return Array.from(characters).sort();
  }, [displayedScriptLines]);

  // Filtrar linhas por personagem selecionado
  const filteredScriptLines = useMemo(() => {
    if (selectedCharacter === "todos") {
      return displayedScriptLines;
    }
    return displayedScriptLines.filter(line => 
      line.character && line.character.trim() === selectedCharacter
    );
  }, [displayedScriptLines, selectedCharacter]);

  // Sincronização de rolagem com vídeo (teleprompter)
  useEffect(() => {
    if (!scriptViewportRef.current) return;

    const currentLineElement = lineRefs.current[currentLine];
    const viewport = scriptViewportRef.current;
    
    if (currentLineElement && viewport) {
      // Calcular posição para centralizar a linha atual
      const lineTop = currentLineElement.offsetTop;
      const lineHeight = currentLineElement.offsetHeight;
      const viewportHeight = viewport.clientHeight;
      
      // Posicionar a linha atual a 40% do topo da viewport (teleprompter style)
      const targetScrollTop = lineTop - (viewportHeight * 0.4) + (lineHeight / 2);
      
      // Rolagem suave
      viewport.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth'
      });
    }
  }, [currentLine]);

  // Fechar dropdown de takes ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (takesDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.takes-dropdown')) {
          setTakesDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [takesDropdownOpen]);

  const { data: takesList = [] } = useTakesList(sessionId);
  const recordingsListParams = useMemo(() => ({
    page: 1,
    pageSize: 10,
    sortBy: "createdAt" as const,
    sortDir: "desc" as const,
    search: "",
  }), []);
  const {
    data: recordingsResponse,
    error: recordingsError,
    isError: hasRecordingsError,
  } = useRecordingsList(sessionId, recordingsListParams);
  const recordingsList = recordingsResponse?.items || [];
  const normalizedRecordings = useMemo(() => {
    return Array.isArray(recordingsList) ? recordingsList : [];
  }, [recordingsList]);
  const scopedRecordings = useMemo(() => {
    if (!onlySelectedCharacter || !recordingProfile?.characterName) {
      return normalizedRecordings;
    }

    const targetCharacter = recordingProfile.characterName.trim().toLowerCase();
    if (!targetCharacter) {
      return normalizedRecordings;
    }

    return normalizedRecordings.filter((take: any) => {
      const character = String(take?.characterName || take?.character || "").trim().toLowerCase();
      return character === targetCharacter;
    });
  }, [normalizedRecordings, onlySelectedCharacter, recordingProfile?.characterName]);

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
    const canDeletePermanently = rawRole === "owner" || rawRole === "master";
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
    const currentId = String(recordingsPlayerOpenId || "");
    if (!currentId) return;
    const audio = recordingRowAudioRefs.current[currentId];
    if (!audio) return;
    audio.playbackRate = 1.0;
  }, [recordingsPlayerOpenId]);
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
      map.set(String(presence.userId), {
        ...presence,
        name: presence.displayName || presence.fullName || presence.name || presence.userId,
      });
    });
    return Array.from(map.values());
  }, [presenceUsers, canViewOnlineUsers]);
  const textControlCandidates = useMemo(() => {
    // Try to get candidates from presence users first (already deduped at source)
    let candidates = presenceUsers.length > 0
      ? presenceUsers.filter((presence: any) => canReceiveTextControl(presence?.role))
      : [];
    
    // If no presence users, fall back to room users
    if (candidates.length === 0 && roomUsers.length > 0) {
      candidates = roomUsers.filter((u: any) => canReceiveTextControl(u?.role));
    }
    
    // Extra safety dedup by userId
    const seen = new Set<string>();
    return candidates.filter((c: any) => {
      const id = String(c?.userId ?? c?.id ?? "");
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [presenceUsers, roomUsers]);

  const mobileMenuItems = useMemo(() => [
    {
      icon: <Monitor className="w-5 h-5" />,
      iconBg: "bg-blue-500/10 text-blue-500",
      title: "Configurar Áudio",
      subtitle: "Microfone e saída",
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
      // Mostrar tempo da fala inicial (não do preroll)
      const displayStart = loopRangeMeta && scriptLines[loopRangeMeta.startIndex] 
        ? scriptLines[loopRangeMeta.startIndex].start 
        : customLoop.start;
      const range = loopRangeMeta ? ` · Linhas ${loopRangeMeta.startIndex + 1}-${loopRangeMeta.endIndex + 1}` : "";
      return `Loop ativo ${formatLiveTimecode(displayStart)} - ${formatLiveTimecode(customLoop.end)}${range}`;
    }
    return null;
  }, [customLoop, loopSelectionMode, loopPreparing, loopSilenceActive, loopRangeMeta, scriptLines, formatLiveTimecode]);

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
            // Restart 3s before the loop start for preroll
            const restartAt = Math.max(0, range.start - 3);
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

  // Reconectar microfone quando o dispositivo de entrada mudar
  useEffect(() => {
    if (!micReady || !deviceSettings.inputDeviceId) return;
    
    const reconnectMicrophone = async () => {
      try {
        // Liberar microfone atual
        if (micState) {
          await releaseMicrophone();
          setMicState(null);
        }
        
        // Reconectar com novo dispositivo
        const newMicState = await requestMicrophone(
          deviceSettings.voiceCaptureMode,
          deviceSettings.inputDeviceId === "default" ? undefined : deviceSettings.inputDeviceId
        );
        
        setMicState(newMicState);
        setGain(newMicState, deviceSettings.inputGain);
        
        const deviceName = deviceSettings.inputDeviceId === "default" 
          ? "Microfone padrão" 
          : `Microfone ${deviceSettings.inputDeviceId.slice(0, 8)}`;
        
        toast({ 
          title: "Microfone alterado", 
          description: `${deviceName} está ativo` 
        });
      } catch (error) {
        console.error("Erro ao reconectar microfone:", error);
        toast({ 
          title: "Erro ao alterar microfone", 
          description: "Não foi possível conectar ao dispositivo selecionado",
          variant: "destructive" 
        });
      }
    };
    
    // Apenas reconectar se o dispositivo realmente mudou
    if (micState) {
      const currentTrack = micState.stream.getAudioTracks()[0];
      const currentDeviceId = currentTrack?.getSettings()?.deviceId;
      
      if (deviceSettings.inputDeviceId === "default" && currentDeviceId !== deviceSettings.inputDeviceId) {
        reconnectMicrophone();
      } else if (deviceSettings.inputDeviceId !== "default" && currentDeviceId !== deviceSettings.inputDeviceId) {
        reconnectMicrophone();
      }
    }
  }, [deviceSettings.inputDeviceId, micReady, micState, deviceSettings.voiceCaptureMode, deviceSettings.inputGain, toast]);

  // Aplicar ganho do microfone em tempo real
  useEffect(() => {
    if (!micState) return;
    
    try {
      setGain(micState, deviceSettings.inputGain);
      console.log(`[Audio] Ganho aplicado: ${(deviceSettings.inputGain * 100).toFixed(0)}%`);
    } catch (error) {
      console.error("[Audio] Erro ao aplicar ganho:", error);
    }
  }, [deviceSettings.inputGain, micState]);

  // Aplicar volume de monitor em tempo real
  useEffect(() => {
    const mediaElements = [
      videoRef.current,
      previewAudioRef.current,
      recordingsPreviewAudioRef.current
    ].filter(Boolean) as HTMLMediaElement[];
    
    mediaElements.forEach(media => {
      if (media) {
        media.volume = deviceSettings.monitorVolume;
        console.log(`[Audio] Volume de monitor aplicado: ${(deviceSettings.monitorVolume * 100).toFixed(0)}% para ${media.tagName.toLowerCase()}`);
      }
    });
  }, [deviceSettings.monitorVolume]);

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
    // Use configured profile or fall back to minimal user data so upload never hard-fails
    const effectiveProfile = recordingProfile ?? {
      actorName: user?.displayName || user?.fullName || "Ator",
      characterId: "",
      characterName: "Sem Personagem",
      voiceActorId: user?.id || "",
      voiceActorName: user?.displayName || user?.fullName || "Ator",
    };
    logAudioStep("upload-started", { lineIndex: input.lineIndex, durationSeconds: input.durationSeconds, autoApprove: input.autoApprove });
    const lineText = scriptLines[input.lineIndex]?.text || "";
    const charName = (effectiveProfile.characterName || "personagem").replace(/\s+/g, "").toUpperCase();
    const actorFullName = (effectiveProfile.actorName || effectiveProfile.voiceActorName || "ator").replace(/\s+/g, "").toUpperCase();
    const videoSecs = Math.round(input.startTimeSeconds);
    const hh = String(Math.floor(videoSecs / 3600)).padStart(2, "0");
    const mm = String(Math.floor((videoSecs % 3600) / 60)).padStart(2, "0");
    const ss = String(videoSecs % 60).padStart(2, "0");
    const filename = `${charName}_${actorFullName}_${hh}${mm}${ss}.wav`;
    const formData = new FormData();
    formData.append("audio", input.wavBlob, filename);
    formData.append("lineText", lineText.slice(0, 200));
    formData.append("characterId", effectiveProfile.characterId);
    formData.append("voiceActorId", user?.id || effectiveProfile.voiceActorId || "");
    formData.append("voiceActorName", effectiveProfile.actorName || effectiveProfile.voiceActorName || "");
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
    // Invalidate and immediately refetch both takes and recordings queries
    await queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "takes"], exact: false });
    await queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "recordings"], exact: false });
    // Force immediate refetch of recordings to show the new take in the director's tab
    await queryClient.refetchQueries({ queryKey: ["/api/sessions", sessionId, "recordings"], exact: false, type: "active" });
    logAudioStep("upload-integrity-check", { takeId: take.id, persisted: true });
    setRecordingAvailability((prev) => ({ ...prev, [String(take.id || "")]: "available" }));
    return take;
  }, [recordingProfile, sessionId, scriptLines, user?.id, user?.displayName, user?.fullName, queryClient, logAudioStep]);

  const initializeRecordingMicrophone = useCallback(async (): Promise<MicrophoneState | null> => {
    if (micState) return micState;
    if (micInitializing) {
      console.warn("[Recording] Já existe uma inicialização em andamento, aguardando...");
      return null;
    }

    setMicInitializing(true);
    try {
      console.log("[Recording] Inicializando microfone...");
      const nextMicState = await requestMicrophone(
        deviceSettings.voiceCaptureMode,
        deviceSettings.inputDeviceId === "default" ? undefined : deviceSettings.inputDeviceId
      );
      setMicState(nextMicState);
      setGain(nextMicState, deviceSettings.inputGain);
      setMicReady(true);
      console.log("[Recording] Microfone inicializado com sucesso");
      return nextMicState;
    } catch (error: any) {
      console.error("[Recording] Falha ao inicializar microfone sob demanda:", {
        name: error?.name,
        message: error?.message,
        constraintName: error?.constraint,
        deviceId: deviceSettings.inputDeviceId,
        mode: deviceSettings.voiceCaptureMode,
      });
      setMicState(null);
      setMicReady(false);
      
      let errorDescription = error?.message || "Permita o acesso ao microfone e tente novamente.";
      
      // Se já for uma mensagem personalizada, use-a
      if (error?.message?.includes('Permissão de microfone negada')) {
        errorDescription = error.message;
      } else if (error?.name === 'NotAllowedError') {
        errorDescription = "Clique no ícone de cadeado na barra de endereço e permita o acesso ao microfone.";
      } else if (error?.name === 'NotFoundError') {
        errorDescription = "Nenhum microfone encontrado. Conecte um dispositivo de áudio.";
      } else if (error?.name === 'NotReadableError') {
        errorDescription = "Microfone já está em uso por outro aplicativo.";
      } else if (error?.name === 'OverconstrainedError') {
        errorDescription = "O microfone selecionado não suporta as configurações solicitadas.";
      }
      
      toast({
        title: "Microfone não pronto",
        description: errorDescription,
        variant: "destructive",
      });
      return null;
    } finally {
      setMicInitializing(false);
    }
  }, [deviceSettings.inputDeviceId, deviceSettings.inputGain, deviceSettings.voiceCaptureMode, micState, micInitializing, toast]);

  const startCountdown = useCallback(async () => {
    if (recordingStatus === "recording" || recordingStatus === "countdown") {
      toast({ title: "Gravação em andamento", description: "Pare a gravação atual antes de iniciar outra.", variant: "destructive" });
      return;
    }

    if (recordingStatus === "recorded" || recordingStatus === "stopped") {
      if (pendingTake?.url) URL.revokeObjectURL(pendingTake.url);
      setPendingTake(null);
      setReviewingTake(null);
      setDirectorReviewModalOpen(false);
      setRecordingStatus("idle");
    }
    
    const activeMicState = micState ?? await initializeRecordingMicrophone();
    if (!activeMicState) return;
    
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
    const prerollStart = Math.max(0, currentLineTime - THRESHOLDS.VIDEO_PREROLL_S);
    
    video.currentTime = prerollStart;
    emitVideoEvent("seek", { currentTime: prerollStart });
    logAudioStep("countdown-started", { initiatorUserId: user?.id, startTime: prerollStart, lineTime: currentLineTime });
    
    // Start UI countdown and play video
    setCountdownValue(3);
    setRecordingStatus("countdown");
    
    video.play().catch((error) => {
      logger.error("Failed to play video", { error });
      toast({ title: "Erro na reprodução", description: "Não foi possível reproduzir o vídeo.", variant: "destructive" });
    });
    
    emitVideoEvent("play", { currentTime: prerollStart });
    emitVideoEvent("countdown-start", { initiatorUserId: user?.id, count: 3 });
    
    if (countdownTimerRef.current) window.clearInterval(countdownTimerRef.current);
    let count = 3;
    
    countdownTimerRef.current = window.setInterval(() => {
      count -= 1;
      const nextCount = Math.max(0, count);
      setCountdownValue(nextCount);
      emitVideoEvent("countdown-tick", { count: nextCount, initiatorUserId: user?.id });
      
      if (nextCount === 0) {
        window.clearInterval(countdownTimerRef.current!);
        countdownTimerRef.current = null;
        if (activeMicState) {
          startCapture(activeMicState).then(() => setRecordingStatus("recording"));
        } else {
          logger.warn("Starting recording without micState");
          setRecordingStatus("idle");
        }
      }
    }, TIMING.COUNTDOWN_BEEP_INTERVAL_MS);
  }, [recordingStatus, micState, pendingTake, initializeRecordingMicrophone, emitVideoEvent, logAudioStep, user?.id, recordingProfile, currentLine, scriptLines, mySessionRole, toast]);

  const handleDirectorApprove = useCallback(async () => {
    if (!reviewingTake) return;
    const takeId = reviewingTake.takeId;
    // Close popup immediately — server responds fast now (Supabase upload is background)
    setReviewingTake(null);
    try {
      setIsDirectorSaving(true);
      await authFetch(`/api/takes/${takeId}/prefer`, { method: "POST" });
      emitVideoEvent("take-decision", { takeId, decision: "approved", userId: user?.id });
      toast({ title: "Take Aprovado", description: "O dublador foi notificado." });
    } catch (err) {
      toast({ title: "Erro ao aprovar", variant: "destructive" });
    } finally {
      setIsDirectorSaving(false);
    }
  }, [reviewingTake, emitVideoEvent, user?.id, toast]);

  const formatDurationLabel = useCallback((seconds: number) => {
    const s = Math.max(0, Math.floor(seconds));
    const m = Math.floor(s / 60);
    const sec = String(s % 60).padStart(2, "0");
    return m > 0 ? `${m}m ${sec}s` : `${s}s`;
  }, []);

  const handleDirectorReject = useCallback(async () => {
    if (!reviewingTake) return;
    const takeId = reviewingTake.takeId;
    // Close popup immediately
    setReviewingTake(null);
    try {
      setIsDirectorSaving(true);
      await authFetch(`/api/takes/${takeId}/discard`, {
        method: "POST",
        body: JSON.stringify({ confirm: true }),
      });
      emitVideoEvent("take-decision", { takeId, decision: "rejected", userId: user?.id });
      toast({ title: "Take Rejeitado", description: "O dublador foi notificado para regravar." });
    } catch (err) {
      toast({ title: "Erro ao rejeitar", variant: "destructive" });
    } finally {
      setIsDirectorSaving(false);
    }
  }, [reviewingTake, emitVideoEvent, user?.id, toast]);

  const handleStopRecording = useCallback(async () => {
    console.log("[StopRecording] Iniciando parada", { recordingStatus, micState: !!micState, micStateType: typeof micState });
    
    // Ser mais permissivo - permitir parada em mais estados para evitar travamento
    const validStates = ["recording", "countdown", "stopping"];
    if (!validStates.includes(recordingStatus)) {
      console.warn("[StopRecording] Estado não ideal para parar, mas permitindo", { recordingStatus, validStates });
      // Não return - permitir mesmo em estados não ideais para evitar travamento
    }
    
    if (!micState) {
      console.error("[StopRecording] micState não disponível - isso pode causar problemas", { micState });
      // Tentar continuar mesmo sem micState para não travar o botão
      console.log("[StopRecording] Tentando parar mesmo sem micState...");
    } else {
      console.log("[StopRecording] micState disponível, prosseguindo normalmente");
    }
    
    // Mudar para estado de transição imediatamente
    console.log("[StopRecording] Mudando para estado 'stopping'");
    setRecordingStatus("stopping");
    
    console.log("[StopRecording] Limpando timers...");
    if (countdownTimerRef.current) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    const pendingCapture = (countdownTimerRef as any)._captureTimeout;
    if (pendingCapture) {
      window.clearTimeout(pendingCapture);
      (countdownTimerRef as any)._captureTimeout = null;
    }
    setCountdownValue(0);
    
    console.log("[StopRecording] Chamando stopCapture...");
    logAudioStep("stop-requested", { state: micState });
    
    try {
      // Só chamar stopCapture se micState estiver disponível
      if (!micState) {
        console.warn("[StopRecording] Sem micState, limpando estado e saindo");
        setRecordingStatus("idle");
        return;
      }

      const result = await stopCapture(micState);
      console.log("[StopRecording] stopCapture retornou", { samplesLength: result.samples.length, duration: result.durationSeconds });
      
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

      // Notificar diretor que há um take para revisão (sem upload automático)
      emitVideoEvent("take-ready-for-review", { 
        takeId: localTakeData.id, 
        audioUrl: localTakeData.url, 
        duration: result.durationSeconds, 
        metrics, 
        lineIndex: currentLine, 
        userId: user?.id, 
        character: recordingProfile?.characterName || "Personagem", 
        start: Number(videoRef.current?.currentTime || 0),
        isPreview: true // Indica que é preview local
      });
      
      toast({ title: "Gravação concluída", description: "Take enviado para aprovação do diretor." });
    } catch (error: any) {
      console.error("[StopRecording] Erro ao parar gravação:", error);
      toast({ 
        title: "Erro ao parar gravação", 
        description: error?.message || "Ocorreu um erro ao processar a gravação.", 
        variant: "destructive" 
      });
      // Garantir que sempre volte para idle em caso de erro
      setRecordingStatus("idle");
    }
  }, [recordingStatus, micState, emitVideoEvent, logAudioStep, toast, isLooping, customLoop, currentLine, uploadTakeForDirector, user?.id, recordingProfile, pendingTake]);

  const handleApproveLocalTake = useCallback(async (take: any) => {
    if (!take) return;
    
    try {
      setIsDirectorSaving(true);
      
      // Fazer upload para Supabase
      const uploadedTake = await uploadTakeForDirector({ 
        wavBlob: take.blob, 
        durationSeconds: take.durationSeconds, 
        qualityScore: take.metrics.score, 
        autoApprove: true, 
        lineIndex: take.lineIndex, 
        startTimeSeconds: take.startTimeSeconds 
      });

      // Notificar todos que o take foi aprovado
      emitVideoEvent("take-decision", { 
        takeId: take.id, 
        decision: "approved", 
        userId: user?.id,
        finalTakeId: uploadedTake.id
      });

      // Limpar preview local
      if (take.url) URL.revokeObjectURL(take.url);
      setPendingTake(null);
      setReviewingTake(null);
      
      toast({ title: "Take Aprovado!", description: "Áudio salvo no Supabase e adicionado à lista de takes." });
    } catch (error: any) {
      console.error("Failed to approve take:", error);
      toast({ title: "Erro ao aprovar", description: "Falha ao salvar take no Supabase.", variant: "destructive" });
    } finally {
      setIsDirectorSaving(false);
    }
  }, [uploadTakeForDirector, emitVideoEvent, user?.id, toast]);

  const handleRejectLocalTake = useCallback(async (take: any) => {
    if (!take) return;
    
    try {
      // Notificar dublador que o take foi rejeitado
      emitVideoEvent("take-decision", { 
        takeId: take.id, 
        decision: "rejected", 
        userId: user?.id,
        targetUserId: take.voiceActorId
      });

      // Apagar preview local
      if (take.url) URL.revokeObjectURL(take.url);
      setPendingTake(null);
      setReviewingTake(null);
      
      toast({ title: "Take Rejeitado", description: "Áudio descartado. Solicitando nova gravação." });
    } catch (error: any) {
      console.error("Failed to reject take:", error);
      toast({ title: "Erro ao rejeitar", description: "Falha ao processar rejeição.", variant: "destructive" });
    }
  }, [emitVideoEvent, user?.id, toast]);

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
    // Usuários privilegiados (director, admin, owner) têm acesso total
    // Dubladores precisam de canTextControl para navegar
    if (!isPrivileged && !canTextControl && loopSelectionMode === "idle") return;
    const line = scriptLines[index];
    if (!line) return;

    if (loopSelectionMode === "selecting-start") {
      // Começar 3 segundos antes da fala inicial
      const adjustedStart = Math.max(0, line.start - 3);
      setCustomLoop({ start: adjustedStart, end: line.end || (line.start + 2) });
      setLoopAnchorIndex(index);
      setLoopSelectionMode("selecting-end");
      toast({ title: "Início selecionado", description: "Clique na fala final do loop." });
    } else if (loopSelectionMode === "selecting-end") {
      const startIndex = loopAnchorIndex ?? index;
      const normalizedStartIndex = Math.min(startIndex, index);
      const normalizedEndIndex = Math.max(startIndex, index);
      const startLine = scriptLines[normalizedStartIndex] || line;
      const endLine = scriptLines[normalizedEndIndex] || line;
      
      // Manter preroll de 3s no início
      const start = Math.max(0, startLine.start - 3);
      const baseEnd = endLine.end || (endLine.start + 2);
      
      // Posroll simples de 2 segundos
      const end = baseEnd + 2;
      
      setCustomLoop({ start, end });
      setLoopRangeMeta({ startIndex: normalizedStartIndex, endIndex: normalizedEndIndex });
      setLoopSelectionMode("idle");
      setIsLooping(true);
      toast({ title: "Loop definido", description: "Preroll de 3s e posroll de 2s aplicados." });
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
  }, [isPrivileged, canTextControl, scriptLines, loopSelectionMode, toast, emitVideoEvent, loopAnchorIndex, logFeatureAudit]);

  const handleLoopButton = useCallback(async () => {
    if (!canControlVideo) return;
    if (loopSelectionMode !== "idle" || customLoop) {
      setLoopSelectionMode("idle");
      setIsLooping(false);
      setCustomLoop(null);
      setLoopRangeMeta(null);
      setLoopAnchorIndex(null);
      // Broadcast loop cancellation so all clients (dubbers) also stop looping
      emitVideoEvent("loop:cancel", {});
    } else {
      // Start loop selection mode
      setLoopSelectionMode("selecting-start");
      toast({ title: "Modo Loop", description: "Clique na primeira fala do loop." });
    }
  }, [canControlVideo, loopSelectionMode, customLoop, loopAnchorIndex, toast, emitVideoEvent]);

  const handleSkipBackward = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      const newTime = Math.max(0, video.currentTime - 3);
      video.currentTime = newTime;
      emitVideoEvent("seek", { currentTime: newTime });
    }
  }, [emitVideoEvent]);

  const handleSkipForward = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      const newTime = Math.min(video.duration || 0, video.currentTime + 3);
      video.currentTime = newTime;
      emitVideoEvent("seek", { currentTime: newTime });
    }
  }, [emitVideoEvent]);

  const handleBack = useCallback(() => {
    const next = !onlySelectedCharacter;
    setOnlySelectedCharacter(next);
    logFeatureAudit("room.character_filter", "toggled", { enabled: next, character: recordingProfile?.characterName || null });
  }, [onlySelectedCharacter, recordingProfile, logFeatureAudit]);

  const handleToggleAutoFollow = useCallback(() => {
    const next = !scriptAutoFollow;
    setScriptAutoFollow(next);
    if (next) syncScrollToCurrentVideoTime();
    logFeatureAudit("room.scroll", "mode_changed", { mode: next ? "automatic" : "manual" });
  }, [scriptAutoFollow, syncScrollToCurrentVideoTime, logFeatureAudit]);

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

  const handleRecordOrStop = useCallback(async () => {
    console.log("[RecordOrStop] Botão REC clicado", { 
      recordingStatus, 
      micState: !!micState, 
      micStateType: typeof micState,
      timestamp: new Date().toISOString()
    });
    
    if (recordingStatus === "recording" || recordingStatus === "countdown" || recordingStatus === "stopping") {
      console.log("[RecordOrStop] Estado de gravação ativo, chamando handleStopRecording...", { 
        recordingStatus,
        motivo: "Usuário clicou para parar"
      });
      try {
        await handleStopRecording();
        console.log("[RecordOrStop] handleStopRecording concluído com sucesso");
      } catch (error) {
        console.error("[RecordOrStop] Erro em handleStopRecording:", error);
      }
    } else {
      console.log("[RecordOrStop] Estado inativo, iniciando nova gravação...", { 
        recordingStatus,
        motivo: "Usuário clicou para gravar"
      });
      try {
        await startCountdown();
        console.log("[RecordOrStop] startCountdown concluído com sucesso");
      } catch (error) {
        console.error("[RecordOrStop] Erro em startCountdown:", error);
      }
    }
  }, [recordingStatus, micState, handleStopRecording, startCountdown]);

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
      const streamUrl = await getTakeStreamUrl(take);
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

  const handleActorNameChange = useCallback((name: string) => {
    setRecordingProfile((prev: any) => {
      const updated = { ...(prev || {}), actorName: name, voiceActorName: name };
      localStorage.setItem(`vhub_rec_profile_${sessionId}`, JSON.stringify(updated));
      return updated;
    });
  }, [sessionId]);

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
      else if (code === shortcuts.record) { e.preventDefault(); if (recordingStatus !== "recording" && recordingStatus !== "countdown") void startCountdown(); }
      else if (code === shortcuts.stop) { e.preventDefault(); if (recordingStatus === "recording" || recordingStatus === "countdown") void handleStopRecording(); else handleStopPlayback(); }
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

  console.log("[RecordingRoom] Iniciando renderização principal");
  
  if (sessionLoading || productionLoading) {
    console.log("[RecordingRoom] Renderizando loading state");
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
      className={cn(
        "recording-room h-screen w-screen overflow-hidden flex flex-col select-none relative bg-gray-50 text-gray-900",
        recordingStatus === "recording" && "ring-2 ring-red-400"
      )}
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

      <SimpleAudioSettings
        open={deviceSettingsOpen}
        onClose={() => setDeviceSettingsOpen(false)}
        initialMicDevice={deviceSettings.inputDeviceId}
        initialOutputDevice={deviceSettings.outputDeviceId}
        initialGain={Math.round(deviceSettings.inputGain * 100)}
        onSave={(settings) => {
          setDeviceSettings({
            ...deviceSettings,
            inputDeviceId: settings.micDevice,
            outputDeviceId: settings.outputDevice,
            inputGain: settings.gain / 100,
          });
        }}
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
          recordingsResponse={recordingsResponse}
          scopedRecordings={scopedRecordings}
          recordingAvailability={recordingAvailability}
          recordingsIsLoading={recordingsIsLoading}
          recordingsPreviewId={recordingsPreviewId}
          recordingsPlayerOpenId={recordingsPlayerOpenId}
          recordingPlayableUrls={recordingPlayableUrls}
          optimisticRemovingTakeIds={optimisticRemovingTakeIds}
          audioRef={recordingsPreviewAudioRef}
          rowAudioRefs={recordingRowAudioRefs}
          getTakeStreamUrl={getTakeStreamUrl}
          onClose={() => setRecordingsOpen(false)}
          onPlayTake={handlePlayRecordingTake}
          onDownloadTake={handleDownloadRecordingTake}
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

      {/* ===== SESSION INFO BAR ===== */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-500">
            <span className="font-medium">Session:</span> {session?.title || "Session"} <span className="mx-2">|</span> <span className="font-medium">Project:</span> {production?.name || "Project"}
          </p>
          <div className="flex items-center gap-3">
            <span
              title={wsConnected ? "Conectado" : "Reconectando..."}
              className={cn("w-2 h-2 rounded-full shrink-0 transition-colors", wsConnected ? "bg-green-500" : "bg-yellow-400 animate-pulse")}
            />
            {isDirector && (
              <button
                onClick={() => setTextControlPopupOpen(true)}
                className="h-8 px-3 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-sm font-medium flex items-center gap-2"
                title="Gerenciar controle de texto e vídeo dos dubladores"
              >
                <Users className="w-4 h-4" />
                Controle de Dubladores
                {textControllerUserIds.size > 0 && (
                  <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center" title={`${textControllerUserIds.size} dublador(es) com controle`}>
                    {textControllerUserIds.size}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setDeviceSettingsOpen(true)}
              className="h-8 px-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Configurar Áudio
            </button>
            <button onClick={handleBack} className="h-8 px-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium">Sair</button>
          </div>
        </div>
        
        {/* Compact Takes and Participants */}
        <div className="flex items-center gap-6">
          {/* Takes Panel */}
          <div className="relative takes-dropdown">
            <button
              onClick={() => setTakesDropdownOpen(!takesDropdownOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-700">Takes</h3>
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">[{scopedRecordings.length || 0}]</span>
              </div>
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${takesDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            {takesDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  {scopedRecordings.length > 0 ? (
                    scopedRecordings.slice(0, 5).map((take: any, index: number) => (
                      <div key={take.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                          {take.characterName?.charAt(0) || "T"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">Take #{take.takeNumber || index + 1}</span>
                            <span className="text-xs text-gray-500">{take.characterName}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatTimecodeByFormat(take.startTimeSeconds || 0, "HH:MM:SS", 24)} • {formatDurationLabel(take.durationSeconds || 0)}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Play take
                            const audio = new Audio(getTakeStreamUrl(take));
                            audio.play().catch(() => {});
                          }}
                          className="w-6 h-6 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors"
                        >
                          <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Nenhum take gravado ainda
                    </div>
                  )}
                  {scopedRecordings.length > 5 && (
                    <div className="text-center py-2 text-xs text-gray-400 border-t border-gray-100">
                      Mais {scopedRecordings.length - 5} takes não mostrados
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== MAIN 2-COLUMN LAYOUT ===== */}
      <div className="flex-1 flex overflow-hidden bg-gray-50">
        {/* LEFT COLUMN - 60% */}
        <div className="w-[60%] flex flex-col border-r border-gray-100 bg-white">
          {/* Video Player */}
          <div className="flex-[1.5] p-4 flex flex-col">
            <div className="relative flex-1 bg-black rounded-lg overflow-hidden shadow-lg">
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
                loopInfo={loopInfo}
                className="w-full h-full"
              />
              {/* Timecode Overlay */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white font-mono text-sm px-3 py-1 rounded">
                {formatTimecodeByFormat(videoTime, "HH:MM:SS:FF", 24)}
              </div>
            </div>

            {/* Director Controls / Dubber Status */}
            <div className="mt-4 space-y-3">
              {isDirectorView ? (
                <>
                  {/* Director Controls */}
                  <div className="flex items-center justify-center gap-3">
                    {/* Skip Backward 3s */}
                    <button
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      onClick={handleSkipBackward}
                      title="Voltar 3 segundos"
                    >
                      <SkipBack className="w-4 h-4 text-gray-700" />
                    </button>
                    {/* Play */}
                    <button
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? <Pause className="w-4 h-4 text-gray-700" /> : <Play className="w-4 h-4 text-gray-700" />}
                    </button>
                    {/* Recording Button */}
                    <button
                      onClick={handleRecordOrStop}
                      className={cn(
                        "w-10 h-10 rounded-lg border flex items-center justify-center transition-colors",
                        recordingStatus === "recording" || recordingStatus === "countdown" || recordingStatus === "stopping"
                          ? "bg-red-500 border-red-500 text-white animate-pulse" 
                          : "border-gray-300 hover:bg-gray-50"
                      )}
                      title={recordingStatus === "recording" ? "Parar gravação" : recordingStatus === "countdown" ? "Cancelar contagem" : recordingStatus === "stopping" ? "Parando..." : "Iniciar gravação"}
                    >
                      {recordingStatus === "recording" || recordingStatus === "countdown" || recordingStatus === "stopping" ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4 text-gray-700" />}
                    </button>
                    {/* Skip Forward 3s */}
                    <button
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      onClick={handleSkipForward}
                      title="Avançar 3 segundos"
                    >
                      <SkipForward className="w-4 h-4 text-gray-700" />
                    </button>
                    {/* Loop */}
                    <button
                      className={cn(
                        "w-10 h-10 rounded-lg border flex items-center justify-center transition-colors",
                        isLooping ? "bg-blue-500 border-blue-500 text-white" : "border-gray-300 hover:bg-gray-50"
                      )}
                      onClick={handleLoopButton}
                    >
                      <Repeat className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                /* Dubber Status */
                <div className="flex flex-col items-center gap-3 py-2">
                  <span className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium animate-pulse",
                    recordingStatus === "recording" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
                  )}>
                    <div className={cn("w-2 h-2 rounded-full", recordingStatus === "recording" ? "bg-red-500" : "bg-gray-400")} />
                    {recordingStatus === "recording" ? "GRAVANDO" : "AGUARDANDO"}
                  </span>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Mic className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Daily Meet Panel - Retrátil sem desconectar */}
          <div className="h-80 flex flex-col border-t border-gray-100 min-h-0">
            {/* Panel Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-blue-500" />
                <h2 className="font-semibold text-gray-900">Chamada de Vídeo</h2>
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  dailyStatus === "conectado" ? "bg-green-500" : "bg-yellow-400 animate-pulse"
                )} />
              </div>
              <div className="text-xs text-gray-500">
                Use os controles do painel
              </div>
            </div>
            
            {/* Daily Meet Content - Com Error Boundary */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full">
                {sessionId ? (
                  <div className="h-full">
                    <SafeDailyMeetPanel
                      key={`daily-${sessionId}`}
                      sessionId={sessionId}
                      mode="embedded"
                      open={dailyMeetOpen}
                      onOpenChange={setDailyMeetOpen}
                      onStatusChange={setDailyStatus}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <PhoneCall className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">Aguardando sessão...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - 40% */}
        <div className="w-[40%] flex flex-col bg-white">
          {/* Script Section */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Script Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Script</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => changeScriptFontSize(-1)} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors text-xs font-bold">A-</button>
                <button onClick={() => changeScriptFontSize(1)} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors text-sm font-bold">A+</button>
              </div>
            </div>
            {/* Script Lines */}
            <div ref={scriptViewportRef} className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredScriptLines.map((line) => {
                const i = line.originalIndex;
                const isActive = i === currentLine;
                const isDone = savedTakes.has(i);
                const isEdited = lineOverrides[i] && Object.keys(lineOverrides[i]).length > 0;
                return (
                  <div
                    key={i}
                    ref={(el) => lineRefs.current[i] = el}
                    onClick={() => { 
                      if (!isEditingScript) {
                        handleLineClick(i);
                      }
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-all",
                      isEditingScript ? "cursor-text" : "cursor-pointer",
                      isActive && "bg-blue-50 border-l-4 border-blue-500 rounded-r-lg",
                      !isActive && !isEditingScript && "hover:bg-gray-50",
                      isDone && "bg-green-50/30",
                      isEdited && !isActive && "bg-orange-50/30 border-l-2 border-orange-300",
                      isEdited && isActive && "bg-orange-50 border-l-4 border-orange-400 rounded-r-lg",
                      isEditingScript && "ring-2 ring-green-200"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center shrink-0 w-12">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400 font-mono">{i + 1}</span>
                          {isEdited && !isEditingScript && (
                            <SquarePen className="w-3 h-3 text-orange-500" />
                          )}
                        </div>
                        {isEditingScript ? (
                          <input
                            type="text"
                            className="text-xs text-blue-500 font-mono font-semibold bg-transparent border border-blue-200 rounded px-1 py-0.5 w-full text-center focus:outline-none focus:ring-1 focus:ring-blue-300"
                            defaultValue={formatTimecodeByFormat(line.start || 0, "HH:MM:SS:FF", 24)}
                            placeholder="00:00:00:00"
                            onClick={(e) => e.stopPropagation()}
                            onBlur={(e) => {
                              const timecodeStr = e.target.value.trim();
                              if (timecodeStr && timecodeStr !== formatTimecodeByFormat(line.start || 0, "HH:MM:SS:FF", 24)) {
                                try {
                                  const seconds = parseUniversalTimecodeToSeconds(timecodeStr);
                                  if (!isNaN(seconds) && seconds >= 0) {
                                    applyScriptLinePatch(i, { start: seconds });
                                    emitTextControlEvent("text-control:update-line", { 
                                      lineIndex: i, 
                                      start: seconds,
                                      history: { field: "timecode", before: formatTimecodeByFormat(line.start || 0, "HH:MM:SS:FF", 24), after: timecodeStr, by: user?.displayName || user?.fullName || "Usuário" }
                                    });
                                  }
                                } catch (error) {
                                  toast({ title: "Timecode inválido", description: "Use o formato HH:MM:SS:FF", variant: "destructive" });
                                }
                              }
                            }}
                          />
                        ) : (
                          <span className="text-xs text-blue-500 font-mono font-semibold">
                            {formatTimecodeByFormat(line.start || 0, "HH:MM:SS:FF", 24)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {isEditingScript ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              className="w-full text-sm font-bold text-blue-600 uppercase tracking-wider bg-transparent border border-blue-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                              defaultValue={line.character}
                              placeholder="Personagem"
                              onClick={(e) => e.stopPropagation()}
                              onBlur={(e) => {
                                if (e.target.value.trim() !== line.character) {
                                  applyScriptLinePatch(i, { character: e.target.value.trim() });
                                  emitTextControlEvent("text-control:update-line", { 
                                    lineIndex: i, 
                                    character: e.target.value.trim(),
                                    history: { field: "character", before: line.character, after: e.target.value.trim(), by: user?.displayName || user?.fullName || "Usuário" }
                                  });
                                }
                              }}
                            />
                            <textarea
                              className="w-full text-base text-gray-900 leading-relaxed bg-transparent border border-gray-200 rounded px-2 py-1 resize-none focus:outline-none focus:ring-2 focus:ring-gray-300"
                              style={{ fontSize: `${scriptFontSize}px` }}
                              defaultValue={line.text}
                              placeholder="Texto da fala"
                              onClick={(e) => e.stopPropagation()}
                              onBlur={(e) => {
                                if (e.target.value.trim() !== line.text) {
                                  applyScriptLinePatch(i, { text: e.target.value.trim() });
                                  emitTextControlEvent("text-control:update-line", { 
                                    lineIndex: i, 
                                    text: e.target.value.trim(),
                                    history: { field: "text", before: line.text, after: e.target.value.trim(), by: user?.displayName || user?.fullName || "Usuário" }
                                  });
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <>
                            <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">{line.character}</p>
                            <p className="text-base text-gray-900 leading-relaxed" style={{ fontSize: `${scriptFontSize}px` }}>{line.text}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Script Action Buttons */}
            <div className="p-4 border-t border-gray-100 flex items-center gap-2">
              <button 
                onClick={handleToggleAutoFollow}
                className={`flex-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  scriptAutoFollow 
                    ? "bg-blue-50 border-blue-200 text-blue-700" 
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Scroll className="w-4 h-4" />
                {scriptAutoFollow ? "Rolamento Auto" : "Rolamento Manual"}
              </button>
              <button 
                onClick={() => setIsEditingScript(!isEditingScript)}
                className={`flex-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  isEditingScript 
                    ? "bg-green-50 border-green-200 text-green-700" 
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Edit className="w-4 h-4" />
                {isEditingScript ? "Editando" : "Editar Texto"}
              </button>
              <div className="flex-1 relative">
                <select
                  value={selectedCharacter}
                  onChange={(e) => setSelectedCharacter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors appearance-none bg-white cursor-pointer"
                >
                  <option value="todos">Todos Personagens</option>
                  {uniqueCharacters.map(character => (
                    <option key={character} value={character}>
                      {character}
                    </option>
                  ))}
                </select>
                <Filter className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
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
              className="fixed bottom-20 left-5 h-14 w-14 rounded-full flex items-center justify-center shadow-lg z-[90] bg-white border border-gray-200 md:hidden"
            >
              <Edit3 className="w-6 h-6" />
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

      {/* Hardware Setup Dialog */}
      <HardwareSetupDialog open={hardwareDialogOpen} onOpenChange={setHardwareDialogOpen} sessionId={sessionId || ""} />

      {/* Director Review Modal */}
      {directorReviewModalOpen && reviewingTake && isDirector && (
        <div className="fixed inset-0 bg-black/50 z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6" data-testid="director-review-popup">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revisar Take</h3>
              <button
                onClick={() => {
                  setDirectorReviewModalOpen(false);
                  setReviewingTake(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Take Info */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                    {reviewingTake.character?.charAt(0) || "T"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{reviewingTake.character || "Personagem"}</p>
                    <p className="text-sm text-gray-500">Linha {reviewingTake.lineIndex + 1}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Duração: {Math.round(reviewingTake.duration * 10) / 10}s</p>
                  <p>Qualidade: {Math.round((reviewingTake.metrics?.score || 0) * 100)}%</p>
                </div>
              </div>

              {/* Audio Player */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <audio 
                  controls 
                  src={reviewingTake.audioUrl}
                  className="w-full"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleRejectLocalTake(reviewingTake)}
                  disabled={isDirectorSaving}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isDirectorSaving ? "Processando..." : "Rejeitar"}
                </button>
                <button
                  onClick={() => handleApproveLocalTake(reviewingTake)}
                  disabled={isDirectorSaving}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isDirectorSaving ? "Salvando..." : "Aprovar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
