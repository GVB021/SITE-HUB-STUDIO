import { Link } from "wouter";
import { Circle, Users, Mic, Square, Menu, ListMusic, Edit3, Monitor, Settings } from "lucide-react";
import { cn } from "@studio/lib/utils";
import { type RecordingStatus } from "@studio/pages/room";
import { ThemeTogglePill } from "@studio/components/ui/ThemeTogglePill";

interface RoomHeaderActionsProps {
  isMobile: boolean;
  recordingStatus: RecordingStatus;
  canViewOnlineUsers: boolean;
  canTextControl: boolean;
  canAccessDashboard: boolean;
  roomUsers: Array<{ displayName?: string; fullName?: string; name?: string; userId: string }>;
  studioId: string;
  onRecordOrStop: () => void;
  onOpenMenu: () => void;
  onOpenRecordings: () => void;
  onOpenTextControl: () => void;
  onOpenDeviceSettings: () => void;
  onOpenShortcuts: () => void;
  onPanelClick: () => void;
}

export function RoomHeaderActions({
  isMobile,
  recordingStatus,
  canViewOnlineUsers,
  canTextControl,
  canAccessDashboard,
  roomUsers,
  studioId,
  onRecordOrStop,
  onOpenMenu,
  onOpenRecordings,
  onOpenTextControl,
  onOpenDeviceSettings,
  onOpenShortcuts,
  onPanelClick,
}: RoomHeaderActionsProps) {
  const isRecording = recordingStatus === "recording";

  return (
    <>
      {isRecording && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-500 animate-pulse">
          <Circle className="w-2 h-2 fill-current" />
          <span className="hidden xs:inline">REC</span>
        </div>
      )}

      {canViewOnlineUsers && !isMobile && (
        <div
          className="h-7 px-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 flex items-center gap-1.5"
          title={roomUsers.map((u) => u.displayName || u.fullName || u.name || u.userId).join(", ")}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{roomUsers.length} online</span>
        </div>
      )}

      {isMobile ? (
        <>
          <button
            onClick={onRecordOrStop}
            className={cn(
              "w-14 h-14 flex items-center justify-center rounded-full transition-all",
              isRecording
                ? "bg-red-500 text-white shadow-lg shadow-red-500/50 animate-pulse"
                : "bg-primary text-primary-foreground"
            )}
            aria-label={isRecording ? "Parar Gravação" : "Iniciar Gravação"}
          >
            {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <button
            onClick={onOpenMenu}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-muted/40 border border-border/60 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Menu principal"
          >
            <Menu className="w-5 h-5" />
          </button>
        </>
      ) : (
        <>
          <ThemeTogglePill />
          
          <button
            onClick={onOpenRecordings}
            className="h-7 px-2 rounded-md bg-muted/40 border border-border/60 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/60 flex items-center gap-1"
            data-testid="button-room-recordings"
          >
            <ListMusic className="w-3.5 h-3.5" />
            Gravações
          </button>

          {canTextControl && (
            <button
              onClick={onOpenTextControl}
              className="h-7 px-2 rounded-md bg-primary/10 border border-primary/20 text-[11px] text-primary hover:bg-primary/20 flex items-center gap-1"
              data-testid="button-room-release-text"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Permitir Controle
            </button>
          )}

          <button
            onClick={onOpenDeviceSettings}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted/40 border border-border/60 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Configurações de dispositivos"
            data-testid="button-open-device-settings"
          >
            <Monitor className="w-4 h-4" />
          </button>

          {canAccessDashboard && (
            <Link to={`/hub-dub/studio/${studioId}/dashboard`}>
              <button
                onClick={onPanelClick}
                className="h-7 px-2 rounded-md bg-muted/40 border border-border/60 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/60 flex items-center gap-1"
                data-testid="button-room-panel"
              >
                <Monitor className="w-3.5 h-3.5" />
                PAINEL
              </button>
            </Link>
          )}

          <button
            onClick={onOpenShortcuts}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted/40 border border-border/60 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Atalhos de teclado"
            data-testid="button-open-shortcuts"
          >
            <Settings className="w-4 h-4" />
          </button>
        </>
      )}
    </>
  );
}
