import { create } from 'zustand';
import { ChartConfig, ChartType, Timeframe, DataSource, DrawingTool, TechnicalIndicator, SymbolData, ChartDataPoint, VolumeDataPoint } from '@/types/chart-types';

interface ChartStore {
  config: ChartConfig;
  selectedSymbol: SymbolData | null;
  chartData: ChartDataPoint[];
  volumeData: VolumeDataPoint[];
  isLoading: boolean;
  isConnected: boolean;
  
  // Actions
  setChartType: (type: ChartType) => void;
  setTimeframe: (timeframe: Timeframe) => void;
  setDataSource: (source: DataSource) => void;
  setSelectedTool: (tool: DrawingTool) => void;
  setSymbol: (symbol: string) => void;
  setSelectedSymbol: (symbol: SymbolData | null) => void;
  setChartData: (data: ChartDataPoint[]) => void;
  setVolumeData: (data: VolumeDataPoint[]) => void;
  setLoading: (loading: boolean) => void;
  setConnected: (connected: boolean) => void;
  
  // Indicator actions
  addIndicator: (indicator: TechnicalIndicator) => void;
  removeIndicator: (id: string) => void;
  updateIndicator: (id: string, updates: Partial<TechnicalIndicator>) => void;
  toggleIndicator: (id: string) => void;
  
  // Chart actions
  toggleVolume: () => void;
  toggleCrosshair: () => void;
  resetZoom: () => void;
}

const defaultConfig: ChartConfig = {
  symbol: 'AAPL',
  chartType: 'candlestick',
  timeframe: '1h',
  dataSource: 'dummy',
  selectedTool: 'cursor',
  indicators: [],
  showVolume: true,
  showCrosshair: true,
};

export const useChartStore = create<ChartStore>((set, get) => ({
  config: defaultConfig,
  selectedSymbol: null,
  chartData: [],
  volumeData: [],
  isLoading: false,
  isConnected: false,
  
  setChartType: (type) => set((state) => ({
    config: { ...state.config, chartType: type }
  })),
  
  setTimeframe: (timeframe) => set((state) => ({
    config: { ...state.config, timeframe }
  })),
  
  setDataSource: (source) => set((state) => ({
    config: { ...state.config, dataSource: source }
  })),
  
  setSelectedTool: (tool) => set((state) => ({
    config: { ...state.config, selectedTool: tool }
  })),
  
  setSymbol: (symbol) => set((state) => ({
    config: { ...state.config, symbol }
  })),
  
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  
  setChartData: (data) => set({ chartData: data }),
  
  setVolumeData: (data) => set({ volumeData: data }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setConnected: (connected) => set({ isConnected: connected }),
  
  addIndicator: (indicator) => set((state) => ({
    config: {
      ...state.config,
      indicators: [...state.config.indicators, indicator]
    }
  })),
  
  removeIndicator: (id) => set((state) => ({
    config: {
      ...state.config,
      indicators: state.config.indicators.filter(i => i.id !== id)
    }
  })),
  
  updateIndicator: (id, updates) => set((state) => ({
    config: {
      ...state.config,
      indicators: state.config.indicators.map(i => 
        i.id === id ? { ...i, ...updates } : i
      )
    }
  })),
  
  toggleIndicator: (id) => set((state) => ({
    config: {
      ...state.config,
      indicators: state.config.indicators.map(i => 
        i.id === id ? { ...i, enabled: !i.enabled } : i
      )
    }
  })),
  
  toggleVolume: () => set((state) => ({
    config: { ...state.config, showVolume: !state.config.showVolume }
  })),
  
  toggleCrosshair: () => set((state) => ({
    config: { ...state.config, showCrosshair: !state.config.showCrosshair }
  })),
  
  resetZoom: () => {
    // This would trigger a chart reset in the actual implementation
    console.log('Reset zoom');
  },
}));
