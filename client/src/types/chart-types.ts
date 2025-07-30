export interface ChartDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ComparisonSymbol {
  symbol: string;
  name: string;
  data: ChartDataPoint[];
  color: string;
  enabled: boolean;
  style: 'line' | 'area' | 'bar';
  change?: number;
  changePercent?: number;
}

export interface VolumeDataPoint {
  time: number;
  value: number;
  color?: string;
}

export interface SymbolData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high24h: number;
  low24h: number;
  marketCap?: number;
}

export interface OrderBookEntry {
  price: number;
  size: number;
  side: 'buy' | 'sell';
}

export interface TradeEntry {
  time: string;
  price: number;
  size: number;
  side: 'buy' | 'sell';
}

export interface TechnicalIndicator {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  color: string;
  parameters: Record<string, any>;
}

export interface WhiteLabelConfig {
  companyName: string;
  tagline: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  theme: 'light' | 'dark';
  features: {
    showToolbar: boolean;
    showIndicators: boolean;
    showVolume: boolean;
    showWatermark: boolean;
  };
}

export type ChartType = 'candlestick' | 'line' | 'area' | 'bar' | 'doughnut' | 'pie' | 'radar' | 'polarArea' | 'scatter';
export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w' | '1y';
export type DataSource = 'dummy' | 'real';
export type ComparisonMode = 'absolute' | 'percentage';
export type DrawingTool = 'cursor' | 'trendline' | 'fibonacci' | 'rectangle' | 'text';

export interface DrawingObject {
  id: string;
  type: DrawingTool;
  points: Array<{ x: number; y: number; price: number; time: number }>;
  color: string;
  lineWidth: number;
  text?: string;
  completed: boolean;
}

export interface FibonacciLevel {
  level: number;
  percentage: number;
  color: string;
}

export interface ChartConfig {
  symbol: string;
  chartType: ChartType;
  timeframe: Timeframe;
  dataSource: DataSource;
  selectedTool: DrawingTool;
  indicators: TechnicalIndicator[];
  showVolume: boolean;
  showCrosshair: boolean;
  drawingObjects: DrawingObject[];
  comparisonSymbols: ComparisonSymbol[];
  comparisonMode: ComparisonMode;
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export interface WebSocketMessage {
  type: 'price_update' | 'trade' | 'order_book' | 'subscribed' | 'unsubscribed' | 'error';
  symbol?: string;
  data?: any;
  message?: string;
  status?: string;
}
