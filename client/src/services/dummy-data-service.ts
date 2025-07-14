import { ChartDataPoint, VolumeDataPoint, SymbolData, OrderBookEntry, TradeEntry } from '@/types/chart-types';

export class DummyDataService {
  private static instance: DummyDataService;
  private basePrice = 175.43;
  private lastTimestamp = Date.now();
  
  static getInstance(): DummyDataService {
    if (!DummyDataService.instance) {
      DummyDataService.instance = new DummyDataService();
    }
    return DummyDataService.instance;
  }

  generateChartData(symbol: string, timeframe: string, count: number = 100): ChartDataPoint[] {
    const data: ChartDataPoint[] = [];
    const now = Date.now();
    const timeframeMs = this.getTimeframeMs(timeframe);
    
    let currentPrice = this.basePrice;
    
    for (let i = count; i > 0; i--) {
      const timestamp = now - (i * timeframeMs);
      const volatility = 0.02;
      const change = (Math.random() - 0.5) * volatility;
      
      const open = currentPrice;
      const close = currentPrice * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = Math.floor(Math.random() * 1000000);
      
      data.push({
        time: Math.floor(timestamp / 1000),
        open: parseFloat(open.toFixed(4)),
        high: parseFloat(high.toFixed(4)),
        low: parseFloat(low.toFixed(4)),
        close: parseFloat(close.toFixed(4)),
        volume
      });
      
      currentPrice = close;
    }
    
    return data;
  }

  generateVolumeData(chartData: ChartDataPoint[]): VolumeDataPoint[] {
    return chartData.map(point => ({
      time: point.time,
      value: point.volume,
      color: point.close >= point.open ? '#10B981' : '#EF4444'
    }));
  }

  generateSymbolData(symbol: string): SymbolData {
    const basePrice = 100 + Math.random() * 200;
    const change = (Math.random() - 0.5) * 10;
    const changePercent = (change / basePrice) * 100;
    
    return {
      symbol,
      name: this.getSymbolName(symbol),
      price: parseFloat(basePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000),
      high24h: basePrice * (1 + Math.random() * 0.05),
      low24h: basePrice * (1 - Math.random() * 0.05),
      marketCap: Math.floor(Math.random() * 1000000000000)
    };
  }

  generateOrderBook(symbol: string): OrderBookEntry[] {
    const basePrice = this.basePrice;
    const orders: OrderBookEntry[] = [];
    
    // Generate sell orders (above current price)
    for (let i = 1; i <= 10; i++) {
      orders.push({
        price: parseFloat((basePrice + i * 0.01).toFixed(2)),
        size: Math.floor(Math.random() * 5000) + 100,
        side: 'sell'
      });
    }
    
    // Generate buy orders (below current price)
    for (let i = 1; i <= 10; i++) {
      orders.push({
        price: parseFloat((basePrice - i * 0.01).toFixed(2)),
        size: Math.floor(Math.random() * 5000) + 100,
        side: 'buy'
      });
    }
    
    return orders;
  }

  generateRecentTrades(symbol: string, count: number = 20): TradeEntry[] {
    const trades: TradeEntry[] = [];
    const now = Date.now();
    
    for (let i = count; i > 0; i--) {
      const timestamp = new Date(now - i * 1000);
      const price = this.basePrice + (Math.random() - 0.5) * 0.1;
      const size = Math.floor(Math.random() * 1000) + 10;
      const side = Math.random() > 0.5 ? 'buy' : 'sell';
      
      trades.push({
        time: timestamp.toLocaleTimeString(),
        price: parseFloat(price.toFixed(2)),
        size,
        side
      });
    }
    
    return trades;
  }

  generateRealTimePriceUpdate(symbol: string): SymbolData {
    const change = (Math.random() - 0.5) * 0.5;
    this.basePrice += change;
    const changePercent = (change / this.basePrice) * 100;
    
    return {
      symbol,
      name: this.getSymbolName(symbol),
      price: parseFloat(this.basePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000),
      high24h: this.basePrice * (1 + Math.random() * 0.05),
      low24h: this.basePrice * (1 - Math.random() * 0.05),
      marketCap: Math.floor(Math.random() * 1000000000000)
    };
  }

  private getTimeframeMs(timeframe: string): number {
    const timeframeMap: Record<string, number> = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
      '1w': 7 * 24 * 60 * 60 * 1000
    };
    return timeframeMap[timeframe] || timeframeMap['1h'];
  }

  private getSymbolName(symbol: string): string {
    const symbolNames: Record<string, string> = {
      'AAPL': 'Apple Inc.',
      'GOOGL': 'Alphabet Inc.',
      'MSFT': 'Microsoft Corporation',
      'TSLA': 'Tesla Inc.',
      'AMZN': 'Amazon.com Inc.',
      'NVDA': 'NVIDIA Corporation',
      'META': 'Meta Platforms Inc.',
      'NFLX': 'Netflix Inc.',
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum'
    };
    return symbolNames[symbol] || `${symbol} Corporation`;
  }
}
