import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Loader2, Lock, Users, Film, Calendar,
  CheckCircle2, XCircle, UserPlus, Pencil, BarChart3, Trash2,
  Mic2, FileText, Settings, ChevronRight, Activity,
  Shield, RefreshCw, History
} from "lucide-react";
import { Button } from "@studio/components/ui/button";
import { Input } from "@studio/components/ui/input";
import { Label } from "@studio/components/ui/label";
import { Badge } from "@studio/components/ui/badge";
import { Checkbox } from "@studio/components/ui/checkbox";
import { authFetch } from "@studio/lib/auth-fetch";
import { useAuth } from "@studio/hooks/use-auth";
import { useToast } from "@studio/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@studio/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@studio/components/ui/select";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@studio/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const AUTHORIZED_EMAIL = "borbaggabriel@gmail.com";

function hasManagementAccess(user: any) {
  const normalizedEmail = String(user?.email || "").trim().toLowerCase();
  const normalizedRole = String(user?.role || "").trim().toLowerCase().replace(/\s+/g, "_");
  return normalizedEmail === AUTHORIZED_EMAIL || normalizedRole === "owner" || normalizedRole === "master" || normalizedRole === "admin";
}

type ManagementSettings = {
  maxVoiceActors: number;
  maxDirectors: number;
  totalSessionsAvailable: number;
  simultaneousProductionsLimit: number;
  maxDirectorsPerSession: number;
  maxDubbersStudentsPerSession: number;
};

type FormState = Record<keyof ManagementSettings, string>;

const EMPTY_FORM: FormState = {
  maxVoiceActors: "",
  maxDirectors: "",
  totalSessionsAvailable: "",
  simultaneousProductionsLimit: "",
  maxDirectorsPerSession: "",
  maxDubbersStudentsPerSession: "",
};

const STUDIO_ROLES = [
  { value: "admin", label: "Administrador do Estúdio" },
  { value: "director", label: "Diretor" },
  { value: "dubber", label: "Dublador" },
];

const PRODUCTION_STATUSES = [
  { value: "planned", label: "Planejada" },
  { value: "in_progress", label: "Em Andamento" },
  { value: "completed", label: "Concluída" },
];

const SESSION_STATUSES = [
  { value: "scheduled", label: "Agendada" },
  { value: "in_progress", label: "Em Progresso" },
  { value: "completed", label: "Finalizada" },
  { value: "cancelled", label: "Cancelada" },
];

type TabValue = "overview" | "members" | "productions" | "sessions" | "takes" | "settings" | "logs";

export default function StudioManagementPage() {
  const { studioId } = useParams<{ studioId: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const canAccess = hasManagementAccess(user);
  const isOwner = user?.role === "owner";

  const [activeTab, setActiveTab] = useState<TabValue>("overview");

  // Settings form state
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ManagementSettings, string>>>({});
  const [feedback, setFeedback] = useState("");

  // Members state
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string[]>>({});
  const [editMember, setEditMember] = useState<any | null>(null);
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [removeMemberConfirm, setRemoveMemberConfirm] = useState<any | null>(null);

  // Productions state
  const [createProductionOpen, setCreateProductionOpen] = useState(false);
  const [newProductionName, setNewProductionName] = useState("");
  const [newProductionDesc, setNewProductionDesc] = useState("");
  const [editProduction, setEditProduction] = useState<any | null>(null);
  const [editProductionForm, setEditProductionForm] = useState({ name: "", description: "", videoUrl: "", status: "" });
  const [deleteProductionConfirm, setDeleteProductionConfirm] = useState<any | null>(null);

  // Sessions state
  const [createSessionOpen, setCreateSessionOpen] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [newSessionProductionId, setNewSessionProductionId] = useState("");
  const [newSessionDate, setNewSessionDate] = useState("");
  const [newSessionDuration, setNewSessionDuration] = useState("60");
  const [editSession, setEditSession] = useState<any | null>(null);
  const [editSessionForm, setEditSessionForm] = useState({ title: "", scheduledAt: "", durationMinutes: "60", status: "" });
  const [deleteSessionConfirm, setDeleteSessionConfirm] = useState<any | null>(null);

  // Queries
  const { data: settingsData, isLoading: settingsLoading, isError: settingsError, error: settingsErrorObj } = useQuery({
    queryKey: ["/api/admin/studios", studioId, "management-settings"],
    queryFn: () => authFetch(`/api/admin/studios/${studioId}/management-settings`) as Promise<{ studio: { id: string; name: string; slug: string }; settings: ManagementSettings }>,
    enabled: canAccess && Boolean(studioId),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/studios", studioId, "stats"],
    queryFn: () => authFetch(`/api/studios/${studioId}/stats`),
    enabled: canAccess && Boolean(studioId),
  });

  const { data: pendingMembers, isLoading: pendingLoading } = useQuery({
    queryKey: ["/api/studios", studioId, "pending-members"],
    queryFn: () => authFetch(`/api/studios/${studioId}/pending-members`),
    enabled: canAccess && Boolean(studioId) && (activeTab === "members" || activeTab === "overview"),
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["/api/studios", studioId, "members"],
    queryFn: () => authFetch(`/api/studios/${studioId}/members`),
    enabled: canAccess && Boolean(studioId) && (activeTab === "members" || activeTab === "overview"),
  });

  const { data: productions, isLoading: prodsLoading } = useQuery({
    queryKey: ["/api/studios", studioId, "productions"],
    queryFn: () => authFetch(`/api/studios/${studioId}/productions`),
    enabled: canAccess && Boolean(studioId) && (activeTab === "productions" || activeTab === "overview"),
  });

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["/api/studios", studioId, "sessions"],
    queryFn: () => authFetch(`/api/studios/${studioId}/sessions`),
    enabled: canAccess && Boolean(studioId) && (activeTab === "sessions" || activeTab === "overview"),
  });

  const { data: takesGrouped, isLoading: takesLoading } = useQuery({
    queryKey: ["/api/studios", studioId, "takes-grouped"],
    queryFn: () => authFetch(`/api/studios/${studioId}/takes/grouped`),
    enabled: canAccess && Boolean(studioId) && activeTab === "takes",
  });

  const { data: auditLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["/api/admin/audit-logs"],
    queryFn: () => authFetch(`/api/admin/audit-logs`),
    enabled: canAccess && Boolean(studioId) && activeTab === "logs",
  });

  // Settings mutations
  const updateSettingsMutation = useMutation({
    mutationFn: (payload: ManagementSettings) =>
      authFetch(`/api/admin/studios/${studioId}/management-settings`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }) as Promise<ManagementSettings>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/studios", studioId, "management-settings"] });
      setFeedback("Alterações salvas com sucesso");
      toast({ title: "Configurações salvas" });
    },
    onError: (error: any) => {
      setFeedback("");
      toast({ title: error?.message || "Falha ao salvar configurações", variant: "destructive" });
    },
  });

  // Member mutations
  const approveMutation = useMutation({
    mutationFn: async ({ membershipId, roles }: { membershipId: string; roles: string[] }) => {
      return authFetch(`/api/studios/${studioId}/members/${membershipId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/studios", studioId, "pending-members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/studios", studioId, "members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/studios", studioId, "stats"] });
      toast({ title: "Membro aprovado com sucesso" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (membershipId: string) => {
      return authFetch(`/api/studios/${studioId}/members/${membershipId}/reject`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/studios", studioId, "pending-members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/studios", studioId, "stats"] });
      toast({ title: "Membro rejeitado" });
    },
  });

  const updateRolesMutation = useMutation({
    mutationFn: async ({ membershipId, roles }: { membershipId: string; roles: string[] }) => {
      return authFetch(`/api/studios/${studioId}/members/${membershipId}/roles`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/studios", studioId, "members"] });
      setEditMember(null);
      toast({ title: "Papéis atualizados" });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (membershipId: string) => {
      return authFetch(`/api/studios/${studioId}/members/${membershipId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/studios", studioId, "members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/studios", studioId, "stats"] });
      setRemoveMemberConfirm(null);
      toast({ title: "Membro removido" });
    },
    onError: (err: any) => {
      toast({ title: "Erro ao remover membro", description: err?.message, variant: "destructive" });
    },
  });

  // Production mutations
  const createProductionMutation = useMutation({
    mutationFn: async () => {
      return authFetch(`/api/studios/${studioId}/productions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProductionName, description: newProductionDesc, studioId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/studios", studioId, "productions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/studios", studioId, "stats"] });
      setCreateProductionOpen(false);
      setNewProductionName("");
      setNewProductionDesc("");
      toast({ title: "Produção criada" });
    },
  });

  const updateProductionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return authFetch(`/api/studios/${studioId}/productions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/studios", studioId, "productions"] });
      setEditProduction(null);
      toast({ title: "Produção atualizada" });
    },
    onError: (err: any) => {
      toast({ title: "Erro ao atualizar", description: err?.message, variant: "destructive" });
    },
  });

  const deleteProductionMutation = useMutation({
    mutationFn: async (id: string) => {
      return authFetch(`/api/studios/${studioId}/productions/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/studios", studioId, "productions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/studios", studioId, "stats"] });
      setDeleteProductionConfirm(null);
      toast({ title: "Produção excluída" });
    },
    onError: (err: any) => {
      toast({ title: "Erro ao excluir", description: err?.message, variant: "destructive" });
    },
  });

  // Session mutations
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      return authFetch(`/api/studios/${studioId}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newSessionTitle,
          productionId: newSessionProductionId,
          studioId,
          scheduledAt: newSessionDate,
          durationMinutes: parseInt(newSessionDuration) || 60,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/studios", studioId, "sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/studios", studioId, "stats"] });
      setCreateSessionOpen(false);
      setNewSessionTitle("");
      setNewSessionProductionId("");
      setNewSessionDate("");
      setNewSessionDuration("60");
      toast({ title: "Sessão criada" });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return authFetch(`/api/studios/${studioId}/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/studios", studioId, "sessions"] });
      setEditSession(null);
      toast({ title: "Sessão atualizada" });
    },
    onError: (err: any) => {
      toast({ title: "Erro ao atualizar", description: err?.message, variant: "destructive" });
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      return authFetch(`/api/studios/${studioId}/sessions/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/studios", studioId, "sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/studios", studioId, "stats"] });
      setDeleteSessionConfirm(null);
      toast({ title: "Sessão excluída" });
    },
    onError: (err: any) => {
      toast({ title: "Erro ao excluir", description: err?.message, variant: "destructive" });
    },
  });

  // Settings form effects and handlers
  useEffect(() => {
    if (!settingsData?.settings) return;
    setForm({
      maxVoiceActors: String(settingsData.settings.maxVoiceActors),
      maxDirectors: String(settingsData.settings.maxDirectors),
      totalSessionsAvailable: String(settingsData.settings.totalSessionsAvailable),
      simultaneousProductionsLimit: String(settingsData.settings.simultaneousProductionsLimit),
      maxDirectorsPerSession: String(settingsData.settings.maxDirectorsPerSession),
      maxDubbersStudentsPerSession: String(settingsData.settings.maxDubbersStudentsPerSession),
    });
    setErrors({});
  }, [settingsData]);

  const fields = useMemo(() => ([
    { key: "maxVoiceActors", label: "Capacidade máxima de dubladores" },
    { key: "maxDirectors", label: "Capacidade máxima de diretores" },
    { key: "totalSessionsAvailable", label: "Número total de sessões disponíveis" },
    { key: "simultaneousProductionsLimit", label: "Limite de produções simultâneas" },
    { key: "maxDirectorsPerSession", label: "Máximo de diretores por sessão" },
    { key: "maxDubbersStudentsPerSession", label: "Máximo de dubladores por sessão" },
  ]) as Array<{ key: keyof ManagementSettings; label: string }>, []);

  const handleInputChange = (key: keyof ManagementSettings, value: string) => {
    setFeedback("");
    if (!/^\d*$/.test(value)) return;
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof ManagementSettings, string>> = {};
    for (const field of fields) {
      const raw = String(form[field.key] || "").trim();
      if (!raw) {
        nextErrors[field.key] = "Campo obrigatório";
        continue;
      }
      const numeric = Number(raw);
      if (!Number.isInteger(numeric) || numeric <= 0) {
        nextErrors[field.key] = "Use um número inteiro positivo";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveSettings = () => {
    if (!validateForm()) return;
    if (!studioId) {
      toast({ title: "Estúdio inválido", variant: "destructive" });
      return;
    }
    const payload: ManagementSettings = {
      maxVoiceActors: Number(form.maxVoiceActors),
      maxDirectors: Number(form.maxDirectors),
      totalSessionsAvailable: Number(form.totalSessionsAvailable),
      simultaneousProductionsLimit: Number(form.simultaneousProductionsLimit),
      maxDirectorsPerSession: Number(form.maxDirectorsPerSession),
      maxDubbersStudentsPerSession: Number(form.maxDubbersStudentsPerSession),
    };
    updateSettingsMutation.mutate(payload);
  };

  // Helper functions
  function toggleRole(membershipId: string, role: string) {
    setSelectedRoles(prev => {
      const current = prev[membershipId] || [];
      const updated = current.includes(role)
        ? current.filter(r => r !== role)
        : [...current, role];
      return { ...prev, [membershipId]: updated };
    });
  }

  const approvedMembers = members?.filter((m: any) => m.status === "approved") || [];

  const isSessionBlocked = (session: any) => {
    if (!session.scheduledAt) return false;
    const now = new Date();
    const scheduledTime = new Date(session.scheduledAt);
    return scheduledTime > now;
  };

  const getTimeUntilStart = (session: any) => {
    if (!session.scheduledAt) return null;
    const now = new Date();
    const scheduledTime = new Date(session.scheduledAt);
    if (scheduledTime <= now) return null;

    const timeUntilStart = scheduledTime.getTime() - now.getTime();
    const minutesUntilStart = Math.ceil(timeUntilStart / (1000 * 60));

    if (minutesUntilStart < 60) return `${minutesUntilStart}min`;
    const hours = Math.floor(minutesUntilStart / 60);
    const mins = minutesUntilStart % 60;
    return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
  };

  // Access denied view
  if (!canAccess) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground p-4 md:p-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 md:p-10 text-center">
          <Lock className="w-10 h-10 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold">Acesso Negado</h1>
          <p className="text-sm text-muted-foreground mt-2">Você não possui permissão para acessar esta página.</p>
          <Button className="mt-6" variant="outline" onClick={() => setLocation("/hub-dub/admin")}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  // No studio view
  if (!studioId) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground p-4 md:p-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 md:p-10 text-center">
          <h1 className="text-2xl font-bold">Estúdio não encontrado</h1>
          <p className="text-sm text-muted-foreground mt-2">Não foi possível identificar o estúdio para gerenciamento.</p>
          <Button className="mt-6" variant="outline" onClick={() => setLocation("/hub-dub/admin")}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setLocation("/hub-dub/admin")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Painel de Controle do Estúdio</h1>
              <p className="text-sm text-muted-foreground">
                {settingsData?.studio?.name || "Carregando..."}
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
            <Shield className="w-3.5 h-3.5" />
            Acesso Administrativo
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 h-auto">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Membros</span>
            </TabsTrigger>
            <TabsTrigger value="productions" className="gap-2">
              <Film className="w-4 h-4" />
              <span className="hidden sm:inline">Produções</span>
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Sessões</span>
            </TabsTrigger>
            <TabsTrigger value="takes" className="gap-2">
              <Mic2 className="w-4 h-4" />
              <span className="hidden sm:inline">Takes</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Logs</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configurações</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {statsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <StatCard label="Membros" value={stats?.members ?? 0} icon={<Users className="w-4 h-4" />} color="blue" />
                  <StatCard label="Pendentes" value={stats?.pendingMembers ?? 0} icon={<UserPlus className="w-4 h-4" />} color="orange" />
                  <StatCard label="Produções" value={stats?.productions ?? 0} icon={<Film className="w-4 h-4" />} color="violet" />
                  <StatCard label="Sessões" value={stats?.sessions ?? 0} icon={<Calendar className="w-4 h-4" />} color="emerald" />
                  <StatCard label="Takes" value={stats?.takes ?? 0} icon={<Mic2 className="w-4 h-4" />} color="rose" />
                  <StatCard label="Online" value={stats?.onlineUsers ?? 0} icon={<Activity className="w-4 h-4" />} color="cyan" />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <QuickActionCard
                    title="Gerenciar Membros"
                    description={`${approvedMembers.length} membros ativos, ${pendingMembers?.length || 0} pendentes`}
                    icon={<Users className="w-5 h-5" />}
                    onClick={() => setActiveTab("members")}
                  />
                  <QuickActionCard
                    title="Gerenciar Produções"
                    description={`${productions?.length || 0} produções no estúdio`}
                    icon={<Film className="w-5 h-5" />}
                    onClick={() => setActiveTab("productions")}
                  />
                  <QuickActionCard
                    title="Gerenciar Sessões"
                    description={`${sessions?.length || 0} sessões agendadas`}
                    icon={<Calendar className="w-5 h-5" />}
                    onClick={() => setActiveTab("sessions")}
                  />
                  <QuickActionCard
                    title="Configurações de Capacidade"
                    description="Ajustar limites e capacidades do estúdio"
                    icon={<Settings className="w-5 h-5" />}
                    onClick={() => setActiveTab("settings")}
                  />
                </div>
              </>
            )}
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            {/* Pending Members */}
            {(pendingMembers?.length ?? 0) > 0 && (
              <section className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <UserPlus className="w-4 h-4 text-orange-500" />
                  <h3 className="font-semibold">Cadastros Pendentes</h3>
                  <Badge variant="secondary">{pendingMembers.length}</Badge>
                </div>
                <div className="space-y-3">
                  {pendingMembers.map((m: any) => (
                    <div key={m.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {(m.user?.fullName || m.user?.email || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{m.user?.fullName || m.user?.displayName || m.user?.email}</p>
                          <p className="text-xs text-muted-foreground">{m.user?.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {STUDIO_ROLES.map(r => (
                          <label key={r.value} className="flex items-center gap-1.5 cursor-pointer">
                            <Checkbox
                              checked={(selectedRoles[m.id] || []).includes(r.value)}
                              onCheckedChange={() => toggleRole(m.id, r.value)}
                            />
                            <span className="text-xs">{r.label}</span>
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={!(selectedRoles[m.id]?.length) || approveMutation.isPending}
                          onClick={() => approveMutation.mutate({ membershipId: m.id, roles: selectedRoles[m.id] })}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          disabled={rejectMutation.isPending}
                          onClick={() => rejectMutation.mutate(m.id)}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Rejeitar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Approved Members */}
            <section className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <h3 className="font-semibold">Membros Ativos</h3>
                  <Badge variant="secondary">{approvedMembers.length}</Badge>
                </div>
              </div>
              {membersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : approvedMembers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Membro</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Email</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Papéis</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedMembers.map((m: any) => {
                        const memberRoles: string[] = m.roles || (m.role ? [m.role] : []);
                        return (
                          <tr key={m.id} className="border-b border-border/50">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                  {(m.user?.fullName || m.user?.email || "?").charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium text-sm">{m.user?.fullName || m.user?.displayName}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-sm text-muted-foreground">{m.user?.email}</td>
                            <td className="py-3 px-3">
                              <div className="flex flex-wrap gap-1">
                                {memberRoles.map(r => (
                                  <Badge key={r} variant="outline" className="text-xs">
                                    {STUDIO_ROLES.find(sr => sr.value === r)?.label || r}
                                  </Badge>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => { setEditMember(m); setEditRoles(memberRoles); }}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={() => setRemoveMemberConfirm(m)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum membro ativo</p>
                </div>
              )}
            </section>
          </TabsContent>

          {/* Productions Tab */}
          <TabsContent value="productions" className="space-y-6">
            <section className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-violet-500" />
                  <h3 className="font-semibold">Produções</h3>
                  <Badge variant="secondary">{productions?.length || 0}</Badge>
                </div>
                <Button size="sm" onClick={() => setCreateProductionOpen(true)}>
                  <Film className="w-4 h-4 mr-1" /> Nova Produção
                </Button>
              </div>
              {prodsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : productions?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Nome</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Descrição</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Status</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productions.map((p: any) => (
                        <tr key={p.id} className="border-b border-border/50">
                          <td className="py-3 px-3 font-medium text-sm">{p.name}</td>
                          <td className="py-3 px-3 text-sm text-muted-foreground">{p.description || "-"}</td>
                          <td className="py-3 px-3">
                            <StatusBadge status={p.status || "planned"} />
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setEditProduction(p);
                                  setEditProductionForm({
                                    name: p.name,
                                    description: p.description || "",
                                    videoUrl: p.videoUrl || "",
                                    status: p.status || "planned"
                                  });
                                }}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteProductionConfirm(p)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Film className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma produção</p>
                  <Button size="sm" className="mt-2" onClick={() => setCreateProductionOpen(true)}>
                    Criar primeira produção
                  </Button>
                </div>
              )}
            </section>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <section className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <h3 className="font-semibold">Sessões</h3>
                  <Badge variant="secondary">{sessions?.length || 0}</Badge>
                </div>
                <Button size="sm" onClick={() => setCreateSessionOpen(true)}>
                  <Calendar className="w-4 h-4 mr-1" /> Nova Sessão
                </Button>
              </div>
              {sessionsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : sessions?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Título</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Data</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Duração</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Status</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((s: any) => {
                        const blocked = isSessionBlocked(s);
                        const timeUntilStart = getTimeUntilStart(s);
                        return (
                          <tr key={s.id} className="border-b border-border/50">
                            <td className="py-3 px-3">
                              <div className="font-medium text-sm">{s.title}</div>
                              {blocked && (
                                <Badge variant="destructive" className="text-xs mt-1">Bloqueada</Badge>
                              )}
                            </td>
                            <td className="py-3 px-3 text-sm text-muted-foreground">
                              {s.scheduledAt ? format(new Date(s.scheduledAt), "dd/MM/yy HH:mm") : "-"}
                            </td>
                            <td className="py-3 px-3 text-sm text-muted-foreground">{s.durationMinutes}min</td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <StatusBadge status={s.status || "scheduled"} />
                                {blocked && timeUntilStart && (
                                  <span className="text-xs text-orange-600 font-medium">{timeUntilStart}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditSession(s);
                                    const dt = s.scheduledAt ? new Date(s.scheduledAt).toISOString().slice(0, 16) : "";
                                    setEditSessionForm({
                                      title: s.title,
                                      scheduledAt: dt,
                                      durationMinutes: String(s.durationMinutes || 60),
                                      status: s.status || "scheduled"
                                    });
                                  }}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={() => setDeleteSessionConfirm(s)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma sessão</p>
                  <Button size="sm" className="mt-2" onClick={() => setCreateSessionOpen(true)}>
                    Criar primeira sessão
                  </Button>
                </div>
              )}
            </section>
          </TabsContent>

          {/* Takes Tab */}
          <TabsContent value="takes" className="space-y-6">
            <section className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Mic2 className="w-4 h-4 text-rose-500" />
                <h3 className="font-semibold">Takes de Áudio</h3>
              </div>
              {takesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : takesGrouped && takesGrouped.length > 0 ? (
                <div className="space-y-4">
                  {takesGrouped.slice(0, 20).map((group: any) => (
                    <div key={group.sessionId} className="border border-border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{group.sessionTitle}</span>
                        <Badge variant="secondary">{group.takes?.length || 0} takes</Badge>
                      </div>
                      <div className="pl-6 space-y-1">
                        {group.takes?.slice(0, 5).map((take: any) => (
                          <div key={take.id} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {take.character || "Sem personagem"} - {format(new Date(take.createdAt), "dd/MM HH:mm")}
                            </span>
                            <div className="flex items-center gap-2">
                              {take.isPreferred && <Badge variant="default" className="text-xs">Aprovado</Badge>}
                              {take.durationSeconds && (
                                <span className="text-xs text-muted-foreground">{take.durationSeconds}s</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Mic2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum take registrado</p>
                </div>
              )}
            </section>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <section className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-500" />
                  <h3 className="font-semibold">Logs de Auditoria</h3>
                </div>
                <Button size="sm" variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/audit-logs"] })}>
                  <RefreshCw className="w-4 h-4 mr-1" /> Atualizar
                </Button>
              </div>
              {logsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : auditLogs && auditLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Data</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Usuário</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Ação</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Detalhes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.slice(0, 50).map((log: any) => (
                        <tr key={log.id} className="border-b border-border/50">
                          <td className="py-2 px-3 text-sm text-muted-foreground">
                            {log.createdAt ? format(new Date(log.createdAt), "dd/MM/yy HH:mm") : "-"}
                          </td>
                          <td className="py-2 px-3 text-sm">{log.userEmail || log.userId?.slice(0, 8) || "-"}</td>
                          <td className="py-2 px-3">
                            <Badge variant="outline" className="text-xs">{log.action}</Badge>
                          </td>
                          <td className="py-2 px-3 text-sm text-muted-foreground">{log.details || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum log registrado</p>
                </div>
              )}
            </section>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <section className="rounded-xl border border-border bg-card p-4 md:p-6">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Configurações de Capacidade</h3>
              </div>

              {settingsError && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {(settingsErrorObj as any)?.message || "Falha ao carregar configurações"}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                {fields.map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <Input
                      id={field.key}
                      type="number"
                      min={1}
                      step={1}
                      inputMode="numeric"
                      value={form[field.key]}
                      onChange={(event) => handleInputChange(field.key, event.target.value)}
                      disabled={settingsLoading || updateSettingsMutation.isPending}
                    />
                    {errors[field.key] && <p className="text-xs text-destructive">{errors[field.key]}</p>}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-sm text-emerald-500 min-h-5">
                  {feedback}
                </div>
                <Button onClick={handleSaveSettings} disabled={settingsLoading || updateSettingsMutation.isPending}>
                  {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Salvar Configurações
                </Button>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Member Dialog */}
      <Dialog open={!!editMember} onOpenChange={() => setEditMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Papéis</DialogTitle>
            <DialogDescription>
              {editMember?.user?.fullName || editMember?.user?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {STUDIO_ROLES.map(r => (
              <label key={r.value} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={editRoles.includes(r.value)}
                  onCheckedChange={() => {
                    setEditRoles(prev =>
                      prev.includes(r.value)
                        ? prev.filter(role => role !== r.value)
                        : [...prev, r.value]
                    );
                  }}
                />
                <span>{r.label}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMember(null)}>Cancelar</Button>
            <Button
              onClick={() => updateRolesMutation.mutate({ membershipId: editMember.id, roles: editRoles })}
              disabled={updateRolesMutation.isPending}
            >
              {updateRolesMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={!!removeMemberConfirm} onOpenChange={() => setRemoveMemberConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Membro</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover {removeMemberConfirm?.user?.fullName || removeMemberConfirm?.user?.email}?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveMemberConfirm(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => removeMemberMutation.mutate(removeMemberConfirm.id)}
              disabled={removeMemberMutation.isPending}
            >
              {removeMemberMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Production Dialog */}
      <Dialog open={createProductionOpen} onOpenChange={setCreateProductionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Produção</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={newProductionName} onChange={e => setNewProductionName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={newProductionDesc} onChange={e => setNewProductionDesc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateProductionOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => createProductionMutation.mutate()}
              disabled={!newProductionName || createProductionMutation.isPending}
            >
              {createProductionMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Production Dialog */}
      <Dialog open={!!editProduction} onOpenChange={() => setEditProduction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Produção</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={editProductionForm.name} onChange={e => setEditProductionForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={editProductionForm.description} onChange={e => setEditProductionForm(prev => ({ ...prev, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>URL do Vídeo</Label>
              <Input value={editProductionForm.videoUrl} onChange={e => setEditProductionForm(prev => ({ ...prev, videoUrl: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editProductionForm.status} onValueChange={v => setEditProductionForm(prev => ({ ...prev, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCTION_STATUSES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProduction(null)}>Cancelar</Button>
            <Button
              onClick={() => updateProductionMutation.mutate({ id: editProduction.id, data: editProductionForm })}
              disabled={updateProductionMutation.isPending}
            >
              {updateProductionMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Production Dialog */}
      <Dialog open={!!deleteProductionConfirm} onOpenChange={() => setDeleteProductionConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Produção</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir "{deleteProductionConfirm?.name}"?
              Todas as sessões e takes associados serão removidos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProductionConfirm(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => deleteProductionMutation.mutate(deleteProductionConfirm.id)}
              disabled={deleteProductionMutation.isPending}
            >
              {deleteProductionMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Session Dialog */}
      <Dialog open={createSessionOpen} onOpenChange={setCreateSessionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Sessão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={newSessionTitle} onChange={e => setNewSessionTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Produção</Label>
              <Select value={newSessionProductionId} onValueChange={setNewSessionProductionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma produção" />
                </SelectTrigger>
                <SelectContent>
                  {productions?.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data e Hora</Label>
              <Input type="datetime-local" value={newSessionDate} onChange={e => setNewSessionDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Duração (minutos)</Label>
              <Input type="number" value={newSessionDuration} onChange={e => setNewSessionDuration(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateSessionOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => createSessionMutation.mutate()}
              disabled={!newSessionTitle || !newSessionProductionId || !newSessionDate || createSessionMutation.isPending}
            >
              {createSessionMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Session Dialog */}
      <Dialog open={!!editSession} onOpenChange={() => setEditSession(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Sessão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={editSessionForm.title} onChange={e => setEditSessionForm(prev => ({ ...prev, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Data e Hora</Label>
              <Input type="datetime-local" value={editSessionForm.scheduledAt} onChange={e => setEditSessionForm(prev => ({ ...prev, scheduledAt: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Duração (minutos)</Label>
              <Input value={editSessionForm.durationMinutes} onChange={e => setEditSessionForm(prev => ({ ...prev, durationMinutes: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editSessionForm.status} onValueChange={v => setEditSessionForm(prev => ({ ...prev, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SESSION_STATUSES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSession(null)}>Cancelar</Button>
            <Button
              onClick={() => updateSessionMutation.mutate({ id: editSession.id, data: editSessionForm })}
              disabled={updateSessionMutation.isPending}
            >
              {updateSessionMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Session Dialog */}
      <Dialog open={!!deleteSessionConfirm} onOpenChange={() => setDeleteSessionConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Sessão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir "{deleteSessionConfirm?.title}"?
              Todos os takes e participantes serão removidos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteSessionConfirm(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => deleteSessionMutation.mutate(deleteSessionConfirm.id)}
              disabled={deleteSessionMutation.isPending}
            >
              {deleteSessionMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente para cards de estatísticas
function StatCard({ label, value, icon, color = "primary" }: { label: string; value: number; icon: React.ReactNode; color?: string }) {
  const colorClasses: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    blue: "bg-blue-500/10 text-blue-500",
    emerald: "bg-emerald-500/10 text-emerald-500",
    violet: "bg-violet-500/10 text-violet-500",
    rose: "bg-rose-500/10 text-rose-500",
    orange: "bg-orange-500/10 text-orange-500",
    cyan: "bg-cyan-500/10 text-cyan-500",
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color] || colorClasses.primary}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

// Componente para ações rápidas
function QuickActionCard({ title, description, icon, onClick }: { title: string; description: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left w-full"
    >
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
    </button>
  );
}

// Componente para badges de status
function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { class: string; label: string }> = {
    planned: { class: "bg-slate-500/10 text-slate-600 border-slate-500/20", label: "Planejada" },
    in_progress: { class: "bg-blue-500/10 text-blue-600 border-blue-500/20", label: "Em Andamento" },
    completed: { class: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", label: "Concluída" },
    scheduled: { class: "bg-amber-500/10 text-amber-600 border-amber-500/20", label: "Agendada" },
    cancelled: { class: "bg-rose-500/10 text-rose-600 border-rose-500/20", label: "Cancelada" },
  };

  const variant = variants[status] || { class: "bg-muted text-muted-foreground", label: status };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${variant.class}`}>
      {variant.label}
    </span>
  );
}

