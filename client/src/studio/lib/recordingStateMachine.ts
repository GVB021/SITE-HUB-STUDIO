/**
 * Máquina de Estados para Gravação (Recording State Machine)
 * 
 * Define os estados possíveis e transições válidas para o fluxo de gravação
 */

export type RecordingState = 
  | "idle"
  | "countdown"
  | "recording"
  | "stopping"
  | "stopped"
  | "recorded"
  | "previewing";

/**
 * Transições válidas entre estados
 * Formato: { [estadoAtual]: [estadosPermitidos] }
 */
export const VALID_TRANSITIONS: Record<RecordingState, RecordingState[]> = {
  idle: ["countdown"],
  countdown: ["recording", "stopping", "idle"], // pode cancelar countdown
  recording: ["stopping"],
  stopping: ["recorded", "idle"], // pode ir para recorded (sucesso) ou idle (erro)
  stopped: ["idle"],
  recorded: ["idle", "previewing"],
  previewing: ["idle"],
};

/**
 * Verifica se uma transição de estado é válida
 */
export function isValidTransition(from: RecordingState, to: RecordingState): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Retorna uma descrição legível do estado
 */
export function getStateLabel(state: RecordingState): string {
  switch (state) {
    case "idle": return "Aguardando";
    case "countdown": return "Contagem";
    case "recording": return "GRAVANDO";
    case "stopping": return "Parando...";
    case "stopped": return "Parado";
    case "recorded": return "Take registrado";
    case "previewing": return "Visualizando";
    default: return state;
  }
}

/**
 * Retorna as classes CSS para o badge de status
 */
export function getStateBadgeClasses(state: RecordingState): string {
  switch (state) {
    case "countdown":
      return "bg-amber-500/15 text-amber-300 border border-amber-500/30";
    case "recording":
      return "bg-red-500/15 text-red-400 border border-red-500/30";
    case "stopping":
      return "bg-orange-500/15 text-orange-300 border border-orange-500/30";
    case "recorded":
      return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
    default:
      return "bg-muted/30 text-muted-foreground border border-white/10";
  }
}

/**
 * Hook para gerenciar transições de estado com validação
 */
export function createStateTransitioner(
  currentState: RecordingState,
  setState: (state: RecordingState) => void,
  onInvalidTransition?: (from: RecordingState, to: RecordingState) => void
) {
  return (nextState: RecordingState) => {
    if (isValidTransition(currentState, nextState)) {
      console.log(`[RecordingFSM] Transição: ${currentState} → ${nextState}`);
      setState(nextState);
    } else {
      console.error(`[RecordingFSM] Transição inválida: ${currentState} → ${nextState}`);
      onInvalidTransition?.(currentState, nextState);
    }
  };
}
