import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  AudioWaveform,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
  PauseCircle,
  PlayCircle,
  Sparkles,
  X,
} from "lucide-react";

import { AppHeader } from "@/components/nav/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { authFetch } from "@/lib/auth-fetch";
import { useToast } from "@/hooks/use-toast";

type HubAlignTake = {
  id: string;
  sessionId: string;
  productionId: string;
  characterName: string;
  voiceActorName: string;
  lineIndex: number;
  timecode: number;
  durationSeconds: number;
  audioUrl: string;
};

type ApprovedTakesResponse = {
  items: HubAlignTake[];
};

type MixProgress =
  | { phase: "idle" }
  | { phase: "fetch"; current: number; total: number }
  | { phase: "render" }
  | { phase: "finalize" };

const mixProgressText: Record<MixProgress["phase"], string> = {
  idle: "",
  fetch: "Baixando takes",
  render: "Renderizando mixagem",
  finalize: "Gerando arquivo .wav",
};

const TAKE_TABS = [
  { value: "all", label: "Todos" },
  { value: "preferred", label: "Preferidos" },
  { value: "selected", label: "Selecionados" },
];

export default function HubAlignPage() {
  const { toast } = useToast();
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const [headerLang, setHeaderLang] = useState<"en" | "pt">("pt");
  const [mode, setMode] = useState<"session" | "production">("session");
  const [sessionIdInput, setSessionIdInput] = useState("");
  const [productionIdInput, setProductionIdInput] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [queryParams, setQueryParams] = useState<{ sessionId?: string; productionId?: string }>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [mixProgress, setMixProgress] = useState<MixProgress>({ phase: "idle" });
  const [mixing, setMixing] = useState(false);
  const [takesTab, setTakesTab] = useState<string>("all");

  useEffect(() => {
    return () => {
      audioPreviewRef.current?.pause();
    };
  }, []);

  const approvedQuery = useQuery<ApprovedTakesResponse>({
    queryKey: ["hubalign-approved", queryParams.sessionId, queryParams.productionId],
    queryFn: async () => {
      const search = new URLSearchParams();
      if (queryParams.sessionId) search.set("sessionId", queryParams.sessionId);
      if (queryParams.productionId) search.set("productionId", queryParams.productionId);
      return authFetch(`/api/hubalign/approved-takes?${search.toString()}`);
    },
    enabled: Boolean(queryParams.sessionId || queryParams.productionId),
    refetchOnWindowFocus: false,
  });

  const takes = approvedQuery.data?.items ?? [];

  useEffect(() => {
    if (!takes.length) return;
    setSelectedIds((prev) => {
      if (prev.size === 0) {
        return new Set(takes.map((item) => item.id));
      }
      const next = new Set<string>();
      takes.forEach((item) => {
        if (prev.has(item.id)) {
          next.add(item.id);
        }
      });
      if (next.size === 0) {
        takes.forEach((item) => next.add(item.id));
      }
      return next;
    });
  }, [takes]);

  const selectedTakes = useMemo<HubAlignTake[]>(() =>
    takes.filter((take) => selectedIds.has(take.id)),
  [takes, selectedIds]);

  const totalDuration = useMemo(
    () =>
      takes.reduce((acc: number, take: HubAlignTake) => Math.max(acc, take.timecode + take.durationSeconds), 0),
    [takes]
  );

  const characters = useMemo<{ name: string; takes: HubAlignTake[] }[]>(() => {
    const map = new Map<string, HubAlignTake[]>();
    takes.forEach((take: HubAlignTake) => {
      const key = take.characterName || "Personagem";
      map.set(key, [...(map.get(key) ?? []), take]);
    });
    return Array.from(map.entries()).map(([name, list]) => ({ name, takes: list }));
  }, [takes]);

  const visibleTakes = useMemo<HubAlignTake[]>(() => {
    if (takesTab === "selected") return selectedTakes;
    if (takesTab === "preferred") return takes; // todos já aprovados
    return takes;
  }, [takesTab, takes, selectedTakes]);

  const durationBadge = totalDuration ? formatTimecode(totalDuration) : "0s";
  const charactersCovered = selectedTakes.reduce((set, take) => {
    const next = set;
    next.add(take.characterName);
    return next;
  }, new Set<string>()).size;

  const handleToggleSelect = (takeId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(takeId)) next.delete(takeId);
      else next.add(takeId);
      return next;
    });
  };

  const handleApplyFilters = () => {
    if (mode === "session" && !sessionIdInput.trim()) {
      toast({ title: "Informe uma sessão", description: "Digite o ID da sessão.", variant: "destructive" });
      return;
    }
    if (mode === "production" && !productionIdInput.trim()) {
      toast({ title: "Informe uma produção", description: "Digite o ID da produção.", variant: "destructive" });
      return;
    }
    setQueryParams({
      sessionId: mode === "session" ? sessionIdInput.trim() : undefined,
      productionId: mode === "production" ? productionIdInput.trim() : undefined,
    });
  };

  const handlePreview = (take: HubAlignTake) => {
    if (!take.audioUrl) return;
    if (!audioPreviewRef.current) {
      audioPreviewRef.current = new Audio();
      audioPreviewRef.current.addEventListener("ended", () => setPreviewingId(null));
    }
    const element = audioPreviewRef.current;
    if (previewingId === take.id && !element.paused) {
      element.pause();
      setPreviewingId(null);
      return;
    }
    element.src = take.audioUrl;
    element.currentTime = 0;
    element.play();
    setPreviewingId(take.id);
  };

  const handleMix = useCallback(async () => {
    if (!selectedTakes.length) {
      toast({ title: "Nenhum take selecionado", description: "Selecione ao menos um take.", variant: "destructive" });
      return;
    }
    try {
      setMixing(true);
      setMixProgress({ phase: "fetch", current: 0, total: selectedTakes.length });
      const blob = await mixTakesToWav(selectedTakes, (progress) => setMixProgress(progress));
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = buildFilename(queryParams);
      anchor.click();
      URL.revokeObjectURL(url);
      toast({ title: "Mixagem completa", description: "Download iniciado." });
    } catch (error: any) {
      toast({ title: "Falha na mixagem", description: error?.message || "Não foi possível exportar.", variant: "destructive" });
    } finally {
      setMixing(false);
      setMixProgress({ phase: "idle" });
    }
  }, [selectedTakes, toast, queryParams]);

  const handleDiscard = (take: HubAlignTake) => {
    toast({
      title: "Take descartado",
      description: `${take.characterName} será ignorado na mixagem final.`,
      variant: "destructive",
    });
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(take.id);
      return next;
    });
  };

  const sidebarContent = (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Origem</p>
        <div className="flex rounded-2xl border border-white/10 p-1">
          {(["session", "production"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className={cn(
                "flex-1 rounded-[20px] py-2 text-sm font-semibold transition",
                mode === option ? "bg-white text-slate-900" : "text-slate-400"
              )}
            >
              {option === "session" ? "Sessão" : "Produção"}
            </button>
          ))}
        </div>
        {mode === "session" ? (
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Session ID</label>
            <Input
              value={sessionIdInput}
              onChange={(event) => setSessionIdInput(event.target.value)}
              placeholder="sess_xxx"
              className="bg-transparent border-white/10"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Production ID</label>
            <Input
              value={productionIdInput}
              onChange={(event) => setProductionIdInput(event.target.value)}
              placeholder="prod_xxx"
              className="bg-transparent border-white/10"
            />
          </div>
        )}
        <Button onClick={handleApplyFilters} className="w-full bg-emerald-500 text-black hover:bg-emerald-400">
          Carregar takes
        </Button>
      </section>

      <Card className="border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/40 text-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Projeto atual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ID selecionado</span>
            <Badge variant="outline" className="border-white/10 text-white">
              {queryParams.sessionId || queryParams.productionId || "—"}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
            <div>
              <p className="text-slate-500 uppercase tracking-[0.3em] text-[10px]">Takes</p>
              <p className="text-lg font-semibold text-white">{takes.length}</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase tracking-[0.3em] text-[10px]">Selecionados</p>
              <p className="text-lg font-semibold text-white">{selectedTakes.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3 text-xs text-slate-400">
        <p className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" /> Mixagem local via Web Audio API.
        </p>
        <p className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-300" /> Não feche a aba ao exportar.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#090b10] text-white">
      <AppHeader lang={headerLang} setLang={setHeaderLang} />
      <div className="flex flex-col lg:flex-row gap-6 px-4 pb-24 pt-24 lg:px-10">
        <aside className="lg:w-80">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-6 sticky top-24 hidden lg:block">
            {sidebarContent}
          </div>
          <div className="lg:hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/40">
            <button
              type="button"
              className="flex w-full items-center justify-between px-6 py-4 text-sm font-semibold"
              onClick={() => setFiltersOpen((prev) => !prev)}
            >
              Filtros
              {filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {filtersOpen && <div className="px-6 pb-6">{sidebarContent}</div>}
          </div>
        </aside>

        <section className="flex-1 space-y-6">
          <Card className="border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/40">
            <CardHeader className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Status do projeto</p>
              <CardTitle className="text-2xl font-bold">Linha do tempo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-white/10 text-white font-semibold">
                  Duração total: {durationBadge}
                </Badge>
                <Badge className="bg-white/10 text-white font-semibold">
                  Personagens cobertos: {charactersCovered}
                </Badge>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 overflow-x-auto">
                <TimelineView characters={characters} totalDuration={totalDuration || 1} selectedIds={selectedIds} onToggle={handleToggleSelect} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/40">
            <CardHeader className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Takes</p>
              <CardTitle className="text-2xl font-bold">Seleção e revisão</CardTitle>
              <p className="text-sm text-slate-400">{selectedTakes.length} takes selecionados</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="all" value={takesTab} onValueChange={setTakesTab} className="space-y-4">
                <TabsList className="bg-white/5">
                  {TAKE_TABS.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:bg-white data-[state=active]:text-black">
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value={takesTab} className="m-0">
                  <ScrollArea className="max-h-[520px] pr-4">
                    <div className="space-y-3">
                      {visibleTakes.map((take) => (
                        <TakeCard
                          key={take.id}
                          take={take}
                          selected={selectedIds.has(take.id)}
                          previewing={previewingId === take.id}
                          referenceDuration={totalDuration || 1}
                          onToggle={() => handleToggleSelect(take.id)}
                          onPreview={() => handlePreview(take)}
                          onDiscard={() => handleDiscard(take)}
                        />
                      ))}
                      {!visibleTakes.length && (
                        <div className="rounded-2xl border border-white/10 px-6 py-10 text-center text-sm text-slate-500">
                          Nenhum take disponível nesta aba.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#090b10]/95 px-4 py-4 backdrop-blur lg:px-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Exportação Final</p>
            <p className="text-lg font-semibold text-white">Mix & Export</p>
            {mixing && mixProgress.phase !== "idle" && (
              <p className="flex items-center gap-2 text-sm text-slate-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                {mixProgress.phase === "fetch" && `${mixProgress.current}/${mixProgress.total}`} {mixProgressText[mixProgress.phase]}
              </p>
            )}
          </div>
          <Button
            size="lg"
            onClick={handleMix}
            disabled={mixing || !selectedTakes.length}
            className="w-full md:w-auto rounded-2xl bg-emerald-500 text-black hover:bg-emerald-400"
          >
            {mixing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Renderizando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Download className="h-4 w-4" /> MIX & EXPORT
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function TimelineView({
  characters,
  totalDuration,
  selectedIds,
  onToggle,
}: {
  characters: { name: string; takes: HubAlignTake[] }[];
  totalDuration: number;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  if (!characters.length) {
    return <div className="px-6 py-10 text-center text-sm text-slate-500">Carregue uma sessão para visualizar a linha do tempo.</div>;
  }

  return (
    <div className="min-w-full space-y-4 p-4">
      {characters.map((character, index) => (
        <div key={character.name + index} className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge className="bg-white/5 text-white">{character.name}</Badge>
            <span className="text-xs text-slate-400">{character.takes.length} takes</span>
          </div>
          <div className="relative h-20 rounded-xl border border-white/10 bg-white/5">
            {character.takes.map((take) => {
              const left = (take.timecode / totalDuration) * 100;
              const width = Math.max((take.durationSeconds / totalDuration) * 100, 4);
              const active = selectedIds.has(take.id);
              return (
                <button
                  key={take.id}
                  type="button"
                  onClick={() => onToggle(take.id)}
                  className={cn(
                    "absolute top-2 h-16 rounded-xl border px-3 py-2 text-left transition",
                    active
                      ? "border-emerald-400 bg-emerald-400/20 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                      : "border-white/10 bg-black/40 opacity-40"
                  )}
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  <p className="text-xs font-semibold leading-tight">{take.characterName}</p>
                  <p className="text-[11px] text-slate-300">{formatTimecode(take.timecode)} • {take.durationSeconds.toFixed(1)}s</p>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function TakeCard({
  take,
  selected,
  previewing,
  referenceDuration,
  onToggle,
  onPreview,
  onDiscard,
}: {
  take: HubAlignTake;
  selected: boolean;
  previewing: boolean;
  referenceDuration: number;
  onToggle: () => void;
  onPreview: () => void;
  onDiscard: () => void;
}) {
  const barWidth = Math.max((take.durationSeconds / referenceDuration) * 100, 5);
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 transition hover:border-white/30">
      <div className="flex flex-wrap items-center gap-3">
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          className="border-emerald-500 data-[state=checked]:bg-emerald-500"
        />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{take.characterName}</p>
          <p className="text-xs text-slate-400">{take.voiceActorName}</p>
        </div>
        <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
          {formatTimecode(take.timecode)} • {take.durationSeconds.toFixed(1)}s
        </div>
      </div>
      <div className="mt-3 h-1 rounded-full bg-white/10">
        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${barWidth}%` }} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreview}
          className={cn(
            "border-white/10 text-white",
            previewing && "border-emerald-400 bg-emerald-400/10 text-emerald-200"
          )}
        >
          {previewing ? <PauseCircle className="mr-2 h-4 w-4" /> : <PlayCircle className="mr-2 h-4 w-4" />}
          {previewing ? "Pausar" : "Preview"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onToggle} className="text-emerald-300">
          <Check className="mr-2 h-4 w-4" /> {selected ? "Manter" : "Selecionar"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onDiscard} className="text-rose-300">
          <X className="mr-2 h-4 w-4" /> Descartar
        </Button>
      </div>
    </div>
  );
}

function buildFilename(params: { sessionId?: string; productionId?: string }) {
  if (params.sessionId) return `hubalign-mix-${params.sessionId}.wav`;
  if (params.productionId) return `hubalign-mix-${params.productionId}.wav`;
  return `hubalign-mix-${Date.now()}.wav`;
}

function formatTimecode(seconds: number) {
  const total = Math.max(0, seconds);
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return minutes > 0 ? `${minutes}m ${secs.toFixed(1)}s` : `${secs.toFixed(1)}s`;
}

async function mixTakesToWav(takes: HubAlignTake[], onProgress: (progress: MixProgress) => void): Promise<Blob> {
  if (typeof window === "undefined") throw new Error("Mixagem disponível apenas no navegador.");
  const OfflineContext = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!OfflineContext || !AudioCtx) throw new Error("Web Audio API indisponível neste navegador.");

  const sorted = [...takes].sort((a, b) => a.timecode - b.timecode);
  const duration = sorted.reduce((acc, take) => Math.max(acc, take.timecode + take.durationSeconds), 0) || 1;
  const sampleRate = 48000;
  const frameCount = Math.ceil(duration * sampleRate);
  const offline = new OfflineContext(1, frameCount, sampleRate);
  const decodeCtx = new AudioCtx();

  for (let index = 0; index < sorted.length; index += 1) {
    onProgress({ phase: "fetch", current: index + 1, total: sorted.length });
    const take = sorted[index];
    const response = await fetch(take.audioUrl);
    if (!response.ok) throw new Error(`Falha ao baixar áudio (${response.status})`);
    const arrayBuffer = await response.arrayBuffer();
    const decoded = await decodeCtx.decodeAudioData(arrayBuffer);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start(take.timecode);
  }

  onProgress({ phase: "render" });
  const rendered = await offline.startRendering();
  onProgress({ phase: "finalize" });
  await decodeCtx.close();
  const wavBuffer = audioBufferToWav(rendered);
  return new Blob([wavBuffer], { type: "audio/wav" });
}

function audioBufferToWav(buffer: AudioBuffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numChannels * 2 + 44;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new DataView(arrayBuffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, length - 8, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, length - 44, true);

  const interleaved = interleave(buffer);
  let offset = 44;
  for (let i = 0; i < interleaved.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, interleaved[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }

  return arrayBuffer;
}

function writeString(view: DataView, offset: number, value: string) {
  for (let i = 0; i < value.length; i += 1) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}

function interleave(buffer: AudioBuffer) {
  const channels = [];
  for (let i = 0; i < buffer.numberOfChannels; i += 1) {
    channels.push(buffer.getChannelData(i));
  }
  const length = buffer.length * buffer.numberOfChannels;
  const result = new Float32Array(length);
  let index = 0;
  for (let i = 0; i < buffer.length; i += 1) {
    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      result[index] = channels[channel][i];
      index += 1;
    }
  }
  return result;
}

