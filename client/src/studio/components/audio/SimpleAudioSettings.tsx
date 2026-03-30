import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@studio/components/ui/dialog";
import { Button } from "@studio/components/ui/button";
import { Label } from "@studio/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@studio/components/ui/select";
import { Slider } from "@studio/components/ui/slider";
import { Mic, Headphones, Volume2 } from "lucide-react";
import { useToast } from "@studio/hooks/use-toast";
import { requestMicrophone, releaseMicrophone, setGain, getMicState } from "@studio/lib/audio/microphoneManager";

interface SimpleAudioSettingsProps {
  open: boolean;
  onClose: () => void;
  initialMicDevice?: string;
  initialOutputDevice?: string;
  initialGain?: number;
  onSave: (settings: { micDevice: string; outputDevice: string; gain: number }) => void;
}

export function SimpleAudioSettings({
  open,
  onClose,
  initialMicDevice = "default",
  initialOutputDevice = "default",
  initialGain = 75,
  onSave
}: SimpleAudioSettingsProps) {
  const { toast } = useToast();
  const [micDevice, setMicDevice] = useState(initialMicDevice);
  const [outputDevice, setOutputDevice] = useState(initialOutputDevice);
  const [gain, setGainValue] = useState(initialGain);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [outputs, setOutputs] = useState<MediaDeviceInfo[]>([]);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  // Carregar dispositivos disponíveis
  useEffect(() => {
    const loadDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const mics = devices.filter(device => device.kind === 'audioinput');
        const speakers = devices.filter(device => device.kind === 'audiooutput');
        
        setMicrophones(mics);
        setOutputs(speakers);
        
        // Verificar se microfone atual está ativo
        const micState = getMicState();
        if (micState) {
          const currentTrack = micState.stream.getAudioTracks()[0];
          const currentDeviceId = currentTrack?.getSettings()?.deviceId;
          setIsMicActive(true);
          if (currentDeviceId) {
            setMicDevice(currentDeviceId);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dispositivos:", error);
      }
    };

    if (open) {
      loadDevices();
    }
  }, [open]);

  // Mudar microfone
  const changeMicrophone = async (deviceId: string) => {
    if (isChanging) return;
    
    setIsChanging(true);
    setMicDevice(deviceId);
    
    try {
      // Liberar microfone atual
      const currentState = getMicState();
      if (currentState) {
        await releaseMicrophone();
        setIsMicActive(false);
      }
      
      // Reconectar com novo dispositivo
      const newMicState = await requestMicrophone(
        "high-fidelity",
        deviceId === "default" ? undefined : deviceId
      );
      
      setGain(newMicState, gain / 100);
      setIsMicActive(true);
      
      const deviceName = deviceId === "default" 
        ? "Microfone padrão" 
        : microphones.find(m => m.deviceId === deviceId)?.label || "Microfone selecionado";
      
      toast({ 
        title: "Microfone alterado", 
        description: `${deviceName} está ativo` 
      });
      
    } catch (error) {
      console.error("Erro ao alterar microfone:", error);
      toast({ 
        title: "Erro ao alterar microfone", 
        description: "Não foi possível conectar ao dispositivo",
        variant: "destructive" 
      });
    } finally {
      setIsChanging(false);
    }
  };

  // Mudar dispositivo de saída
  const changeOutput = async (deviceId: string) => {
    setOutputDevice(deviceId);
    
    try {
      // Aplicar a todos os elementos de áudio na página
      const mediaElements = document.querySelectorAll('video, audio') as NodeListOf<HTMLMediaElement>;
      
      for (const media of mediaElements) {
        if ('setSinkId' in media) {
          await (media as any).setSinkId(deviceId === "default" ? "" : deviceId);
        }
      }
      
      const deviceName = deviceId === "default" 
        ? "Saída padrão" 
        : outputs.find(o => o.deviceId === deviceId)?.label || "Saída selecionada";
      
      toast({ 
        title: "Saída alterada", 
        description: `Áudio redirecionado para ${deviceName}` 
      });
      
    } catch (error) {
      console.error("Erro ao alterar saída:", error);
      toast({ 
        title: "Erro ao alterar saída", 
        description: "Seu navegador pode não suportar esta função",
        variant: "destructive" 
      });
    }
  };

  // Ajustar ganho
  const adjustGain = (newGain: number) => {
    setGainValue(newGain);
    
    const micState = getMicState();
    if (micState) {
      setGain(micState, newGain / 100);
      console.log(`[Audio] Ganho ajustado: ${newGain}%`);
    }
  };

  // Salvar configurações
  const handleSave = () => {
    const settings = {
      micDevice,
      outputDevice,
      gain
    };
    
    onSave(settings);
    toast({ 
      title: "Configurações salvas", 
      description: "Suas preferências foram salvas com sucesso" 
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Áudio</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Microfone */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Seu Microfone
            </Label>
            <Select 
              value={micDevice} 
              onValueChange={changeMicrophone}
              disabled={isChanging}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu microfone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Padrão do Sistema</SelectItem>
                {microphones.map(mic => (
                  <SelectItem key={mic.deviceId || `mic-${Math.random()}`} value={mic.deviceId || `mic-default`}>
                    {mic.label || `Microfone ${mic.deviceId?.slice(0, 8) || 'desconhecido'}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isMicActive && (
              <span className="text-xs text-green-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Ativo
              </span>
            )}
            {isChanging && (
              <span className="text-xs text-amber-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Alterando...
              </span>
            )}
          </div>

          {/* Saída de Áudio */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Headphones className="w-4 h-4" />
              Seus Fones/Alto-falantes
            </Label>
            <Select value={outputDevice} onValueChange={changeOutput}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a saída" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Padrão do Sistema</SelectItem>
                {outputs.map(output => (
                  <SelectItem key={output.deviceId || `output-${Math.random()}`} value={output.deviceId || `output-default`}>
                    {output.label || `Saída ${output.deviceId?.slice(0, 8) || 'desconhecida'}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ganho do Microfone */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Volume do Microfone
            </Label>
            <Slider
              value={[gain]}
              min={0}
              max={150}
              step={1}
              onValueChange={([value]) => adjustGain(value)}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className="font-medium">{gain}%</span>
              <span>150%</span>
            </div>
            {gain === 0 && (
              <div className="text-xs text-amber-600">
                Microfone está mudo - nenhum áudio será capturado
              </div>
            )}
            {gain > 120 && (
              <div className="text-xs text-amber-600">
                Ganho muito alto pode causar distorção
              </div>
            )}
          </div>

          <Button onClick={handleSave} className="w-full" disabled={isChanging}>
            {isChanging ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
