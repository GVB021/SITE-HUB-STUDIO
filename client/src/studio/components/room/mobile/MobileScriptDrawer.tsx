import { type ReactNode } from "react";
import { Drawer } from "vaul";
import { X, Minus, Plus, CheckCircle2, Edit3 } from "lucide-react";
import { cn } from "@studio/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@studio/components/ui/dropdown-menu";
import { type ScriptLine as ScriptLineType } from "@studio/hooks/room";

interface MobileScriptLine extends ScriptLineType {
  originalIndex: number;
}

interface MobileScriptDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lines: MobileScriptLine[];
  currentLine: number;
  scriptFontSize: number;
  onFontSizeChange: (delta: number) => void;
  savedTakes: Set<number>;
  lockedLines: Record<number, { userId: string }>;
  liveDrafts: Record<number, string>;
  userId?: string;
  presenceUsers: { userId: string; name?: string }[];
  canTextControl: boolean;
  formatTimecode: (seconds: number) => string;
  onLineClick: (index: number) => void;
  onEditField: (index: number, field: "character" | "text" | "timecode") => void;
}

export function MobileScriptDrawer({
  open,
  onOpenChange,
  lines,
  currentLine,
  scriptFontSize,
  onFontSizeChange,
  savedTakes,
  lockedLines,
  liveDrafts,
  userId,
  presenceUsers,
  canTextControl,
  formatTimecode,
  onLineClick,
  onEditField,
}: MobileScriptDrawerProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]" />
        <Drawer.Content className="room-bg-elevated flex flex-col rounded-t-[32px] h-[85vh] fixed bottom-0 left-0 right-0 z-[120] outline-none">
          <div className="p-6 flex-1 flex flex-col overflow-hidden">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-8" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold room-text-primary">Roteiro</h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 mr-2">
                  <button
                    onClick={() => onFontSizeChange(-1)}
                    disabled={scriptFontSize <= 10}
                    className="w-7 h-7 rounded-lg flex items-center justify-center room-button-secondary disabled:opacity-50 room-transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-mono w-6 text-center room-text-muted">{scriptFontSize}</span>
                  <button
                    onClick={() => onFontSizeChange(1)}
                    disabled={scriptFontSize >= 36}
                    className="w-7 h-7 rounded-lg flex items-center justify-center room-button-secondary disabled:opacity-50 room-transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-2 rounded-full room-button-secondary room-text-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Script lines */}
            <div className="flex-1 overflow-y-auto pb-20">
              {lines.map((line) => {
                const i = line.originalIndex;
                const isActive = i === currentLine;
                const isDone = savedTakes.has(i);
                const lock = lockedLines[i];
                const isLockedByOther = lock && lock.userId !== userId;
                const lockingUser = isLockedByOther
                  ? presenceUsers.find((u) => u.userId === lock.userId)?.name || "Alguém"
                  : null;
                const liveText = isLockedByOther && liveDrafts[i] ? liveDrafts[i] : line.text;

                return (
                  <div
                    key={i}
                    onClick={() => { onLineClick(i); onOpenChange(false); }}
                    className={cn(
                      "mb-4 px-6 py-5 rounded-2xl transition-all border",
                      isActive
                        ? "bg-primary/10 border-primary/25 shadow-lg shadow-primary/5"
                        : "bg-white/[0.03] border-white/[0.06]",
                      isLockedByOther && "opacity-70 border-amber-500/30 bg-amber-500/5"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[11px] font-mono room-text-subtle">
                        #{i + 1} · {formatTimecode(line.start)}
                      </span>
                      <span className={cn("text-sm font-bold uppercase tracking-widest", isActive ? "text-primary" : "room-text-muted")}>
                        {line.character}
                      </span>
                      {isDone && <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-500" />}
                      {isLockedByOther && (
                        <span className="ml-auto text-[10px] text-amber-500 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                          {lockingUser} editando...
                        </span>
                      )}
                      {canTextControl && !isLockedByOther && (
                        <div className="ml-auto">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all flex items-center justify-center"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditField(i, "character"); }}>
                                Personagem
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditField(i, "text"); }}>
                                Fala
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditField(i, "timecode"); }}>
                                Timecode
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                    <p
                      className={cn("leading-relaxed", isActive ? "room-text-primary font-medium" : "room-text-muted")}
                      style={{ fontSize: `${scriptFontSize}px` }}
                    >
                      {liveText}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
