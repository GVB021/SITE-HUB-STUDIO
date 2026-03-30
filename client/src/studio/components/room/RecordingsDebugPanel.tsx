import { useState } from 'react';
import { Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecordingsDebugPanelProps {
  sessionId: string;
  params: any;
  response?: any;
  error?: any;
  isLoading: boolean;
}

/**
 * Painel de diagnóstico para debugging de carregamento de recordings
 * Só aparece em desenvolvimento
 */
export function RecordingsDebugPanel({
  sessionId,
  params,
  response,
  error,
  isLoading
}: RecordingsDebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Só mostrar em desenvolvimento
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-[9999] shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bug className="w-4 h-4" />
            Recordings Debug
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="space-y-3 text-xs">
          {/* Session ID */}
          <div>
            <div className="font-semibold text-muted-foreground">Session ID:</div>
            <div className="font-mono bg-muted p-2 rounded mt-1 break-all">
              {sessionId}
            </div>
          </div>

          {/* Params */}
          <div>
            <div className="font-semibold text-muted-foreground">Params:</div>
            <pre className="font-mono bg-muted p-2 rounded mt-1 overflow-auto max-h-32">
              {JSON.stringify(params, null, 2)}
            </pre>
          </div>

          {/* Status */}
          <div>
            <div className="font-semibold text-muted-foreground">Status:</div>
            <div className={`font-mono p-2 rounded mt-1 ${
              isLoading ? 'bg-blue-500/20 text-blue-400' :
              error ? 'bg-red-500/20 text-red-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {isLoading ? '⏳ Loading...' :
               error ? '❌ Error' :
               '✅ Success'}
            </div>
          </div>

          {/* Response */}
          {response && (
            <div>
              <div className="font-semibold text-muted-foreground">Response:</div>
              <pre className="font-mono bg-muted p-2 rounded mt-1 overflow-auto max-h-40">
                {JSON.stringify({
                  total: response.total,
                  page: response.page,
                  pageSize: response.pageSize,
                  itemsCount: response.items?.length || 0,
                }, null, 2)}
              </pre>
            </div>
          )}

          {/* Error */}
          {error && (
            <div>
              <div className="font-semibold text-red-400">Error:</div>
              <pre className="font-mono bg-red-500/10 p-2 rounded mt-1 overflow-auto max-h-40 text-red-300">
                {JSON.stringify({
                  message: error?.message || String(error),
                  stack: error?.stack,
                }, null, 2)}
              </pre>
            </div>
          )}

          {/* API URL */}
          <div>
            <div className="font-semibold text-muted-foreground">API URL:</div>
            <div className="font-mono bg-muted p-2 rounded mt-1 break-all text-[10px]">
              {`/api/sessions/${sessionId}/recordings?${new URLSearchParams({
                page: String(params.page),
                pageSize: String(params.pageSize),
                sortBy: params.sortBy,
                sortDir: params.sortDir,
                ...(params.search && { search: params.search }),
                ...(params.userId && { userId: params.userId }),
              }).toString()}`}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                console.log('📊 Recordings Debug Info:', {
                  sessionId,
                  params,
                  response,
                  error,
                  isLoading
                });
              }}
            >
              Log to Console
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify({
                  sessionId,
                  params,
                  response,
                  error
                }, null, 2));
              }}
            >
              Copy JSON
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
