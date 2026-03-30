import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Calendar,
  Mic,
  HardDrive,
  Plus,
  Activity,
  Clock,
} from "lucide-react";

async function fetchOverview() {
  const res = await fetch("/api/platform-admin/overview");
  if (!res.ok) throw new Error("Failed to fetch overview");
  return res.json();
}

async function fetchRecentActivity() {
  const res = await fetch("/api/platform-admin/audits?limit=20");
  if (!res.ok) throw new Error("Failed to fetch activity");
  const data = await res.json();
  return data.audits || [];
}

export default function PlatformAdminOverview() {
  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ["platform-admin-overview"],
    queryFn: fetchOverview,
  });
  const { data: activity, isLoading: loadingActivity } = useQuery({
    queryKey: ["platform-admin-activity"],
    queryFn: fetchRecentActivity,
  });

  const stats = [
    {
      label: "Total Estúdios",
      value: overview?.totalStudios ?? 0,
      icon: Building2,
      color: "from-violet-600 to-violet-800",
    },
    {
      label: "Total Usuários",
      value: overview?.totalUsers ?? 0,
      icon: Users,
      color: "from-violet-600 to-violet-800",
    },
    {
      label: "Sessões Hoje",
      value: overview?.todayTakes ?? 0,
      icon: Calendar,
      color: "from-violet-600 to-violet-800",
    },
    {
      label: "Takes Gravados",
      value: overview?.totalTakes ?? 0,
      icon: Mic,
      color: "from-violet-600 to-violet-800",
    },
    {
      label: "Storage Usado",
      value: "—",
      icon: HardDrive,
      color: "from-violet-600 to-violet-800",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
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

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button className="bg-violet-600 hover:bg-violet-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Novo Estúdio
        </Button>
        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10 rounded-2xl">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-bold text-white">Atividade Recente</h2>
          </div>
          <Separator className="bg-white/10 mb-4" />
          <ScrollArea className="h-64">
            {loadingActivity ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="space-y-3">
                {activity.map((log: any) => (
                  <div key={log.id} className="flex items-start gap-3 text-sm">
                    <Clock className="w-4 h-4 text-slate-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-white font-medium">{log.action}</p>
                      <p className="text-slate-400 text-xs">{log.details}</p>
                      <p className="text-slate-500 text-xs mt-1">
                        {new Date(log.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">Nenhuma atividade recente.</p>
            )}
          </ScrollArea>
        </div>
      </Card>
    </div>
  );
}
