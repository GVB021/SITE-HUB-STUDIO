import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@studio/lib/auth-fetch";
import { DEFAULT_PAGINATION } from "@studio/lib/pagination";

export function useSessionData(studioId: string, sessionId: string) {
  return useQuery({
    queryKey: ["/api/studios", studioId, "sessions", sessionId],
    queryFn: () => authFetch(`/api/studios/${studioId}/sessions/${sessionId}`),
    enabled: Boolean(studioId && sessionId),
  });
}

export function useProductionScript(studioId: string, productionId?: string) {
  return useQuery({
    queryKey: ["/api/studios", studioId, "productions", productionId],
    queryFn: () => authFetch(`/api/studios/${studioId}/productions/${productionId}`),
    enabled: Boolean(studioId && productionId),
  });
}

export function useCharactersList(productionId?: string) {
  return useQuery<Array<{ id: string; name: string; voiceActorId: string | null }>>({
    queryKey: ["/api/productions", productionId, "characters"],
    queryFn: () => authFetch(`/api/productions/${productionId}/characters`),
    enabled: Boolean(productionId),
  });
}

export function useTakesList(sessionId: string) {
  return useQuery({
    queryKey: ["/api/sessions", sessionId, "takes"],
    queryFn: () => authFetch(`/api/sessions/${sessionId}/takes`),
    enabled: Boolean(sessionId),
    refetchInterval: 20000,
  });
}

export type RecordingsQueryParams = {
  page: number;
  pageSize: number;
  search: string;
  userId?: string;
  from?: string;
  to?: string;
  sortBy: "createdAt" | "durationSeconds" | "lineIndex" | "characterName";
  sortDir: "asc" | "desc";
};

export type RecordingsResponse = {
  items: any[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
};

export function useRecordingsList(sessionId: string, params: RecordingsQueryParams) {
  const cacheKey = `vhub_recordings_cache_${sessionId}`;
  const page = params.page || DEFAULT_PAGINATION.page;
  const pageSize = params.pageSize || DEFAULT_PAGINATION.pageSize;
  const query = useQuery({
    queryKey: ["/api/sessions", sessionId, "recordings", params],
    queryFn: async () => {
      console.debug("[Room][Recordings] iniciando leitura de takes", { sessionId });
      try {
        const queryString = new URLSearchParams();
        queryString.set("page", String(page));
        queryString.set("pageSize", String(pageSize));
        queryString.set("sortBy", params.sortBy);
        queryString.set("sortDir", params.sortDir);
        if (params.search) queryString.set("search", params.search);
        if (params.userId) queryString.set("userId", params.userId);
        if (params.from) queryString.set("from", params.from);
        if (params.to) queryString.set("to", params.to);
        const data = await authFetch(`/api/sessions/${sessionId}/recordings?${queryString.toString()}`);
        const normalized: RecordingsResponse = Array.isArray(data)
          ? { items: data, page, pageSize: data.length || pageSize, total: data.length || 0, pageCount: 1 }
          : {
              items: Array.isArray(data?.items) ? data.items : Array.isArray(data?.takes) ? data.takes : [],
              page: Number(data?.page || page),
              pageSize: Number(data?.pageSize || pageSize),
              total: Number(data?.total || 0),
              pageCount: Number(
                data?.pageCount || Math.ceil((data?.total || 0) / (data?.pageSize || pageSize)) || 1
              ),
            };
        console.debug("[Room][Recordings] takes carregados", { sessionId, total: normalized.total });
        return normalized;
      } catch (error) {
        console.error("[Room][Recordings] falha ao carregar takes", { sessionId, error });
        // Return empty data instead of throwing to prevent repeated errors
        return {
          items: [],
          page: params.page || DEFAULT_PAGINATION.page,
          pageSize: params.pageSize || DEFAULT_PAGINATION.pageSize,
          total: 0,
          pageCount: 1,
        };
      }
    },
    enabled: Boolean(sessionId),
    refetchInterval: 20000,
    initialData: () => {
      try {
        const raw = localStorage.getItem(cacheKey);
        const items = raw ? JSON.parse(raw) : [];
        return {
          items,
          page: DEFAULT_PAGINATION.page,
          pageSize: DEFAULT_PAGINATION.pageSize,
          total: Array.isArray(items) ? items.length : 0,
          pageCount: 1,
        };
      } catch {
        return {
          items: [],
          page: DEFAULT_PAGINATION.page,
          pageSize: DEFAULT_PAGINATION.pageSize,
          total: 0,
          pageCount: 1,
        };
      }
    },
    staleTime: 1000,
  });

  useEffect(() => {
    if (!Array.isArray(query.data?.items)) return;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(query.data.items.slice(0, 120)));
    } catch {}
  }, [cacheKey, query.data?.items]);

  return query;
}
