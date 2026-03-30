import { useState, useEffect } from "react";
import { Lock, Clock, RefreshCw } from "lucide-react";
import { Button } from "@studio/components/ui/button";
import { Card, CardContent } from "@studio/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SessionBlockedScreenProps {
  scheduledAt: Date;
  minutesUntilStart: number;
  sessionTitle: string;
  productionName?: string;
}

const SessionBlockedScreen = ({ 
  scheduledAt, 
  minutesUntilStart, 
  sessionTitle, 
  productionName 
}: SessionBlockedScreenProps) => {
  const [timeLeft, setTimeLeft] = useState(minutesUntilStart);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      // Auto-refresh quando chegar o horário
      window.location.reload();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 60000); // Atualizar a cada minuto
    
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (minutes: number) => {
    if (minutes <= 0) return "Qualquer momento";
    if (minutes < 60) return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 1) {
      return mins > 0 ? `1 hora e ${mins} minuto${mins !== 1 ? 's' : ''}` : "1 hora";
    }
    
    return mins > 0 
      ? `${hours} horas e ${mins} minuto${mins !== 1 ? 's' : ''}` 
      : `${hours} hora${hours !== 1 ? 's' : ''}`;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  const getUserTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          {/* Ícone de bloqueio */}
          <div className="flex justify-center">
            <div className="relative">
              <Lock className="w-16 h-16 text-slate-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Título e mensagem */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">Sessão Bloqueada</h2>
            <p className="text-slate-600">
              Esta sessão estará disponível em <span className="font-semibold text-blue-600">{formatTime(timeLeft)}</span>
            </p>
          </div>

          {/* Informações da sessão */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-left">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="font-medium text-slate-700">Início previsto:</span>
            </div>
            <p className="text-slate-600 text-sm pl-6">
              {format(scheduledAt, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
            <p className="text-xs text-slate-500 pl-6">
              Fuso horário: {getUserTimezone()}
            </p>
            
            {sessionTitle && (
              <div className="pt-2 border-t border-slate-200">
                <p className="text-sm font-medium text-slate-700">Sessão:</p>
                <p className="text-slate-600 pl-6">{sessionTitle}</p>
              </div>
            )}
            
            {productionName && (
              <div>
                <p className="text-sm font-medium text-slate-700">Produção:</p>
                <p className="text-slate-600 pl-6">{productionName}</p>
              </div>
            )}
          </div>

          {/* Botão de atualizar */}
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="w-full gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? "Verificando..." : "Verificar novamente"}
          </Button>

          {/* Informações adicionais */}
          <div className="text-xs text-slate-500 space-y-1">
            <p>• A página será atualizada automaticamente quando a sessão começar</p>
            <p>• Administradores e diretores podem entrar a qualquer momento</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionBlockedScreen;
