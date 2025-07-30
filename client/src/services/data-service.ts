import { MarketDataPoint, TradeData, CorporateAction, NewsEvent, DataAdapterInfo, SymbolValidation } from '@shared/types';

export class DataService {
  private baseUrl: string;
  
  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }
  
  // Data adapter management
  async getDataAdapters(): Promise<DataAdapterInfo[]> {
    const response = await fetch(`${this.baseUrl}/data-adapters`);
    if (!response.ok) throw new Error('Failed to fetch data adapters');
    return response.json();
  }
  
  async addDataAdapter(name: string, type: string, config: any, priority: number = 1): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/data-adapters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, config, priority })
    });
    return response.json();
  }
  
  async removeDataAdapter(name: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/data-adapters/${name}`, {
      method: 'DELETE'
    });
    return response.json();
  }
  
  // Enhanced data fetching
  async getEnhancedChartData(
    symbol: string, 
    timeframe: string = '1h', 
    start?: Date, 
    end?: Date, 
    source?: string
  ): Promise<MarketDataPoint[]> {
    const params = new URLSearchParams({
      timeframe,
      ...(start && { start: start.toISOString() }),
      ...(end && { end: end.toISOString() }),
      ...(source && { source })
    });
    
    const response = await fetch(`${this.baseUrl}/chart-data-enhanced/${symbol}?${params}`);
    if (!response.ok) throw new Error('Failed to fetch enhanced chart data');
    
    const data = await response.json();
    return data.map((point: any) => ({
      ...point,
      timestamp: new Date(point.timestamp)
    }));
  }
  
  async getRealtimeQuote(symbol: string, source?: string): Promise<MarketDataPoint | null> {
    const params = new URLSearchParams();
    if (source) params.append('source', source);
    
    const response = await fetch(`${this.baseUrl}/quote/${symbol}?${params}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to fetch quote');
    
    const quote = await response.json();
    return {
      ...quote,
      timestamp: new Date(quote.timestamp)
    };
  }
  
  async getCorporateActions(symbol: string, start?: Date, end?: Date): Promise<CorporateAction[]> {
    const params = new URLSearchParams();
    if (start) params.append('start', start.toISOString());
    if (end) params.append('end', end.toISOString());
    
    const response = await fetch(`${this.baseUrl}/corporate-actions/${symbol}?${params}`);
    if (!response.ok) throw new Error('Failed to fetch corporate actions');
    
    const actions = await response.json();
    return actions.map((action: any) => ({
      ...action,
      date: new Date(action.date)
    }));
  }
  
  async getNews(symbol: string, limit: number = 10): Promise<NewsEvent[]> {
    const response = await fetch(`${this.baseUrl}/news/${symbol}?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch news');
    
    const news = await response.json();
    return news.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }));
  }
  
  async validateSymbol(symbol: string): Promise<SymbolValidation> {
    const response = await fetch(`${this.baseUrl}/validate-symbol/${symbol}`);
    if (!response.ok) throw new Error('Failed to validate symbol');
    return response.json();
  }
}

export const dataService = new DataService();