import { memo, useEffect, useRef } from "react";
import { Activity, Wifi, WifiOff, Users, Mic, Upload, Settings, AlertCircle, X } from "lucide-react";
import { Badge } from "@studio/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@studio/components/ui/card";
import { Button } from "@studio/components/ui/button";
import { format } from "date-fns";

interface StudioEvent {
  type: 'user_entered' | 'user_left' | 'recording_started' | 'recording_stopped' | 'upload_started' | 'upload_completed' | 'permission_changed';
  data: any;
  timestamp: Date;
  userName?: string;
  message?: string;
}

interface EventFeedProps {
  studioId: string;
  events: StudioEvent[] | null;
  isConnected: boolean;
  clearEvents?: () => void;
}

const EventFeed = memo(function EventFeed({ events, isConnected, clearEvents }: EventFeedProps) {
  const eventsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto scroll to bottom when new events arrive
    eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'user_entered': return <Users className="w-4 h-4 text-green-500" />;
      case 'user_left': return <Users className="w-4 h-4 text-red-500" />;
      case 'recording_started': return <Mic className="w-4 h-4 text-red-500" />;
      case 'recording_stopped': return <Mic className="w-4 h-4 text-gray-500" />;
      case 'upload_started': return <Upload className="w-4 h-4 text-blue-500" />;
      case 'upload_completed': return <Upload className="w-4 h-4 text-green-500" />;
      case 'permission_changed': return <Settings className="w-4 h-4 text-purple-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEventMessage = (event: StudioEvent) => {
    switch (event.type) {
      case 'user_entered':
        return `${event.userName || 'Alguém'} entrou no estúdio`;
      case 'user_left':
        return `${event.userName || 'Alguém'} saiu do estúdio`;
      case 'recording_started':
        return `${event.userName || 'Alguém'} começou a gravar`;
      case 'recording_stopped':
        return `${event.userName || 'Alguém'} parou de gravar`;
      case 'upload_started':
        return `${event.userName || 'Alguém'} está fazendo upload`;
      case 'upload_completed':
        return `${event.userName || 'Alguém'} concluiu upload`;
      case 'permission_changed':
        return `Permissões alteradas para ${event.userName || 'alguém'}`;
      default:
        return event.message || 'Evento desconhecido';
    }
  };

  const getEventBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'user_entered': 'default',
      'user_left': 'destructive',
      'recording_started': 'destructive',
      'recording_stopped': 'secondary',
      'upload_started': 'outline',
      'upload_completed': 'default',
      'permission_changed': 'secondary'
    };
    return variants[type] || 'secondary';
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'user_entered': return 'Entrou';
      case 'user_left': return 'Saiu';
      case 'recording_started': return 'Gravando';
      case 'recording_stopped': return 'Parou';
      case 'upload_started': return 'Upload';
      case 'upload_completed': return 'Concluído';
      case 'permission_changed': return 'Permissão';
      default: return 'Outro';
    }
  };


  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Eventos em Tempo Real
            </span>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "destructive"} className="gap-1">
                {isConnected ? (
                  <>
                    <Wifi className="w-3 h-3" />
                    Online
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" />
                    Offline
                  </>
                )}
              </Badge>
              <Button variant="outline" size="sm" onClick={clearEvents}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {isConnected 
              ? "Conectado ao servidor de eventos em tempo real" 
              : "Desconectado do servidor. Tentando reconectar..."
            }
          </div>
        </CardContent>
      </Card>

      {/* Events Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Feed de Eventos</span>
            <Badge variant="secondary">
              {events?.length || 0} eventos
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!events || events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum evento recebido ainda</p>
              <p className="text-xs mt-1">
                {isConnected ? "Aguardando eventos..." : "Verifique sua conexão"}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {events.map((event, index) => (
                <div 
                  key={`${event.timestamp.getTime()}-${index}`}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors animate-in slide-in-from-top-1"
                >
                  <div className="mt-0.5">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getEventBadge(event.type)} className="text-xs">
                        {getEventLabel(event.type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(event.timestamp), "HH:mm:ss")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{getEventMessage(event)}</p>
                    {event.userName && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Usuário: {event.userName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={eventsEndRef} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sobre os Eventos</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p>• Eventos aparecem em tempo real quando acontecem no estúdio</p>
          <p>• Entrada/saída de usuários, início/fim de gravações, uploads, etc.</p>
          <p>• Mantenha esta página aberta para monitorar atividades ao vivo</p>
          <p>• Eventos mais recentes aparecem no topo da lista</p>
        </CardContent>
      </Card>
    </div>
  );
});

EventFeed.displayName = "EventFeed";

export default EventFeed;
