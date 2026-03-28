import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Building2,
  Edit,
  PauseCircle,
  UserX,
  Trash2,
  Search,
  Plus,
  Users,
  Calendar,
  HardDrive,
} from "lucide-react";

async function fetchStudios({ page, limit, status, planTier }: any) {
  const search = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) search.set("status", status);
  if (planTier) search.set("planTier", planTier);
  const res = await fetch(`/api/platform-admin/studios?${search}`);
  if (!res.ok) throw new Error("Failed to fetch studios");
  return res.json();
}

async function updateStudio({ id, data }: any) {
  const res = await fetch(`/api/platform-admin/studios/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update studio");
  return res.json();
}

async function deleteStudio(id: string) {
  const res = await fetch(`/api/platform-admin/studios/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete studio");
}

async function impersonateStudio({ userId }: any) {
  const res = await fetch("/api/platform-admin/impersonate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetUserId: userId }),
  });
  if (!res.ok) throw new Error("Failed to impersonate");
  return res.json();
}

export default function PlatformAdminStudios() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [planFilter, setPlanFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedStudio, setSelectedStudio] = useState<any>(null);
  const [newStudioOpen, setNewStudioOpen] = useState(false);
  const [newStudio, setNewStudio] = useState({ name: "", ownerEmail: "", planTier: "basic" });

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["platform-admin-studios", page, statusFilter, planFilter],
    queryFn: () => fetchStudios({ page, limit: 20, status: statusFilter, planTier: planFilter }),
  });

  const updateMutation = useMutation({ mutationFn: updateStudio, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform-admin-studios"] }) });
  const deleteMutation = useMutation({ mutationFn: deleteStudio, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform-admin-studios"] }) });
  const impersonateMutation = useMutation({ mutationFn: impersonateStudio });

  const studios = data?.studios || [];
  const filtered = studios.filter((s: any) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const statusColor = (status: boolean) => (status ? "bg-emerald-600/20 text-emerald-300 border-emerald-600/30" : "bg-amber-600/20 text-amber-300 border-amber-600/30");
  const statusLabel = (status: boolean) => (status ? "ATIVO" : "SUSPENSO");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Estúdios</h1>
        <Sheet open={newStudioOpen} onOpenChange={setNewStudioOpen}>
          <SheetTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Novo Estúdio
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10">
            <SheetHeader>
              <SheetTitle className="text-white">Criar Novo Estúdio</SheetTitle>
              <SheetDescription className="text-slate-400">Preencha os dados do novo estúdio.</SheetDescription>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={newStudio.name} onChange={(e) => setNewStudio((s) => ({ ...s, name: e.target.value }))} className="bg-slate-800 border-white/10" />
              </div>
              <div>
                <Label htmlFor="ownerEmail">E-mail do Dono</Label>
                <Input id="ownerEmail" type="email" value={newStudio.ownerEmail} onChange={(e) => setNewStudio((s) => ({ ...s, ownerEmail: e.target.value }))} className="bg-slate-800 border-white/10" />
              </div>
              <div>
                <Label>Plano</Label>
                <Select value={newStudio.planTier} onValueChange={(v) => setNewStudio((s) => ({ ...s, planTier: v }))}>
                  <SelectTrigger className="bg-slate-800 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10">
                    <SelectItem value="basic">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SheetFooter>
              <Button variant="outline" onClick={() => setNewStudioOpen(false)}>Cancelar</Button>
              <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => {/* TODO: call create API */}}>Criar</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10 rounded-2xl">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar estúdio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800 border-white/10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-slate-800 border-white/10 min-w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Suspenso</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="bg-slate-800 border-white/10 min-w-[140px]">
                <SelectValue placeholder="Plano" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="basic">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10 rounded-2xl">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-slate-400">Nome</TableHead>
                <TableHead className="text-slate-400">Dono</TableHead>
                <TableHead className="text-slate-400">Membros</TableHead>
                <TableHead className="text-slate-400">Sessões</TableHead>
                <TableHead className="text-slate-400">Storage</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    Nenhum estúdio encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((studio: any) => (
                  <TableRow key={studio.id} className="border-white/10">
                    <TableCell className="text-white font-medium">{studio.name}</TableCell>
                    <TableCell className="text-slate-300">{studio.ownerId || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">—</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">—</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <HardDrive className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">—</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColor(studio.isActive)}>{statusLabel(studio.isActive)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" onClick={() => { setSelectedStudio(studio); setEditOpen(true); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => updateMutation.mutate({ id: studio.id, data: { isActive: !studio.isActive } })}>
                          <PauseCircle className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => impersonateMutation.mutate({ userId: studio.ownerId })}>
                          <UserX className="w-4 h-4" />
                        </Button>
                        <Dialog open={deleteOpen && selectedStudio?.id === studio.id} onOpenChange={(open) => { setDeleteOpen(open); if (!open) setSelectedStudio(null); }}>
                          <DialogTrigger asChild>
                            <Button size="icon" variant="ghost" onClick={() => setSelectedStudio(studio)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10">
                            <DialogHeader>
                              <DialogTitle className="text-white">Deletar Estúdio</DialogTitle>
                              <DialogDescription className="text-slate-400">
                                Tem certeza que deseja deletar o estúdio <strong>{selectedStudio?.name}</strong>? Esta ação não pode ser desfeita.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
                              <Button variant="destructive" onClick={() => { deleteMutation.mutate(studio.id); setDeleteOpen(false); }}>Deletar</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
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
      <Sheet open={editOpen && !!selectedStudio} onOpenChange={(open) => { setEditOpen(open); if (!open) setSelectedStudio(null); }}>
        <SheetContent className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10">
          <SheetHeader>
            <SheetTitle className="text-white">Editar Estúdio</SheetTitle>
            <SheetDescription className="text-slate-400">Altere os dados do estúdio.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Nome</Label>
              <Input id="edit-name" defaultValue={selectedStudio?.name} className="bg-slate-800 border-white/10" />
            </div>
            <div>
              <Label htmlFor="edit-logo">Logo URL</Label>
              <Input id="edit-logo" defaultValue={selectedStudio?.logoUrl} className="bg-slate-800 border-white/10" />
            </div>
            <div>
              <Label htmlFor="edit-website">Website</Label>
              <Input id="edit-website" defaultValue={selectedStudio?.website} className="bg-slate-800 border-white/10" />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => {/* TODO: call update API */}}>Salvar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
