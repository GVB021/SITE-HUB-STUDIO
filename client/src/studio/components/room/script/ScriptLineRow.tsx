import { type RefObject } from "react";
import { CheckCircle2, Loader2, Edit3 } from "lucide-react";
import { cn } from "@studio/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@studio/components/ui/dropdown-menu";

interface DisplayLine {
  originalIndex: number;
  start: number;
  end: number;
  character: string;
  text: string;
}

interface LockInfo {
  userId: string;
}

interface EditingField {
  lineIndex: number;
  field: "character" | "text" | "timecode";
}

interface EditHistoryEntry {
  field: string;
  by: string;
}

interface ScriptLineRowProps {
  line: DisplayLine;
  currentLine: number;
  savedTakes: Set<number>;
  customLoop: { start: number; end: number } | null;
  lockedLines: Record<number, LockInfo | undefined>;
  liveDrafts: Record<number, string | undefined>;
  presenceUsers: Array<{ userId: string; name?: string }>;
  userId: string | undefined;
  canTextControl: boolean;
  scriptFontSize: number;
  formatTimecode: (t: number) => string;
  editingField: EditingField | null;
  editingDraftValue: string;
  lineEditHistory: Record<number, EditHistoryEntry[] | undefined>;
  lineRef: (el: HTMLDivElement | null) => void;
  onLineClick: (i: number) => void;
  onEditDraftChange: (v: string) => void;
  onStartEdit: (i: number, field: "character" | "text" | "timecode") => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
}

export function ScriptLineRow({
  line,
  currentLine,
  savedTakes,
  customLoop,
  lockedLines,
  liveDrafts,
  presenceUsers,
  userId,
  canTextControl,
  scriptFontSize,
  formatTimecode,
  editingField,
  editingDraftValue,
  lineEditHistory,
  lineRef,
  onLineClick,
  onEditDraftChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
}: ScriptLineRowProps) {
  const i = line.originalIndex;
  const isActive = i === currentLine;
  const isDone = savedTakes.has(i);
  const isInLoop = customLoop
    ? line.start >= customLoop.start && line.end <= customLoop.end
    : false;

  const lock = lockedLines[i];
  const isLockedByOther = !!(lock && lock.userId !== userId);
  const lockingUser = isLockedByOther
    ? presenceUsers.find((u) => u.userId === lock!.userId)?.name || "Alguém"
    : null;
  const liveText = isLockedByOther && liveDrafts[i] ? liveDrafts[i] : line.text;

  const isEditing = editingField?.lineIndex === i;

  return (
    <div
      ref={lineRef}
      onClick={canTextControl && !isLockedByOther ? () => onLineClick(i) : undefined}
      className={cn(
        "mb-4 px-5 py-4 rounded-xl transition-all duration-300 relative overflow-hidden",
        isActive
          ? "bg-background/85 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.22)] backdrop-blur-md"
          : "bg-transparent",
        isInLoop && "shadow-[inset_0_0_0_1px_rgba(129,140,248,0.45)] bg-indigo-500/10",
        canTextControl && !isLockedByOther ? "cursor-pointer" : "cursor-default",
        isLockedByOther && "opacity-70 border border-amber-500/30 bg-amber-500/5"
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-[13px] font-mono tabular-nums text-muted-foreground">
          #{i + 1} · {formatTimecode(line.start)}
        </span>
        <span
          className={cn(
            "text-[16px] font-extrabold uppercase tracking-tight",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          {line.character}
        </span>
        {isDone && <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-500" />}
        {isLockedByOther && (
          <span className="ml-auto text-[10px] text-amber-500 flex items-center gap-1 font-medium px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Loader2 className="w-3 h-3 animate-spin" />
            {lockingUser} editando...
          </span>
        )}
      </div>

      <p
        className={cn(
          "leading-relaxed transition-all",
          isActive ? "text-foreground font-medium" : "text-muted-foreground",
          isLockedByOther && "italic text-amber-200/80"
        )}
        style={{ fontSize: `${scriptFontSize}px` }}
      >
        {liveText}
      </p>

      {canTextControl && !isLockedByOther && (
        <div className="mt-3 flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all hover:scale-105 flex items-center justify-center"
                title="Editar linha"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStartEdit(i, "character"); }}>
                Personagem
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStartEdit(i, "text"); }}>
                Fala
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStartEdit(i, "timecode"); }}>
                Timecode
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {isEditing && (
        <div
          className="mt-3 rounded-lg border border-border/70 bg-muted/30 p-3"
          onClick={(e) => e.stopPropagation()}
        >
          {editingField!.field === "text" ? (
            <textarea
              value={editingDraftValue}
              onChange={(e) => onEditDraftChange(e.target.value)}
              className="w-full min-h-20 rounded-md border border-border/70 bg-background px-3 py-2 text-sm text-foreground outline-none"
              readOnly={isLockedByOther}
              disabled={isLockedByOther}
            />
          ) : (
            <input
              value={editingDraftValue}
              onChange={(e) => onEditDraftChange(e.target.value)}
              className="w-full h-9 rounded-md border border-border/70 bg-background px-3 text-sm text-foreground outline-none"
              readOnly={isLockedByOther}
              disabled={isLockedByOther}
            />
          )}
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              onClick={onCancelEdit}
              className="h-7 px-2 rounded-md bg-muted/70 text-[11px] text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
            {!isLockedByOther && (
              <button
                onClick={onSaveEdit}
                className="h-7 px-2 rounded-md bg-primary/20 text-[11px] text-primary hover:bg-primary/30"
              >
                Salvar
              </button>
            )}
          </div>
        </div>
      )}

      {lineEditHistory[i]?.[0] && (
        <div className="mt-2 text-[11px] text-muted-foreground">
          Última alteração: {lineEditHistory[i]![0].field} por {lineEditHistory[i]![0].by}
        </div>
      )}
    </div>
  );
}
