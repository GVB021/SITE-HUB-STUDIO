import { Monitor } from "lucide-react";
import { Button } from "@studio/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface DirectorEntryModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  studioId: string;
}

export function DirectorEntryModal({ isOpen, onConfirm, studioId: _studioId }: DirectorEntryModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px] room-bg-elevated border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" />
            Assumir Controle de Direção
          </DialogTitle>
          <DialogDescription className="room-text-muted mt-2">
            Você está entrando como Diretor. Isso lhe dará controle total sobre:
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2 text-sm room-text-secondary">
              <li>Controle de Playback e Gravação</li>
              <li>Aprovação e Rejeição de Takes</li>
              <li>Gerenciamento de Usuários e Permissões</li>
              <li>Edição de Texto do Script</li>
            </ul>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            onClick={onConfirm}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11"
          >
            Assumir Controle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
