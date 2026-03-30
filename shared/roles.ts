export const PLATFORM_ROLES = ["owner", "user"] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export const STUDIO_ROLES = [
  "owner",
  "admin", 
  "director",
  "dubber",
] as const;
export type StudioRole = (typeof STUDIO_ROLES)[number];

export const STUDIO_ROLE_HIERARCHY: Record<StudioRole, number> = {
  owner: 100,
  admin: 80,
  director: 60,
  dubber: 20,
};

const PLATFORM_ROLE_ALIASES: Record<string, PlatformRole> = {
  owner: "owner",
  platformowner: "owner",
  platform_owner: "owner",
  master: "owner",
  admin: "owner",
  administrador: "owner",
  administrator: "owner",
  super_admin: "owner",
  platform_admin: "owner",
  user: "user",
};

const STUDIO_ROLE_ALIASES: Record<string, StudioRole> = {
  owner: "owner",
  platformowner: "owner",
  platform_owner: "owner",
  admin: "admin",
  studio_admin: "admin",
  studioowner: "admin",
  studio_owner: "admin",
  administrador: "admin",
  administrator: "admin",
  master: "admin",
  diretor: "director",
  director: "director",
  teacher: "director",
  dublador: "dubber",
  actor: "dubber",
  voice_actor: "dubber",
  dubber: "dubber",
  engenheiro_audio: "dubber",
  engenheriodeaudio: "dubber",
  audio_engineer: "dubber",
  engineer: "dubber",
  aluno: "dubber",
  student: "dubber",
};

export function normalizePlatformRole(role: unknown): PlatformRole {
  const key = String(role || "").trim().toLowerCase().replace(/\s+/g, "_");
  return PLATFORM_ROLE_ALIASES[key] ?? "user";
}

export function normalizeStudioRole(role: unknown): StudioRole {
  const key = String(role || "").trim().toLowerCase().replace(/\s+/g, "_");
  return STUDIO_ROLE_ALIASES[key] ?? "dubber";
}

export function getHighestStudioRole(roles: Array<string | null | undefined>): StudioRole {
  let best: StudioRole = "dubber";
  let bestLevel = STUDIO_ROLE_HIERARCHY[best];
  for (const r of roles) {
    const nr = normalizeStudioRole(r);
    const lvl = STUDIO_ROLE_HIERARCHY[nr] ?? 0;
    if (lvl > bestLevel) {
      best = nr;
      bestLevel = lvl;
    }
  }
  return best;
}

export function hasMinStudioRole(role: unknown, minRole: StudioRole) {
  const current = normalizeStudioRole(role);
  return (STUDIO_ROLE_HIERARCHY[current] ?? 0) >= (STUDIO_ROLE_HIERARCHY[minRole] ?? 0);
}

export function isDirectorRole(role: unknown) {
  const r = normalizeStudioRole(role);
  return r === "owner" || r === "admin" || r === "director";
}

export function isDubberRole(role: unknown) {
  const r = normalizeStudioRole(role);
  return r === "dubber";
}

export function isPrivilegedStudioRole(role: unknown) {
  return isDirectorRole(role);
}
