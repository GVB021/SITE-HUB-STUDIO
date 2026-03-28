import { forwardRef } from "react";
import { cn } from "@studio/lib/utils";
import { Lock, Play } from "lucide-react";
import { type ScriptLine as ScriptLineType } from "@studio/hooks/room";

interface ScriptLineProps {
  line: ScriptLineType & { originalIndex: number };
  isActive: boolean;
  isPast: boolean;
  isLockedByOther?: string | null;
  liveDraft?: string;
  hasTakes?: boolean;
  onClick: () => void;
  onEdit?: (field: "character" | "text" | "timecode") => void;
  canEdit?: boolean;
  formatTimecode: (seconds: number) => string;
}

export const ScriptLine = forwardRef<HTMLDivElement, ScriptLineProps>(({
  line,
  isActive,
  isPast,
  isLockedByOther,
  liveDraft,
  hasTakes,
  onClick,
  onEdit,
  canEdit,
  formatTimecode
}, ref) => {
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={cn(
        "group relative p-4 mb-2 rounded-xl cursor-pointer transition-all duration-300",
        isActive 
          ? "bg-primary/20 border-l-4 border-primary shadow-sm ring-1 ring-primary/30" 
          : isPast 
            ? "opacity-60 hover:opacity-80 border-l-4 border-transparent" 
            : "hover:bg-muted/50 border-l-4 border-transparent",
        isLockedByOther ? "opacity-50 pointer-events-none cursor-not-allowed border-dashed border-red-500/50" : "",
        hasTakes ? "border-r-4 border-r-green-500" : ""
      )}
      style={isActive ? { transform: 'scale(1.02)' } : undefined}
    >
      {/* Indicador de Lock */}
      {isLockedByOther && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded-full shadow-lg flex items-center gap-1 z-10">
          <Lock className="w-3 h-3" />
          Editado por {isLockedByOther}
        </div>
      )}

      {/* Indicador de Take Salvo */}
      {hasTakes && !isActive && (
        <div className="absolute right-2 top-2 text-green-500/50 group-hover:text-green-500 transition-colors">
          <div className="w-2 h-2 rounded-full bg-current" />
        </div>
      )}

      {/* Botão de Play */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
        isActive ? "opacity-100 bg-primary/10" : ""
      )}>
        <Play className={cn("w-4 h-4", isActive ? "text-primary fill-current" : "text-muted-foreground")} />
      </div>

      <div className={cn("pl-6", isActive ? "pl-8" : "")}>
        <div className="flex items-center justify-between mb-1.5">
          <span 
            className="text-[11px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
            onClick={(e) => {
              if (canEdit && onEdit && !isLockedByOther) {
                e.stopPropagation();
                onEdit("character");
              }
            }}
          >
            {line.character || "Desconhecido"}
          </span>
          <span 
            className="text-[10px] font-medium text-muted-foreground/70 tabular-nums hover:text-foreground transition-colors"
            onClick={(e) => {
              if (canEdit && onEdit && !isLockedByOther) {
                e.stopPropagation();
                onEdit("timecode");
              }
            }}
          >
            {formatTimecode(line.start)}
          </span>
        </div>
        
        <p 
          className={cn(
            "text-base md:text-[17px] leading-relaxed",
            isActive ? "text-foreground font-medium" : "text-muted-foreground",
            liveDraft ? "text-amber-500/90 italic border-l border-amber-500/30 pl-2" : ""
          )}
          onClick={(e) => {
            if (canEdit && onEdit && !isLockedByOther) {
              e.stopPropagation();
              onEdit("text");
            }
          }}
        >
          {liveDraft ?? line.text}
        </p>
      </div>
    </div>
  );
});

ScriptLine.displayName = "ScriptLine";
