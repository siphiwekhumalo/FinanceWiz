import { BaseDataAdapter, MarketDataPoint, TradeData, CorporateAction, NewsEvent, DataSubscription } from './base-adapter';
import { AlphaVantageAdapter } from './alpha-vantage-adapter';
import { BinanceAdapter } from './binance-adapter';
import { CSVAdapter } from './csv-adapter';

export type AdapterType = 'alpha_vantage' | 'binance' | 'csv' | 'dummy';

export interface AdapterConfig {
  type: AdapterType;
  config: any;
  priority: number;
}

export interface DataRequest {
  symbol: string;
  timeframe: string;
  start: Date;
  end: Date;
  preferredSource?: string;
}

export class DataManager {
  private adapters: Map<string, BaseDataAdapter> = new Map();
  private adapterPriority: Map<string, number> = new Map();
  private subscriptions: Map<string, DataSubscription[]> = new Map();
  
  constructor() {
    // Initialize dummy adapter for development
    this.addDummyAdapter();
  }
  
  async addAdapter(name: string, config: AdapterConfig): Promise<void> {
    let adapter: BaseDataAdapter;
    
    switch (config.type) {
      case 'alpha_vantage':
        adapter = new AlphaVantageAdapter(config.config.apiKey);
        break;
      case 'binance':
        adapter = new BinanceAdapter();
        break;
      case 'csv':
        adapter = new CSVAdapter(config.config);
        break;
      default:
        throw new Error(`Unsupported adapter type: ${config.type}`);
    }
    
    try {
      await adapter.connect();
      this.adapters.set(name, adapter);
      this.adapterPriority.set(name, config.priority);
      console.log(`Added data adapter: ${name} (${config.type})`);
    } catch (error) {
      console.error(`Failed to add adapter ${name}:`, error);
      throw error;
    }
  }
  
  async removeAdapter(name: string): Promise<void> {
    const adapter = this.adapters.get(name);
    if (adapter) {
      await adapter.disconnect();
      this.adapters.delete(name);
      this.adapterPriority.delete(name);
      console.log(`Removed data adapter: ${name}`);
    }
  }
  
  async getHistoricalData(request: DataRequest): Promise<MarketDataPoint[]> {
    const adapters = this.getOrderedAdapters(request.preferredSource);
    const errors: string[] = [];
    
    for (const [name, adapter] of adapters) {
      try {
        const data = await adapter.getHistoricalData(
          request.symbol,
          request.timeframe,
          request.start,
          request.end
        );
        
        if (data.length > 0) {
          console.log(`Retrieved ${data.length} data points from ${name}`);
          return data;
        }
      } catch (error) {
        errors.push(`${name}: ${error}`);
        console.error(`Error from adapter ${name}:`, error);
      }
    }
    
    // If no real data available, use dummy data
    return this.generateDummyData(request);
  }
  
  async getRealtimeQuote(symbol: string, preferredSource?: string): Promise<MarketDataPoint | null> {
    const adapters = this.getOrderedAdapters(preferredSource);
    
    for (const [name, adapter] of adapters) {
      try {
        const quote = await adapter.getRealtimeQuote(symbol);
        if (quote) {
          return quote;
        }
      } catch (error) {
        console.error(`Error getting quote from ${name}:`, error);
      }
    }
    
    return null;
  }
  
  async subscribe(symbol: string, dataType: 'quotes' | 'trades' | 'news' | 'corporate_actions', callback: (data: any) => void): Promise<void> {
    const subscription: DataSubscription = { symbol, dataType, callback };
    const key = `${symbol}_${dataType}`;
    
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, []);
    }
    this.subscriptions.get(key)!.push(subscription);
    
    // Subscribe with all available adapters
    const adapters = this.getOrderedAdapters();
    for (const [name, adapter] of adapters) {
      try {
        await adapter.subscribe(subscription);
        console.log(`Subscribed to ${symbol} ${dataType} via ${name}`);
      } catch (error) {
        console.error(`Failed to subscribe via ${name}:`, error);
      }
    }
  }
  
  async unsubscribe(symbol: string, dataType: string): Promise<void> {
    const key = `${symbol}_${dataType}`;
    this.subscriptions.delete(key);
    
    // Unsubscribe from all adapters
    for (const [name, adapter] of this.adapters) {
      try {
        await adapter.unsubscribe(symbol, dataType);
        console.log(`Unsubscribed from ${symbol} ${dataType} via ${name}`);
      } catch (error) {
        console.error(`Failed to unsubscribe via ${name}:`, error);
      }
    }
  }
  
  async getCorporateActions(symbol: string, start: Date, end: Date): Promise<CorporateAction[]> {
    const allActions: CorporateAction[] = [];
    
    for (const [name, adapter] of this.adapters) {
      try {
        const actions = await adapter.getCorporateActions(symbol, start, end);
        allActions.push(...actions);
      } catch (error) {
        console.error(`Error getting corporate actions from ${name}:`, error);
      }
    }
    
    // Remove duplicates and sort by date
    const uniqueActions = allActions.filter((action, index, self) => 
      index === self.findIndex(a => 
        a.symbol === action.symbol && 
        a.type === action.type && 
        a.date.getTime() === action.date.getTime()
      )
    );
    
    return uniqueActions.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  
  async getNews(symbol: string, limit: number = 10): Promise<NewsEvent[]> {
    const allNews: NewsEvent[] = [];
    
    for (const [name, adapter] of this.adapters) {
      try {
        const news = await adapter.getNews(symbol, limit);
        allNews.push(...news);
      } catch (error) {
        console.error(`Error getting news from ${name}:`, error);
      }
    }
    
    // Remove duplicates and sort by date
    const uniqueNews = allNews.filter((news, index, self) => 
      index === self.findIndex(n => 
        n.title === news.title && 
        Math.abs(n.timestamp.getTime() - news.timestamp.getTime()) < 60000 // Within 1 minute
      )
    );
    
    return uniqueNews
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  async validateSymbol(symbol: string): Promise<{ isValid: boolean; sources: string[] }> {
    const validSources: string[] = [];
    
    for (const [name, adapter] of this.adapters) {
      try {
        const isValid = await adapter.validateSymbol(symbol);
        if (isValid) {
          validSources.push(name);
        }
      } catch (error) {
        console.error(`Error validating symbol via ${name}:`, error);
      }
    }
    
    return {
      isValid: validSources.length > 0,
      sources: validSources
    };
  }
  
  getAvailableAdapters(): { name: string; type: string; priority: number }[] {
    return Array.from(this.adapters.entries()).map(([name, adapter]) => ({
      name,
      type: (adapter as any).constructor.name,
      priority: this.adapterPriority.get(name) || 0
    }));
  }
  
  private getOrderedAdapters(preferredSource?: string): [string, BaseDataAdapter][] {
    let adapters = Array.from(this.adapters.entries());
    
    // Sort by priority (higher first)
    adapters.sort((a, b) => {
      const priorityA = this.adapterPriority.get(a[0]) || 0;
      const priorityB = this.adapterPriority.get(b[0]) || 0;
      return priorityB - priorityA;
    });
    
    // If preferred source is specified, move it to front
    if (preferredSource && this.adapters.has(preferredSource)) {
      adapters = adapters.filter(([name]) => name !== preferredSource);
      adapters.unshift([preferredSource, this.adapters.get(preferredSource)!]);
    }
    
    return adapters;
  }
  
  private addDummyAdapter(): void {
    // Add a simple dummy adapter for development
    const dummyAdapter = new (class extends BaseDataAdapter {
      async connect() { this.isConnected = true; }
      async disconnect() { this.isConnected = false; }
      async getHistoricalData() { return []; }
      async getRealtimeQuote() { return null; }
      async subscribe() {}
      async unsubscribe() {}
    })();
    
    dummyAdapter.connect();
    this.adapters.set('dummy', dummyAdapter);
    this.adapterPriority.set('dummy', 0);
  }
  
  private generateDummyData(request: DataRequest): MarketDataPoint[] {
    // Generate dummy data as fallback
    const data: MarketDataPoint[] = [];
    const timeframeMinutes: Record<string, number> = {
      '1m': 1, '5m': 5, '15m': 15, '1h': 60,
      '4h': 240, '1d': 1440, '1w': 10080
    };
    
    const intervalMinutes = timeframeMinutes[request.timeframe] || 60;
    const startTime = request.start.getTime();
    const endTime = request.end.getTime();
    let basePrice = 100 + Math.random() * 100;
    
    for (let time = startTime; time <= endTime; time += intervalMinutes * 60 * 1000) {
      const volatility = 0.02;
      const change = (Math.random() - 0.5) * volatility;
      
      const open = basePrice;
      const close = basePrice * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = Math.floor(Math.random() * 1000000);
      
      data.push({
        symbol: request.symbol,
        timestamp: new Date(time),
        open,
        high,
        low,
        close,
        volume,
        source: 'dummy'
      });
      
      basePrice = close;
    }
    
    return data;
  }
}