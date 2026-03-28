import { useMemo, useState, useEffect, useCallback, useRef, type ChangeEvent } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pause, Play, ChevronRight, FileAudio, Check, Download, Trash2, Search, AlertCircle, UploadCloud, Music3, Zap } from "lucide-react";
import { AppHeader } from "@/components/nav/AppHeader";
import { authFetch } from "@/lib/auth-fetch";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// Hook para detectar mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
}

type HubAlignAccess = {
  allowed: boolean;
  username: string;
  expected: string;
  supabaseOk: boolean;
  supabaseReason: string | null;
};

type HubAlignProject = {
  id: string;
  name: string;
  description: string;
  fileCount: number;
  versionCount: number;
  debug?: string[];
};

type HubAlignTake = {
  id: string;
  characterId: string | null;
  characterName: string;
  productionId: string;
  productionName: string;
  voiceActorId: string | null;
  voiceActorName: string;
  sessionId: string;
  sessionTitle: string;
  startTimeSeconds: number | null;
  lineIndex: number;
  durationSeconds: number;
  audioUrl: string;
  streamUrl: string;
  isPreferred: boolean;
};

type TrackRow = {
  id: string;
  takeId: string;
  fileName: string;
  streamUrl: string;
  startSeconds: number;
  durationSeconds: number;
  characterName: string;
};

type HubAlignSession = {
  id: string;
  title: string;
  productionId: string;
  productionName: string;
  characterCount: number;
  takeCount: number;
  preferredTakeCount: number;
  totalTakeCount: number;
};

type HubAlignProductTake = {
  takeId: string;
  lineIndex: number;
  startTimeSeconds: number | null;
  durationSeconds: number;
  audioUrl: string;
  characterName: string;
  voiceActorName: string;
};

type HubAlignProductAssignment = {
  characterId: string;
  characterName: string;
  voiceActorId: string;
  voiceActorName: string;
  takeIds: string[];
};

type HubAlignProductManifest = {
  id: string;
  name: string;
  sessionId: string;
  sessionTitle: string;
  productionId: string;
  productionName: string;
  status: "pending" | "mixing" | "ready" | "error";
  metadata: {
    assignmentCount: number;
    takeCount: number;
  };
  assignments: {
    characterId: string;
    characterName: string;
    voiceActorId: string;
    voiceActorName: string;
    takes: HubAlignProductTake[];
  }[];
  timeline: HubAlignProductTake[];
  meTrackPath?: string | null;
  finalUrl?: string | null;
  note?: string | null;
  createdAt?: string;
};

const STATUS_BADGE_CLASSES: Record<HubAlignProductManifest["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  mixing: "bg-orange-100 text-orange-700 border-orange-200",
  ready: "bg-emerald-100 text-emerald-800 border-emerald-200",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

const normalizeTake = (take: HubAlignTake): HubAlignProductTake => ({
  takeId: take.id,
  lineIndex: take.lineIndex,
  startTimeSeconds: take.startTimeSeconds,
  durationSeconds: take.durationSeconds,
  audioUrl: take.audioUrl,
  characterName: take.characterName,
  voiceActorName: take.voiceActorName,
});

type BuilderVoiceActor = {
  key: string;
  id: string;
  name: string;
  takes: HubAlignTake[];
  takeCount: number;
};

type BuilderCharacter = {
  key: string;
  characterId: string;
  characterName: string;
  voiceActors: BuilderVoiceActor[];
};

const slugifyKey = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "unnamed";
};

function formatSize(input: number) {
  if (!Number.isFinite(input) || input <= 0) return "0 B";
  if (input >= 1024 * 1024) return `${(input / (1024 * 1024)).toFixed(2)} MB`;
  if (input >= 1024) return `${(input / 1024).toFixed(1)} KB`;
  return `${Math.round(input)} B`;
}

export default function HubAlignPage() {
  const isMobile = useIsMobile();
  const [lang, setLang] = useState<"en" | "pt">("pt");
  const [, navigate] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedTakes, setSelectedTakes] = useState<HubAlignTake[]>([]);
  const [selectedPreview, setSelectedPreview] = useState<string>("");
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [hubDubSearch, setHubDubSearch] = useState("");
  const [isGeneratingTrack, setIsGeneratingTrack] = useState(false);
  const [trackReady, setTrackReady] = useState(false);
  const [lastDebug, setLastDebug] = useState<string[]>([]);
  const [showStatus, setShowStatus] = useState(false);
  const [builderSessionId, setBuilderSessionId] = useState("");
  const [builderProductName, setBuilderProductName] = useState("");
  const [builderNote, setBuilderNote] = useState("");
  const [assignmentMap, setAssignmentMap] = useState<Record<string, string>>({});
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [currentMixingProductId, setCurrentMixingProductId] = useState<string | null>(null);
  const [uploadingMeProductId, setUploadingMeProductId] = useState<string | null>(null);
  const meInputRef = useRef<HTMLInputElement>(null);

  const accessQuery = useQuery<HubAlignAccess>({
    queryKey: ["/api/hubalign/access"],
    queryFn: () => authFetch("/api/hubalign/access"),
    enabled: Boolean(user),
    retry: false,
  });

  const handleMeUploadClick = (productId: string) => {
    setUploadingMeProductId(productId);
    meInputRef.current?.click();
  };

  const handleMeFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedProjectId || !uploadingMeProductId) return;
    uploadMeMutation.mutate({ projectId: selectedProjectId, productId: uploadingMeProductId, file });
    event.target.value = "";
  };

  const projectsQuery = useQuery<{ items: HubAlignProject[] }>({
    queryKey: ["/api/hubalign/projects"],
    queryFn: () => authFetch("/api/hubalign/projects"),
    enabled: Boolean(accessQuery.data?.allowed),
  });

  const hubDubTakesQuery = useQuery<{ items: HubAlignTake[] }>({
    queryKey: ["/api/hubalign/hubdub-takes", hubDubSearch, "all"],
    queryFn: () => authFetch(`/api/hubalign/hubdub-takes?allTakes=true&search=${encodeURIComponent(hubDubSearch)}`),
    enabled: Boolean(accessQuery.data?.allowed),
  });

  const sessionsQuery = useQuery<{ items: HubAlignSession[] }>({
    queryKey: ["/api/hubalign/sessions"],
    queryFn: () => authFetch("/api/hubalign/sessions"),
    enabled: Boolean(accessQuery.data?.allowed),
  });

  const productsQuery = useQuery<{ items: HubAlignProductManifest[] }>({
    queryKey: ["/api/hubalign/projects", selectedProjectId, "products"],
    queryFn: () => authFetch(`/api/hubalign/projects/${selectedProjectId}/products`),
    enabled: Boolean(accessQuery.data?.allowed && selectedProjectId),
    keepPreviousData: true,
  });

  const sessionsOptions = sessionsQuery.data?.items || [];
  const currentSession = sessionsOptions.find((session) => session.id === builderSessionId);

  const builderSessionTakes = useMemo(() => {
    if (!builderSessionId || !hubDubTakesQuery.data?.items) return [];
    return hubDubTakesQuery.data.items.filter((take) => take.sessionId === builderSessionId);
  }, [builderSessionId, hubDubTakesQuery.data]);

  const builderCharacters = useMemo(() => {
    const map = new Map<string, BuilderCharacter & { voiceActorMap: Map<string, BuilderVoiceActor> }>();
    for (const take of builderSessionTakes) {
      const characterId = take.characterId || slugifyKey(take.characterName || `char-${take.id}`);
      const characterName = take.characterName || "Sem personagem";
      const actorId = take.voiceActorId || slugifyKey(take.voiceActorName || `actor-${take.id}`);
      const actorName = take.voiceActorName || "Sem dublador";
      const charEntry = map.get(characterId) ?? {
        key: characterId,
        characterId,
        characterName,
        voiceActors: [],
        voiceActorMap: new Map<string, BuilderVoiceActor>(),
      };
      const actorEntry = charEntry.voiceActorMap.get(actorId) ?? {
        key: actorId,
        id: actorId,
        name: actorName,
        takes: [],
        takeCount: 0,
      };
      actorEntry.takes.push(take);
      actorEntry.takeCount = actorEntry.takes.length;
      charEntry.voiceActorMap.set(actorId, actorEntry);
      map.set(characterId, charEntry);
    }
    return Array.from(map.values())
      .map((charEntry) => ({
        key: charEntry.key,
        characterId: charEntry.characterId,
        characterName: charEntry.characterName,
        voiceActors: Array.from(charEntry.voiceActorMap.values()),
      }))
      .sort((a, b) => a.characterName.localeCompare(b.characterName));
  }, [builderSessionTakes]);

  const [takeSelectionMap, setTakeSelectionMap] = useState<Record<string, Set<string>>>({});

  useEffect(() => {
    if (!builderSessionId) {
      setAssignmentMap({});
      setTakeSelectionMap({});
      return;
    }
    setAssignmentMap((prev) => {
      const next: Record<string, string> = {};
      builderCharacters.forEach((character) => {
        const preferred = prev[character.characterId];
        const hasPreferred = character.voiceActors.some((actor) => actor.id === preferred);
        const fallback = character.voiceActors[0]?.id || "";
        next[character.characterId] = hasPreferred ? preferred : fallback;
      });
      return next;
    });
    // Default: select preferred takes per character
    setTakeSelectionMap(() => {
      const next: Record<string, Set<string>> = {};
      for (const take of builderSessionTakes) {
        const characterId = take.characterId || slugifyKey(take.characterName || `char-${take.id}`);
        if (!next[characterId]) next[characterId] = new Set();
        if (take.isPreferred) next[characterId].add(take.id);
      }
      return next;
    });
  }, [builderSessionId, builderCharacters]);

  const toggleTakeInSelection = (characterId: string, takeId: string) => {
    setTakeSelectionMap((prev) => {
      const next = { ...prev };
      const set = new Set(next[characterId] || []);
      if (set.has(takeId)) set.delete(takeId);
      else set.add(takeId);
      next[characterId] = set;
      return next;
    });
  };

  const selectAllTakesForCharacter = (characterId: string, takeIds: string[]) => {
    setTakeSelectionMap((prev) => ({ ...prev, [characterId]: new Set(takeIds) }));
  };

  const clearTakesForCharacter = (characterId: string) => {
    setTakeSelectionMap((prev) => ({ ...prev, [characterId]: new Set() }));
  };

  const builderAssignments = useMemo(() => {
    return builderCharacters.map((character) => {
      const actorId = assignmentMap[character.characterId];
      const actor = character.voiceActors.find((item) => item.id === actorId) || character.voiceActors[0];
      const selectedIds = takeSelectionMap[character.characterId] || new Set<string>();
      const filteredTakes = (actor?.takes || []).filter((take) => selectedIds.has(take.id));
      const normalizedTakes = filteredTakes.map((take) => normalizeTake(take));
      return {
        characterId: character.characterId,
        characterName: character.characterName,
        voiceActorId: actor?.id || "",
        voiceActorName: actor?.name || "",
        takes: normalizedTakes,
      };
    });
  }, [builderCharacters, assignmentMap, takeSelectionMap]);

  const builderTimeline = useMemo(() => {
    const timeline = builderAssignments.flatMap((assignment) => assignment.takes);
    return [...timeline].sort((a, b) => (a.startTimeSeconds ?? 0) - (b.startTimeSeconds ?? 0));
  }, [builderAssignments]);

  const builderTimelineDuration = builderTimeline.reduce((acc, take) => acc + take.durationSeconds, 0);
  const builderAssignmentsComplete = builderAssignments.length > 0 && builderAssignments.every((assignment) => assignment.voiceActorId && assignment.takes.length > 0);
  const canCreateProduct = Boolean(
    selectedProjectId &&
      builderSessionId &&
      builderProductName.trim() &&
      builderAssignmentsComplete
  );

  const handleAssignmentChange = (characterId: string, voiceActorId: string) => {
    setAssignmentMap((prev) => ({ ...prev, [characterId]: voiceActorId }));
  };

  const handleCreateProduct = () => {
    if (!canCreateProduct || !selectedProjectId) return;
    const sessionTitle = sessionsOptions.find((session) => session.id === builderSessionId)?.title || builderSessionId;
    const productionId = sessionsOptions.find((session) => session.id === builderSessionId)?.productionId || "";
    const productionName = sessionsOptions.find((session) => session.id === builderSessionId)?.productionName || "";
    const payload = {
      name: builderProductName.trim(),
      sessionId: builderSessionId,
      sessionTitle,
      productionId,
      productionName,
      assignments: builderAssignments.map((assignment) => ({
        characterId: assignment.characterId,
        characterName: assignment.characterName,
        voiceActorId: assignment.voiceActorId,
        voiceActorName: assignment.voiceActorName,
        takeIds: assignment.takes.map((take) => take.takeId),
      })),
      timeline: builderTimeline,
      note: builderNote.trim() || undefined,
    };
    setIsCreatingProduct(true);
    createProductMutation.mutate(payload);
  };

  useEffect(() => {
    if (sessionsOptions.length > 0 && !builderSessionId) {
      setBuilderSessionId(sessionsOptions[0].id);
    }
  }, [sessionsOptions, builderSessionId]);

  const createProductMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      authFetch(`/api/hubalign/projects/${selectedProjectId}/products`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      toast({ title: "Produto salvo", description: "Manifest do produto armazenado." });
      setBuilderProductName("");
      setBuilderNote("");
      setIsCreatingProduct(false);
      queryClient.invalidateQueries({ queryKey: ["/api/hubalign/projects", selectedProjectId, "products"] });
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err.message || "Falha ao criar produto", variant: "destructive" });
    },
    onSettled: () => {
      setIsCreatingProduct(false);
    },
  });

  const mixProductMutation = useMutation({
    mutationFn: ({ projectId, productId }: { projectId: string; productId: string }) =>
      authFetch(`/api/hubalign/projects/${projectId}/products/${productId}/mix`, { method: "POST" }),
    onSettled: () => {
      setCurrentMixingProductId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/hubalign/projects", selectedProjectId, "products"] });
    },
    onSuccess: () => {
      toast({ title: "Mix concluída", description: "Áudio final gerado." });
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err.message || "Falha ao mixar", variant: "destructive" });
    },
  });

  const handleMixProduct = (productId: string) => {
    if (!selectedProjectId) return;
    setCurrentMixingProductId(productId);
    mixProductMutation.mutate({ projectId: selectedProjectId, productId });
  };

  const uploadMeMutation = useMutation({
    mutationFn: ({ projectId, productId, file }: { projectId: string; productId: string; file: File }) => {
      const formData = new FormData();
      formData.append("meTrack", file);
      return authFetch(`/api/hubalign/projects/${projectId}/products/${productId}/me-upload`, {
        method: "POST",
        body: formData,
      });
    },
    onSettled: () => {
      setUploadingMeProductId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/hubalign/projects", selectedProjectId, "products"] });
    },
    onSuccess: () => {
      toast({ title: "M&E atualizada", description: "Arquivo enviado para o produto." });
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err.message || "Falha ao enviar M&E", variant: "destructive" });
    },
  });

  const statusQuery = useQuery<{
    projectId: string;
    latestVersion: any;
    history: any[];
    metrics: any;
  }>({
    queryKey: ["/api/hubalign/projects", selectedProjectId, "status"],
    queryFn: () => authFetch(`/api/hubalign/projects/${selectedProjectId}/status`),
    enabled: Boolean(selectedProjectId),
    refetchInterval: 5000, // Atualiza a cada 5s para tempo real
  });

  const createProjectMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch("/api/hubalign/projects", {
        method: "POST",
        body: JSON.stringify({ name: projectName, description: projectDescription }),
      });
      if (res.debug) setLastDebug(res.debug);
      return res;
    },
    onSuccess: (created: HubAlignProject) => {
      queryClient.invalidateQueries({ queryKey: ["/api/hubalign/projects"] });
      setSelectedProjectId(created.id);
      setProjectName("");
      setProjectDescription("");
      toast({ title: "Projeto criado com sucesso" });
    },
    onError: (err: any) => {
      if (err.debug) setLastDebug(err.debug);
      toast({ title: "Erro ao criar projeto", description: err.message, variant: "destructive" });
    }
  });

  const assembleTrackMutation = useMutation({
    mutationFn: async () => {
      const timeline = selectedTakes.reduce((acc, take, idx) => {
        const start = idx === 0 ? 0 : acc[idx-1].startSeconds + acc[idx-1].durationSeconds;
        acc.push({
          id: `row-${take.id}-${idx}`,
          takeId: take.id,
          fileName: `${take.characterName}_${take.id}.wav`,
          streamUrl: take.streamUrl,
          startSeconds: start,
          durationSeconds: take.durationSeconds,
          characterName: take.characterName,
        });
        return acc;
      }, [] as TrackRow[]);

      const res = await authFetch(`/api/hubalign/projects/${selectedProjectId}/assemble`, {
        method: "POST",
        body: JSON.stringify({ selectedTakes, timeline }),
      });
      if (res.debug) setLastDebug(res.debug);
      return res;
    },
    onSuccess: () => {
      setIsGeneratingTrack(false);
      setTrackReady(true);
      toast({ title: "Timeline organizada com sucesso" });
    },
    onError: (err: any) => {
      setIsGeneratingTrack(false);
      if (err.debug) setLastDebug(err.debug);
      toast({ title: "Erro na montagem", description: err.message, variant: "destructive" });
    }
  });

  const toggleTakeSelection = useCallback((take: HubAlignTake) => {
    setSelectedTakes(prev => {
      const isSelected = prev.some(t => t.id === take.id);
      if (isSelected) {
        return prev.filter(t => t.id !== take.id);
      } else {
        return [...prev, take];
      }
    });
    setTrackReady(false);
  }, []);

  const moveTake = useCallback((index: number, direction: "up" | "down") => {
    setSelectedTakes(prev => {
      const next = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
    setTrackReady(false);
  }, []);

  const tracks = useMemo<TrackRow[]>(() => {
    let start = 0;
    return selectedTakes.map((take, idx) => {
      const row = {
        id: `row-${take.id}-${idx}`,
        takeId: take.id,
        fileName: `${take.characterName}_${take.id}.wav`,
        streamUrl: take.streamUrl,
        startSeconds: start,
        durationSeconds: take.durationSeconds,
        characterName: take.characterName,
      };
      start += row.durationSeconds;
      return row;
    });
  }, [selectedTakes]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader lang={lang} setLang={setLang} />
        <main className="pt-28 max-w-4xl mx-auto px-6">
          <div className="rounded-2xl border border-border p-8 bg-card">
            <h1 className="text-2xl font-semibold mb-2">HubAlign - Acesso restrito</h1>
            <p className="text-muted-foreground mb-6">Faça login para acessar o ambiente de montagem e sincronização.</p>
            <button className="h-10 px-5 rounded-md bg-primary text-primary-foreground font-semibold" onClick={() => navigate("/hub-dub/login")}>
              Ir para login
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (accessQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!accessQuery.data?.allowed) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader lang={lang} setLang={setLang} />
        <main className="pt-28 max-w-4xl mx-auto px-6">
          <div className="rounded-2xl border border-border p-8 bg-card">
            <h1 className="text-2xl font-semibold mb-2">Acesso não autorizado</h1>
            <p className="text-muted-foreground">A área HubAlign está liberada exclusivamente para o usuário borbaggabriel.</p>
          </div>
        </main>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <AppHeader lang={lang} setLang={setLang} />
        <main className="flex-1 pt-20 px-4 pb-10 space-y-6">
          <section className="space-y-4">
            <h1 className="text-xl font-bold">HubAlign Mobile</h1>
            <div className="rounded-2xl bg-card border border-border p-4 shadow-sm">
              <h2 className="text-sm font-semibold mb-3">Selecione o Projeto</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {(projectsQuery.data?.items || []).map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setTrackReady(false);
                    }}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl border text-sm transition-all ${
                      selectedProjectId === project.id ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 border-border"
                    }`}
                  >
                    {project.name}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {selectedProjectId && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Seleção de Takes</h2>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">{selectedTakes.length} selecionados</span>
              </div>
              <div className="grid gap-3">
                {(hubDubTakesQuery.data?.items || []).map((take) => {
                  const isSelected = selectedTakes.some(t => t.id === take.id);
                  return (
                    <button
                      key={take.id}
                      onClick={() => toggleTakeSelection(take)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left min-h-[56px] ${
                        isSelected ? "bg-primary/5 border-primary/30" : "bg-card border-border"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? "bg-primary border-primary text-primary-foreground" : "bg-muted/50 border-border"
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold truncate max-w-[200px]">{take.characterName || "Sem personagem"}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{take.productionName}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">{take.durationSeconds.toFixed(1)}s</span>
                    </button>
                  );
                })}
              </div>

              <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border/50 z-50">
                {!trackReady ? (
                  <button
                    disabled={selectedTakes.length === 0 || isGeneratingTrack}
                    onClick={() => {
                      setIsGeneratingTrack(true);
                      assembleTrackMutation.mutate();
                    }}
                    className="vhub-btn-lg w-full bg-primary text-primary-foreground flex items-center justify-center gap-2 rounded-2xl"
                  >
                    {isGeneratingTrack ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <FileAudio className="w-4 h-4" />
                        Gerar Track
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
                      <button
                        className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                        onClick={() => {
                          const audio = document.getElementById("hubalign-audio-mobile") as HTMLAudioElement;
                          if (audio.paused) {
                            audio.play();
                            setIsPreviewPlaying(true);
                          } else {
                            audio.pause();
                            setIsPreviewPlaying(false);
                          }
                        }}
                      >
                        {isPreviewPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold truncate">Track Gerada • {selectedTakes.length} takes</p>
                        <audio id="hubalign-audio-mobile" src={selectedTakes[0]?.streamUrl} className="hidden" onPlay={() => setIsPreviewPlaying(true)} onPause={() => setIsPreviewPlaying(false)} />
                      </div>
                      <button 
                        className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = selectedTakes[0]?.streamUrl;
                          link.download = "track-final.wav";
                          link.click();
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                    <button onClick={() => setTrackReady(false)} className="w-full text-xs text-muted-foreground font-bold uppercase tracking-widest py-2">
                      Recomeçar
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader lang={lang} setLang={setLang} />
      <main className="pt-24 pb-16 max-w-[1400px] mx-auto px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">HubAlign</h1>
            <p className="text-muted-foreground">Upload e gerenciamento de dublagens com sincronização inteligente.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowStatus(!showStatus)}
              className={`h-10 px-4 rounded-md border flex items-center gap-2 text-sm font-semibold transition-all ${showStatus ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"}`}
            >
              <AlertCircle className="w-4 h-4" />
              {showStatus ? "Ocultar Dashboard" : "Ver Dashboard Real-time"}
            </button>
          </div>
        </div>

        {showStatus && selectedProjectId && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="lg:col-span-2 rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Play className="w-4 h-4 text-primary" />
                  Status da Timeline
                </h3>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${statusQuery.data?.metrics?.status === "timeline_ready" ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"}`}>
                  {statusQuery.data?.metrics?.status === "timeline_ready" ? "PRONTO PARA USO" : "PENDENTE"}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background/40 p-4 rounded-lg border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Duração Total</p>
                  <p className="text-xl font-mono">{(statusQuery.data?.latestVersion?.metadata?.totalDuration || 0).toFixed(2)}s</p>
                </div>
                <div className="bg-background/40 p-4 rounded-lg border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Takes na Timeline</p>
                  <p className="text-xl font-mono">{statusQuery.data?.metrics?.takesCount || 0}</p>
                </div>
                <div className="bg-background/40 p-4 rounded-lg border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Última Montagem</p>
                  <p className="text-sm font-mono">{statusQuery.data?.metrics?.lastAssemblyTime ? new Date(statusQuery.data.metrics.lastAssemblyTime).toLocaleString() : "---"}</p>
                </div>
              </div>

              {statusQuery.data?.latestVersion && (
                <div className="bg-black/20 p-4 rounded-lg border border-white/5 space-y-2">
                  <p className="text-xs font-bold uppercase text-primary/70">Resumo da Montagem</p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-xs">Timeline Lógica Gerada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-xs">{statusQuery.data?.latestVersion?.metadata?.characterCount || 0} Personagens Únicos</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Histórico de Versões</h3>
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {statusQuery.data?.history?.map((v: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border text-xs">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[10px] text-primary">{v.name.split("/").pop().slice(0, 16)}...</span>
                      <span className="text-muted-foreground">{new Date(v.updatedAt).toLocaleString()}</span>
                    </div>
                    <span className="text-muted-foreground">{formatSize(v.size)}</span>
                  </div>
                ))}
                {(!statusQuery.data?.history || statusQuery.data.history.length === 0) && (
                  <p className="text-center text-muted-foreground text-xs py-8">Nenhuma versão encontrada.</p>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase">Projetos</p>
            <p className="text-2xl font-bold">{projectsQuery.data?.items?.length || 0}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase">Takes Disponíveis</p>
            <p className="text-2xl font-bold">{hubDubTakesQuery.data?.items?.length || 0}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase">Takes selecionados</p>
            <p className="text-2xl font-bold">{selectedTakes.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase">Duração Total</p>
            <p className="text-2xl font-bold">{selectedTakes.reduce((acc, t) => acc + t.durationSeconds, 0).toFixed(1)}s</p>
          </div>
        </section>

        {lastDebug.length > 0 && (
          <section className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-blue-400">
              <Search className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Debugger de Operação</h3>
            </div>
            <div className="bg-black/40 rounded-lg p-3 font-mono text-[10px] space-y-1 max-h-32 overflow-y-auto">
              {lastDebug.map((line, i) => (
                <p key={i} className="text-blue-200/70">{line}</p>
              ))}
            </div>
            <button onClick={() => setLastDebug([])} className="text-[10px] text-blue-400 hover:underline uppercase font-bold">Limpar logs</button>
          </section>
        )}

        <section className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-lg font-semibold">Projetos HubAlign</h2>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
            <input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Nome do projeto" className="h-10 rounded-md border border-border px-3 bg-background" />
            <input value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} placeholder="Descrição técnica" className="h-10 rounded-md border border-border px-3 bg-background" />
            <button
              className="h-10 px-4 rounded-md bg-primary text-primary-foreground font-semibold disabled:opacity-50"
              onClick={() => createProjectMutation.mutate()}
              disabled={createProjectMutation.isPending}
            >
              {createProjectMutation.isPending ? "Criando..." : "Criar projeto"}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(projectsQuery.data?.items || []).map((project) => (
              <button
                key={project.id}
                className={`text-left rounded-lg border p-4 transition-all ${selectedProjectId === project.id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:border-border/80"}`}
                onClick={() => {
                  setSelectedProjectId(project.id);
                  setTrackReady(false);
                }}
              >
                <p className="font-semibold">{project.name}</p>
                <p className="text-sm text-muted-foreground">{project.description || "Sem descrição"}</p>
                <p className="text-xs text-muted-foreground mt-2">{project.fileCount} takes vinculados • {project.versionCount} montagens</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Takes dublados do HubDub</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  value={hubDubSearch} 
                  onChange={(e) => setHubDubSearch(e.target.value)} 
                  placeholder="Buscar personagem, produção, ator..." 
                  className="h-9 w-80 rounded-md border border-border pl-9 pr-3 bg-background text-sm" 
                />
              </div>
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {hubDubTakesQuery.isLoading && <div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>}
            {(hubDubTakesQuery.data?.items || []).map((take) => {
              const isSelected = selectedTakes.some(t => t.id === take.id);
              return (
                <div key={take.id} className={`rounded-lg border p-3 flex items-center justify-between gap-4 transition-all ${isSelected ? "border-primary/40 bg-primary/5" : "border-border bg-background/50 hover:bg-muted/30"}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleTakeSelection(take)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="font-medium text-sm">{take.characterName || "Sem personagem"} - {take.productionName}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{take.voiceActorName} • {take.sessionTitle} • {take.durationSeconds.toFixed(1)}s</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="h-8 w-8 rounded-md border border-border flex items-center justify-center hover:bg-background transition-colors" onClick={() => setSelectedPreview(take.streamUrl)}>
                      <Play className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            {!hubDubTakesQuery.isLoading && (hubDubTakesQuery.data?.items || []).length === 0 && (
              <div className="text-center py-12 space-y-2">
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto opacity-20" />
                <p className="text-sm text-muted-foreground">Nenhum take dublado encontrado.</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-gradient-to-br from-background/80 via-background to-background/90 p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Selecionar sessão</p>
              <h2 className="text-xl font-bold">Montar produto HubAlign</h2>
            </div>
            <div className="grid gap-2">
              <p className="text-xs text-muted-foreground">Sessão ({sessionsOptions.length} disponíveis)</p>
              <select
                value={builderSessionId}
                onChange={(event) => setBuilderSessionId(event.target.value)}
                className="h-11 rounded-xl border border-border bg-background px-3 text-sm min-w-[260px]"
              >
                {sessionsOptions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.title} — {session.productionName} ({session.preferredTakeCount}/{session.totalTakeCount})
                  </option>
                ))}
              </select>
              {currentSession && (
                <p className="text-[11px] text-muted-foreground">
                  {currentSession.preferredTakeCount} takes preferidos · {currentSession.totalTakeCount} takes no total · {currentSession.characterCount} personagens
                </p>
              )}
            </div>
          </div>

          {/* Mode 1 — Checkboxes per character */}
          <div className="rounded-xl border border-border bg-card/70 p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm font-semibold">Personagens e seleção de takes</p>
              <span className="text-xs text-muted-foreground">{builderCharacters.length} personagens · {builderTimeline.length} takes selecionados</span>
            </div>
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
              {builderCharacters.map((character) => {
                const actorId = assignmentMap[character.characterId] || character.voiceActors[0]?.id || "";
                const actor = character.voiceActors.find((a) => a.id === actorId) || character.voiceActors[0];
                const selectedIds = takeSelectionMap[character.characterId] || new Set<string>();
                const allTakeIds = (actor?.takes || []).map((t) => t.id);
                return (
                  <div key={character.key} className="rounded-xl border border-border/70 bg-background/70 p-3 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{character.characterName}</p>
                        <p className="text-[11px] text-muted-foreground">{selectedIds.size}/{allTakeIds.length} takes selecionados</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={actorId}
                          onChange={(event) => handleAssignmentChange(character.characterId, event.target.value)}
                          className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                        >
                          {character.voiceActors.map((a) => (
                            <option key={a.key} value={a.id}>{a.name} ({a.takeCount})</option>
                          ))}
                        </select>
                        <button
                          onClick={() => selectAllTakesForCharacter(character.characterId, allTakeIds)}
                          className="px-2 py-1 text-[10px] rounded border border-border hover:bg-muted font-bold uppercase"
                          title="Selecionar todos"
                        >Todos</button>
                        <button
                          onClick={() => clearTakesForCharacter(character.characterId)}
                          className="px-2 py-1 text-[10px] rounded border border-border hover:bg-muted font-bold uppercase"
                          title="Desmarcar todos"
                        >Nenhum</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-1 pl-1">
                      {(actor?.takes || []).map((take) => (
                        <label key={take.id} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(take.id)}
                            onChange={() => toggleTakeInSelection(character.characterId, take.id)}
                            className="w-3.5 h-3.5 rounded border-border text-primary"
                          />
                          <span className="text-xs flex-1 truncate">
                            {take.isPreferred && <span className="mr-1 text-primary font-bold">★</span>}
                            Take #{take.lineIndex + 1} · {take.durationSeconds.toFixed(1)}s
                            {take.startTimeSeconds != null && ` · @${take.startTimeSeconds.toFixed(1)}s`}
                          </span>
                          <button
                            type="button"
                            className="opacity-0 group-hover:opacity-100 h-5 w-5 flex items-center justify-center rounded border border-border hover:bg-muted"
                            onClick={() => setSelectedPreview(take.streamUrl)}
                            title="Pré-visualizar"
                          >
                            <Play className="w-2.5 h-2.5" />
                          </button>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
              {!builderCharacters.length && (
                <p className="text-sm text-muted-foreground">Selecione uma sessão para carregar os takes disponíveis.</p>
              )}
            </div>
          </div>

          {/* Mode 2 — Global takes list */}
          {builderSessionTakes.length > 0 && (
            <details className="rounded-xl border border-border bg-card/50">
              <summary className="px-4 py-3 cursor-pointer text-sm font-semibold select-none list-none flex items-center justify-between">
                <span>Lista global de takes da sessão</span>
                <span className="text-xs text-muted-foreground font-normal">{builderSessionTakes.length} takes disponíveis — clique para expandir</span>
              </summary>
              <div className="px-4 pb-4 space-y-2">
                <div className="text-[11px] text-muted-foreground pb-1">Marque ou desmarque takes diretamente. ★ = take preferido.</div>
                <div className="max-h-[320px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                  {builderSessionTakes
                    .slice()
                    .sort((a, b) => (a.startTimeSeconds ?? 0) - (b.startTimeSeconds ?? 0))
                    .map((take) => {
                      const characterId = take.characterId || slugifyKey(take.characterName || `char-${take.id}`);
                      const selectedIds = takeSelectionMap[characterId] || new Set<string>();
                      return (
                        <label key={take.id} className="flex items-center gap-3 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-muted/30">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(take.id)}
                            onChange={() => toggleTakeInSelection(characterId, take.id)}
                            className="w-3.5 h-3.5 rounded border-border text-primary flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">
                              {take.isPreferred && <span className="text-primary mr-1">★</span>}
                              {take.characterName} — {take.voiceActorName}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              Take #{take.lineIndex + 1} · {take.durationSeconds.toFixed(1)}s
                              {take.startTimeSeconds != null && ` · @${take.startTimeSeconds.toFixed(1)}s`}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="h-6 w-6 flex items-center justify-center rounded border border-border hover:bg-muted flex-shrink-0"
                            onClick={(e) => { e.preventDefault(); setSelectedPreview(take.streamUrl); }}
                            title="Pré-visualizar"
                          >
                            <Play className="w-3 h-3" />
                          </button>
                        </label>
                      );
                    })}
                </div>
              </div>
            </details>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase">Duração estimada</p>
              <p className="text-2xl font-semibold">{builderTimelineDuration.toFixed(1)}s</p>
              <p className="text-[11px] text-muted-foreground">Timeline composta por {builderTimeline.length} takes</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase">Nome do produto</p>
              <input
                value={builderProductName}
                onChange={(event) => setBuilderProductName(event.target.value)}
                placeholder="Ex: Episódio 7 - V1"
                className="h-10 w-full rounded-md border border-border px-3 bg-background text-sm"
              />
              <textarea
                value={builderNote}
                onChange={(event) => setBuilderNote(event.target.value)}
                placeholder="Observações (opcional, max 500 caracteres)"
                className="w-full rounded-md border border-border px-3 py-2 bg-background text-sm"
                rows={3}
              />
            </div>
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Resumo da sessão</p>
                <p className="text-sm font-semibold">{currentSession?.title || "Sem sessão selecionada"}</p>
                <p className="text-[11px] text-muted-foreground">{currentSession?.preferredTakeCount || 0} pref · {currentSession?.totalTakeCount || 0} total · {currentSession?.characterCount || 0} personagens</p>
              </div>
              <button
                className="w-full rounded-xl bg-primary text-primary-foreground font-semibold h-12 disabled:opacity-40 flex items-center justify-center gap-2"
                disabled={!canCreateProduct || isCreatingProduct}
                onClick={handleCreateProduct}
              >
                {isCreatingProduct ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Criando produto...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Criar produto
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Produtos do projeto</h2>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{(productsQuery.data?.items?.length || 0)} manifestos</p>
            </div>
          </div>
          <div className="space-y-3">
            {(productsQuery.data?.items || []).map((product) => (
              <div key={product.id} className="rounded-2xl border border-border/70 bg-background/70 p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sessionTitle} • {product.productionName}</p>
                  </div>
                  <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-[0.3em] rounded-full border ${STATUS_BADGE_CLASSES[product.status]}`}>
                    {product.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>{product.metadata.takeCount} takes</span>
                  <span>{product.metadata.assignmentCount} personagens</span>
                  <span>Atualizado em {new Date(product.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
                {product.note && <p className="text-sm text-muted-foreground">{product.note}</p>}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    className="px-3 py-2 rounded-xl border border-border text-sm font-semibold flex items-center gap-2"
                    onClick={() => handleMixProduct(product.id)}
                    disabled={product.status === "mixing" || currentMixingProductId === product.id}
                  >
                    {currentMixingProductId === product.id ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Mixando...</>
                    ) : (
                      <Music3 className="w-4 h-4" />
                    )}
                    Misturar
                  </button>
                  <button
                    className="px-3 py-2 rounded-xl border border-border text-sm font-semibold flex items-center gap-2"
                    onClick={() => handleMeUploadClick(product.id)}
                  >
                    <UploadCloud className="w-4 h-4" />
                    {product.meTrackPath ? "Atualizar M&E" : "Enviar M&E"}
                  </button>
                  {product.finalUrl && (
                    <a
                      href={`/api/hubalign/files/stream?path=${encodeURIComponent(product.finalUrl)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl border border-border text-sm font-semibold flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Baixar mix final
                    </a>
                  )}
                </div>
                {product.meTrackPath && (
                  <p className="text-[11px] text-foreground/70">M&E carregada • {product.meTrackPath.split("/").pop()}</p>
                )}
              </div>
            ))}
            {(!productsQuery.data?.items || productsQuery.data.items.length === 0) && (
              <p className="text-sm text-muted-foreground">Selecione um projeto e crie um produto para vê-lo listado aqui.</p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Montagem de tracks e timeline</h2>
            <span className="text-xs text-muted-foreground uppercase font-bold">{selectedTakes.length} takes na timeline</span>
          </div>
          
          <div className="space-y-2 min-h-[100px]">
            {selectedTakes.map((take, idx) => (
              <div key={`${take.id}-${idx}`} className="flex items-center gap-3 rounded-lg border border-border p-3 bg-background/40 group">
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveTake(idx, "up")} disabled={idx === 0} className="p-1 hover:bg-muted rounded disabled:opacity-20"><ChevronRight className="w-3 h-3 -rotate-90" /></button>
                  <button onClick={() => moveTake(idx, "down")} disabled={idx === selectedTakes.length - 1} className="p-1 hover:bg-muted rounded disabled:opacity-20"><ChevronRight className="w-3 h-3 rotate-90" /></button>
                </div>
                <div className="flex-1 grid grid-cols-[1fr_120px_120px] gap-4 items-center">
                  <div>
                    <p className="text-sm font-bold">{take.characterName}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{take.productionName}</p>
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground">
                    START: {tracks[idx]?.startSeconds.toFixed(2)}s
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground">
                    DUR: {take.durationSeconds.toFixed(2)}s
                  </div>
                </div>
                <button onClick={() => toggleTakeSelection(take)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {selectedTakes.length === 0 && (
              <div className="border-2 border-dashed border-border rounded-xl py-12 text-center">
                <p className="text-sm text-muted-foreground">Selecione takes acima para começar a montagem.</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
            <button
              className="vhub-btn-lg bg-primary text-primary-foreground font-bold flex items-center gap-2 rounded-xl disabled:opacity-50"
              disabled={!selectedProjectId || selectedTakes.length === 0 || isGeneratingTrack}
              onClick={() => {
                setIsGeneratingTrack(true);
                assembleTrackMutation.mutate();
              }}
            >
              {isGeneratingTrack ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  MONTANDO TIMELINE...
                </>
              ) : (
                <>
                  <FileAudio className="w-4 h-4" />
                  MONTAR TIMELINE
                </>
              )}
            </button>
            {trackReady && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                <div className="h-10 px-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-500 flex items-center gap-2 text-sm font-bold">
                  <Check className="w-4 h-4" />
                  TIMELINE SALVA COM SUCESSO
                </div>
                <p className="text-xs text-muted-foreground max-w-[200px]">
                  A timeline foi gerada e salva no histórico do projeto.
                </p>
              </div>
            )}
          </div>
        </section>

        <input
          ref={meInputRef}
          type="file"
          accept="audio/wav,audio/x-wav,audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/m4a"
          className="hidden"
          onChange={handleMeFileChange}
        />

        <section className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-lg font-semibold">Playback de pré-visualização</h2>
          <div className="flex items-center gap-3">
            <button
              className="h-12 w-12 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center disabled:opacity-50 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              disabled={!selectedPreview}
              onClick={() => {
                const audio = document.getElementById("hubalign-audio-preview") as HTMLAudioElement | null;
                if (!audio) return;
                if (audio.paused) {
                  audio.play().catch(() => {});
                  setIsPreviewPlaying(true);
                } else {
                  audio.pause();
                  setIsPreviewPlaying(false);
                }
              }}
            >
              {isPreviewPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Arquivo Selecionado</p>
              <p className="text-sm font-mono truncate">{selectedPreview ? decodeURIComponent(selectedPreview.split("path=").pop() || "") : "Nenhum arquivo selecionado."}</p>
            </div>
          </div>
          <audio id="hubalign-audio-preview" src={selectedPreview} className="hidden" onPause={() => setIsPreviewPlaying(false)} onPlay={() => setIsPreviewPlaying(true)} />
        </section>
      </main>
    </div>
  );
}
