import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Film,
  Calendar,
  Mic,
  Activity,
  Clock,
  PlayCircle,
  ChevronRight,
} from "lucide-react";

// Mock studioId for now; in real app, get from route params or context
const studioId = "demo-studio";

async function fetchOverview() {
  const res = await fetch(`/api/studio-admin/studios/${studioId}/overview`);
  if (!res.ok) throw new Error("Failed to fetch overview");
  return res.json();
}

async function fetchUpcomingSessions() {
  // Mock: replace with real endpoint if available
  return [
    { id: "1", title: "Sessão A", scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), status: "scheduled" },
    { id: "2", title: "Sessão B", scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), status: "scheduled" },
    { id: "3", title: "Sessão C", scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), status: "scheduled" },
    { id: "4", title: "Sessão D", scheduledAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), status: "scheduled" },
    { id: "5", title: "Sessão E", scheduledAt: new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString(), status: "scheduled" },
  ];
}

async function fetchRecentActivity() {
  // Mock: recent takes or actions
  return [
    { id: "1", action: "Take gravado", details: "Personagem A - Linha 1", createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
    { id: "2", action: "Sessão concluída", details: "Sessão X", createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
    { id: "3", action: "Membro convidado", details: "novo@exemplo.com", createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    { id: "4", action: "Take aprovado", details: "Personagem B - Linha 3", createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
    { id: "5", action: "Projeto criado", details: "Projeto Y", createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
  ];
}

export default function StudioAdminOverview() {
  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ["studio-admin-overview", studioId],
    queryFn: fetchOverview,
  });
  const { data: upcomingSessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ["studio-admin-upcoming-sessions"],
    queryFn: fetchUpcomingSessions,
  });
  const { data: activity = [], isLoading: loadingActivity } = useQuery({
    queryKey: ["studio-admin-activity"],
    queryFn: fetchRecentActivity,
  });

  const stats = [
    {
      label: "Membros",
      value: overview?.members ?? 0,
      icon: Users,
      color: "from-emerald-600 to-emerald-800",
    },
    {
      label: "Projetos",
      value: overview?.productions ?? 0,
      icon: Film,
      color: "from-emerald-600 to-emerald-800",
    },
    {
      label: "Sessões este mês",
      value: overview?.sessions ?? 0,
      icon: Calendar,
      color: "from-emerald-600 to-emerald-800",
    },
    {
      label: "Takes gravados",
      value: overview?.takes ?? 0,
      icon: Mic,
      color: "from-emerald-600 to-emerald-800",
    },
  ];

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  };

  const formatRelative = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Sessions */}
        <Card className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              Próximas Sessões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {loadingSessions ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                </div>
              ) : upcomingSessions.length === 0 ? (
                <p className="text-slate-500 text-sm">Nenhuma sessão agendada.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingSessions.map((session: any) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-white/5">
                      <div>
                        <p className="text-white font-medium">{session.title}</p>
                        <p className="text-xs text-slate-400">{formatDateTime(session.scheduledAt)}</p>
                      </div>
                      <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5">
                        <PlayCircle className="w-4 h-4 mr-1" />
                        Entrar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {loadingActivity ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                </div>
              ) : activity.length === 0 ? (
                <p className="text-slate-500 text-sm">Nenhuma atividade recente.</p>
              ) : (
                <div className="space-y-3">
                  {activity.map((log: any) => (
                    <div key={log.id} className="flex items-start gap-3 text-sm">
                      <Clock className="w-4 h-4 text-slate-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-white font-medium">{log.action}</p>
                        <p className="text-slate-400 text-xs">{log.details}</p>
                        <p className="text-slate-500 text-xs mt-1">{formatRelative(log.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
