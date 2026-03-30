import { useMemo } from 'react';
import { getUserPermissions } from '@studio/lib/room-utils';

export type UserPermissions = ReturnType<typeof getUserPermissions>;

interface UseRoomPermissionsParams {
  user: { role?: string; id?: string } | null;
  studioRole: string | null;
  hasTextControl: boolean;
  isDirector: boolean;
}

/**
 * Hook centralizado para gerenciar permissões do usuário na sala
 * Substitui cálculos fragmentados de permissões
 */
export function useRoomPermissions(params: UseRoomPermissionsParams): UserPermissions {
  const { user, studioRole, hasTextControl, isDirector } = params;

  return useMemo(() => {
    return getUserPermissions(user, studioRole, hasTextControl, isDirector);
  }, [user, studioRole, hasTextControl, isDirector]);
}
