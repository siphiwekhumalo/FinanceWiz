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

export interface DataSubscription {
  symbol: string;
  dataType: 'quotes' | 'trades' | 'news' | 'corporate_actions';
  callback: (data: any) => void;
}

export abstract class BaseDataAdapter {
  protected subscriptions: Map<string, DataSubscription[]> = new Map();
  protected isConnected: boolean = false;
  
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract getHistoricalData(symbol: string, timeframe: string, start: Date, end: Date): Promise<MarketDataPoint[]>;
  abstract getRealtimeQuote(symbol: string): Promise<MarketDataPoint | null>;
  abstract subscribe(subscription: DataSubscription): Promise<void>;
  abstract unsubscribe(symbol: string, dataType: string): Promise<void>;
  
  // Optional methods for advanced features
  async getCorporateActions(symbol: string, start: Date, end: Date): Promise<CorporateAction[]> {
    return [];
  }
  
  async getNews(symbol: string, limit: number = 10): Promise<NewsEvent[]> {
    return [];
  }
  
  async validateSymbol(symbol: string): Promise<boolean> {
    try {
      const quote = await this.getRealtimeQuote(symbol);
      return quote !== null;
    } catch {
      return false;
    }
  }
  
  protected addSubscription(subscription: DataSubscription): void {
    const key = `${subscription.symbol}_${subscription.dataType}`;
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, []);
    }
    this.subscriptions.get(key)!.push(subscription);
  }
  
  protected removeSubscription(symbol: string, dataType: string): void {
    const key = `${symbol}_${dataType}`;
    this.subscriptions.delete(key);
  }
  
  protected notifySubscribers(symbol: string, dataType: string, data: any): void {
    const key = `${symbol}_${dataType}`;
    const subs = this.subscriptions.get(key);
    if (subs) {
      subs.forEach(sub => sub.callback(data));
    }
  }
}