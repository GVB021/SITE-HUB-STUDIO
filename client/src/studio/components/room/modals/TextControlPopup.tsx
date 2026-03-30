import { X } from "lucide-react";
import { cn } from "@studio/lib/utils";

interface TextControlPresence {
  userId: string | number;
  name?: string;
  role?: string;
}

interface TextControlPopupProps {
  authorizedCount: number;
  candidates: TextControlPresence[];
  authorizedIds: Set<string>;
  zIndex: number;
  normalizeRole: (role?: string) => string;
  onToggle: (userId: string) => void;
  onClose: () => void;
}

export function TextControlPopup({
  authorizedCount,
  candidates,
  authorizedIds,
  zIndex,
  normalizeRole,
  onToggle,
  onClose,
}: TextControlPopupProps) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-md"
      style={{ zIndex }}
    >
      <div className="rounded-2xl w-[calc(100vw-32px)] max-w-[620px] overflow-hidden border border-border/70 bg-card/95 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/70">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-foreground">Permitir Controle</span>
            <span className="text-[10px] px-2 py-1 rounded-full border bg-muted/60 text-muted-foreground">
              {authorizedCount} autorizados
            </span>
          </div>
          <button
            onClick={onClose}
            className="transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4 max-h-[420px] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-12 text-[10px] uppercase text-muted-foreground tracking-wider pb-2 border-b border-border/60">
            <span className="col-span-5">Usuário</span>
            <span className="col-span-3">Perfil</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2 text-right">Permissão</span>
          </div>

          <div className="space-y-1 mt-2">
            {candidates.map((presence) => {
              const uid = String(presence.userId || "");
              const allowed = authorizedIds.has(uid);
              return (
                <div
                  key={uid}
                  className="grid grid-cols-12 items-center text-xs py-2 px-2 rounded-md hover:bg-muted/40"
                >
                  <span className="col-span-5 truncate text-foreground">
                    {presence.name || presence.userId}
                  </span>
                  <span className="col-span-3 text-muted-foreground">
                    {normalizeRole(presence.role)}
                  </span>
                  <span className="col-span-2 flex items-center gap-1 text-emerald-500">
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    online
                  </span>
                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => onToggle(uid)}
                      className={cn(
                        "h-7 px-2 rounded-md text-[11px] border transition-colors",
                        allowed
                          ? "bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/25"
                          : "bg-primary/15 text-primary border-primary/30 hover:bg-primary/25"
                      )}
                      data-testid={`button-toggle-text-control-${uid}`}
                    >
                      {allowed ? "Revogar Controle" : "Permitir Controle"}
                    </button>
                  </div>
                </div>
              );
            })}
            {candidates.length === 0 && (
              <div className="text-sm text-center py-10 text-muted-foreground">
                Nenhum dublador online no momento
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
