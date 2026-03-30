import { useState } from "react";
import { type RecordingStatus } from "@studio/lib/audio/recordingEngine";

export function useRoomRecording(sessionId: string | undefined) {
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>("idle");
  const [countdownValue, setCountdownValue] = useState(0);
  const [lastRecording, setLastRecording] = useState<any>(null);
  const [qualityMetrics, setQualityMetrics] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingTake, setPendingTake] = useState<any>(null);
  const [reviewingTake, setReviewingTake] = useState<any>(null);
  const [recordingsIsLoading, setRecordingsIsLoading] = useState<Set<string>>(new Set());
  const [lastUploadedTakeId, setLastUploadedTakeId] = useState<string | null>(null);
  const [isWaitingReview, setIsWaitingReview] = useState(false);
  
  const [recordingProfile, setRecordingProfile] = useState<any | null>(null);
  const [preRoll, setPreRoll] = useState(1);
  const [postRoll, setPostRoll] = useState(1);

  return {
    recordingStatus,
    setRecordingStatus,
    countdownValue,
    setCountdownValue,
    lastRecording,
    setLastRecording,
    qualityMetrics,
    setQualityMetrics,
    isSaving,
    setIsSaving,
    pendingTake,
    setPendingTake,
    reviewingTake,
    setReviewingTake,
    recordingsIsLoading,
    setRecordingsIsLoading,
    lastUploadedTakeId,
    setLastUploadedTakeId,
    isWaitingReview,
    setIsWaitingReview,
    recordingProfile,
    setRecordingProfile,
    preRoll,
    setPreRoll,
    postRoll,
    setPostRoll,
  };
}
