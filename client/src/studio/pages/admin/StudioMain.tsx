import { useState, memo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@studio/lib/auth-fetch";
import {
  BarChart3, Settings, Monitor, Calendar, Users, Activity,
  Cpu, Wifi, Upload, Download, AlertCircle, CheckCircle
} from "lucide-react";
import { Button } from "@studio/components/ui/button";
import { Badge } from "@studio/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@studio/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@studio/components/ui/tabs";
import { PageSection, PageHeader, StatCard } from "@studio/components/ui/design-system";
import { useToast } from "@studio/hooks/use-toast";
import { useStudioRole } from "@studio/hooks/use-studio-role";
import { useAuth } from "@studio/hooks/use-auth";
import { format } from "date-fns";
import { pt } from "@studio/lib/i18n";

// Import components
import SessionStatus from "./components/SessionStatus";
import HardwareConfig from "./components/HardwareConfig";
import MonitorPanel from "./components/MonitorPanel";
import EventFeed from "./components/EventFeed";

// Import hooks
import { useHardwareConfig } from "./hooks/useHardwareConfig";
import { useMonitoringLogs } from "./hooks/useMonitoringLogs";
import { useStudioEvents } from "./hooks/useStudioEvents";

type AdminTab = "sessions" | "hardware" | "monitoring" | "events";

const StudioMain = memo(function StudioMain({ studioId }: { studioId: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { canManageMembers } = useStudioRole(studioId);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("sessions");

  // Proteção: apenas studio_admin pode acessar
  if (!canManageMembers) {
    return (
      <PageSection>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">Apenas administradores do estúdio podem acessar esta página.</p>
        </div>
      </PageSection>
    );
  }

  // Queries básicas
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/studios", studioId, "stats"],
    queryFn: () => authFetch(`/api/studios/${studioId}/stats`),
  });

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["/api/studios", studioId, "sessions"],
    queryFn: () => authFetch(`/api/studios/${studioId}/sessions`),
  });

  // Hooks personalizados
  const { config: hardwareConfig, updateHardwareConfig, isLoading: hardwareLoading } = useHardwareConfig(studioId);
  const { logs, isLoading: logsLoading } = useMonitoringLogs(studioId);
  const { events, isConnected } = useStudioEvents(studioId);

  const tabs: { key: AdminTab; label: string; icon: typeof BarChart3; count?: number }[] = [
    { key: "sessions", label: "Sessões", icon: Calendar, count: sessions?.length || 0 },
    { key: "hardware", label: "Hardware", icon: Cpu },
    { key: "monitoring", label: "Monitoramento", icon: Monitor },
    { key: "events", label: "Eventos ao Vivo", icon: Activity, count: isConnected ? events?.length || 0 : undefined },
  ];

  return (
    <PageSection>
      <PageHeader
        label="Administração Avançada"
        title="Painel do Estúdio"
        subtitle="Controle total do estúdio com monitoramento em tempo real"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          label="Sessões Ativas" 
          value={sessions?.filter((s: any) => s.status === "in_progress").length ?? 0} 
          icon={<Calendar className="w-4 h-4 text-emerald-500" />} 
        />
        <StatCard 
          label="Usuários Online" 
          value={stats?.onlineUsers ?? 0} 
          icon={<Users className="w-4 h-4 text-blue-500" />} 
        />
        <StatCard 
          label="Takes Hoje" 
          value={stats?.takesToday ?? 0} 
          icon={<Upload className="w-4 h-4 text-violet-500" />} 
        />
        <StatCard 
          label="Status Sistema" 
          value={isConnected ? "Online" : "Offline"} 
          icon={<Wifi className={`w-4 h-4 ${isConnected ? "text-green-500" : "text-red-500"}`} />} 
        />
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AdminTab)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          {tabs.map(tab => (
            <TabsTrigger 
              key={tab.key} 
              value={tab.key}
              className="flex items-center gap-2"
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  {tab.count}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <SessionStatus 
            studioId={studioId}
            sessions={sessions}
            isLoading={sessionsLoading}
          />
        </TabsContent>

        {/* Hardware Tab */}
        <TabsContent value="hardware" className="space-y-4">
          <HardwareConfig
            studioId={studioId}
            config={hardwareConfig}
            onUpdate={updateHardwareConfig}
            isLoading={hardwareLoading}
          />
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <MonitorPanel
            studioId={studioId}
            logs={logs || []}
            isLoading={logsLoading}
          />
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <EventFeed
            studioId={studioId}
            events={events}
            isConnected={isConnected}
          />
        </TabsContent>
      </Tabs>
    </PageSection>
  );
});

StudioMain.displayName = "StudioMain";

export default StudioMain;
