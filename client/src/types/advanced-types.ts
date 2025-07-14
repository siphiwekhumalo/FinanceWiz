// Advanced features types for high-end trading platform

export interface CompareSymbol {
  id: string;
  symbol: string;
  name: string;
  color: string;
  visible: boolean;
  data: ChartDataPoint[];
  normalizedData: ChartDataPoint[];
  basePrice: number;
  compareMode: 'percentage' | 'price';
}

export interface TechnicalIndicator {
  id: string;
  name: string;
  type: 'overlay' | 'oscillator';
  parameters: Record<string, any>;
  data: number[];
  color: string;
  visible: boolean;
  settings: {
    period?: number;
    source?: 'close' | 'open' | 'high' | 'low' | 'hlc3' | 'ohlc4';
    smoothing?: number;
    signalPeriod?: number;
  };
}

export interface BacktestStrategy {
  id: string;
  name: string;
  description: string;
  conditions: {
    entry: StrategyCondition[];
    exit: StrategyCondition[];
  };
  results?: BacktestResults;
}

export interface StrategyCondition {
  indicator: string;
  operator: '>' | '<' | '=' | 'crossover' | 'crossunder';
  value: number | string;
  timeframe?: string;
}

export interface BacktestResults {
  totalTrades: number;
  winRate: number;
  profitLoss: number;
  maxDrawdown: number;
  sharpeRatio: number;
  trades: BacktestTrade[];
}

export interface BacktestTrade {
  entryTime: number;
  exitTime: number;
  entryPrice: number;
  exitPrice: number;
  profit: number;
  side: 'long' | 'short';
}

export interface MarketEvent {
  id: string;
  symbol: string;
  type: 'earnings' | 'dividend' | 'split' | 'news' | 'economic';
  timestamp: number;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  color: string;
  icon: string;
}

export interface PriceGap {
  id: string;
  timestamp: number;
  gapType: 'up' | 'down';
  gapSize: number;
  gapPercent: number;
  previousClose: number;
  currentOpen: number;
  filled: boolean;
  fillTimestamp?: number;
}

export interface ReplaySession {
  id: string;
  symbol: string;
  startTime: number;
  endTime: number;
  currentTime: number;
  speed: number;
  isPlaying: boolean;
  data: ChartDataPoint[];
  currentIndex: number;
}

export interface ChartNote {
  id: string;
  timestamp: number;
  price: number;
  text: string;
  color: string;
  author: string;
  created: number;
  modified?: number;
}

export interface CrosshairSync {
  enabled: boolean;
  charts: string[];
  currentTime?: number;
  currentPrice?: number;
}

export interface ExportOptions {
  format: 'png' | 'pdf' | 'csv' | 'json';
  resolution: 'standard' | 'high' | 'ultra';
  includeLogo: boolean;
  includeWatermark: boolean;
  timeRange: {
    start: number;
    end: number;
  };
}

export interface ThemeCustomization {
  id: string;
  name: string;
  colors: {
    background: string;
    foreground: string;
    grid: string;
    upColor: string;
    downColor: string;
    textColor: string;
    borderColor: string;
    volumeColor: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    size: number;
  };
  layout: {
    showGrid: boolean;
    showVolume: boolean;
    showCrosshair: boolean;
    chartType: 'candlestick' | 'line' | 'area';
  };
}

export interface MultiSymbolPanel {
  id: string;
  name: string;
  symbols: string[];
  layout: 'grid' | 'tabs' | 'split';
  syncCrosshair: boolean;
  syncTimeframe: boolean;
  compareMode: boolean;
}

export interface RealTimeUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
  bid: number;
  ask: number;
  lastSize: number;
  tickDirection: 'up' | 'down' | 'unchanged';
}

export interface AdvancedChartState {
  compareSymbols: CompareSymbol[];
  indicators: TechnicalIndicator[];
  backtestStrategy: BacktestStrategy | null;
  marketEvents: MarketEvent[];
  priceGaps: PriceGap[];
  replaySession: ReplaySession | null;
  chartNotes: ChartNote[];
  crosshairSync: CrosshairSync;
  currentTheme: ThemeCustomization;
  multiSymbolPanels: MultiSymbolPanel[];
  realTimeUpdates: RealTimeUpdate[];
  fullScreenMode: boolean;
  exportSettings: ExportOptions;
}

// Re-export from chart-types for compatibility
export type { ChartDataPoint, VolumeDataPoint, SymbolData } from './chart-types';