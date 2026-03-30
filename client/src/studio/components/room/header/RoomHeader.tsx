import { type ReactNode, useState } from "react";
import { ArrowLeft, User, ChevronRight, ArrowUpDown, UserCheck, Pencil, Video, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@studio/lib/utils";

interface RoomHeaderProps {
  isMobile: boolean;
  studioId?: string;
  productionName?: string;
  sessionTitle?: string;
  sideScriptWidth?: number;
  recordingProfile?: any;
  charSelectorOpen: boolean;
  setCharSelectorOpen: (open: boolean) => void;
  charactersList: any[];
  handleCharacterChange: (char: any) => void;
  onActorNameChange?: (name: string) => void;
  onBack: () => void;
  scriptAutoFollow?: boolean;
  onToggleAutoFollow?: () => void;
  onlySelectedCharacter?: boolean;
  onToggleCharacterFilter?: () => void;
  rightSlot?: ReactNode;
  dailyStatus?: "conectando" | "conectado" | "desconectado";
  onDailyToggle?: () => void;
  onMobileMenuOpen?: () => void;
}

export function RoomHeader({
  isMobile,
  productionName = "Sessão",
  sessionTitle = "",
  sideScriptWidth = 320,
  recordingProfile,
  charSelectorOpen,
  setCharSelectorOpen,
  charactersList,
  handleCharacterChange,
  onActorNameChange,
  onBack,
  scriptAutoFollow = false,
  onToggleAutoFollow,
  onlySelectedCharacter = false,
  onToggleCharacterFilter,
  rightSlot,
  dailyStatus = "desconectado",
  onDailyToggle,
  onMobileMenuOpen,
}: RoomHeaderProps) {
  const [actorInput, setActorInput] = useState(recordingProfile?.actorName || "");
  const [actorPopoverOpen, setActorPopoverOpen] = useState(false);

  const handleActorNameBlur = () => {
    onActorNameChange?.(actorInput.trim());
  };

  const dailyDot = dailyStatus === "conectado"
    ? "bg-emerald-500"
    : dailyStatus === "conectando"
    ? "bg-amber-400 animate-pulse"
    : "bg-red-500";

  if (isMobile) {
    return (
      <header className="shrink-0 flex items-center justify-between px-3 h-14 relative z-20 bg-background/70 backdrop-blur-xl border-b border-border/60 shadow-sm" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        {/* Left: back + title */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/40 border border-border/60 text-muted-foreground active:bg-muted/70 transition-colors shrink-0"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-bold text-xs truncate text-foreground leading-tight">{productionName}</span>
            {recordingProfile?.actorName && (
              <span className="text-[10px] text-primary/70 truncate leading-tight">{recordingProfile.actorName}</span>
            )}
          </div>
        </div>

        {/* Right: actor pencil, Daily icon, hamburger */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Actor name popover */}
          <div className="relative">
            <button
              onClick={() => setActorPopoverOpen(v => !v)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/40 border border-border/60 text-muted-foreground active:bg-muted/70 transition-colors"
              aria-label="Nome artístico"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {actorPopoverOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 w-56 rounded-xl bg-popover/98 backdrop-blur-xl border border-border shadow-2xl p-3 z-[1200]"
                >
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Nome Artístico</p>
                  <input
                    type="text"
                    value={actorInput}
                    autoFocus
                    onChange={(e) => setActorInput(e.target.value)}
                    onBlur={() => { handleActorNameBlur(); setActorPopoverOpen(false); }}
                    onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                    placeholder="Seu nome artístico"
                    className="w-full h-10 rounded-lg px-3 text-sm bg-muted/50 border border-border text-foreground focus:border-primary outline-none transition-all"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Daily.co icon */}
          {onDailyToggle && (
            <button
              onClick={onDailyToggle}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/40 border border-border/60 text-muted-foreground active:bg-muted/70 transition-colors relative"
              aria-label="Vídeo & Voz"
            >
              <Video className="w-4 h-4" />
              <span className={cn("absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-background", dailyDot)} />
            </button>
          )}

          {/* Hamburger */}
          {onMobileMenuOpen && (
            <button
              onClick={onMobileMenuOpen}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/40 border border-border/60 text-muted-foreground active:bg-muted/70 transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "shrink-0 flex items-center px-4 h-16 relative z-20 transition-[grid-template-columns] duration-75",
        "bg-background/70 backdrop-blur-xl border-b border-border/60 shadow-sm grid"
      )}
      style={{
        gridTemplateColumns: "1fr auto",
      }}
    >
      {/* Left: back, title, character selector, script toggles */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted/40 border border-border/60 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Voltar ao painel"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <span className="font-bold text-xs sm:text-sm truncate text-foreground">{productionName}</span>
          <span className="text-[10px] text-muted-foreground truncate">{sessionTitle}</span>
        </div>

        {/* Actor name input */}
        <div className="relative ml-2 flex items-center h-7 rounded-md bg-muted/40 border border-border/60 px-2 gap-1.5 focus-within:border-primary/60 transition-colors">
          <Pencil className="w-3 h-3 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={actorInput}
            onChange={(e) => setActorInput(e.target.value)}
            onBlur={handleActorNameBlur}
            onKeyDown={(e) => { if (e.key === "Enter") { e.currentTarget.blur(); } }}
            placeholder="Seu nome artístico"
            className="w-28 bg-transparent text-[11px] text-foreground placeholder:text-muted-foreground/60 outline-none"
            data-testid="input-header-actor-name"
          />
        </div>

        {/* Character selector */}
        <div className="relative ml-1">
          <button
            onClick={() => setCharSelectorOpen(!charSelectorOpen)}
            className="h-7 px-2 rounded-md bg-muted/40 border border-border/60 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/60 flex items-center gap-1.5"
            data-testid="button-character-selector"
          >
            <User className="w-3.5 h-3.5" />
            {recordingProfile?.actorName && (
              <span className="max-w-[100px] truncate text-primary/80 font-medium">{recordingProfile.actorName}</span>
            )}
            {recordingProfile?.actorName && <ChevronRight className="w-2.5 h-2.5 text-muted-foreground/60" />}
            <span className="max-w-[140px] truncate">{recordingProfile?.characterName || "Personagem"}</span>
            <ChevronRight className={cn("w-3 h-3 transition-transform", charSelectorOpen && "rotate-90")} />
          </button>
          <AnimatePresence>
            {charSelectorOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute top-full left-0 mt-2 w-64 rounded-xl bg-popover/95 backdrop-blur-xl border border-border shadow-2xl p-2"
                style={{ zIndex: 1150 }}
              >
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1.5 border-b border-border/60 mb-1">
                  Selecionar personagem
                </div>
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  {(charactersList || []).map((char) => (
                    <button
                      key={char.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCharacterChange(char);
                        setCharSelectorOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-2 py-2 rounded-md text-xs transition-colors",
                        recordingProfile?.characterId === char.id
                          ? "bg-primary/12 text-primary"
                          : "text-foreground hover:bg-muted/60"
                      )}
                    >
                      {char.name}
                    </button>
                  ))}
                  {(!charactersList || charactersList.length === 0) && (
                    <div className="px-2 py-3 text-xs text-muted-foreground">Nenhum personagem cadastrado.</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Script toggles */}
        {(onToggleAutoFollow || onToggleCharacterFilter) && (
          <div className="flex items-center gap-1 ml-2 border-l border-border/60 pl-2">
            {onToggleAutoFollow && (
              <button
                type="button"
                onClick={onToggleAutoFollow}
                title={scriptAutoFollow ? "Desativar Rolagem Automática" : "Ativar Rolagem Automática"}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all border",
                  scriptAutoFollow
                    ? "bg-primary/20 border-primary/30 text-primary"
                    : "bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            )}
            {onToggleCharacterFilter && (
              <button
                type="button"
                onClick={onToggleCharacterFilter}
                disabled={!recordingProfile}
                title={onlySelectedCharacter ? "Mostrar Todos os Personagens" : "Apenas Meu Personagem"}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all border",
                  onlySelectedCharacter
                    ? "bg-primary/20 border-primary/30 text-primary"
                    : "bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  !recordingProfile && "opacity-50 cursor-not-allowed"
                )}
              >
                <UserCheck className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right slot */}
      {rightSlot && (
        <div className={cn(
          "flex items-center gap-2",
          !isMobile && "justify-end px-4 border-l border-border/60"
        )}>
          {rightSlot}
        </div>
      )}
    </header>
  );
}
