import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSettingsStore } from './settingsStore';
import localforage from 'localforage';

vi.mock('localforage');

describe('settingsStore', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      settings: {
        heroTitle: '',
        heroSubtitle: '',
        heroImageUrl: '',
        featuredTitle: '',
        featuredSubtitle: '',
        featuredCourseId: '',
      },
      isLoading: true,
    });
    vi.clearAllMocks();
  });

  describe('loadSettings', () => {
    it('should load settings from localforage', async () => {
      const mockSettings = {
        heroTitle: 'Test Title',
        heroSubtitle: 'Test Subtitle',
        heroImageUrl: 'test.jpg',
        featuredTitle: 'Featured',
        featuredSubtitle: 'Featured Sub',
        featuredCourseId: 'test-course',
      };

      vi.mocked(localforage.getItem).mockResolvedValue(mockSettings);

      await useSettingsStore.getState().loadSettings();

      const settings = useSettingsStore.getState().settings;
      expect(settings.heroTitle).toBe('Test Title');
      expect(settings.heroSubtitle).toBe('Test Subtitle');
      expect(useSettingsStore.getState().isLoading).toBe(false);
    });

    it('should use default settings if none stored', async () => {
      vi.mocked(localforage.getItem).mockResolvedValue(null);
      vi.mocked(localforage.setItem).mockResolvedValue(undefined);

      await useSettingsStore.getState().loadSettings();

      const settings = useSettingsStore.getState().settings;
      expect(settings.heroTitle).toBeTruthy();
      expect(settings.heroSubtitle).toBeTruthy();
      expect(useSettingsStore.getState().isLoading).toBe(false);
    });

    it('should handle load errors gracefully', async () => {
      vi.mocked(localforage.getItem).mockRejectedValue(new Error('Load failed'));

      await useSettingsStore.getState().loadSettings();

      expect(useSettingsStore.getState().isLoading).toBe(false);
      expect(useSettingsStore.getState().settings).toBeTruthy();
    });
  });

  describe('updateSettings', () => {
    it('should update settings', async () => {
      const newSettings = {
        heroTitle: 'New Title',
        heroSubtitle: 'New Subtitle',
        heroImageUrl: 'new.jpg',
        featuredTitle: 'New Featured',
        featuredSubtitle: 'New Featured Sub',
        featuredCourseId: 'new-course',
      };

      vi.mocked(localforage.setItem).mockResolvedValue(undefined);

      await useSettingsStore.getState().updateSettings(newSettings);

      const settings = useSettingsStore.getState().settings;
      expect(settings.heroTitle).toBe('New Title');
      expect(settings.heroSubtitle).toBe('New Subtitle');
      expect(settings.featuredCourseId).toBe('new-course');
    });

    it('should persist settings to localforage', async () => {
      const newSettings = {
        heroTitle: 'Persisted Title',
        heroSubtitle: 'Persisted Subtitle',
        heroImageUrl: 'persist.jpg',
        featuredTitle: 'Persist Featured',
        featuredSubtitle: 'Persist Sub',
        featuredCourseId: 'persist-course',
      };

      vi.mocked(localforage.setItem).mockResolvedValue(undefined);

      await useSettingsStore.getState().updateSettings(newSettings);

      expect(localforage.setItem).toHaveBeenCalledWith('app_settings', newSettings);
    });
  });
});
