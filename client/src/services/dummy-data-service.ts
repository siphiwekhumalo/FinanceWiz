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
    
    // Ensure minimum 200 data points for better chart rendering
    const adjustedCount = Math.max(200, this.getAdjustedCount(timeframe, count));
    let currentPrice = this.basePrice;
    
    for (let i = adjustedCount; i > 0; i--) {
      const timestamp = now - (i * timeframeMs);
      const volatility = this.getVolatilityForTimeframe(timeframe);
      const change = (Math.random() - 0.5) * volatility;
      
      const open = currentPrice;
      const close = currentPrice * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
      const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
      const volume = this.getVolumeForTimeframe(timeframe);
      
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
      '1w': 7 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000
    };
    return timeframeMap[timeframe] || timeframeMap['1h'];
  }

  private getAdjustedCount(timeframe: string, baseCount: number): number {
    // Ensure we always have enough data points for scrolling (at least 200)
    const minCount = Math.max(200, baseCount);
    
    switch (timeframe) {
      case '1m': return Math.max(minCount, 500);
      case '5m': return Math.max(minCount, 400);
      case '15m': return Math.max(minCount, 300);
      case '1h': return Math.max(minCount, 250);
      case '4h': return Math.max(minCount, 200);
      case '1d': return Math.max(minCount, 200);
      case '1w': return Math.max(minCount, 200);
      case '1y': return Math.max(minCount, 200);
      default: return minCount;
    }
  }

  private getVolatilityForTimeframe(timeframe: string): number {
    switch (timeframe) {
      case '1m': return 0.005;
      case '5m': return 0.01;
      case '15m': return 0.015;
      case '1h': return 0.02;
      case '4h': return 0.03;
      case '1d': return 0.04;
      case '1w': return 0.06;
      case '1y': return 0.15;
      default: return 0.02;
    }
  }

  private getVolumeForTimeframe(timeframe: string): number {
    const base = Math.floor(Math.random() * 1000000) + 100000;
    switch (timeframe) {
      case '1m': return Math.floor(base * 0.1);
      case '5m': return Math.floor(base * 0.5);
      case '15m': return Math.floor(base * 1.5);
      case '1h': return Math.floor(base * 6);
      case '4h': return Math.floor(base * 24);
      case '1d': return Math.floor(base * 144);
      case '1w': return Math.floor(base * 1008);
      case '1y': return Math.floor(base * 52560);
      default: return base;
    }
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
