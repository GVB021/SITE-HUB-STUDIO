import { type Shortcuts } from "@studio/pages/room";

export const DEFAULT_SHORTCUTS: Shortcuts = {
  playPause: "Space",
  record: "KeyR",
  stop: "KeyS",
  back: "ArrowLeft",
  forward: "ArrowRight",
  loop: "KeyL",
};

export const SHORTCUT_LABELS: Record<keyof Shortcuts, string> = {
  playPause: "Play / Pause",
  record: "Gravar",
  stop: "Parar",
  back: "Voltar 2s",
  forward: "Avançar 2s",
  loop: "Alternar Loop",
};

export const UI_LAYER_BASE = {
  playerControls: 160,
  floatingButtons: 180,
  chatPanel: 1150,
  modalOverlay: 1400,
  confirmationModal: 1500,
  mobileDrawerOverlay: 1450,
  mobileDrawerContent: 1500,
} as const;

export function keyLabel(code: string) {
  if (code === "Space") return "Espaço";
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Arrow")) return code.slice(5);
  return code;
}

export function normalizeRoomRole(role: unknown): string {
  const str = String(role || "").trim().toLowerCase();
  switch (str) {
    case "owner":
    case "admin":
    case "director":
      return str;
    default:
      return "dubber";
  }
}

export type UiRole = "viewer" | "text_controller" | "audio_controller" | "admin";
export type UiPermission = "text_control" | "audio_control" | "presence_view" | "approve_take" | "dashboard_access";

export const UI_ROLE_PERMISSIONS: Record<UiRole, UiPermission[]> = {
  viewer: [],
  text_controller: ["text_control", "presence_view"],
  audio_controller: ["audio_control", "presence_view"],
  admin: ["text_control", "audio_control", "approve_take", "dashboard_access", "presence_view"],
};

const PRIVILEGED_ROLES = new Set([
  "owner",
  "admin", 
  "director",
]);

export function resolveUiRole(role: unknown, controlledText: boolean): UiRole {
  const normalized = normalizeRoomRole(role);
  if (normalized === "director") return "admin";
  if (controlledText) return "text_controller";
  return "audio_controller";
}

export function hasUiPermission(role: string | undefined, permission: UiPermission): boolean {
  if (!role) return false;
  
  // Directors and admins can do most things
  if (PRIVILEGED_ROLES.has(role)) {
    return true;
  }
  
  // Dubbers can only view presence
  if (permission === "presence_view" && role === "dubber") {
    return true;
  }
  
  return false;
}

export function canReceiveTextControl(role: unknown) {
  return normalizeRoomRole(role) !== "director";
}

/**
 * Função centralizada para calcular todas as permissões de um usuário na sala de gravação
 * 
 * @param user - Objeto do usuário (com role global)
 * @param studioRole - Role do usuário no estúdio (owner, admin, director, dubber)
 * @param hasTextControl - Se o usuário recebeu controle de texto do diretor
 * @param isDirector - Se o usuário é diretor da sessão
 * @returns Objeto com todas as permissões calculadas
 */
export function getUserPermissions(
  user: { role?: string; id?: string } | null,
  studioRole: string | null,
  hasTextControl: boolean,
  isDirector: boolean
) {
  // Calcular se é privilegiado (owner global, admin de estúdio, owner de estúdio, ou diretor)
  const isPrivileged = 
    user?.role === "owner" || 
    studioRole === "admin" || 
    studioRole === "owner" || 
    isDirector;

  // Calcular UI role
  const uiRole = resolveUiRole(studioRole, hasTextControl);

  return {
    // Flags de identificação
    isPrivileged,
    isDirector,
    isDubber: !isDirector && studioRole === "dubber",
    
    // Permissões específicas
    canControlVideo: isDirector || hasTextControl,
    canTextControl: isPrivileged || hasTextControl,
    canManageAudio: isPrivileged,
    canApproveTake: isPrivileged,
    canViewOnlineUsers: true, // Todos podem ver usuários online
    canAccessDashboard: isPrivileged || user?.role === "owner",
    canEditScript: isPrivileged || hasTextControl,
    canGrantTextControl: isPrivileged,
    canNavigateScript: isPrivileged || hasTextControl,
    canSelectLoop: isPrivileged || hasTextControl,
    
    // UI role para compatibilidade
    uiRole,
  };
}

/**
 * Verifica se um usuário pode realizar uma ação específica
 * Wrapper para hasUiPermission com melhor tipagem
 */
export function canPerformAction(
  permissions: ReturnType<typeof getUserPermissions>,
  action: 
    | "control_video"
    | "text_control" 
    | "manage_audio"
    | "approve_take"
    | "view_users"
    | "access_dashboard"
    | "edit_script"
    | "grant_text_control"
    | "navigate_script"
    | "select_loop"
): boolean {
  switch (action) {
    case "control_video": return permissions.canControlVideo;
    case "text_control": return permissions.canTextControl;
    case "manage_audio": return permissions.canManageAudio;
    case "approve_take": return permissions.canApproveTake;
    case "view_users": return permissions.canViewOnlineUsers;
    case "access_dashboard": return permissions.canAccessDashboard;
    case "edit_script": return permissions.canEditScript;
    case "grant_text_control": return permissions.canGrantTextControl;
    case "navigate_script": return permissions.canNavigateScript;
    case "select_loop": return permissions.canSelectLoop;
    default: return false;
  }
}
