import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { getStateLabel, getStateBadgeClasses, type RecordingState } from '@studio/lib/recordingStateMachine';

interface StatusBadgeProps {
  status: RecordingState;
  className?: string;
}

/**
 * Badge visual do status de gravação
 * Memoizado para evitar re-renders
 */
export const StatusBadge = memo(function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = getStateLabel(status);
  const badgeClasses = getStateBadgeClasses(status);

  return (
    <Badge className={`${badgeClasses} ${className || ''}`}>
      {label}
    </Badge>
  );
});
