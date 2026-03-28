import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@studio/lib/auth-fetch";
import { useAuth } from "@studio/hooks/use-auth";

export type StudioRole = "platform_owner" | "studio_admin" | "diretor" | "engenheiro_audio" | "dublador" | "aluno" | null;

const ROLE_HIERARCHY: Record<string, number> = {
  platform_owner: 100,
  studio_admin: 100,
  diretor: 100,
  engenheiro_audio: 100,
  dublador: 10,
  aluno: 10,
};

export function useStudioRole(studioId: string) {
  const { user } = useAuth();

  const { data, isLoading } = useQuery<{ role: string | null; roles: string[] }>({
    queryKey: ["/api/studios", studioId, "my-role"],
    queryFn: () => authFetch(`/api/studios/${studioId}/my-role`),
    enabled: !!studioId && !!user,
    staleTime: 60000,
  });

  const roles: string[] = user?.role === "platform_owner"
    ? ["platform_owner"]
    : (data?.roles?.length ? data.roles : (data?.role ? [data.role] : []));

  const role: StudioRole = user?.role === "platform_owner"
    ? "platform_owner"
    : (data?.role as StudioRole) || null;

  const hasMinRole = (minRole: string): boolean => {
    if (roles.length === 0) return false;
    return roles.some(r => (ROLE_HIERARCHY[r] ?? 0) >= (ROLE_HIERARCHY[minRole] ?? 999));
  };

  const hasRole = (targetRole: string): boolean => {
    return roles.includes(targetRole);
  };

  const isDirector = hasMinRole("diretor");
  const isDubber = !isDirector && (hasRole("dublador") || hasRole("aluno"));

  return {
    role,
    roles,
    isLoading: isLoading && user?.role !== "platform_owner",
    canManageMembers: isDirector,
    canCreateProductions: isDirector,
    canCreateSessions: isDirector,
    canEditScripts: isDirector,
    canManageStaff: isDirector,
    canViewStaff: isDirector,
    hasMinRole,
    hasRole,
    isDirector,
    isDubber,
  };
}
