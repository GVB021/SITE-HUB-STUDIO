import * as React from 'react';
import { PhoneCall } from 'lucide-react';

// Import direto para evitar problemas de alias
const DailyMeetPanel = React.lazy(() => import('./DailyMeetPanel').then(module => ({ default: module.DailyMeetPanel })));

interface SafeDailyMeetPanelProps {
  sessionId: string;
  mode?: "floating" | "embedded";
  open?: boolean;
  onOpenChange?: (next: boolean) => void;
  onStatusChange?: (status: "conectando" | "conectado" | "desconectado") => void;
}

export function SafeDailyMeetPanel({ 
  sessionId, 
  mode = "embedded", 
  open, 
  onOpenChange, 
  onStatusChange 
}: SafeDailyMeetPanelProps) {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setHasError(false);
    setError(null);
  }, [sessionId]);

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center p-4">
          <PhoneCall className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium text-gray-700 mb-1">Chamada Indisponível</p>
          <p className="text-xs text-gray-500 mb-3">{error || 'Erro na conexão'}</p>
          <button 
            onClick={() => {
              setHasError(false);
              setError(null);
            }}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  try {
    return (
      <React.Suspense fallback={
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <PhoneCall className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Carregando chamada...</p>
          </div>
        </div>
      }>
        <DailyMeetPanel
          sessionId={sessionId}
          mode={mode}
          open={open}
          onOpenChange={onOpenChange}
          onStatusChange={(status) => {
            try {
              onStatusChange?.(status);
            } catch (err) {
              console.error("Error in onStatusChange:", err);
            }
          }}
        />
      </React.Suspense>
    );
  } catch (err) {
    console.error("SafeDailyMeetPanel caught error:", err);
    setHasError(true);
    setError(err instanceof Error ? err.message : 'Erro desconhecido');
    onStatusChange?.("desconectado");
    
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center p-4">
          <PhoneCall className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium text-gray-700 mb-1">Chamada Indisponível</p>
          <p className="text-xs text-gray-500">Erro ao inicializar</p>
        </div>
      </div>
    );
  }
}
