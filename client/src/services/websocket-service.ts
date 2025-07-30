import { MarketDataPoint, TradeData, NewsEvent, WSMessage } from '@shared/types';

export type DataType = 'quotes' | 'trades' | 'news' | 'corporate_actions';

export interface SubscriptionCallback<T = any> {
  (data: T): void;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 5000;
  private maxReconnectAttempts: number = 5;
  private reconnectAttempts: number = 0;
  private subscriptions: Map<string, SubscriptionCallback[]> = new Map();
  private isConnecting: boolean = false;
  
  constructor() {
    this.connect();
  }
  
  private connect(): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }
    
    this.isConnecting = true;
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      
      // Resubscribe to all existing subscriptions
      this.resubscribeAll();
    };
    
    this.ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.isConnecting = false;
      this.ws = null;
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        setTimeout(() => this.connect(), this.reconnectInterval);
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.isConnecting = false;
    };
  }
  
  private handleMessage(message: WSMessage): void {
    switch (message.type) {
      case 'quote_update':
        this.notifySubscribers(`${message.symbol}_quotes`, message.data);
        break;
      case 'trade_update':
        this.notifySubscribers(`${message.symbol}_trades`, message.data);
        break;
      case 'news_update':
        this.notifySubscribers(`${message.symbol}_news`, message.data);
        break;
      case 'subscribed':
      case 'unsubscribed':
        console.log(`${message.type}: ${message.symbol} ${message.dataType}`);
        break;
      case 'error':
        console.error('WebSocket error:', message.message);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }
  
  private notifySubscribers<T>(key: string, data: T): void {
    const callbacks = this.subscriptions.get(key);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
  
  private resubscribeAll(): void {
    // Re-establish all subscriptions after reconnection
    for (const key of this.subscriptions.keys()) {
      const [symbol, dataType] = key.split('_');
      this.sendSubscribeMessage(symbol, dataType as DataType);
    }
  }
  
  private sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }
  
  private sendSubscribeMessage(symbol: string, dataType: DataType): void {
    this.sendMessage({
      type: `subscribe_${dataType}`,
      symbol,
      dataType
    });
  }
  
  // Public API methods
  subscribeToQuotes(symbol: string, callback: SubscriptionCallback<MarketDataPoint>): void {
    const key = `${symbol}_quotes`;
    
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, []);
      this.sendSubscribeMessage(symbol, 'quotes');
    }
    
    this.subscriptions.get(key)!.push(callback);
  }
  
  subscribeToTrades(symbol: string, callback: SubscriptionCallback<TradeData>): void {
    const key = `${symbol}_trades`;
    
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, []);
      this.sendSubscribeMessage(symbol, 'trades');
    }
    
    this.subscriptions.get(key)!.push(callback);
  }
  
  subscribeToNews(symbol: string, callback: SubscriptionCallback<NewsEvent>): void {
    const key = `${symbol}_news`;
    
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, []);
      this.sendSubscribeMessage(symbol, 'news');
    }
    
    this.subscriptions.get(key)!.push(callback);
  }
  
  unsubscribe(symbol: string, dataType: DataType, callback?: SubscriptionCallback): void {
    const key = `${symbol}_${dataType}`;
    const callbacks = this.subscriptions.get(key);
    
    if (callbacks) {
      if (callback) {
        // Remove specific callback
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
      
      // If no callbacks left, unsubscribe from server
      if (!callback || callbacks.length === 0) {
        this.subscriptions.delete(key);
        this.sendMessage({
          type: 'unsubscribe',
          symbol,
          dataType
        });
      }
    }
  }
  
  unsubscribeAll(symbol: string): void {
    const dataTypes: DataType[] = ['quotes', 'trades', 'news', 'corporate_actions'];
    dataTypes.forEach(dataType => this.unsubscribe(symbol, dataType));
  }
  
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
  }
  
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const webSocketService = new WebSocketService();