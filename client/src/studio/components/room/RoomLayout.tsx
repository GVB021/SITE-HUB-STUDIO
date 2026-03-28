import { ReactNode } from "react";
import { cn } from "@studio/lib/utils";

interface RoomLayoutProps {
  header: ReactNode;
  video: ReactNode;
  script: ReactNode;
  controls: ReactNode;
  modals: ReactNode;
  dailyMeetPanel?: ReactNode;
  isMobile: boolean;
  sideScriptWidth: number;
}

export function RoomLayout({
  header,
  video,
  script,
  controls,
  modals,
  dailyMeetPanel,
  isMobile,
  sideScriptWidth
}: RoomLayoutProps) {
  if (isMobile) {
    return (
      <div className="flex flex-col h-[100dvh] w-full bg-background overflow-hidden relative">
        {header}
        <div className="flex-1 min-h-0 flex flex-col relative">
          <div className="shrink-0 z-10">{video}</div>
          <div className="flex-1 min-h-0 z-0 bg-background/50 relative">{script}</div>
        </div>
        <div className="shrink-0 z-40 border-t border-border bg-background">{controls}</div>
        {dailyMeetPanel}
        {modals}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden font-sans">
      {header}
      <div className="flex-1 min-h-0 flex relative">
        <main className="flex-1 min-w-0 flex flex-col relative z-0">
          <div className="flex-1 min-h-0 relative bg-black/40 flex flex-col">
            <div className="flex-1 min-h-0 relative p-4 flex items-center justify-center">
              {video}
            </div>
            {controls}
          </div>
        </main>
        
        <aside 
          className="shrink-0 h-full border-l border-border/80 flex flex-col relative z-10 room-bg-surface"
          style={{ width: sideScriptWidth }}
        >
          {script}
        </aside>
      </div>
      {dailyMeetPanel}
      {modals}
    </div>
  );
}
