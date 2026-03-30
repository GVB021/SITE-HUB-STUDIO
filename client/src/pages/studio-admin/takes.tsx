import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Mic,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  User,
  Film,
  Calendar,
} from "lucide-react";

const studioId = "demo-studio";

async function fetchTakes() {
  const res = await fetch(`/api/studio-admin/studios/${studioId}/takes`);
  if (!res.ok) throw new Error("Failed to fetch takes");
  return res.json();
}

async function fetchProjects() {
  const res = await fetch(`/api/studio-admin/studios/${studioId}/projects`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

async function fetchSessions() {
  const res = await fetch(`/api/studio-admin/studios/${studioId}/sessions`);
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json();
}

async function fetchCharacters() {
  // Mock: replace with real endpoint if available
  return [
    { id: "1", name: "Personagem A" },
    { id: "2", name: "Personagem B" },
    { id: "3", name: "Personagem C" },
  ];
}

async function bulkUpdateTakes({ takeIds, status }: { takeIds: string[]; status: string }) {
  // Mock: replace with real bulk endpoint
  console.log("Bulk update:", { takeIds, status });
  return true;
}

export default function StudioAdminTakes() {
  const [filters, setFilters] = useState({
    projectId: "",
    sessionId: "",
    characterId: "",
    status: "",
  });
  const [selectedTakes, setSelectedTakes] = useState<Set<string>>(new Set());
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  const queryClient = useQueryClient();

  const { data: takes = [], isLoading } = useQuery({
    queryKey: ["studio-admin-takes", studioId],
    queryFn: fetchTakes,
  });
  const { data: projects = [] } = useQuery({ queryKey: ["studio-admin-projects", studioId], queryFn: fetchProjects });
  const { data: sessions = [] } = useQuery({ queryKey: ["studio-admin-sessions", studioId], queryFn: fetchSessions });
  const { data: characters = [] } = useQuery({ queryKey: ["studio-admin-characters"], queryFn: fetchCharacters });

  const bulkApproveMutation = useMutation({
    mutationFn: () => bulkUpdateTakes({ takeIds: Array.from(selectedTakes), status: "approved" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-admin-takes"] });
      setSelectedTakes(new Set());
    },
  });
  const bulkDiscardMutation = useMutation({
    mutationFn: () => bulkUpdateTakes({ takeIds: Array.from(selectedTakes), status: "discarded" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-admin-takes"] });
      setSelectedTakes(new Set());
    },
  });

  const filtered = takes.filter((take: any) => {
    if (filters.projectId && take.productionId !== filters.projectId) return false;
    if (filters.sessionId && take.sessionId !== filters.sessionId) return false;
    if (filters.characterId && take.characterId !== filters.characterId) return false;
    if (filters.status && take.isPreferred !== (filters.status === "approved")) return false;
    return true;
  });

  const statusColor = (isPreferred: boolean) => {
    if (isPreferred) return "bg-emerald-600/20 text-emerald-300 border-emerald-600/30";
    return "bg-amber-600/20 text-amber-300 border-amber-600/30";
  };
  const statusLabel = (isPreferred: boolean) => (isPreferred ? "APROVADO" : "PENDENTE");

  const handlePlayPause = (takeId: string, audioUrl: string) => {
    if (!audioRefs.current[takeId]) {
      audioRefs.current[takeId] = new Audio(audioUrl);
      audioRefs.current[takeId].addEventListener("ended", () => setPlayingAudio(null));
    }
    const audio = audioRefs.current[takeId];
    if (playingAudio === takeId) {
      audio.pause();
      setPlayingAudio(null);
    } else {
      // Pause any other playing audio
      Object.values(audioRefs.current).forEach((a) => a.pause());
      audio.play();
      setPlayingAudio(takeId);
    }
  };

  const toggleSelectAll = () => {
    if (selectedTakes.size === filtered.length) {
      setSelectedTakes(new Set());
    } else {
      setSelectedTakes(new Set(filtered.map((t: any) => t.id)));
    }
  };

  const toggleSelect = (takeId: string) => {
    setSelectedTakes((prev) => {
      const next = new Set(prev);
      if (next.has(takeId)) next.delete(takeId);
      else next.add(takeId);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Takes</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={filters.projectId} onValueChange={(v) => setFilters((f) => ({ ...f, projectId: v }))}>
            <SelectTrigger className="bg-slate-800 border-white/10 min-w-[140px]">
              <SelectValue placeholder="Projeto" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/10">
              <SelectItem value="">Todos</SelectItem>
              {projects.map((project: any) => (
                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.sessionId} onValueChange={(v) => setFilters((f) => ({ ...f, sessionId: v }))}>
            <SelectTrigger className="bg-slate-800 border-white/10 min-w-[140px]">
              <SelectValue placeholder="Sessão" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/10">
              <SelectItem value="">Todas</SelectItem>
              {sessions.map((session: any) => (
                <SelectItem key={session.id} value={session.id}>{session.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.characterId} onValueChange={(v) => setFilters((f) => ({ ...f, characterId: v }))}>
            <SelectTrigger className="bg-slate-800 border-white/10 min-w-[140px]">
              <SelectValue placeholder="Personagem" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/10">
              <SelectItem value="">Todos</SelectItem>
              {characters.map((char: any) => (
                <SelectItem key={char.id} value={char.id}>{char.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}>
            <SelectTrigger className="bg-slate-800 border-white/10 min-w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/10">
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="approved">Aprovados</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTakes.size > 0 && (
        <Card className="bg-gradient-to-b from-emerald-900/20 to-emerald-900/10 border-emerald-600/30 rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-emerald-300">{selectedTakes.size} selecionados</span>
            <div className="flex gap-2">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => bulkApproveMutation.mutate()}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Aprovar todos
              </Button>
              <Button size="sm" variant="destructive" onClick={() => bulkDiscardMutation.mutate()}>
                <XCircle className="w-4 h-4 mr-1" />
                Descartar todos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10 rounded-2xl">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-slate-400">
                  <Checkbox checked={selectedTakes.size === filtered.length && filtered.length > 0} onCheckedChange={toggleSelectAll} />
                </TableHead>
                <TableHead className="text-slate-400">Personagem</TableHead>
                <TableHead className="text-slate-400">Ator</TableHead>
                <TableHead className="text-slate-400">Timecode</TableHead>
                <TableHead className="text-slate-400">Duração</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Áudio</TableHead>
                <TableHead className="text-slate-400">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    Nenhum take encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((take: any) => (
                  <TableRow key={take.id} className="border-white/10">
                    <TableCell>
                      <Checkbox checked={selectedTakes.has(take.id)} onCheckedChange={() => toggleSelect(take.id)} />
                    </TableCell>
                    <TableCell className="text-white">{take.characterName || "—"}</TableCell>
                    <TableCell className="text-slate-300">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {take.voiceActorName || "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{take.timecode ? `${Math.floor(take.timecode / 60)}:${String(Math.floor(take.timecode % 60)).padStart(2, "0")}` : "—"}</TableCell>
                    <TableCell className="text-slate-300">{take.durationSeconds ? `${take.durationSeconds}s` : "—"}</TableCell>
                    <TableCell>
                      <Badge className={statusColor(take.isPreferred)}>{statusLabel(take.isPreferred)}</Badge>
                    </TableCell>
                    <TableCell>
                      {take.audioUrl && (
                        <Button size="sm" variant="ghost" onClick={() => handlePlayPause(take.id, take.audioUrl)}>
                          {playingAudio === take.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="border-emerald-600/30 text-emerald-400 hover:bg-emerald-600/10">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-rose-600/30 text-rose-400 hover:bg-rose-600/10">
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  );
}
