import { cn } from "@studio/lib/utils";

interface DiscardTakeModalProps {
  take: any;
  isFinalStep: boolean;
  zIndex: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DiscardTakeModal({
  take,
  isFinalStep,
  zIndex,
  onCancel,
  onConfirm,
}: DiscardTakeModalProps) {
  if (!take) return null;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      style={{ zIndex }}
    >
      <div className="w-[calc(100vw-32px)] max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl">
        <h3 className="text-sm font-bold text-foreground">Excluir take</h3>
        <p className="text-xs text-muted-foreground mt-2">
          {isFinalStep
            ? "Tem certeza que deseja excluir permanentemente este take? Esta ação não pode ser desfeita."
            : "Você está prestes a excluir este take da sessão."}
        </p>
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onCancel}
            className="h-9 px-3 rounded-lg bg-muted/70 text-muted-foreground hover:text-foreground"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "h-9 px-3 rounded-lg text-white",
              isFinalStep ? "bg-destructive hover:bg-destructive/90" : "bg-amber-600 hover:bg-amber-500"
            )}
          >
            {isFinalStep ? "Excluir permanentemente" : "Prosseguir"}
          </button>
        </div>
      </div>
    </div>
  );
}
