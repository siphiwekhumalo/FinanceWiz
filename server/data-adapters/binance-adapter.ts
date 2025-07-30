import { BaseDataAdapter, MarketDataPoint, TradeData } from './base-adapter';
import { WebSocket } from 'ws';

export class BinanceAdapter extends BaseDataAdapter {
  private wsConnections: Map<string, WebSocket> = new Map();
  private baseUrl = 'https://api.binance.com';
  private wsUrl = 'wss://stream.binance.com:9443/ws/';
  
  async connect(): Promise<void> {
    try {
      // Test connection with exchange info
      const response = await fetch(`${this.baseUrl}/api/v3/exchangeInfo`);
      const data = await response.json();
      
      if (!data.symbols) {
        throw new Error('Invalid response from Binance API');
      }
      
      this.isConnected = true;
      console.log('Binance adapter connected successfully');
    } catch (error) {
      throw new Error(`Failed to connect to Binance: ${error}`);
    }
  }
  
  async disconnect(): Promise<void> {
    this.wsConnections.forEach(ws => ws.close());
    this.wsConnections.clear();
    this.isConnected = false;
    this.subscriptions.clear();
    console.log('Binance adapter disconnected');
  }
  
  async getHistoricalData(symbol: string, timeframe: string, start: Date, end: Date): Promise<MarketDataPoint[]> {
    if (!this.isConnected) {
      throw new Error('Adapter not connected');
    }
    
    const intervalMap: Record<string, string> = {
      '1m': '1m',
      '5m': '5m',
      '15m': '15m',
      '1h': '1h',
      '4h': '4h',
      '1d': '1d',
      '1w': '1w',
      '1M': '1M'
    };
    
    const interval = intervalMap[timeframe] || '1h';
    const binanceSymbol = this.formatSymbol(symbol);
    
    try {
      const url = `${this.baseUrl}/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&startTime=${start.getTime()}&endTime=${end.getTime()}&limit=1000`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from Binance');
      }
      
      return data.map(kline => ({
        symbol,
        timestamp: new Date(kline[0]),
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
        source: 'binance'
      }));
    } catch (error) {
      throw new Error(`Failed to fetch historical data: ${error}`);
    }
  }
  
  async getRealtimeQuote(symbol: string): Promise<MarketDataPoint | null> {
    if (!this.isConnected) {
      throw new Error('Adapter not connected');
    }
    
    const binanceSymbol = this.formatSymbol(symbol);
    
    try {
      const response = await fetch(`${this.baseUrl}/api/v3/ticker/24hr?symbol=${binanceSymbol}`);
      const data = await response.json();
      
      if (data.code) {
        return null; // Symbol not found or error
      }
      
      return {
        symbol,
        timestamp: new Date(),
        open: parseFloat(data.openPrice),
        high: parseFloat(data.highPrice),
        low: parseFloat(data.lowPrice),
        close: parseFloat(data.lastPrice),
        volume: parseFloat(data.volume),
        source: 'binance'
      };
    } catch (error) {
      console.error(`Failed to fetch realtime quote for ${symbol}:`, error);
      return null;
    }
  }
  
  async subscribe(subscription: any): Promise<void> {
    this.addSubscription(subscription);
    
    const binanceSymbol = this.formatSymbol(subscription.symbol).toLowerCase();
    
    if (subscription.dataType === 'quotes') {
      this.subscribeToKlines(subscription.symbol, binanceSymbol);
    } else if (subscription.dataType === 'trades') {
      this.subscribeToTrades(subscription.symbol, binanceSymbol);
    }
  }
  
  async unsubscribe(symbol: string, dataType: string): Promise<void> {
    this.removeSubscription(symbol, dataType);
    
    const binanceSymbol = this.formatSymbol(symbol).toLowerCase();
    const wsKey = `${binanceSymbol}_${dataType}`;
    
    const ws = this.wsConnections.get(wsKey);
    if (ws) {
      ws.close();
      this.wsConnections.delete(wsKey);
    }
  }
  
  private subscribeToKlines(symbol: string, binanceSymbol: string): void {
    const wsKey = `${binanceSymbol}_quotes`;
    const ws = new WebSocket(`${this.wsUrl}${binanceSymbol}@kline_1m`);
    
    ws.on('open', () => {
      console.log(`WebSocket connected for ${symbol} klines`);
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        const kline = message.k;
        
        if (kline.x) { // Kline is closed
          const marketData: MarketDataPoint = {
            symbol,
            timestamp: new Date(kline.t),
            open: parseFloat(kline.o),
            high: parseFloat(kline.h),
            low: parseFloat(kline.l),
            close: parseFloat(kline.c),
            volume: parseFloat(kline.v),
            source: 'binance'
          };
          
          this.notifySubscribers(symbol, 'quotes', marketData);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    ws.on('error', (error) => {
      console.error(`WebSocket error for ${symbol}:`, error);
    });
    
    ws.on('close', () => {
      console.log(`WebSocket closed for ${symbol} klines`);
      this.wsConnections.delete(wsKey);
    });
    
    this.wsConnections.set(wsKey, ws);
  }
  
  private subscribeToTrades(symbol: string, binanceSymbol: string): void {
    const wsKey = `${binanceSymbol}_trades`;
    const ws = new WebSocket(`${this.wsUrl}${binanceSymbol}@trade`);
    
    ws.on('open', () => {
      console.log(`WebSocket connected for ${symbol} trades`);
    });
    
    ws.on('message', (data) => {
      try {
        const trade = JSON.parse(data.toString());
        
        const tradeData: TradeData = {
          symbol,
          timestamp: new Date(trade.T),
          price: parseFloat(trade.p),
          size: parseFloat(trade.q),
          side: trade.m ? 'sell' : 'buy', // m = true means buyer is market maker (sell)
          source: 'binance'
        };
        
        this.notifySubscribers(symbol, 'trades', tradeData);
      } catch (error) {
        console.error('Error parsing trade message:', error);
      }
    });
    
    ws.on('error', (error) => {
      console.error(`WebSocket error for ${symbol} trades:`, error);
    });
    
    ws.on('close', () => {
      console.log(`WebSocket closed for ${symbol} trades`);
      this.wsConnections.delete(wsKey);
    });
    
    this.wsConnections.set(wsKey, ws);
  }
  
  private formatSymbol(symbol: string): string {
    // Convert from standard format (e.g., BTC/USDT) to Binance format (BTCUSDT)
    return symbol.replace('/', '').toUpperCase();
  }
  
  async validateSymbol(symbol: string): Promise<boolean> {
    try {
      const binanceSymbol = this.formatSymbol(symbol);
      const response = await fetch(`${this.baseUrl}/api/v3/exchangeInfo?symbol=${binanceSymbol}`);
      const data = await response.json();
      return data.symbols && data.symbols.length > 0;
    } catch {
      return false;
    }
  }
}