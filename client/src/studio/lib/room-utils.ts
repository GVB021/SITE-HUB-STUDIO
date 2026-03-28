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

export function normalizeRoomRole(role: unknown) {
  const value = String(role || "").trim().toLowerCase().replace(/\s+/g, "_");
  if (
    value === "director" ||
    value === "diretor" ||
    value === "studio_admin" ||
    value === "engenheiro_audio" ||
    value === "platform_owner" ||
    value === "master"
  )
    return "diretor";
  return "dublador";
}

export type UiRole = "viewer" | "text_controller" | "audio_controller" | "admin";
export type UiPermission = "text_control" | "audio_control" | "presence_view" | "approve_take" | "dashboard_access";

export const UI_ROLE_PERMISSIONS: Record<UiRole, UiPermission[]> = {
  viewer: [],
  text_controller: ["text_control", "presence_view"],
  audio_controller: ["audio_control", "presence_view"],
  admin: ["text_control", "audio_control", "approve_take", "dashboard_access", "presence_view"],
};

export function resolveUiRole(role: unknown, controlledText: boolean): UiRole {
  const normalized = normalizeRoomRole(role);
  if (normalized === "diretor") return "admin";
  if (controlledText) return "text_controller";
  return "audio_controller";
}

export function hasUiPermission(role: UiRole, permission: UiPermission) {
  return UI_ROLE_PERMISSIONS[role].includes(permission);
}

export function canReceiveTextControl(role: unknown) {
  return normalizeRoomRole(role) !== "diretor";
}
