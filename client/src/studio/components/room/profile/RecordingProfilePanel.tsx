import { useState } from "react";
import { User, X, Loader2 } from "lucide-react";
import { authFetch } from "@studio/lib/auth-fetch";
import { type RecordingProfile } from "@studio/pages/room";

interface ProfileCharacter {
  id: string;
  name: string;
  voiceActorId: string | null;
}

interface RecordingProfilePanelProps {
  characters: ProfileCharacter[];
  user: any;
  sessionId: string;
  productionId: string;
  onSave: (profile: RecordingProfile) => void;
  onClose?: () => void;
  existingProfile?: RecordingProfile | null;
}

export function RecordingProfilePanel({
  characters,
  user,
  sessionId: _sessionId,
  productionId,
  onSave,
  onClose,
  existingProfile,
}: RecordingProfilePanelProps) {
  const [actorName, setActorName] = useState(
    existingProfile?.actorName || user?.fullName || user?.displayName || ""
  );
  const [selectedCharId, setSelectedCharId] = useState(existingProfile?.characterId || "");
  const [freeCharName, setFreeCharName] = useState(existingProfile?.characterName || "");
  const [isCreating, setIsCreating] = useState(false);

  const hasCharacters = characters.length > 0;

  const handleSubmit = async () => {
    setIsCreating(true);
    try {
      let charId = selectedCharId;
      let charName = "";

      if (hasCharacters) {
        const char = characters.find((c) => c.id === selectedCharId);
        charName = char?.name || "";
      } else {
        const resp = await authFetch(`/api/productions/${productionId}/characters`, {
          method: "POST",
          body: JSON.stringify({ name: freeCharName }),
        });
        charId = resp.id;
        charName = resp.name;
      }

      onSave({
        actorName,
        characterId: charId,
        characterName: charName,
        voiceActorId: user?.id || "",
        voiceActorName: actorName,
      });
    } catch (err) {
      console.error("Failed to setup profile:", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="rounded-2xl w-[calc(100vw-32px)] max-w-[420px] overflow-hidden glass-panel shadow-2xl border border-border/50">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Perfil de Gravação</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Quem você será hoje?</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
              data-testid="button-close-profile"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="space-y-4">
            <div>
              <label className="vhub-label mb-2 block">Seu Nome Artístico</label>
              <input
                type="text"
                value={actorName}
                onChange={(e) => setActorName(e.target.value)}
                placeholder="Ex: Gabriel Borba"
                className="w-full h-11 rounded-xl px-4 text-sm bg-muted/50 border border-border text-foreground focus:border-primary outline-none transition-all"
                data-testid="input-actor-name"
              />
            </div>

            {hasCharacters ? (
              <div>
                <label className="vhub-label mb-2 block">Selecione seu Personagem</label>
                <select
                  value={selectedCharId}
                  onChange={(e) => setSelectedCharId(e.target.value)}
                  className="w-full h-11 rounded-xl px-4 text-sm bg-muted/50 border border-border text-foreground focus:border-primary outline-none transition-all"
                  data-testid="select-character"
                >
                  <option value="">Escolha um personagem...</option>
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="vhub-label mb-2 block">Nome do Personagem</label>
                <input
                  type="text"
                  value={freeCharName}
                  onChange={(e) => setFreeCharName(e.target.value)}
                  placeholder="Ex: Batman"
                  className="w-full h-11 rounded-xl px-4 text-sm bg-muted/50 border border-border text-foreground focus:border-primary outline-none transition-all"
                  data-testid="input-free-character"
                />
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!actorName.trim() || (!selectedCharId && !freeCharName.trim()) || isCreating}
            className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
            data-testid="button-save-profile"
          >
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Começar a Gravar"}
          </button>
        </div>
      </div>
    </div>
  );
}
