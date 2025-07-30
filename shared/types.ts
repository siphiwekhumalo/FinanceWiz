// Data adapter types shared between client and server
export interface MarketDataPoint {
  symbol: string;
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  source: string;
}

export interface TradeData {
  symbol: string;
  timestamp: Date;
  price: number;
  size: number;
  side: 'buy' | 'sell';
  source: string;
}

export interface CorporateAction {
  symbol: string;
  type: 'dividend' | 'split' | 'earnings' | 'merger' | 'spinoff';
  date: Date;
  data: Record<string, any>;
  source: string;
}

export interface NewsEvent {
  symbol: string;
  timestamp: Date;
  title: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  source: string;
}

export interface DataAdapterInfo {
  name: string;
  type: string;
  priority: number;
  isConnected?: boolean;
  lastUpdate?: Date;
}

export interface SymbolValidation {
  isValid: boolean;
  sources: string[];
}

// WebSocket message types
export interface WSMessage {
  type: string;
  symbol?: string;
  dataType?: string;
  data?: any;
  status?: string;
  message?: string;
}

export interface QuoteUpdateMessage extends WSMessage {
  type: 'quote_update';
  symbol: string;
  data: MarketDataPoint;
}

export interface TradeUpdateMessage extends WSMessage {
  type: 'trade_update';
  symbol: string;
  data: TradeData;
}

export interface NewsUpdateMessage extends WSMessage {
  type: 'news_update';
  symbol: string;
  data: NewsEvent;
}