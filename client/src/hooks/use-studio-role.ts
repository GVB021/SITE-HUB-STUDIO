import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch";
import { useAuth } from "@/hooks/use-auth";

export type StudioRole = "owner" | "admin" | "director" | "dubber" | null;

const ROLE_HIERARCHY: Record<string, number> = {
  owner: 100,
  admin: 80,
  director: 60,
  dubber: 20,
};

export function useStudioRole(studioId: string) {
  const { user } = useAuth();

  const { data, isLoading } = useQuery<{ role: string | null; roles: string[] }>({
    queryKey: ["/api/studios", studioId, "my-role"],
    queryFn: () => authFetch(`/api/studios/${studioId}/my-role`),
    enabled: !!studioId && !!user,
    staleTime: 60000,
  });

  const roles: string[] = user?.role === "owner"
    ? ["owner"]
    : (data?.roles?.length ? data.roles : (data?.role ? [data.role] : []));

  const role: StudioRole = user?.role === "owner"
    ? "owner"
    : (data?.role as StudioRole) || null;

  const hasMinRole = (minRole: string): boolean => {
    const current = role || "dubber";
    return (ROLE_HIERARCHY[current] ?? 0) >= (ROLE_HIERARCHY[minRole] ?? 0);
  };

  const hasRole = (targetRole: string): boolean => {
    return roles.includes(targetRole);
  };

  return {
    role,
    roles,
    isLoading: isLoading && user?.role !== "owner",
    canManageMembers: hasMinRole("admin"),
    canCreateProductions: hasMinRole("admin"),
    canCreateSessions: hasMinRole("director"),
    canEditScripts: hasMinRole("admin"),
    canManageStaff: hasMinRole("admin"),
    canViewStaff: hasMinRole("director"),
    hasMinRole,
    hasRole,
  };
}
