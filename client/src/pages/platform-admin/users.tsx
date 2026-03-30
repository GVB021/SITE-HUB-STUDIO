import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Search,
  Edit,
  PauseCircle,
  Trash2,
  Shield,
  Building,
  User,
  Clock,
} from "lucide-react";

async function fetchStudioUsers() {
  const res = await fetch("/api/platform-admin/studios");
  if (!res.ok) throw new Error("Failed to fetch studios");
  const data = await res.json();
  // Flatten users from all studios for this demo
  const users = data.studios.flatMap((studio: any) => (studio.users || []).map((u: any) => ({ ...u, studioName: studio.name })));
  // Add mock platform owner
  users.push({
    id: "platform-owner-1",
    firstName: "Admin",
    lastName: "Platform",
    email: "admin@hubdub.com",
    role: "owner",
    status: "active",
    studioName: "—",
    lastLogin: new Date().toISOString(),
  });
  return users;
}

async function updateUser({ id, data }: any) {
  const res = await fetch(`/api/platform-admin/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
}

async function deleteUser(id: string) {
  const res = await fetch(`/api/platform-admin/users/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete user");
}

export default function PlatformAdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [studioFilter, setStudioFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["platform-admin-users"],
    queryFn: fetchStudioUsers,
  });

  const updateMutation = useMutation({ mutationFn: updateUser, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform-admin-users"] }) });
  const deleteMutation = useMutation({ mutationFn: deleteUser, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform-admin-users"] }) });

  const filtered = users.filter((u: any) => {
    const matchesSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    const matchesStudio = !studioFilter || u.studioName === studioFilter;
    const matchesStatus = !statusFilter || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStudio && matchesStatus;
  });

  const uniqueStudios = Array.from(new Set(users.map((u: any) => u.studioName).filter(Boolean)));
  const roleColor = (role: string) => {
    switch (role) {
      case "owner": return "bg-violet-600/20 text-violet-300 border-violet-600/30";
      case "admin": return "bg-blue-600/20 text-blue-300 border-blue-600/30";
      case "director": return "bg-emerald-600/20 text-emerald-300 border-emerald-600/30";
      case "dubber": return "bg-slate-600/20 text-slate-300 border-slate-600/30";
      default: return "bg-slate-600/20 text-slate-300 border-slate-600/30";
    }
  };
  const roleLabel = (role: string) => {
    switch (role) {
      case "owner": return "OWNER";
      case "admin": return "ADMIN";
      case "director": return "DIRETOR";
      case "dubber": return "DUBLADOR";
      default: return role.toUpperCase();
    }
  };
  const statusColor = (status: string) => (status === "active" ? "bg-emerald-600/20 text-emerald-300 border-emerald-600/30" : "bg-amber-600/20 text-amber-300 border-amber-600/30");
  const statusLabel = (status: string) => (status === "active" ? "ATIVO" : "SUSPENSO");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Usuários</h1>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10 rounded-2xl">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nome ou e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800 border-white/10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="bg-slate-800 border-white/10 min-w-[140px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="director">Diretor</SelectItem>
                <SelectItem value="dubber">Dublador</SelectItem>
              </SelectContent>
            </Select>
            <Select value={studioFilter} onValueChange={setStudioFilter}>
              <SelectTrigger className="bg-slate-800 border-white/10 min-w-[140px]">
                <SelectValue placeholder="Estúdio" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="">Todos</SelectItem>
                {uniqueStudios.map((studio: string) => (
                  <SelectItem key={studio} value={studio}>{studio}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-slate-800 border-white/10 min-w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="suspended">Suspenso</SelectItem>
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
                <TableHead className="text-slate-400">Usuário</TableHead>
                <TableHead className="text-slate-400">E-mail</TableHead>
                <TableHead className="text-slate-400">Role</TableHead>
                <TableHead className="text-slate-400">Estúdio</TableHead>
                <TableHead className="text-slate-400">Último Acesso</TableHead>
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
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user: any) => (
                  <TableRow key={user.id} className="border-white/10">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.profileImageUrl} />
                          <AvatarFallback className="bg-violet-600/20 text-violet-300 text-xs">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={roleColor(user.role)}>{roleLabel(user.role)}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">{user.studioName || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("pt-BR") : "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColor(user.status)}>{statusLabel(user.status)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" onClick={() => {/* TODO: edit role */}}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => updateMutation.mutate({ id: user.id, data: { status: user.status === "active" ? "suspended" : "active" } })}>
                          <PauseCircle className="w-4 h-4" />
                        </Button>
                        <Dialog open={deleteOpen && selectedUser?.id === user.id} onOpenChange={(open) => { setDeleteOpen(open); if (!open) setSelectedUser(null); }}>
                          <DialogTrigger asChild>
                            <Button size="icon" variant="ghost" onClick={() => setSelectedUser(user)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10">
                            <DialogHeader>
                              <DialogTitle className="text-white">Deletar Usuário</DialogTitle>
                              <DialogDescription className="text-slate-400">
                                Tem certeza que deseja deletar o usuário <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>? Esta ação não pode ser desfeita.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
                              <Button variant="destructive" onClick={() => { deleteMutation.mutate(user.id); setDeleteOpen(false); }}>Deletar</Button>
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
    </div>
  );
}
