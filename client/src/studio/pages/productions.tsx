import { useState, useEffect, memo } from "react";
import {
  useProductions, useCreateProduction, useUpdateProduction
} from "@studio/hooks/use-productions";
import { useCharacters, useCreateCharacter } from "@studio/hooks/use-characters";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@studio/lib/auth-fetch";
import { Button } from "@studio/components/ui/button";
import { Input } from "@studio/components/ui/input";
import { Textarea } from "@studio/components/ui/textarea";
import {
  Plus, Film, Search, MoreVertical, Upload, UserPlus,
  Settings2, FileJson, Download, Loader2, Trash2, Save,
  Clock, MessageSquare, FileText, ClipboardPaste
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@studio/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@studio/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@studio/components/ui/select";
import { useToast } from "@studio/hooks/use-toast";
import {
  PageSection, PageHeader, EmptyState, StatusBadge, FieldGroup, GridSkeleton
} from "@studio/components/ui/design-system";
import { useStudioRole } from "@studio/hooks/use-studio-role";
import { pt } from "@studio/lib/i18n";
import { parseUniversalTimecodeToSeconds } from "@studio/lib/timecode";

interface ScriptLine {
  character: string;
  start: string;
  tempo?: string;
  tempoEmSegundos?: number;
  text: string;
  notes?: string;
}

const Productions = memo(function Productions({ studioId }: { studioId: string }) {
  const { data: productions, isLoading } = useProductions(studioId);
  const createProd = useCreateProduction(studioId);
  const { toast } = useToast();
  const { canCreateProductions } = useStudioRole(studioId);

  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsOpen] = useState(false);
  const [selectedProdId, setSelectedProdId] = useState<string | null>(null);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", videoUrl: "" });

  const filtered = productions?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!formData.name) return;
    await createProd.mutateAsync({ ...formData, status: "planned", scriptJson: undefined });
    setIsOpen(false);
    setFormData({ name: "", description: "", videoUrl: "" });
    toast({ title: "Producao criada" });
  };

  return (
    <PageSection>
      <PageHeader
        title={pt.productions.title}
        subtitle="Gerencie seus projetos de dublagem"
        action={canCreateProductions ? (
          <Dialog open={isCreateOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 press-effect">
                <Plus className="w-3.5 h-3.5" />
                {pt.productions.newProduction}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Producao</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <FieldGroup label={pt.productions.name}>
                  <Input
                    placeholder="ex: Episodio 1 — Dragao"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    data-testid="input-production-name"
                  />
                </FieldGroup>
                <FieldGroup label={pt.productions.description}>
                  <Textarea
                    placeholder="Detalhes da producao..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="resize-none"
                    rows={3}
                    data-testid="input-production-description"
                  />
                </FieldGroup>
                <FieldGroup label={pt.productions.videoUrl}>
                  <Input
                    placeholder="https://..."
                    value={formData.videoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                    data-testid="input-production-url"
                  />
                </FieldGroup>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreate}
                  disabled={!formData.name || createProd.isPending}
                  className="press-effect"
                  data-testid="button-create-production"
                >
                  {createProd.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {createProd.isPending ? pt.productions.creating : pt.productions.create}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : undefined}
      />

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-10 h-10"
          placeholder={pt.productions.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="input-search-productions"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <GridSkeleton count={6} />
        ) : filtered?.map(prod => (
          <div
            key={prod.id}
            className="vhub-card-clickable p-5 group"
            data-testid={`card-production-${prod.id}`}
            role="button"
            tabIndex={0}
            onClick={() => { setSelectedProdId(prod.id); setIsManageOpen(true); }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedProdId(prod.id); setIsManageOpen(true); } }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
                <Film className="w-4 h-4 text-primary" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity relative z-10"
                    data-testid={`button-menu-production-${prod.id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canCreateProductions && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedProdId(prod.id); setIsManageOpen(true); }}>
                      <Settings2 className="w-4 h-4 mr-2" /> Gerenciar
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      const res = await authFetch(`/api/productions/${prod.id}/export`);
                      if (!res.ok) throw new Error("Falha na exportacao");
                      const blob = await res.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${prod.name.replace(/\s+/g, "_")}_exportacao.zip`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                    } catch {
                      toast({ title: "Falha na exportacao", variant: "destructive" });
                    }
                  }}>
                    <Download className="w-4 h-4 mr-2" /> {pt.productions.export}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h3 className="font-semibold text-foreground text-base mb-1 truncate">{prod.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
              {prod.description || "Sem descricao."}
            </p>

            <div className="mt-4">
              <StatusBadge status={prod.status} />
            </div>
          </div>
        ))}

        {!isLoading && filtered?.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              icon={<Film className="w-5 h-5" />}
              title={search ? "Nenhum resultado encontrado" : pt.productions.noProductions}
              description={search ? "Tente um termo de busca diferente." : pt.productions.noProductionsDesc}
            />
          </div>
        )}
      </div>

      {selectedProdId && (
        <ManageProductionDialog
          studioId={studioId}
          productionId={selectedProdId}
          open={isManageOpen}
          onOpenChange={setIsManageOpen}
        />
      )}
    </PageSection>
  );
});

export default Productions;

function ManageProductionDialog({ productionId, studioId, open, onOpenChange }: {
  productionId: string;
  studioId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: allProductions } = useProductions(studioId);
  const production = allProductions?.find(p => p.id === productionId);
  const updateProd = useUpdateProduction(studioId, productionId);
  const { data: characters } = useCharacters(productionId);
  const createChar = useCreateCharacter(productionId);
  const { toast } = useToast();

  const [newCharName, setNewCharName] = useState("");
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [detailsDirty, setDetailsDirty] = useState(false);

  const [scriptLines, setScriptLines] = useState<ScriptLine[]>([]);
  const [scriptDirty, setScriptDirty] = useState(false);
  const [editingLineIdx, setEditingLineIdx] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "script" | "characters">("details");
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonPasteText, setJsonPasteText] = useState("");
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  useEffect(() => {
    if (!production) return;
    setEditName(production.name || "");
    setEditDesc(production.description || "");
    setEditVideoUrl(production.videoUrl || "");
    setDetailsDirty(false);

    if (production.scriptJson) {
      try {
        const parsed = JSON.parse(production.scriptJson);
        let rawLines: any[];
        if (Array.isArray(parsed)) {
          rawLines = parsed;
        } else if (parsed.lines && Array.isArray(parsed.lines)) {
          rawLines = parsed.lines;
        } else {
          rawLines = [];
        }
        const normalized = rawLines.map((line: any) => ({
          character: line.character || line.personagem || line.char || "",
          start: line.start || line.tempo || line.timecode || line.tc || "00:00:00",
          text: line.text || line.fala || line.dialogue || line.dialog || "",
          notes: line.notes || line.notas || "",
        }));
        setScriptLines(normalized);
      } catch {
        setScriptLines([]);
      }
    } else {
      setScriptLines([]);
    }
    setScriptDirty(false);
  }, [production]);

  const handleSaveDetails = async () => {
    if (!editName.trim()) {
      toast({ title: "Nome da producao e obrigatorio", variant: "destructive" });
      return;
    }
    await updateProd.mutateAsync({
      name: editName.trim(),
      description: editDesc,
      videoUrl: editVideoUrl,
    });
    setDetailsDirty(false);
    toast({ title: "Producao atualizada" });
  };

  const toTimecodeString = (val: any): string => {
    if (val === undefined || val === null) return "00:00:00";
    if (typeof val === "number") {
      const h = Math.floor(val / 3600);
      const m = Math.floor((val % 3600) / 60);
      const s = Math.floor(val % 60);
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return String(val) || "00:00:00";
  };

  const toTempoEmSegundos = (val: any): number => {
    return parseUniversalTimecodeToSeconds(val ?? "00:00:00:00", 23.976);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setIsPdfLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await authFetch(`/api/productions/${productionId}/parse-pdf`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || `Erro ${res.status}`);
      }
      const result = await res.json();
      const lines: ScriptLine[] = (result.lines || []).map((l: any) => ({
        character: String(l.character || ""),
        start: String(l.start || "00:00:00"),
        tempo: String(l.start || "00:00:00"),
        tempoEmSegundos: toTempoEmSegundos(l.start || "00:00:00"),
        text: String(l.text || ""),
        notes: String(l.notes || ""),
      }));
      if (lines.length === 0) throw new Error("Nenhuma linha detectada no PDF.");
      
      setScriptLines(lines);
      setScriptDirty(true);
      toast({ title: `${lines.length} linha${lines.length !== 1 ? "s" : ""} importadas do PDF (${result.pageCount} página${result.pageCount !== 1 ? "s" : ""})` });
    } catch (err: any) {
      toast({ title: "Erro ao processar PDF", description: err?.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleScriptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        let rawLines: any[];
        if (Array.isArray(json)) {
          rawLines = json;
        } else if (json.lines && Array.isArray(json.lines)) {
          rawLines = json.lines;
        } else if (json.script && Array.isArray(json.script)) {
          rawLines = json.script;
        } else {
          toast({ title: "Formato nao reconhecido", description: "O JSON deve conter um array ou um objeto com chave 'lines'.", variant: "destructive" });
          return;
        }
        const normalized: ScriptLine[] = [];
        for (let i = 0; i < rawLines.length; i += 1) {
          const line = rawLines[i];
          const tempoOriginal = line?.tempo ?? line?.start ?? line?.timecode ?? line?.tc ?? line?.in ?? null;
          let tempoEmSegundos: number;
          try {
            tempoEmSegundos = toTempoEmSegundos(tempoOriginal);
          } catch (err: any) {
            toast({
              title: "Tempo inválido no JSON",
              description: `Linha ${i + 1}: ${String(tempoOriginal ?? "")} (${String(err?.message || "erro")})`,
              variant: "destructive",
            });
            return;
          }

          normalized.push({
            character: String(line?.character || line?.personagem || line?.char || line?.name || ""),
            start: toTimecodeString(tempoOriginal),
            tempo: String(tempoOriginal ?? "00:00:00"),
            tempoEmSegundos,
            text: String(line?.text || line?.fala || line?.dialogue || line?.dialog || line?.line || ""),
            notes: String(line?.notes || line?.notas || line?.note || ""),
          });
        }
        
        setScriptLines(normalized);
        setScriptDirty(true);
        toast({ title: `${normalized.length} linha${normalized.length !== 1 ? "s" : ""} carregada${normalized.length !== 1 ? "s" : ""} do arquivo` });
      } catch {
        toast({ title: "Formato JSON invalido", description: "Verifique se o arquivo e um JSON valido.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const safeToTempoEmSegundos = (val: any): number => {
    try { return toTempoEmSegundos(val); } catch { return 0; }
  };

  const parseRawLines = (rawLines: any[]): ScriptLine[] =>
    rawLines.map((line: any) => {
      const tempoRaw = line?.tempo ?? line?.start ?? line?.timecode ?? line?.tc ?? line?.in ?? null;
      const startStr = tempoRaw != null ? String(tempoRaw) : "00:00:00:00";
      return {
        character: String(line?.character || line?.personagem || line?.char || line?.name || ""),
        start: startStr,
        tempo: startStr,
        tempoEmSegundos: safeToTempoEmSegundos(tempoRaw),
        text: String(line?.text || line?.fala || line?.dialogue || line?.dialog || line?.line || ""),
        notes: String(line?.notes || line?.notas || line?.note || ""),
      };
    });

  // Function to extract unique character names from script lines
  const extractCharactersFromScript = (lines: ScriptLine[]): string[] => {
    const characterNames = new Set<string>();
    
    lines.forEach(line => {
      const charName = line.character?.trim();
      if (charName && charName.length > 0 && charName !== "") {
        // Clean up character name (remove extra spaces, normalize case)
        const cleanName = charName.replace(/\s+/g, ' ').trim();
        if (cleanName && cleanName !== "") {
          characterNames.add(cleanName);
        }
      }
    });
    
    return Array.from(characterNames).sort();
  };

  // Function to automatically add missing characters to production
  const syncCharactersToProduction = async (characterNames: string[]) => {
    if (!characterNames || characterNames.length === 0) return;
    
    // Get existing character names
    const existingCharNames = new Set(
      characters?.map((char: { name: string }) => char.name.toLowerCase()) || []
    );
    
    // Find characters that don't exist yet
    const missingCharacters = characterNames.filter(
      name => !existingCharNames.has(name.toLowerCase())
    );
    
    if (missingCharacters.length === 0) return;
    
    // Add missing characters to production
    try {
      const promises = missingCharacters.map(charName => 
        createChar.mutateAsync({ name: charName.trim(), voiceActorId: null })
      );
      
      await Promise.all(promises);
      
      toast({ 
        title: "Personagens adicionados automaticamente", 
        description: `${missingCharacters.length} novo${missingCharacters.length !== 1 ? "s" : ""} personagem${missingCharacters.length !== 1 ? "s" : ""} adicionado${missingCharacters.length !== 1 ? "s" : ""}` 
      });
    } catch (err: any) {
      toast({ 
        title: "Erro ao adicionar personagens", 
        description: err?.message || "Tente adicionar manualmente.", 
        variant: "destructive" 
      });
    }
  };

  const handleJsonPaste = async () => {
    const raw = jsonPasteText.trim();
    if (!raw) return;
    let json: any;
    try {
      json = JSON.parse(raw);
    } catch {
      toast({ title: "JSON inválido", description: "Verifique a sintaxe e tente novamente.", variant: "destructive" });
      return;
    }
    let rawLines: any[];
    if (Array.isArray(json)) {
      rawLines = json;
    } else if (json?.lines && Array.isArray(json.lines)) {
      rawLines = json.lines;
    } else if (json?.script && Array.isArray(json.script)) {
      rawLines = json.script;
    } else {
      toast({ title: "Formato não reconhecido", description: "Cole um array JSON ou objeto com chave 'lines'.", variant: "destructive" });
      return;
    }
    const normalized = parseRawLines(rawLines);
    
    setScriptLines(normalized);
    setScriptDirty(true);
    setShowJsonModal(false);
    setJsonPasteText("");
    toast({ title: `${normalized.length} linha${normalized.length !== 1 ? "s" : ""} importadas com sucesso` });
  };

  const handleSaveScript = async () => {
    try {
      // Extract and sync characters before saving
      const extractedCharacters = extractCharactersFromScript(scriptLines);
      await syncCharactersToProduction(extractedCharacters);
      
      const json = JSON.stringify({ lines: scriptLines });
      await updateProd.mutateAsync({ scriptJson: json });
      setScriptDirty(false);
      toast({ title: `Roteiro salvo (${scriptLines.length} linha${scriptLines.length !== 1 ? "s" : ""})` });
    } catch (err: any) {
      toast({ title: "Erro ao salvar roteiro", description: err?.message || "Tente novamente.", variant: "destructive" });
    }
  };

  const addScriptLine = () => {
    const newLine: ScriptLine = { character: "", start: "00:00:00", text: "", notes: "" };
    setScriptLines(prev => [...prev, newLine]);
    setEditingLineIdx(scriptLines.length);
    setScriptDirty(true);
  };

  const updateScriptLine = async (idx: number, field: keyof ScriptLine, value: string) => {
    setScriptLines(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
    setScriptDirty(true);
    
  };

  const removeScriptLine = (idx: number) => {
    setScriptLines(prev => prev.filter((_, i) => i !== idx));
    setScriptDirty(true);
    if (editingLineIdx === idx) setEditingLineIdx(null);
  };

  const handleAddChar = async () => {
    if (!newCharName.trim()) return;
    await createChar.mutateAsync({ name: newCharName.trim(), voiceActorId: null });
    setNewCharName("");
    toast({ title: "Personagem adicionado" });
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Film className="w-4 h-4 text-primary" />
            {production?.name || "Producao"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-1 border-b border-border/60 -mx-6 px-6">
          {(["details", "script", "characters"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`tab-${tab}`}
            >
              {tab === "details" ? "Detalhes" : tab === "script" ? "Roteiro" : "Personagens"}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
              {tab === "script" && scriptDirty && (
                <span className="ml-1.5 w-2 h-2 bg-blue-500 rounded-full inline-block" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto py-4 -mx-6 px-6 min-h-0">
          {activeTab === "details" && (
            <div className="space-y-4">
              <FieldGroup label="Nome da Producao">
                <Input
                  value={editName}
                  onChange={(e) => { setEditName(e.target.value); setDetailsDirty(true); }}
                  data-testid="input-edit-production-name"
                />
              </FieldGroup>
              <FieldGroup label="Descricao">
                <Textarea
                  value={editDesc}
                  onChange={(e) => { setEditDesc(e.target.value); setDetailsDirty(true); }}
                  className="resize-none"
                  rows={3}
                  data-testid="input-edit-production-description"
                />
              </FieldGroup>
              <FieldGroup label="URL do Video">
                <Input
                  value={editVideoUrl}
                  onChange={(e) => { setEditVideoUrl(e.target.value); setDetailsDirty(true); }}
                  placeholder="https://..."
                  data-testid="input-edit-production-url"
                />
              </FieldGroup>
              <FieldGroup label="Status">
                <Select
                  value={production?.status || "planned"}
                  onValueChange={async (val) => {
                    await updateProd.mutateAsync({ status: val });
                    toast({ title: "Status atualizado" });
                  }}
                >
                  <SelectTrigger data-testid="select-production-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planejado</SelectItem>
                    <SelectItem value="in_progress">Em Progresso</SelectItem>
                    <SelectItem value="completed">Concluido</SelectItem>
                  </SelectContent>
                </Select>
              </FieldGroup>
              {detailsDirty && (
                <Button
                  onClick={handleSaveDetails}
                  disabled={updateProd.isPending}
                  className="gap-1.5"
                  data-testid="button-save-production-details"
                >
                  {updateProd.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar Alteracoes
                </Button>
              )}
            </div>
          )}

          {activeTab === "script" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {scriptLines.length} linha{scriptLines.length !== 1 ? "s" : ""}
                  </span>
                  {scriptDirty && (
                    <span className="text-xs text-blue-400 bg-blue-500/12 px-2 py-0.5 rounded-full border border-blue-500/25">
                      Nao salvo
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="relative gap-1.5" disabled={isPdfLoading} data-testid="button-upload-pdf">
                    {isPdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                    {isPdfLoading ? "Processando..." : "Importar PDF"}
                    <input
                      type="file"
                      accept=".pdf"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handlePdfUpload}
                      disabled={isPdfLoading}
                    />
                  </Button>
                  <Button variant="outline" size="sm" className="relative gap-1.5" data-testid="button-upload-script">
                    <Upload className="w-3.5 h-3.5" /> Importar JSON
                    <input
                      type="file"
                      accept=".json"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleScriptUpload}
                    />
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setShowJsonModal(v => !v); setJsonPasteText(""); }} data-testid="button-paste-json">
                    <ClipboardPaste className="w-3.5 h-3.5" /> {showJsonModal ? "Cancelar" : "Colar JSON"}
                  </Button>
                  <Button size="sm" onClick={addScriptLine} className="gap-1.5" data-testid="button-add-script-line">
                    <Plus className="w-3.5 h-3.5" /> Adicionar Linha
                  </Button>
                </div>
              </div>

              {showJsonModal && (
                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Cole um array JSON com os campos <span className="text-primary font-semibold">personagem</span>, <span className="text-primary font-semibold">fala</span> e <span className="text-muted-foreground font-semibold">tempo</span> (opcional).
                  </p>
                  <textarea
                    value={jsonPasteText}
                    onChange={(e) => setJsonPasteText(e.target.value)}
                    placeholder={`[\n  { "personagem": "NOME", "tempo": "00:00:00", "fala": "Texto da fala" }\n]`}
                    className="w-full min-h-[160px] rounded-md border border-border bg-background text-xs font-mono text-foreground p-3 resize-y outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/50"
                    data-testid="textarea-json-paste"
                    spellCheck={false}
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => { setShowJsonModal(false); setJsonPasteText(""); }} data-testid="button-cancel-json">Cancelar</Button>
                    <Button size="sm" onClick={handleJsonPaste} disabled={!jsonPasteText.trim()} className="gap-1.5" data-testid="button-confirm-json">
                      <Upload className="w-3.5 h-3.5" /> Confirmar Importação
                    </Button>
                  </div>
                </div>
              )}

              {scriptLines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <FileJson className="w-8 h-8 mb-3 opacity-40" />
                  <p className="text-sm font-medium">Nenhuma linha no roteiro</p>
                  <p className="text-xs mt-1">Adicione linhas manualmente ou importe um arquivo JSON</p>
                </div>
              ) : (
                <div className="border border-white/10 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-[80px_120px_1fr_1fr_40px] gap-0 bg-white/3 border-b border-white/8 px-3 py-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> TC
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Personagem</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Dialogo</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> Notas
                    </span>
                    <span />
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {scriptLines.map((line, idx) => (
                      <div
                        key={idx}
                        className={`grid grid-cols-[80px_120px_1fr_1fr_40px] gap-0 px-3 py-1.5 border-b border-border/30 items-center hover:bg-muted/30 transition-colors ${
                          editingLineIdx === idx ? "bg-primary/10 ring-1 ring-primary/25 ring-inset" : ""
                        }`}
                        data-testid={`script-row-${idx}`}
                      >
                        <input
                          type="text"
                          value={line.start}
                          onChange={(e) => updateScriptLine(idx, "start", e.target.value)}
                          onFocus={() => setEditingLineIdx(idx)}
                          className="w-full bg-transparent text-xs font-mono text-foreground outline-none px-1 py-1 rounded hover:bg-white/5 focus:bg-white/8 focus:ring-1 focus:ring-primary/30"
                          placeholder="00:00:00"
                          data-testid={`input-tc-${idx}`}
                        />
                        <input
                          type="text"
                          value={line.character}
                          onChange={(e) => updateScriptLine(idx, "character", e.target.value)}
                          onFocus={() => setEditingLineIdx(idx)}
                          className="w-full bg-transparent text-xs font-semibold text-foreground outline-none px-1 py-1 rounded hover:bg-white/5 focus:bg-white/8 focus:ring-1 focus:ring-primary/30 uppercase"
                          placeholder="Personagem"
                          data-testid={`input-char-${idx}`}
                        />
                        <input
                          type="text"
                          value={line.text}
                          onChange={(e) => updateScriptLine(idx, "text", e.target.value)}
                          onFocus={() => setEditingLineIdx(idx)}
                          className="w-full bg-transparent text-xs text-foreground outline-none px-1 py-1 rounded hover:bg-white/5 focus:bg-white/8 focus:ring-1 focus:ring-primary/30"
                          placeholder="Texto do dialogo..."
                          data-testid={`input-text-${idx}`}
                        />
                        <input
                          type="text"
                          value={line.notes || ""}
                          onChange={(e) => updateScriptLine(idx, "notes", e.target.value)}
                          onFocus={() => setEditingLineIdx(idx)}
                          className="w-full bg-transparent text-xs text-muted-foreground outline-none px-1 py-1 rounded hover:bg-white/5 focus:bg-white/8 focus:ring-1 focus:ring-primary/30 italic"
                          placeholder="Notas..."
                          data-testid={`input-notes-${idx}`}
                        />
                        <button
                          onClick={() => removeScriptLine(idx)}
                          className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/12 transition-colors"
                          data-testid={`button-remove-line-${idx}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {scriptDirty && (
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    onClick={handleSaveScript}
                    disabled={updateProd.isPending}
                    className="gap-1.5"
                    data-testid="button-save-script"
                  >
                    {updateProd.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar Roteiro
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {scriptLines.length} linha{scriptLines.length !== 1 ? "s" : ""} no roteiro
                  </span>
                </div>
              )}
            </div>
          )}


          {activeTab === "characters" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nome do personagem..."
                  value={newCharName}
                  onChange={(e) => setNewCharName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddChar()}
                  data-testid="input-character-name"
                />
                <Button onClick={handleAddChar} disabled={createChar.isPending} className="press-effect shrink-0 gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  {pt.productions.addCharacter}
                </Button>
              </div>

              <div className="vhub-card divide-y divide-border/40 overflow-hidden">
                {characters?.map((char: { id: string; name: string; voiceActorId: string | null }) => (
                  <div key={char.id} className="flex items-center justify-between p-3 gap-4" data-testid={`character-row-${char.id}`}>
                    <span className="text-sm font-medium text-foreground truncate">{char.name}</span>
                  </div>
                ))}
                {(!characters || characters.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <UserPlus className="w-6 h-6 mb-2 opacity-40" />
                    <p className="text-sm">Nenhum personagem adicionado</p>
                    <p className="text-xs mt-1">Adicione personagens para esta producao</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

    </>
  );
}
