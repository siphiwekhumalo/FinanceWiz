import { BaseDataAdapter, MarketDataPoint } from './base-adapter';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

export interface CSVConfig {
  filePath: string;
  delimiter?: string;
  headers?: string[];
  dateFormat?: string;
  timezone?: string;
}

export class CSVAdapter extends BaseDataAdapter {
  private config: CSVConfig;
  private data: Map<string, MarketDataPoint[]> = new Map();
  
  constructor(config: CSVConfig) {
    super();
    this.config = {
      delimiter: ',',
      dateFormat: 'YYYY-MM-DD HH:mm:ss',
      timezone: 'UTC',
      ...config
    };
  }
  
  async connect(): Promise<void> {
    try {
      await this.loadCSVData();
      this.isConnected = true;
      console.log('CSV adapter connected successfully');
    } catch (error) {
      throw new Error(`Failed to connect to CSV data source: ${error}`);
    }
  }
  
  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.data.clear();
    this.subscriptions.clear();
    console.log('CSV adapter disconnected');
  }
  
  async getHistoricalData(symbol: string, timeframe: string, start: Date, end: Date): Promise<MarketDataPoint[]> {
    if (!this.isConnected) {
      throw new Error('Adapter not connected');
    }
    
    const symbolData = this.data.get(symbol) || [];
    return symbolData.filter(point => 
      point.timestamp >= start && 
      point.timestamp <= end
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  async getRealtimeQuote(symbol: string): Promise<MarketDataPoint | null> {
    if (!this.isConnected) {
      throw new Error('Adapter not connected');
    }
    
    const symbolData = this.data.get(symbol);
    if (!symbolData || symbolData.length === 0) {
      return null;
    }
    
    // Return the latest data point
    return symbolData[symbolData.length - 1];
  }
  
  async subscribe(subscription: any): Promise<void> {
    this.addSubscription(subscription);
    
    // For CSV data, we can simulate real-time updates by replaying historical data
    if (subscription.dataType === 'quotes') {
      this.startReplay(subscription.symbol);
    }
  }
  
  async unsubscribe(symbol: string, dataType: string): Promise<void> {
    this.removeSubscription(symbol, dataType);
    // Stop any ongoing replay for this symbol
    clearInterval((this as any)[`replay_${symbol}`]);
  }
  
  private async loadCSVData(): Promise<void> {
    try {
      const fileContent = readFileSync(this.config.filePath, 'utf-8');
      const records = parse(fileContent, {
        columns: this.config.headers || true,
        delimiter: this.config.delimiter,
        skip_empty_lines: true
      });
      
      // Group data by symbol
      const symbolMap = new Map<string, MarketDataPoint[]>();
      
      for (const record of records) {
        const dataPoint = this.parseRecord(record);
        if (dataPoint) {
          if (!symbolMap.has(dataPoint.symbol)) {
            symbolMap.set(dataPoint.symbol, []);
          }
          symbolMap.get(dataPoint.symbol)!.push(dataPoint);
        }
      }
      
      // Sort data by timestamp for each symbol
      symbolMap.forEach((data, symbol) => {
        data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        this.data.set(symbol, data);
      });
      
      console.log(`Loaded data for ${symbolMap.size} symbols from CSV`);
    } catch (error) {
      throw new Error(`Failed to load CSV data: ${error}`);
    }
  }
  
  private parseRecord(record: any): MarketDataPoint | null {
    try {
      // Default column mappings - can be customized
      const symbol = record.symbol || record.Symbol || record.SYMBOL;
      const timestamp = this.parseDate(record.timestamp || record.date || record.Date);
      const open = parseFloat(record.open || record.Open || record.OPEN);
      const high = parseFloat(record.high || record.High || record.HIGH);
      const low = parseFloat(record.low || record.Low || record.LOW);
      const close = parseFloat(record.close || record.Close || record.CLOSE);
      const volume = parseFloat(record.volume || record.Volume || record.VOLUME || '0');
      
      if (!symbol || !timestamp || isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) {
        return null;
      }
      
      return {
        symbol,
        timestamp,
        open,
        high,
        low,
        close,
        volume,
        source: 'csv'
      };
    } catch (error) {
      console.error('Error parsing CSV record:', error);
      return null;
    }
  }
  
  private parseDate(dateString: string): Date {
    // Handle various date formats
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // Try parsing with specific format if needed
      throw new Error(`Invalid date format: ${dateString}`);
    }
    return date;
  }
  
  private startReplay(symbol: string): void {
    const symbolData = this.data.get(symbol);
    if (!symbolData || symbolData.length === 0) {
      return;
    }
    
    let currentIndex = 0;
    const replayInterval = setInterval(() => {
      if (currentIndex >= symbolData.length) {
        clearInterval(replayInterval);
        return;
      }
      
      const dataPoint = symbolData[currentIndex];
      this.notifySubscribers(symbol, 'quotes', {
        ...dataPoint,
        timestamp: new Date() // Use current time for simulation
      });
      
      currentIndex++;
    }, 1000); // Replay one data point per second
    
    // Store interval for cleanup
    (this as any)[`replay_${symbol}`] = replayInterval;
  }
  
  getAvailableSymbols(): string[] {
    return Array.from(this.data.keys());
  }
  
  getDataRange(symbol: string): { start: Date; end: Date } | null {
    const symbolData = this.data.get(symbol);
    if (!symbolData || symbolData.length === 0) {
      return null;
    }
    
    return {
      start: symbolData[0].timestamp,
      end: symbolData[symbolData.length - 1].timestamp
    };
  }
}