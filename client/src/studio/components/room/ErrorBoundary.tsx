import { Component, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { logger } from '@studio/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary específico para RecordingRoom
 * Captura erros e exibe UI de fallback
 */
export class RoomErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logger.error('RecordingRoom error caught', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen p-8">
          <Alert variant="destructive" className="max-w-lg">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Erro na Sala de Gravação</AlertTitle>
            <AlertDescription className="mt-2 space-y-4">
              <p>Ocorreu um erro inesperado:</p>
              <pre className="text-sm bg-black/20 p-3 rounded overflow-auto">
                {this.state.error?.message || 'Erro desconhecido'}
              </pre>
              <div className="flex gap-2">
                <Button onClick={this.handleReset} variant="outline">
                  Tentar Novamente
                </Button>
                <Button onClick={() => window.location.reload()} variant="default">
                  Recarregar Página
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}
