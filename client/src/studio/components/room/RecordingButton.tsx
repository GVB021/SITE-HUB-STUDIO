import { memo } from 'react';
import { Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@studio/lib/utils';
import type { RecordingState } from '@studio/lib/recordingStateMachine';

interface RecordingButtonProps {
  recordingStatus: RecordingState;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Botão de gravação com estados visuais distintos
 * Memoizado para evitar re-renders desnecessários
 */
export const RecordingButton = memo(function RecordingButton({
  recordingStatus,
  onStart,
  onStop,
  disabled = false,
  className,
}: RecordingButtonProps) {
  const isRecording = recordingStatus === 'recording';
  const isCountdown = recordingStatus === 'countdown';
  const isStopping = recordingStatus === 'stopping';
  const isActive = isRecording || isCountdown || isStopping;

  const handleClick = () => {
    if (isActive) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isStopping}
      variant={isActive ? 'destructive' : 'default'}
      size="lg"
      className={cn(
        'relative min-w-[120px] transition-all duration-200',
        isRecording && 'animate-pulse',
        className
      )}
    >
      {isActive ? (
        <>
          <Square className="mr-2 h-5 w-5" />
          {isStopping ? 'Parando...' : 'PARAR'}
        </>
      ) : (
        <>
          <Mic className="mr-2 h-5 w-5" />
          REC
        </>
      )}

      {/* Indicador de gravação pulsante */}
      {isRecording && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
      )}
    </Button>
  );
});
