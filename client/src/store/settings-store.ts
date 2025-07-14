import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WhiteLabelConfig } from '@/types/chart-types';

interface SettingsStore {
  whiteLabel: WhiteLabelConfig;
  isSettingsOpen: boolean;
  isFullscreen: boolean;
  
  // Actions
  updateWhiteLabel: (config: Partial<WhiteLabelConfig>) => void;
  setSettingsOpen: (open: boolean) => void;
  setFullscreen: (fullscreen: boolean) => void;
  resetToDefaults: () => void;
}

const defaultWhiteLabel: WhiteLabelConfig = {
  companyName: 'FinanceChart Pro',
  tagline: 'Advanced Trading Analytics',
  primaryColor: '#3B82F6',
  secondaryColor: '#1E293B',
  theme: 'dark',
  features: {
    showToolbar: true,
    showIndicators: true,
    showVolume: true,
    showWatermark: true,
  },
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      whiteLabel: defaultWhiteLabel,
      isSettingsOpen: false,
      isFullscreen: false,
      
      updateWhiteLabel: (config) => set((state) => ({
        whiteLabel: { ...state.whiteLabel, ...config }
      })),
      
      setSettingsOpen: (open) => set({ isSettingsOpen: open }),
      
      setFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),
      
      resetToDefaults: () => set({
        whiteLabel: defaultWhiteLabel,
        isSettingsOpen: false,
        isFullscreen: false,
      }),
    }),
    {
      name: 'chart-settings',
      partialize: (state) => ({ whiteLabel: state.whiteLabel }),
    }
  )
);
