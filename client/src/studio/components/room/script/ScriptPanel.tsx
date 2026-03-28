import { forwardRef, ReactNode } from "react";
import { ListMusic, ArrowUpDown } from "lucide-react";
import { cn } from "@studio/lib/utils";
import { type ScriptLine as ScriptLineType } from "@studio/hooks/room";

interface ScriptPanelProps {
  lines: (ScriptLineType & { originalIndex: number })[];
  currentLineIndex: number;
  renderLine: (line: ScriptLineType & { originalIndex: number }, index: number) => ReactNode;
  autoFollow: boolean;
  onToggleAutoFollow: () => void;
  className?: string;
  isMobile?: boolean;
}

export const ScriptPanel = forwardRef<HTMLDivElement, ScriptPanelProps>(({
  lines,
  currentLineIndex,
  renderLine,
  autoFollow,
  onToggleAutoFollow,
  className,
  isMobile
}, ref) => {
  return (
    <div className={cn("flex flex-col h-full bg-background/50", className)}>
      <div className="shrink-0 p-3 sm:p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-20 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold text-xs sm:text-sm uppercase tracking-widest text-foreground">Roteiro</h2>
          <div className="ml-2 px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
            {currentLineIndex + 1} / {lines.length}
          </div>
        </div>
        
        <button
          onClick={onToggleAutoFollow}
          className={cn(
            "p-1.5 sm:p-2 rounded-lg transition-all border flex items-center gap-1.5",
            autoFollow 
              ? "bg-primary/10 text-primary border-primary/20 shadow-inner" 
              : "bg-transparent text-muted-foreground hover:bg-muted/50 border-transparent"
          )}
          title={autoFollow ? "Desativar Rolagem Automática" : "Ativar Rolagem Automática"}
        >
          <ArrowUpDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="text-[10px] font-medium uppercase tracking-wider hidden sm:inline">
            {autoFollow ? 'Sincronizado' : 'Manual'}
          </span>
        </button>
      </div>

      <div 
        ref={ref}
        className={cn(
          "flex-1 overflow-y-auto px-2 sm:px-4 py-6 scroll-smooth",
          !isMobile && "custom-scrollbar"
        )}
        style={{
          scrollBehavior: 'smooth',
          perspective: '1000px',
        }}
      >
        <div className="max-w-2xl mx-auto pb-[50vh]">
          {lines.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic opacity-50 p-8 text-center">
              O roteiro desta produção está vazio.
            </div>
          ) : (
            lines.map((line, idx) => renderLine(line, idx))
          )}
        </div>
      </div>
    </div>
  );
});

ScriptPanel.displayName = "ScriptPanel";
