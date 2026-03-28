import { createContext, useContext, useRef, type ReactNode } from "react";
import { useRoomWebSocket } from "@studio/hooks/room/use-room-websocket";
import { useRoomPlayback } from "@studio/hooks/room/use-room-playback";
import { useRoomRecording } from "@studio/hooks/room/use-room-recording";
import { useRoomScript } from "@studio/hooks/room/use-room-script";
import { type ScriptLineOverride } from "@studio/hooks/room/types";

interface RoomContextValue {
  // WebSocket
  wsConnected: boolean;
  roomUsers: any[];
  presenceUsers: any[];
  clientAcks: Record<string, any>;
  lockedLines: Record<number, any>;
  liveDrafts: Record<number, string>;
  textControllerUserIds: Set<string>;
  emitVideoEvent: (type: string, data: any) => void;
  emitTextControlEvent: (type: string, data: any) => void;

  // Playback
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  isMuted: boolean;
  setIsMuted: (v: boolean | ((prev: boolean) => boolean)) => void;
  videoTime: number;
  setVideoTime: (v: number) => void;
  videoDuration: number;
  setVideoDuration: (v: number) => void;
  teleprompterSpeed: number;
  setTeleprompterSpeed: (v: number) => void;
  seek: (offset: number) => void;
  togglePlayback: () => void;

  // Recording
  recordingStatus: string;
  setRecordingStatus: (v: any) => void;
  countdownValue: number;
  setCountdownValue: (v: number) => void;
  lastRecording: any;
  setLastRecording: (v: any) => void;
  qualityMetrics: any;
  setQualityMetrics: (v: any) => void;
  isSaving: boolean;
  setIsSaving: (v: boolean) => void;
  pendingTake: any;
  setPendingTake: (v: any) => void;
  reviewingTake: any;
  setReviewingTake: (v: any) => void;
  lastUploadedTakeId: string | null;
  setLastUploadedTakeId: (v: string | null) => void;
  isWaitingReview: boolean;
  setIsWaitingReview: (v: boolean) => void;
  recordingProfile: any;
  setRecordingProfile: (v: any) => void;
  preRoll: number;
  setPreRoll: (v: number) => void;
  postRoll: number;
  setPostRoll: (v: number) => void;

  // Script
  lineOverrides: Record<number, ScriptLineOverride>;
  lineEditHistory: Record<number, Array<{ field: string; before: string; after: string; by: string }>>;
  editingField: { lineIndex: number; field: "character" | "text" | "timecode" } | null;
  setEditingField: (v: any) => void;
  editingDraftValue: string;
  setEditingDraftValue: (v: string) => void;
  currentLine: number;
  setCurrentLine: (v: number) => void;
  applyScriptLinePatch: (lineIndex: number, patch: ScriptLineOverride) => void;
  pushEditHistory: (lineIndex: number, field: "character" | "text" | "timecode", before: string, after: string, by: string) => void;
  resetScriptState: () => void;
}

const RoomContext = createContext<RoomContextValue | null>(null);

interface RoomProviderProps {
  studioId: string | undefined;
  sessionId: string | undefined;
  userId: string | undefined;
  baseScriptLines: any[];
  children: ReactNode;
}

export function RoomProvider({
  studioId,
  sessionId,
  userId,
  baseScriptLines,
  children,
}: RoomProviderProps) {
  const script = useRoomScript(baseScriptLines);

  const ws = useRoomWebSocket(studioId, sessionId, userId, {
    onUpdateLine: script.applyScriptLinePatch,
  });

  const playback = useRoomPlayback();
  const recording = useRoomRecording(sessionId);

  const value: RoomContextValue = {
    // WebSocket
    wsConnected: ws.wsConnected,
    roomUsers: ws.roomUsers,
    presenceUsers: ws.presenceUsers,
    clientAcks: ws.clientAcks,
    lockedLines: ws.lockedLines,
    liveDrafts: ws.liveDrafts,
    textControllerUserIds: ws.textControllerUserIds,
    emitVideoEvent: ws.emitVideoEvent,
    emitTextControlEvent: ws.emitTextControlEvent,

    // Playback
    videoRef: playback.videoRef,
    isPlaying: playback.isPlaying,
    setIsPlaying: playback.setIsPlaying,
    isMuted: playback.isMuted,
    setIsMuted: playback.setIsMuted,
    videoTime: playback.videoTime,
    setVideoTime: playback.setVideoTime,
    videoDuration: playback.videoDuration,
    setVideoDuration: playback.setVideoDuration,
    teleprompterSpeed: playback.teleprompterSpeed,
    setTeleprompterSpeed: playback.setTeleprompterSpeed,
    seek: playback.seek,
    togglePlayback: playback.togglePlayback,

    // Recording
    recordingStatus: recording.recordingStatus,
    setRecordingStatus: recording.setRecordingStatus,
    countdownValue: recording.countdownValue,
    setCountdownValue: recording.setCountdownValue,
    lastRecording: recording.lastRecording,
    setLastRecording: recording.setLastRecording,
    qualityMetrics: recording.qualityMetrics,
    setQualityMetrics: recording.setQualityMetrics,
    isSaving: recording.isSaving,
    setIsSaving: recording.setIsSaving,
    pendingTake: recording.pendingTake,
    setPendingTake: recording.setPendingTake,
    reviewingTake: recording.reviewingTake,
    setReviewingTake: recording.setReviewingTake,
    lastUploadedTakeId: recording.lastUploadedTakeId,
    setLastUploadedTakeId: recording.setLastUploadedTakeId,
    isWaitingReview: recording.isWaitingReview,
    setIsWaitingReview: recording.setIsWaitingReview,
    recordingProfile: recording.recordingProfile,
    setRecordingProfile: recording.setRecordingProfile,
    preRoll: recording.preRoll,
    setPreRoll: recording.setPreRoll,
    postRoll: recording.postRoll,
    setPostRoll: recording.setPostRoll,

    // Script
    lineOverrides: script.lineOverrides,
    lineEditHistory: script.lineEditHistory,
    editingField: script.editingField,
    setEditingField: script.setEditingField,
    editingDraftValue: script.editingDraftValue,
    setEditingDraftValue: script.setEditingDraftValue,
    currentLine: script.currentLine,
    setCurrentLine: script.setCurrentLine,
    applyScriptLinePatch: script.applyScriptLinePatch,
    pushEditHistory: script.pushEditHistory,
    resetScriptState: script.resetScriptState,
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

export function useRoom(): RoomContextValue {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used inside <RoomProvider>");
  return ctx;
}
