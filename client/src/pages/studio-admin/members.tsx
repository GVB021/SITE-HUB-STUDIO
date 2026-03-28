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
  Users,
  UserPlus,
  Edit,
  Trash2,
  Clock,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";

const studioId = "demo-studio";

async function fetchMembers() {
  const res = await fetch(`/api/studio-admin/studios/${studioId}/users`);
  if (!res.ok) throw new Error("Failed to fetch members");
  const data = await res.json();
  return data.map((m: any) => ({
    ...m.user,
    membershipId: m.id,
    role: m.role,
    status: m.status,
  }));
}

async function inviteMember({ email, role }: any) {
  const res = await fetch(`/api/studio-admin/studios/${studioId}/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: email, role }), // In real app, resolve userId by email
  });
  if (!res.ok) throw new Error("Failed to invite");
  return res.json();
}

async function updateMemberRole({ membershipId, role, status }: any) {
  const res = await fetch(`/api/studio-admin/studios/${studioId}/users/${membershipId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, status }),
  });
  if (!res.ok) throw new Error("Failed to update");
  return res.json();
}

async function removeMember({ userId }: any) {
  const res = await fetch(`/api/studio-admin/studios/${studioId}/users/${userId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to remove");
}

export default function StudioAdminMembers() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "director" });
  const [roleEditOpen, setRoleEditOpen] = useState<string | null>(null);
  const [newRole, setNewRole] = useState("");

  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["studio-admin-members", studioId],
    queryFn: fetchMembers,
  });

  const inviteMutation = useMutation({ mutationFn: inviteMember, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["studio-admin-members"] }); setInviteOpen(false); setInviteForm({ email: "", role: "director" }); } });
  const updateMutation = useMutation({ mutationFn: updateMemberRole, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["studio-admin-members"] }); setRoleEditOpen(null); } });
  const removeMutation = useMutation({ mutationFn: removeMember, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["studio-admin-members"] }); setRemoveOpen(false); } });

  const roleColor = (role: string) => {
    switch (role) {
      case "director": return "bg-emerald-600/20 text-emerald-300 border-emerald-600/30";
      case "dubber": return "bg-slate-600/20 text-slate-300 border-slate-600/30";
      default: return "bg-slate-600/20 text-slate-300 border-slate-600/30";
    }
  };
  const roleLabel = (role: string) => {
    switch (role) {
      case "director": return "DIRETOR";
      case "dubber": return "DUBLADOR";
      default: return role.toUpperCase();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Membros</h1>
        <Sheet open={inviteOpen} onOpenChange={setInviteOpen}>
          <SheetTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Convidar Membro
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10">
            <SheetHeader>
              <SheetTitle className="text-white">Convidar Membro</SheetTitle>
              <SheetDescription className="text-slate-400">Convide um novo membro para o estúdio.</SheetDescription>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={inviteForm.email} onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))} className="bg-slate-800 border-white/10" />
              </div>
              <div>
                <Label>Papel</Label>
                <Select value={inviteForm.role} onValueChange={(v) => setInviteForm((f) => ({ ...f, role: v }))}>
                  <SelectTrigger className="bg-slate-800 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10">
                    <SelectItem value="director">Diretor</SelectItem>
                    <SelectItem value="dubber">Dublador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SheetFooter>
              <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancelar</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => inviteMutation.mutate(inviteForm)}>Convidar</Button>
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
                <TableHead className="text-slate-400">Usuário</TableHead>
                <TableHead className="text-slate-400">E-mail</TableHead>
                <TableHead className="text-slate-400">Papel</TableHead>
                <TableHead className="text-slate-400">Último acesso</TableHead>
                <TableHead className="text-slate-400">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto" />
                  </TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    Nenhum membro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member: any) => (
                  <TableRow key={member.id} className="border-white/10">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={member.profileImageUrl} />
                          <AvatarFallback className="bg-emerald-600/20 text-emerald-300 text-xs">
                            {member.firstName?.[0]}{member.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-medium">{member.firstName} {member.lastName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{member.email}</TableCell>
                    <TableCell>
                      {roleEditOpen === member.id ? (
                        <div className="flex items-center gap-2">
                          <Select value={newRole || member.role} onValueChange={setNewRole}>
                            <SelectTrigger className="bg-slate-800 border-white/10 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-white/10">
                              <SelectItem value="director">Diretor</SelectItem>
                              <SelectItem value="dubber">Dublador</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" onClick={() => updateMutation.mutate({ membershipId: member.membershipId, role: newRole || member.role })}>Salvar</Button>
                          <Button size="sm" variant="ghost" onClick={() => setRoleEditOpen(null)}>Cancelar</Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge className={roleColor(member.role)}>{roleLabel(member.role)}</Badge>
                          <Button size="icon" variant="ghost" onClick={() => { setRoleEditOpen(member.id); setNewRole(member.role); }}>
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString("pt-BR") : "Nunca"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog open={removeOpen && selectedMember?.id === member.id} onOpenChange={(open) => { setRemoveOpen(open); if (!open) setSelectedMember(null); }}>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="ghost" onClick={() => setSelectedMember(member)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10">
                          <DialogHeader>
                            <DialogTitle className="text-white">Remover Membro</DialogTitle>
                            <DialogDescription className="text-slate-400">
                              Tem certeza que deseja remover <strong>{selectedMember?.firstName} {selectedMember?.lastName}</strong> do estúdio?
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setRemoveOpen(false)}>Cancelar</Button>
                            <Button variant="destructive" onClick={() => { removeMutation.mutate({ userId: member.id }); setRemoveOpen(false); }}>Remover</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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
