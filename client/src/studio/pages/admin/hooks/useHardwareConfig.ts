import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@studio/lib/auth-fetch";
import { useToast } from "@studio/hooks/use-toast";

interface HardwareConfig {
  sampleRate: 44100 | 48000;
  bufferSize: 128 | 256 | 512 | 1024;
  latencyTarget: 10 | 20 | 50;
  allowedFormats: ('WAV' | 'MP3' | 'M4A')[];
}

const defaultConfig: HardwareConfig = {
  sampleRate: 44100,
  bufferSize: 256,
  latencyTarget: 20,
  allowedFormats: ['WAV', 'MP3']
};

export function useHardwareConfig(studioId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get hardware config
  const { data: config, isLoading, error } = useQuery({
    queryKey: ["/api/studios", studioId, "hardware-config"],
    queryFn: async () => {
      try {
        const response = await authFetch(`/api/studios/${studioId}/hardware-config`);
        return response as HardwareConfig;
      } catch (err) {
        // If no config exists, return default
        return defaultConfig;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update hardware config
  const updateMutation = useMutation({
    mutationFn: async (newConfig: HardwareConfig) => {
      return authFetch(`/api/studios/${studioId}/hardware-config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/studios", studioId, "hardware-config"] });
      toast({ title: "Configurações de hardware atualizadas com sucesso!" });
    },
    onError: (err: any) => {
      toast({ 
        title: "Erro ao atualizar configurações", 
        description: err?.message || "Tente novamente mais tarde.",
        variant: "destructive" 
      });
    },
  });

  const updateHardwareConfig = async (config: HardwareConfig) => {
    return updateMutation.mutateAsync(config);
  };

  return {
    config: config || defaultConfig,
    isLoading,
    error,
    updateHardwareConfig,
    isUpdating: updateMutation.isPending,
  };
}
