import { type ReactNode } from "react";
import { ArrowLeft, User, ChevronRight, ArrowUpDown, UserCheck } from "lucide-react";
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
  onBack: () => void;
  scriptAutoFollow?: boolean;
  onToggleAutoFollow?: () => void;
  onlySelectedCharacter?: boolean;
  onToggleCharacterFilter?: () => void;
  rightSlot?: ReactNode;
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
  onBack,
  scriptAutoFollow = false,
  onToggleAutoFollow,
  onlySelectedCharacter = false,
  onToggleCharacterFilter,
  rightSlot,
}: RoomHeaderProps) {
  return (
    <header
      className={cn(
        "shrink-0 flex items-center px-4 h-16 relative z-20 transition-[grid-template-columns] duration-75",
        "bg-background/70 backdrop-blur-xl border-b border-border/60 shadow-sm",
        !isMobile ? "grid" : "justify-between"
      )}
      style={{
        gridTemplateColumns: !isMobile ? "1fr auto" : undefined,
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

        {/* Character selector */}
        <div className="relative ml-2">
          <button
            onClick={() => setCharSelectorOpen(!charSelectorOpen)}
            className="h-7 px-2 rounded-md bg-muted/40 border border-border/60 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/60 flex items-center gap-1.5"
            data-testid="button-character-selector"
          >
            <User className="w-3.5 h-3.5" />
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
