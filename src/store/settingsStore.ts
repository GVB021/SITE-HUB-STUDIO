import { create } from 'zustand';
import localforage from 'localforage';

export interface AppSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  featuredTitle: string;
  featuredSubtitle: string;
  featuredCourseId: string;
}

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<void>;
}

const defaultSettings: AppSettings = {
  heroTitle: 'Sua voz, sua carreira.',
  heroSubtitle: 'Milhares de minicursos gratuitos de dublagem e fonoaudiologia. O material de apoio definitivo para alunos e futuros profissionais do mercado.',
  heroImageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
  featuredTitle: 'Módulo em Destaque',
  featuredSubtitle: 'Prepare-se para o mercado de trabalho',
  featuredCourseId: 'plano-de-carreira',
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,
  isLoading: true,
  loadSettings: async () => {
    try {
      const storedSettings = await localforage.getItem<AppSettings>('app_settings');
      if (storedSettings) {
        set({ settings: { ...defaultSettings, ...storedSettings }, isLoading: false });
      } else {
        await localforage.setItem('app_settings', defaultSettings);
        set({ settings: defaultSettings, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ settings: defaultSettings, isLoading: false });
    }
  },
  updateSettings: async (newSettings) => {
    await localforage.setItem('app_settings', newSettings);
    set({ settings: newSettings });
  }
}));
