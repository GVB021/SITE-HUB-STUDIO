import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  Plus,
  PlayCircle,
  Edit,
  X,
  Users,
  Clock,
  Film,
} from "lucide-react";

const studioId = "demo-studio";

async function fetchSessions() {
  const res = await fetch(`/api/studio-admin/studios/${studioId}/sessions`);
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json();
}

async function fetchProjects() {
  const res = await fetch(`/api/studio-admin/studios/${studioId}/projects`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

async function fetchMembers() {
  const res = await fetch(`/api/studio-admin/studios/${studioId}/users`);
  if (!res.ok) throw new Error("Failed to fetch members");
  return res.json();
}

async function createSession(data: any) {
  const res = await fetch(`/api/studio-admin/studios/${studioId}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, studioId }),
  });
  if (!res.ok) throw new Error("Failed to create session");
  return res.json();
}

async function updateSession({ id, data }: any) {
  const res = await fetch(`/api/studio-admin/studios/${studioId}/sessions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update session");
  return res.json();
}

async function deleteSession(id: string) {
  const res = await fetch(`/api/studio-admin/studios/${studioId}/sessions/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete session");
}

export default function StudioAdminSessions() {
  const [newSessionOpen, setNewSessionOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [newSession, setNewSession] = useState({
    title: "",
    productionId: "",
    scheduledAt: "",
    invitees: [] as string[],
  });

  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["studio-admin-sessions", studioId],
    queryFn: fetchSessions,
  });
  const { data: projects = [] } = useQuery({ queryKey: ["studio-admin-projects", studioId], queryFn: fetchProjects });
  const { data: members = [] } = useQuery({ queryKey: ["studio-admin-members", studioId], queryFn: fetchMembers });

  const createMutation = useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-admin-sessions"] });
      setNewSessionOpen(false);
      setNewSession({ title: "", productionId: "", scheduledAt: "", invitees: [] });
    },
  });
  const updateMutation = useMutation({ mutationFn: updateSession, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["studio-admin-sessions"] }); setEditOpen(false); } });
  const deleteMutation = useMutation({ mutationFn: deleteSession, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["studio-admin-sessions"] }); } });

  const statusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-600/20 text-blue-300 border-blue-600/30";
      case "in_progress": return "bg-rose-600/20 text-rose-300 border-rose-600/30 animate-pulse";
      case "completed": return "bg-emerald-600/20 text-emerald-300 border-emerald-600/30";
      default: return "bg-slate-600/20 text-slate-300 border-slate-600/30";
    }
  };
  const statusLabel = (status: string) => {
    switch (status) {
      case "scheduled": return "AGENDADA";
      case "in_progress": return "AO VIVO";
      case "completed": return "CONCLUÍDA";
      default: return status.toUpperCase();
    }
  };

  const handleInviteeToggle = (userId: string, checked: boolean) => {
    setNewSession((prev) => ({
      ...prev,
      invitees: checked
        ? [...prev.invitees, userId]
        : prev.invitees.filter((id) => id !== userId),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Sessões</h1>
        <Sheet open={newSessionOpen} onOpenChange={setNewSessionOpen}>
          <SheetTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nova Sessão
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10">
            <SheetHeader>
              <SheetTitle className="text-white">Criar Nova Sessão</SheetTitle>
              <SheetDescription className="text-slate-400">Preencha os dados da nova sessão.</SheetDescription>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="session-title">Nome</Label>
                <Input id="session-title" value={newSession.title} onChange={(e) => setNewSession((s) => ({ ...s, title: e.target.value }))} className="bg-slate-800 border-white/10" />
              </div>
              <div>
                <Label>Projeto</Label>
                <Select value={newSession.productionId} onValueChange={(v) => setNewSession((s) => ({ ...s, productionId: v }))}>
                  <SelectTrigger className="bg-slate-800 border-white/10">
                    <SelectValue placeholder="Selecione um projeto" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10">
                    {projects.map((project: any) => (
                      <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="session-date">Data e Hora</Label>
                <Input id="session-date" type="datetime-local" value={newSession.scheduledAt} onChange={(e) => setNewSession((s) => ({ ...s, scheduledAt: e.target.value }))} className="bg-slate-800 border-white/10" />
              </div>
              <div>
                <Label>Convidar Membros</Label>
                <ScrollArea className="h-32 border border-white/10 rounded-lg p-2">
                  <div className="space-y-2">
                    {members.map((member: any) => (
                      <div key={member.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={member.id}
                          checked={newSession.invitees.includes(member.id)}
                          onCheckedChange={(checked) => handleInviteeToggle(member.id, checked as boolean)}
                        />
                        <Label htmlFor={member.id} className="text-sm text-white">
                          {member.firstName} {member.lastName}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
            <SheetFooter>
              <Button variant="outline" onClick={() => setNewSessionOpen(false)}>Cancelar</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => createMutation.mutate(newSession)}>Criar</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Table */}
      <Card className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10 rounded-2xl">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-slate-400">Nome</TableHead>
                <TableHead className="text-slate-400">Projeto</TableHead>
                <TableHead className="text-slate-400">Data</TableHead>
                <TableHead className="text-slate-400">Participantes</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto" />
                  </TableCell>
                </TableRow>
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Nenhuma sessão encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session: any) => (
                  <TableRow key={session.id} className="border-white/10">
                    <TableCell className="text-white font-medium">{session.title}</TableCell>
                    <TableCell className="text-slate-300">
                      <div className="flex items-center gap-1">
                        <Film className="w-4 h-4" />
                        {projects.find((p: any) => p.id === session.productionId)?.name || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-4 h-4" />
                        {session.scheduledAt ? new Date(session.scheduledAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-slate-300">
                        <Users className="w-4 h-4" />
                        {/* Mock count */}
                        {Math.floor(Math.random() * 4) + 1}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColor(session.status)}>{statusLabel(session.status)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5">
                          <PlayCircle className="w-4 h-4 mr-1" />
                          Entrar
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => { setSelectedSession(session); setEditOpen(true); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(session.id)}>
                          <X className="w-4 h-4" />
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

      {/* Edit Sheet */}
      <Sheet open={editOpen && !!selectedSession} onOpenChange={(open) => { setEditOpen(open); if (!open) setSelectedSession(null); }}>
        <SheetContent className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10">
          <SheetHeader>
            <SheetTitle className="text-white">Editar Sessão</SheetTitle>
            <SheetDescription className="text-slate-400">Altere os dados da sessão.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-title">Nome</Label>
              <Input id="edit-title" defaultValue={selectedSession?.title} className="bg-slate-800 border-white/10" />
            </div>
            <div>
              <Label>Data e Hora</Label>
              <Input type="datetime-local" defaultValue={selectedSession?.scheduledAt?.slice(0, 16)} className="bg-slate-800 border-white/10" />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {/* TODO: call update API */}}>Salvar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
