import { memo } from "react";
import { Calendar, Clock, Users, PlayCircle, PauseCircle, CheckCircle } from "lucide-react";
import { Badge } from "@studio/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@studio/components/ui/card";
import { format } from "date-fns";

interface SessionStatusProps {
  studioId: string;
  sessions: any[] | undefined;
  isLoading: boolean;
}

const SessionStatus = memo(function SessionStatus({ sessions, isLoading }: SessionStatusProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeSessions = sessions?.filter(s => s.status === "in_progress") || [];
  const scheduledSessions = sessions?.filter(s => s.status === "scheduled") || [];
  const completedSessions = sessions?.filter(s => s.status === "completed") || [];

  return (
    <div className="space-y-6">
      {/* Sessões Ativas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-emerald-500" />
            Sessões Ativas ({activeSessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PlayCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma sessão ativa no momento</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <div>
                      <h4 className="font-semibold">{session.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Iniciou: {session.startedAt ? format(new Date(session.startedAt), "HH:mm") : "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-emerald-500">
                      AO VIVO
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {session.participantCount || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sessões Agendadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Sessões Agendadas ({scheduledSessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma sessão agendada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div>
                    <h4 className="font-semibold">{session.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {session.scheduledAt ? format(new Date(session.scheduledAt), "dd/MM/yyyy HH:mm") : "-"}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    AGENDADA
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sessões Concluídas (Recentes) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-gray-500" />
            Sessões Concluídas (Recentes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma sessão concluída recentemente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div>
                    <h4 className="font-semibold">{session.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {session.completedAt ? format(new Date(session.completedAt), "dd/MM/yyyy HH:mm") : "-"}
                    </p>
                  </div>
                  <Badge variant="outline">
                    CONCLUÍDA
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

SessionStatus.displayName = "SessionStatus";

export default SessionStatus;
