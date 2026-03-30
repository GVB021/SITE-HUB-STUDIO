import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@studio/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, Settings, Check, AlertCircle } from "lucide-react";
import { useHardwareControl } from "@studio/hooks/use-hardware-control";

interface HardwareSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
}

export function HardwareSetupDialog({ open, onOpenChange, sessionId }: HardwareSetupDialogProps) {
  const {
    devices,
    config,
    isRequesting,
    hasPermission,
    audioLevel,
    isTesting,
    requestMicrophoneAccess,
    changeMicrophone,
    saveConfig,
    testMicrophone,
  } = useHardwareControl(sessionId);

  const [localConfig, setLocalConfig] = useState(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = () => {
    saveConfig(localConfig);
    onOpenChange(false);
  };

  const microphones = devices.filter(device => device.kind === 'audioinput');
  const speakers = devices.filter(device => device.kind === 'audiooutput');

  const getAudioLevelColor = (level: number) => {
    if (level < 30) return "bg-green-500";
    if (level < 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuração de Hardware
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status do Microfone */}
          <div className="p-4 room-rounded-xl room-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {hasPermission ? (
                  <Mic className="w-5 h-5 text-green-500" />
                ) : (
                  <MicOff className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">
                  Microfone: {hasPermission ? "Configurado" : "Não configurado"}
                </span>
              </div>
              <Badge variant={hasPermission ? "default" : "destructive"}>
                {hasPermission ? "Ativo" : "Inativo"}
              </Badge>
            </div>

            {!hasPermission && (
              <Button
                onClick={requestMicrophoneAccess}
                disabled={isRequesting}
                className="w-full"
              >
                {isRequesting ? "Solicitando..." : "Configurar Microfone"}
              </Button>
            )}

            {hasPermission && (
              <div className="space-y-3">
                {/* Nível de Áudio */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium room-text-primary">Nível de Áudio</span>
                    <span className="text-sm room-text-muted">{Math.round(audioLevel)}%</span>
                  </div>
                  <div className="w-full room-bg-subtle rounded-full h-2">
                    <div
                      className={`h-2 rounded-full room-transition ${getAudioLevelColor(audioLevel)}`}
                      style={{ width: `${audioLevel}%` }}
                    />
                  </div>
                </div>

                {/* Botão de Teste */}
                <Button
                  onClick={testMicrophone}
                  disabled={isTesting}
                  variant="outline"
                  className="w-full"
                >
                  {isTesting ? "Testando..." : "Testar Microfone"}
                </Button>
              </div>
            )}
          </div>

          {/* Seleção de Dispositivos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dispositivos</h3>

            {/* Microfone */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Microfone</label>
              <Select
                value={localConfig.selectedMicrophone || undefined}
                onValueChange={(value) => {
                  if (value && value !== "") {
                    setLocalConfig({ ...localConfig, selectedMicrophone: value });
                    if (hasPermission) {
                      changeMicrophone(value);
                    }
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um microfone" />
                </SelectTrigger>
                <SelectContent>
                  {microphones.map((mic) => (
                    <SelectItem key={mic.deviceId} value={mic.deviceId || `mic-${mic.deviceId || 'default'}`}>
                      {mic.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Alto-falante */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Alto-falante</label>
              <Select
                value={localConfig.selectedSpeaker || undefined}
                onValueChange={(value) => {
                  if (value && value !== "") {
                    setLocalConfig({ ...localConfig, selectedSpeaker: value });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um alto-falante" />
                </SelectTrigger>
                <SelectContent>
                  {speakers.map((speaker) => (
                    <SelectItem key={speaker.deviceId} value={speaker.deviceId || `speaker-${speaker.deviceId || 'default'}`}>
                      {speaker.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Configurações de Áudio */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configurações de Áudio</h3>

            {/* Volume do Microfone */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Volume do Microfone</label>
                <span className="text-sm text-muted-foreground">{localConfig.microphoneVolume}%</span>
              </div>
              <Slider
                value={[localConfig.microphoneVolume]}
                onValueChange={([value]) => setLocalConfig({ ...localConfig, microphoneVolume: value })}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* Ganho do Microfone */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Ganho do Microfone</label>
                <span className="text-sm text-muted-foreground">{localConfig.microphoneGain}%</span>
              </div>
              <Slider
                value={[localConfig.microphoneGain]}
                onValueChange={([value]) => setLocalConfig({ ...localConfig, microphoneGain: value })}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* Configurações Avançadas */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Configurações Avançadas</h4>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Cancelamento de Eco</label>
                  <p className="text-xs text-muted-foreground">Remove eco do ambiente</p>
                </div>
                <Switch
                  checked={localConfig.echoCancellation}
                  onCheckedChange={(checked) => setLocalConfig({ ...localConfig, echoCancellation: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Supressão de Ruído</label>
                  <p className="text-xs text-muted-foreground">Reduz ruídos de fundo</p>
                </div>
                <Switch
                  checked={localConfig.noiseSuppression}
                  onCheckedChange={(checked) => setLocalConfig({ ...localConfig, noiseSuppression: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Controle Automático de Ganho</label>
                  <p className="text-xs text-muted-foreground">Ajusta volume automaticamente</p>
                </div>
                <Switch
                  checked={localConfig.autoGainControl}
                  onCheckedChange={(checked) => setLocalConfig({ ...localConfig, autoGainControl: checked })}
                />
              </div>
            </div>
          </div>

          {/* Informações Importantes */}
          <div className="p-4 room-rounded-xl room-bg-surface border border-primary/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium room-text-primary">Importante</p>
                <p className="text-xs room-text-muted">
                  As configurações de hardware serão salvas e aplicadas automaticamente 
                  na próxima vez que você entrar no estúdio.
                </p>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
