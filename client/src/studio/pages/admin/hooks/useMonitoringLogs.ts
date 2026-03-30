import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@studio/lib/auth-fetch";

interface SimpleLog {
  id: string;
  type: 'recording' | 'upload' | 'access' | 'error';
  message: string;
  timestamp: Date;
  userId: string;
  userName: string;
}

export function useMonitoringLogs(studioId: string) {
  // Get monitoring logs
  const { data: logs, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/studios", studioId, "monitoring", "logs"],
    queryFn: async () => {
      try {
        const response = await authFetch(`/api/studios/${studioId}/monitoring/logs`);
        
        // Transform logs to simplified format
        const transformedLogs = (response as any[]).map((log, index) => ({
          id: log.id || `log-${index}`,
          type: log.type || 'access',
          message: log.message || log.action || 'Atividade registrada',
          timestamp: new Date(log.timestamp || log.createdAt || Date.now()),
          userId: log.userId || log.user?.id || 'unknown',
          userName: log.userName || log.user?.displayName || log.user?.fullName || log.user?.email || 'Usuário desconhecido',
        })) as SimpleLog[];

        return transformedLogs;
      } catch (err) {
        console.error('Error fetching monitoring logs:', err);
        return [];
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider data fresh for 10 seconds
  });

  return {
    logs,
    isLoading,
    error,
    refetch,
  };
}
