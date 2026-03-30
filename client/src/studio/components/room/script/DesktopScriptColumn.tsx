import { type RefObject, type ReactNode, type PointerEvent } from "react";
import { Minus, Plus, Type } from "lucide-react";
import { cn } from "@studio/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@studio/components/ui/dropdown-menu";

const FONT_PRESETS = [
  { label: "Pequeno", value: 12 },
  { label: "Normal", value: 16 },
  { label: "Grande", value: 20 },
  { label: "Maior", value: 24 },
  { label: "Máximo", value: 28 },
  { label: "Gigante", value: 36 },
];

interface DesktopScriptColumnProps {
  /** Viewport ref forwarded for scroll-sync */
  viewportRef: RefObject<HTMLDivElement>;
  onScroll: () => void;
  /** Resize handle */
  isDragging: boolean;
  sideScriptWidth: number;
  onResizePointerDown: (e: PointerEvent<HTMLDivElement>) => void;
  /** Line count info */
  lineCount: number;
  /** Font size controls */
  scriptFontSize: number;
  onFontSizeChange: (delta: number) => void;
  onFontSizeExact: (size: number) => void;
  /** Render each line via render prop */
  renderLine: (index: number) => ReactNode;
  lineKeys: number[];
}

export function DesktopScriptColumn({
  viewportRef,
  onScroll,
  isDragging,
  sideScriptWidth,
  onResizePointerDown,
  lineCount,
  scriptFontSize,
  onFontSizeChange,
  onFontSizeExact,
  renderLine,
  lineKeys,
}: DesktopScriptColumnProps) {
  return (
    <div className="flex flex-col min-h-0 room-bg-surface border-l border-border relative group/side">
      {/* Resize handle */}
      <div
        onPointerDown={onResizePointerDown}
        className={cn(
          "absolute top-0 bottom-0 -left-1 w-2 cursor-ew-resize transition-all z-50 flex items-center justify-center",
          isDragging ? "bg-primary/40" : "hover:bg-primary/20"
        )}
        aria-label="Redimensionar largura do roteiro (máx 50%)"
      >
        <div
          className={cn(
            "w-0.5 h-8 room-rounded-full transition-all",
            isDragging ? "bg-white" : "bg-muted group-hover/side:bg-white"
          )}
        />
        {isDragging && (
          <div className="absolute top-1/2 -left-12 -translate-y-1/2 bg-primary text-white text-[10px] px-2 py-0.5 room-rounded-full font-bold shadow-lg">
            {Math.round((sideScriptWidth / window.innerWidth) * 100)}%
          </div>
        )}
      </div>

      {/* Header */}
      <div className="room-controls flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold room-text-primary">Roteiro</h2>
          <span className="text-[10px] room-text-muted">{lineCount} linhas</span>
        </div>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 room-rounded flex items-center justify-center room-button-secondary room-transition">
                <Type className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {FONT_PRESETS.map((size) => (
                <DropdownMenuItem key={size.value} onClick={() => onFontSizeExact(size.value)}>
                  {size.label}
                  <span className="ml-auto font-mono">{size.value}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => onFontSizeChange(-1)}
            disabled={scriptFontSize <= 10}
            className="w-8 h-8 room-rounded flex items-center justify-center room-button-secondary room-transition disabled:opacity-50"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono w-6 text-center room-text-muted">{scriptFontSize}</span>
          <button
            onClick={() => onFontSizeChange(1)}
            disabled={scriptFontSize >= 36}
            className="w-8 h-8 room-rounded flex items-center justify-center room-button-secondary room-transition disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Script viewport */}
      <div
        ref={viewportRef}
        className="flex-1 overflow-y-auto p-4 min-h-0 relative custom-scrollbar"
        onScrollCapture={onScroll}
      >
        {lineKeys.map((key) => renderLine(key))}
      </div>
    </div>
  );
}
