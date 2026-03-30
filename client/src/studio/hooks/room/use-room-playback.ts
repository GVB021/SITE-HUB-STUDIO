import { useState, useCallback, useRef } from "react";
import { type TimecodeFormat } from "@studio/lib/timecode";

export function useRoomPlayback() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(1.0);
  const [timecodeFormat, setTimecodeFormat] = useState<TimecodeFormat>("HH:MM:SS");

  const seek = useCallback((offset: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + offset));
    }
  }, []);

  const togglePlayback = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
    }
  }, [isPlaying]);

  return {
    videoRef,
    isPlaying,
    setIsPlaying,
    isMuted,
    setIsMuted,
    videoTime,
    setVideoTime,
    videoDuration,
    setVideoDuration,
    teleprompterSpeed,
    setTeleprompterSpeed,
    timecodeFormat,
    setTimecodeFormat,
    seek,
    togglePlayback,
  };
}
