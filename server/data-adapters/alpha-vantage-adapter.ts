import { BaseDataAdapter, MarketDataPoint, TradeData, NewsEvent } from './base-adapter';

export class AlphaVantageAdapter extends BaseDataAdapter {
  private apiKey: string;
  private baseUrl = 'https://www.alphavantage.co/query';
  
  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }
  
  async connect(): Promise<void> {
    // Test connection with a simple API call
    try {
      const response = await fetch(`${this.baseUrl}?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${this.apiKey}`);
      const data = await response.json();
      
      if (data['Error Message'] || data['Note']) {
        throw new Error('Invalid API key or rate limit exceeded');
      }
      
      this.isConnected = true;
      console.log('Alpha Vantage adapter connected successfully');
    } catch (error) {
      throw new Error(`Failed to connect to Alpha Vantage: ${error}`);
    }
  }
  
  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.subscriptions.clear();
    console.log('Alpha Vantage adapter disconnected');
  }
  
  async getHistoricalData(symbol: string, timeframe: string, start: Date, end: Date): Promise<MarketDataPoint[]> {
    if (!this.isConnected) {
      throw new Error('Adapter not connected');
    }
    
    const functionMap: Record<string, string> = {
      '1m': 'TIME_SERIES_INTRADAY',
      '5m': 'TIME_SERIES_INTRADAY',
      '15m': 'TIME_SERIES_INTRADAY',
      '1h': 'TIME_SERIES_INTRADAY',
      '1d': 'TIME_SERIES_DAILY',
      '1w': 'TIME_SERIES_WEEKLY',
      '1M': 'TIME_SERIES_MONTHLY'
    };
    
    const func = functionMap[timeframe] || 'TIME_SERIES_DAILY';
    let url = `${this.baseUrl}?function=${func}&symbol=${symbol}&apikey=${this.apiKey}&outputsize=full`;
    
    if (func === 'TIME_SERIES_INTRADAY') {
      const intervalMap: Record<string, string> = {
        '1m': '1min',
        '5m': '5min',
        '15m': '15min',
        '1h': '60min'
      };
      url += `&interval=${intervalMap[timeframe] || '60min'}`;
    }
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      const timeSeriesKey = Object.keys(data).find(key => key.includes('Time Series'));
      if (!timeSeriesKey) {
        throw new Error('Invalid response format from Alpha Vantage');
      }
      
      const timeSeries = data[timeSeriesKey];
      const dataPoints: MarketDataPoint[] = [];
      
      for (const [timestamp, values] of Object.entries(timeSeries)) {
        const date = new Date(timestamp);
        if (date >= start && date <= end) {
          const point = values as any;
          dataPoints.push({
            symbol,
            timestamp: date,
            open: parseFloat(point['1. open']),
            high: parseFloat(point['2. high']),
            low: parseFloat(point['3. low']),
            close: parseFloat(point['4. close']),
            volume: parseInt(point['5. volume'] || '0'),
            source: 'alpha_vantage'
          });
        }
      }
      
      return dataPoints.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } catch (error) {
      throw new Error(`Failed to fetch historical data: ${error}`);
    }
  }
  
  async getRealtimeQuote(symbol: string): Promise<MarketDataPoint | null> {
    if (!this.isConnected) {
      throw new Error('Adapter not connected');
    }
    
    try {
      const response = await fetch(`${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`);
      const data = await response.json();
      
      const quote = data['Global Quote'];
      if (!quote) {
        return null;
      }
      
      return {
        symbol,
        timestamp: new Date(),
        open: parseFloat(quote['02. open']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        close: parseFloat(quote['05. price']),
        volume: parseInt(quote['06. volume'] || '0'),
        source: 'alpha_vantage'
      };
    } catch (error) {
      console.error(`Failed to fetch realtime quote for ${symbol}:`, error);
      return null;
    }
  }
  
  async subscribe(subscription: any): Promise<void> {
    this.addSubscription(subscription);
    
    // For Alpha Vantage, we'll poll for updates since they don't provide WebSocket
    if (subscription.dataType === 'quotes') {
      this.startPolling(subscription.symbol);
    }
  }
  
  async unsubscribe(symbol: string, dataType: string): Promise<void> {
    this.removeSubscription(symbol, dataType);
  }
  
  async getNews(symbol: string, limit: number = 10): Promise<NewsEvent[]> {
    try {
      const response = await fetch(`${this.baseUrl}?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${this.apiKey}&limit=${limit}`);
      const data = await response.json();
      
      if (!data.feed) {
        return [];
      }
      
      return data.feed.map((item: any) => ({
        symbol,
        timestamp: new Date(item.time_published),
        title: item.title,
        content: item.summary,
        sentiment: this.mapSentiment(item.overall_sentiment_label),
        source: 'alpha_vantage'
      }));
    } catch (error) {
      console.error(`Failed to fetch news for ${symbol}:`, error);
      return [];
    }
  }
  
  private mapSentiment(sentiment: string): 'positive' | 'negative' | 'neutral' {
    const s = sentiment.toLowerCase();
    if (s.includes('positive') || s.includes('bullish')) return 'positive';
    if (s.includes('negative') || s.includes('bearish')) return 'negative';
    return 'neutral';
  }
  
  private startPolling(symbol: string): void {
    const pollInterval = setInterval(async () => {
      try {
        const quote = await this.getRealtimeQuote(symbol);
        if (quote) {
          this.notifySubscribers(symbol, 'quotes', quote);
        }
      } catch (error) {
        console.error(`Polling error for ${symbol}:`, error);
      }
    }, 5000); // Poll every 5 seconds
    
    // Store interval for cleanup
    (this as any)[`poll_${symbol}`] = pollInterval;
  }
}