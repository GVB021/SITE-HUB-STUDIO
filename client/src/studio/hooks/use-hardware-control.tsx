import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@studio/hooks/use-toast";

interface AudioDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

interface HardwareConfig {
  selectedMicrophone: string;
  selectedSpeaker: string;
  microphoneVolume: number;
  microphoneGain: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

const DEFAULT_CONFIG: HardwareConfig = {
  selectedMicrophone: "",
  selectedSpeaker: "",
  microphoneVolume: 80,
  microphoneGain: 50,
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

const STORAGE_KEY = "hardware_config_v1";

export function useHardwareControl(sessionId: string) {
  const { toast } = useToast();
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [config, setConfig] = useState<HardwareConfig>(DEFAULT_CONFIG);
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isTesting, setIsTesting] = useState(false);
  
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  // Carregar configurações salvas
  useEffect(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_${sessionId}`);
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (error) {
        console.warn("Failed to load hardware config:", error);
      }
    }
  }, [sessionId]);

  // Salvar configurações
  const saveConfig = useCallback((newConfig: HardwareConfig) => {
    setConfig(newConfig);
    localStorage.setItem(`${STORAGE_KEY}_${sessionId}`, JSON.stringify(newConfig));
  }, [sessionId]);

  // Listar dispositivos disponíveis
  const refreshDevices = useCallback(async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = deviceList.filter(device => 
        device.kind === 'audioinput' || device.kind === 'audiooutput'
      ).map(device => ({
        deviceId: device.deviceId || `device-${Math.random().toString(36).slice(2, 9)}`,
        label: device.label || `Dispositivo ${device.deviceId?.slice(0, 8) || 'default'}`,
        kind: device.kind,
      }));
      
      setDevices(audioDevices);
      console.log("🎤 Dispositivos de áudio encontrados:", audioDevices);
    } catch (error) {
      console.error("❌ Erro ao listar dispositivos:", error);
      toast({
        title: "Erro de Hardware",
        description: "Não foi possível listar os dispositivos de áudio.",
        variant: "destructive",
      });
    }
  }, []);

  // Solicitar permissões e inicializar microfone
  const requestMicrophoneAccess = useCallback(async () => {
    setIsRequesting(true);
    
    try {
      console.log("🎤 Solicitando acesso ao microfone...");
      
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: config.selectedMicrophone || undefined,
          echoCancellation: config.echoCancellation,
          noiseSuppression: config.noiseSuppression,
          autoGainControl: config.autoGainControl,
          sampleRate: 48000,
          channelCount: 1,
        },
        video: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      // Configurar análise de áudio
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      
      source.connect(analyser);
      analyserRef.current = analyser;
      
      // Iniciar monitoramento de nível
      startAudioLevelMonitoring();
      
      setHasPermission(true);
      console.log("✅ Microfone inicializado com sucesso");
      
      // Listar dispositivos após obter permissão
      await refreshDevices();
      
      toast({
        title: "Microfone Configurado",
        description: "Acesso ao microfone concedido com sucesso.",
        variant: "default",
      });
      
      return stream;
      
    } catch (error: any) {
      console.error("❌ Erro ao acessar microfone:", {
        name: error?.name,
        message: error?.message,
        constraintName: error?.constraintName,
        stack: error?.stack,
      });
      
      let errorMessage = "Não foi possível acessar o microfone.";
      if (error.name === 'NotAllowedError') {
        errorMessage = "Permissão de microfone negada. Verifique as configurações do navegador.";
      } else if (error.name === 'NotFoundError') {
        errorMessage = "Nenhum microfone encontrado. Conecte um dispositivo.";
      } else if (error.name === 'NotReadableError') {
        errorMessage = "Microfone já está em uso por outro aplicativo.";
      }

      // Fallback: se um microfone específico falhar, tenta o padrão antes de desistir.
      if (config.selectedMicrophone) {
        try {
          console.warn("⚠️ Tentando fallback para microfone padrão após falha do dispositivo selecionado...");
          const fallbackConstraints: MediaStreamConstraints = {
            audio: {
              echoCancellation: config.echoCancellation,
              noiseSuppression: config.noiseSuppression,
              autoGainControl: config.autoGainControl,
              sampleRate: 48000,
              channelCount: 1,
            },
            video: false,
          };

          const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
          streamRef.current = fallbackStream;

          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const source = audioContext.createMediaStreamSource(fallbackStream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.8;

          source.connect(analyser);
          analyserRef.current = analyser;
          startAudioLevelMonitoring();
          setHasPermission(true);
          console.warn("✅ Fallback para microfone padrão aplicado com sucesso");

          await refreshDevices();
          toast({
            title: "Microfone Configurado",
            description: "O dispositivo selecionado falhou; usando o microfone padrão.",
            variant: "default",
          });

          return fallbackStream;
        } catch (fallbackError) {
          console.error("❌ Fallback para microfone padrão também falhou:", fallbackError);
        }
      }
      
      toast({
        title: "Erro de Microfone",
        description: errorMessage,
        variant: "destructive",
      });
      
      setHasPermission(false);
      throw error;
      
    } finally {
      setIsRequesting(false);
    }
  }, [config, refreshDevices]);

  // Monitorar nível de áudio
  const startAudioLevelMonitoring = useCallback(() => {
    if (!analyserRef.current) return;
    
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const updateLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const normalizedLevel = Math.min(100, (average / 128) * 100);
      
      setAudioLevel(normalizedLevel);
      animationRef.current = requestAnimationFrame(updateLevel);
    };
    
    updateLevel();
  }, []);

  // Parar monitoramento
  const stopAudioLevelMonitoring = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Testar microfone
  const testMicrophone = useCallback(async () => {
    if (!hasPermission) {
      await requestMicrophoneAccess();
    }
    
    setIsTesting(true);
    console.log("🔊 Iniciando teste de microfone...");
    
    // Simular gravação de teste por 3 segundos
    setTimeout(() => {
      setIsTesting(false);
      toast({
        title: "Teste Concluído",
        description: `Nível médio: ${Math.round(audioLevel)}%`,
        variant: "default",
      });
    }, 3000);
  }, [hasPermission, requestMicrophoneAccess, audioLevel]);

  // Mudar dispositivo de microfone
  const changeMicrophone = useCallback(async (deviceId: string) => {
    const newConfig = { ...config, selectedMicrophone: deviceId };
    saveConfig(newConfig);
    
    // Reiniciar stream com novo dispositivo
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (analyserRef.current) {
      stopAudioLevelMonitoring();
      analyserRef.current = null;
    }
    
    await requestMicrophoneAccess();
  }, [config, saveConfig, requestMicrophoneAccess, stopAudioLevelMonitoring]);

  // Limpar recursos
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    // Estado
    devices,
    config,
    isRequesting,
    hasPermission,
    audioLevel,
    isTesting,
    
    // Ações
    requestMicrophoneAccess,
    refreshDevices,
    testMicrophone,
    changeMicrophone,
    saveConfig,
    
    // Controles
    stopAudioLevelMonitoring,
  };
}
