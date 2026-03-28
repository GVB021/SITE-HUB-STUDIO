/**
 * Barrel export para componentes do RecordingRoom
 */

export { RecordingButton } from './RecordingButton';
export { StatusBadge } from './StatusBadge';
export { RoomErrorBoundary } from './ErrorBoundary';

// Re-exports de componentes existentes
export { VideoPlayer } from './video/VideoPlayer';
export { RecordingsPanel } from './recordings/RecordingsPanel';
export { CountdownOverlay } from './overlays/CountdownOverlay';
export { DirectorConsole } from './overlays/DirectorConsole';
export { DirectorReview } from './modals/DirectorReview';
export { ShortcutsDialog } from './modals/ShortcutsDialog';
export { DiscardTakeModal } from './modals/DiscardTakeModal';
export { TextControlPopup } from './modals/TextControlPopup';
export { ScriptLineRow } from './script/ScriptLineRow';
