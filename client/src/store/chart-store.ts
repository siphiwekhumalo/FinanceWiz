import { create } from 'zustand';
import { ChartConfig, ChartType, Timeframe, DataSource, DrawingTool, TechnicalIndicator, SymbolData, ChartDataPoint, VolumeDataPoint, ComparisonSymbol } from '@/types/chart-types';

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
  
  // Chart instance management
  chartInstance: any;
  setChartInstance: (instance: any) => void;
  
  // Drawing actions
  addDrawingObject: (object: DrawingObject) => void;
  updateDrawingObject: (id: string, updates: Partial<DrawingObject>) => void;
  removeDrawingObject: (id: string) => void;
  clearDrawingObjects: () => void;
  
  // Comparison actions
  addComparisonSymbol: (symbol: ComparisonSymbol) => void;
  removeComparisonSymbol: (symbol: string) => void;
  toggleComparisonSymbol: (symbol: string) => void;
  clearComparisonSymbols: () => void;
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
  drawingObjects: [],
  comparisonSymbols: [],
};

export const useChartStore = create<ChartStore>((set, get) => ({
  config: defaultConfig,
  selectedSymbol: null,
  chartData: [],
  volumeData: [],
  isLoading: false,
  isConnected: false,
  chartInstance: null,
  
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
    // Custom chart zoom reset - trigger redraw
    const state = get();
    if (state.chartInstance && state.chartInstance.redraw) {
      state.chartInstance.redraw();
    }
  },
  
  // Chart instance management
  setChartInstance: (instance) => set({ chartInstance: instance }),
  
  // Drawing actions
  addDrawingObject: (object) => set((state) => ({
    config: {
      ...state.config,
      drawingObjects: [...state.config.drawingObjects, object],
    },
  })),
  updateDrawingObject: (id, updates) => set((state) => ({
    config: {
      ...state.config,
      drawingObjects: state.config.drawingObjects.map(obj => 
        obj.id === id ? { ...obj, ...updates } : obj
      ),
    },
  })),
  removeDrawingObject: (id) => set((state) => ({
    config: {
      ...state.config,
      drawingObjects: state.config.drawingObjects.filter(obj => obj.id !== id),
    },
  })),
  clearDrawingObjects: () => set((state) => ({
    config: {
      ...state.config,
      drawingObjects: [],
    },
  })),
  
  // Comparison actions
  addComparisonSymbol: (symbol) => set((state) => ({
    config: { 
      ...state.config, 
      comparisonSymbols: [...state.config.comparisonSymbols, symbol]
    }
  })),
  
  removeComparisonSymbol: (symbol) => set((state) => ({
    config: { 
      ...state.config, 
      comparisonSymbols: state.config.comparisonSymbols.filter(s => s.symbol !== symbol)
    }
  })),
  
  toggleComparisonSymbol: (symbol) => set((state) => ({
    config: { 
      ...state.config, 
      comparisonSymbols: state.config.comparisonSymbols.map(s => 
        s.symbol === symbol ? { ...s, enabled: !s.enabled } : s
      )
    }
  })),
  
  clearComparisonSymbols: () => set((state) => ({
    config: { ...state.config, comparisonSymbols: [] }
  })),
}));
