import { WebSocketMessage, PriceUpdate } from '@/types/chart-types';

export class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private isConnected = false;

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        this.socket = new WebSocket(wsUrl);
        
        this.socket.onopen = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.notifyListeners('connected', { status: 'connected' });
          resolve();
        };
        
        this.socket.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        this.socket.onclose = () => {
          console.log('WebSocket disconnected');
          this.isConnected = false;
          this.notifyListeners('disconnected', { status: 'disconnected' });
          this.attemptReconnect();
        };
        
        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnected = false;
          this.notifyListeners('error', { error: 'Connection error' });
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
  }

  subscribe(symbol: string): void {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({
        type: 'subscribe',
        symbol
      }));
    }
  }

  unsubscribe(symbol: string): void {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({
        type: 'unsubscribe',
        symbol
      }));
    }
  }

  addListener(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  removeListener(event: string, callback: (data: any) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'price_update':
        this.notifyListeners('price_update', message.data);
        break;
      case 'trade':
        this.notifyListeners('trade', message.data);
        break;
      case 'order_book':
        this.notifyListeners('order_book', message.data);
        break;
      case 'subscribed':
        this.notifyListeners('subscribed', message);
        break;
      case 'unsubscribed':
        this.notifyListeners('unsubscribed', message);
        break;
      case 'error':
        this.notifyListeners('error', message);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private notifyListeners(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }
}
