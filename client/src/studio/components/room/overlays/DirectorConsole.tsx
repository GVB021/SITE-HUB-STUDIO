import { X } from "lucide-react";
import { cn } from "@studio/lib/utils";

interface DirectorConsoleUser {
  userId: string | number;
  name?: string;
  role?: unknown;
}

interface DirectorConsoleProps {
  users: DirectorConsoleUser[];
  clientAcks: Record<string, { lastAck: number; command: string }>;
  normalizeRole: (role: unknown) => string;
  onClose: () => void;
}

export function DirectorConsole({ users, clientAcks, normalizeRole, onClose }: DirectorConsoleProps) {
  return (
    <div className="absolute top-20 right-4 z-50 w-64 room-bg-elevated backdrop-blur border border-border rounded-xl shadow-2xl p-4 animate-in slide-in-from-right-10 fade-in">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/20">
        <h3 className="text-xs font-bold uppercase tracking-wider room-text-primary">Console do Diretor</h3>
        <button onClick={onClose} className="room-text-muted hover:text-foreground transition-colors">
          <X className="w-3 h-3" />
        </button>
      </div>
      <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
        {users.map((u) => {
          const uid = String(u.userId);
          const ack = clientAcks[uid];
          const hasRecentAck = ack && Date.now() - ack.lastAck < 2000;
          return (
            <div key={uid} className="flex items-center justify-between text-xs p-2 rounded room-bg-surface">
              <div className="flex flex-col">
                <span className="font-bold room-text-primary truncate max-w-[120px]">{u.name || "Usuário"}</span>
                <span className="text-[10px] room-text-subtle">{normalizeRole(u.role)}</span>
              </div>
              <div className="flex items-center gap-2">
                {hasRecentAck && (
                  <span className="text-[9px] text-emerald-400 font-mono animate-pulse">ACK: {ack.command}</span>
                )}
                <div
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    hasRecentAck
                      ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"
                      : "bg-muted-foreground/40"
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
