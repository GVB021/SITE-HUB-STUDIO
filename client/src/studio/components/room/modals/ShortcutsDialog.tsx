import { X } from "lucide-react";
import { type Shortcuts } from "@studio/pages/room";

interface ShortcutLabels {
  [key: string]: string;
}

interface ShortcutsDialogProps {
  shortcuts: Shortcuts;
  pendingShortcuts: Shortcuts;
  listeningFor: keyof Shortcuts | null;
  shortcutLabels: ShortcutLabels;
  defaultShortcuts: Shortcuts;
  keyLabel: (code: string) => string;
  onSetPending: (shortcuts: Shortcuts) => void;
  onSetListeningFor: (key: keyof Shortcuts | null) => void;
  onApply: (shortcuts: Shortcuts) => void;
  onSaveDefault: (shortcuts: Shortcuts) => void;
  onClose: () => void;
}

export function ShortcutsDialog({
  pendingShortcuts,
  listeningFor,
  shortcutLabels,
  defaultShortcuts,
  keyLabel,
  onSetPending,
  onSetListeningFor,
  onApply,
  onSaveDefault,
  onClose,
}: ShortcutsDialogProps) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="rounded-2xl w-[calc(100vw-32px)] max-w-[420px] overflow-hidden glass-panel shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <span className="text-sm font-semibold text-foreground">Atalhos de Teclado</span>
          <button
            onClick={onClose}
            className="room-transition room-text-muted hover:text-foreground"
            data-testid="button-close-shortcuts"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4 flex flex-col gap-2">
          {(Object.keys(shortcutLabels) as Array<keyof Shortcuts>).map((key) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm room-text-secondary">{shortcutLabels[key]}</span>
              <button
                onClick={() => onSetListeningFor(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono min-w-[80px] text-center transition-all ${
                  listeningFor === key ? "animate-pulse" : ""
                }`}
                style={
                  listeningFor === key
                    ? { border: "1px solid hsl(var(--primary))", background: "hsl(var(--primary) / 0.12)", color: "hsl(var(--primary))" }
                    : { border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.70)" }
                }
                data-testid={`shortcut-btn-${key}`}
              >
                {listeningFor === key ? "Pressione tecla…" : keyLabel(pendingShortcuts[key])}
              </button>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 flex justify-between gap-3 border-t border-border/10">
          <button
            onClick={() => { onSetPending(defaultShortcuts); onSetListeningFor(null); }}
            className="text-xs room-transition room-text-subtle"
            data-testid="button-reset-shortcuts"
          >
            Restaurar padrões
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => onApply(pendingShortcuts)}
              className="vhub-btn-xs vhub-btn-secondary"
              data-testid="button-apply-shortcuts"
            >
              Aplicar
            </button>
            <button
              onClick={() => onSaveDefault(pendingShortcuts)}
              className="vhub-btn-xs vhub-btn-primary"
              data-testid="button-save-shortcuts"
            >
              Salvar como Padrão
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
