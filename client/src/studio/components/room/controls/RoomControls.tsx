import { ReactNode } from "react";
import { cn } from "@studio/lib/utils";

interface RoomControlsProps {
  playbackControls?: ReactNode;
  recordingControls?: ReactNode;
  timeline?: ReactNode;
  visible?: boolean;
}

export function RoomControls({
  playbackControls,
  recordingControls,
  timeline,
  visible = true
}: RoomControlsProps) {
  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 transition-all duration-300 transform",
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
        "bg-gradient-to-t from-background via-background/95 to-transparent pt-12 pb-4 px-4 sm:px-8"
      )}
      style={{ zIndex: 160 }}
    >
      {timeline && (
        <div className="mb-4">
          {timeline}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 flex justify-start">
          {playbackControls}
        </div>

        <div className="flex-1 flex justify-center">
          {recordingControls}
        </div>

        <div className="flex-1 flex justify-end" />
      </div>
    </div>
  );
}
