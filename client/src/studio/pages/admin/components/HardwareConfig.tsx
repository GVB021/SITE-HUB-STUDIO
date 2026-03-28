import { memo, useState } from "react";
import { Cpu, Settings, Volume2, Zap, Save, RotateCcw } from "lucide-react";
import { Button } from "@studio/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@studio/components/ui/card";
import { Label } from "@studio/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@studio/components/ui/select";
import { Checkbox } from "@studio/components/ui/checkbox";
import { useToast } from "@studio/hooks/use-toast";

interface HardwareConfig {
  sampleRate: 44100 | 48000;
  bufferSize: 128 | 256 | 512 | 1024;
  latencyTarget: 10 | 20 | 50;
  allowedFormats: ('WAV' | 'MP3' | 'M4A')[];
}

interface HardwareConfigProps {
  studioId: string;
  config: HardwareConfig | null;
  onUpdate: (config: HardwareConfig) => Promise<void>;
  isLoading: boolean;
}

const defaultConfig: HardwareConfig = {
  sampleRate: 44100,
  bufferSize: 256,
  latencyTarget: 20,
  allowedFormats: ['WAV', 'MP3']
};

const HardwareConfig = memo(function HardwareConfig({ 
  config, 
  onUpdate, 
  isLoading 
}: HardwareConfigProps) {
  const { toast } = useToast();
  const [localConfig, setLocalConfig] = useState<HardwareConfig>(config || defaultConfig);
  const [hasChanges, setHasChanges] = useState(false);

  const updateConfig = (key: keyof HardwareConfig, value: any) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    setHasChanges(JSON.stringify(newConfig) !== JSON.stringify(config || defaultConfig));
  };

  const handleFormatToggle = (format: 'WAV' | 'MP3' | 'M4A', checked: boolean) => {
    const newFormats = checked 
      ? [...localConfig.allowedFormats, format]
      : localConfig.allowedFormats.filter(f => f !== format);
    updateConfig('allowedFormats', newFormats);
  };

  const handleSave = async () => {
    try {
      await onUpdate(localConfig);
      setHasChanges(false);
      toast({ title: "Configurações salvas com sucesso!" });
    } catch (error) {
      toast({ 
        title: "Erro ao salvar configurações", 
        description: "Tente novamente mais tarde.",
        variant: "destructive" 
      });
    }
  };

  const handleReset = () => {
    setLocalConfig(defaultConfig);
    setHasChanges(true);
  };

  const getLatencyDescription = (target: number) => {
    switch (target) {
      case 10: return "Ultra Baixa (<10ms) - Para estúdios profissionais";
      case 20: return "Baixa (<20ms) - Recomendado para dublagem";
      case 50: return "Média (<50ms) - Para conexões instáveis";
      default: return "";
    }
  };

  const getBufferSizeDescription = (size: number) => {
    switch (size) {
      case 128: return "128 samples - Ultra responsivo";
      case 256: return "256 samples - Equilíbrio ideal";
      case 512: return "512 samples - Mais estável";
      case 1024: return "1024 samples - Máxima estabilidade";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-500" />
            Configurações de Hardware
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sample Rate */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Taxa de Amostragem (Sample Rate)
            </Label>
            <Select 
              value={localConfig.sampleRate.toString()} 
              onValueChange={(value) => updateConfig('sampleRate', parseInt(value) as 44100 | 48000)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="44100">44.1 kHz (Padrão CD)</SelectItem>
                <SelectItem value="48000">48 kHz (Padrão Video)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Define a qualidade do áudio gravado. 48kHz é padrão para vídeo.
            </p>
          </div>

          {/* Buffer Size */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Tamanho do Buffer
            </Label>
            <Select 
              value={localConfig.bufferSize.toString()} 
              onValueChange={(value) => updateConfig('bufferSize', parseInt(value) as 128 | 256 | 512 | 1024)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="128">128 samples</SelectItem>
                <SelectItem value="256">256 samples</SelectItem>
                <SelectItem value="512">512 samples</SelectItem>
                <SelectItem value="1024">1024 samples</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {getBufferSizeDescription(localConfig.bufferSize)}
            </p>
          </div>

          {/* Latency Target */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Alvo de Latência
            </Label>
            <Select 
              value={localConfig.latencyTarget.toString()} 
              onValueChange={(value) => updateConfig('latencyTarget', parseInt(value) as 10 | 20 | 50)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">Ultra Baixa</SelectItem>
                <SelectItem value="20">Baixa</SelectItem>
                <SelectItem value="50">Média</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {getLatencyDescription(localConfig.latencyTarget)}
            </p>
          </div>

          {/* Audio Formats */}
          <div className="space-y-3">
            <Label>Formatos de Áudio Permitidos</Label>
            <div className="space-y-2">
              {(['WAV', 'MP3', 'M4A'] as const).map((format) => (
                <div key={format} className="flex items-center space-x-2">
                  <Checkbox
                    id={`format-${format}`}
                    checked={localConfig.allowedFormats.includes(format)}
                    onCheckedChange={(checked) => handleFormatToggle(format, checked as boolean)}
                  />
                  <Label htmlFor={`format-${format}`} className="text-sm">
                    {format} {format === 'WAV' ? '(Sem perda)' : format === 'MP3' ? '(Compressão)' : '(Apple)'}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Escolha quais formatos os usuários podem fazer upload.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || isLoading}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? "Salvando..." : "Salvar Configurações"}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Restaurar Padrão
            </Button>
            {hasChanges && (
              <span className="text-sm text-muted-foreground ml-auto">
                Você tem alterações não salvas
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Informações Importantes</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <p>• As configurações serão aplicadas como padrão para novos usuários</p>
          <p>• Usuários existentes precisarão atualizar manualmente suas configurações</p>
          <p>• Configurações muito agressivas (buffer 128, latência 10ms) podem causar problemas em conexões instáveis</p>
          <p>• WAV oferece melhor qualidade mas arquivos maiores. MP3/M4A são menores com leve perda de qualidade</p>
        </CardContent>
      </Card>
    </div>
  );
});

HardwareConfig.displayName = "HardwareConfig";

export default HardwareConfig;
