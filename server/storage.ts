import { 
  users, symbols, chartData, indicators, whiteLabels, trades, orderBook,
  type User, type InsertUser, type Symbol, type InsertSymbol, 
  type ChartData, type InsertChartData, type Indicator, type InsertIndicator,
  type WhiteLabel, type InsertWhiteLabel, type Trade, type InsertTrade,
  type OrderBook, type InsertOrderBook
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Symbol operations
  getSymbol(id: number): Promise<Symbol | undefined>;
  getSymbolBySymbol(symbol: string): Promise<Symbol | undefined>;
  getAllSymbols(): Promise<Symbol[]>;
  createSymbol(symbol: InsertSymbol): Promise<Symbol>;
  
  // Chart data operations
  getChartData(symbolId: number, timeframe: string, limit?: number): Promise<ChartData[]>;
  createChartData(data: InsertChartData): Promise<ChartData>;
  bulkCreateChartData(data: InsertChartData[]): Promise<ChartData[]>;
  
  // Indicator operations
  getAllIndicators(): Promise<Indicator[]>;
  createIndicator(indicator: InsertIndicator): Promise<Indicator>;
  
  // White label operations
  getWhiteLabel(id: number): Promise<WhiteLabel | undefined>;
  createWhiteLabel(whiteLabel: InsertWhiteLabel): Promise<WhiteLabel>;
  updateWhiteLabel(id: number, whiteLabel: Partial<InsertWhiteLabel>): Promise<WhiteLabel | undefined>;
  
  // Trade operations
  getRecentTrades(symbolId: number, limit?: number): Promise<Trade[]>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  
  // Order book operations
  getOrderBook(symbolId: number): Promise<OrderBook[]>;
  createOrderBookEntry(entry: InsertOrderBook): Promise<OrderBook>;
  clearOrderBook(symbolId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private symbols: Map<number, Symbol>;
  private chartDataMap: Map<string, ChartData[]>;
  private indicators: Map<number, Indicator>;
  private whiteLabels: Map<number, WhiteLabel>;
  private tradesMap: Map<number, Trade[]>;
  private orderBookMap: Map<number, OrderBook[]>;
  
  private currentUserId: number;
  private currentSymbolId: number;
  private currentChartDataId: number;
  private currentIndicatorId: number;
  private currentWhiteLabelId: number;
  private currentTradeId: number;
  private currentOrderBookId: number;

  constructor() {
    this.users = new Map();
    this.symbols = new Map();
    this.chartDataMap = new Map();
    this.indicators = new Map();
    this.whiteLabels = new Map();
    this.tradesMap = new Map();
    this.orderBookMap = new Map();
    
    this.currentUserId = 1;
    this.currentSymbolId = 1;
    this.currentChartDataId = 1;
    this.currentIndicatorId = 1;
    this.currentWhiteLabelId = 1;
    this.currentTradeId = 1;
    this.currentOrderBookId = 1;
    
    this.initializeMockData();
  }

  private initializeMockData() {
    // Add default symbols
    const defaultSymbols = [
      { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", sector: "Technology" },
      { symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ", sector: "Technology" },
      { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ", sector: "Technology" },
      { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ", sector: "Automotive" },
      { symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ", sector: "E-commerce" },
    ];
    
    defaultSymbols.forEach(symbolData => {
      const symbol: Symbol = {
        id: this.currentSymbolId++,
        symbol: symbolData.symbol,
        name: symbolData.name,
        exchange: symbolData.exchange,
        sector: symbolData.sector,
        isActive: true,
        createdAt: new Date(),
      };
      this.symbols.set(symbol.id, symbol);
    });
    
    // Add default indicators
    const defaultIndicators = [
      { name: "Moving Average (20)", type: "MA", parameters: { period: 20 } },
      { name: "RSI (14)", type: "RSI", parameters: { period: 14 } },
      { name: "MACD", type: "MACD", parameters: { fast: 12, slow: 26, signal: 9 } },
      { name: "Bollinger Bands", type: "BB", parameters: { period: 20, multiplier: 2 } },
    ];
    
    defaultIndicators.forEach(indicatorData => {
      const indicator: Indicator = {
        id: this.currentIndicatorId++,
        name: indicatorData.name,
        type: indicatorData.type,
        parameters: indicatorData.parameters,
        isActive: true,
      };
      this.indicators.set(indicator.id, indicator);
    });
    
    // Add default white label
    const defaultWhiteLabel: WhiteLabel = {
      id: this.currentWhiteLabelId++,
      name: "FinanceChart Pro",
      logo: null,
      primaryColor: "#3B82F6",
      secondaryColor: "#1E293B",
      theme: "dark",
      customCss: null,
      features: { 
        showToolbar: true, 
        showIndicators: true, 
        showVolume: true,
        showWatermark: true 
      },
      createdAt: new Date(),
    };
    this.whiteLabels.set(defaultWhiteLabel.id, defaultWhiteLabel);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { ...insertUser, id: this.currentUserId++ };
    this.users.set(user.id, user);
    return user;
  }

  // Symbol operations
  async getSymbol(id: number): Promise<Symbol | undefined> {
    return this.symbols.get(id);
  }

  async getSymbolBySymbol(symbol: string): Promise<Symbol | undefined> {
    return Array.from(this.symbols.values()).find(s => s.symbol === symbol);
  }

  async getAllSymbols(): Promise<Symbol[]> {
    return Array.from(this.symbols.values()).filter(s => s.isActive);
  }

  async createSymbol(insertSymbol: InsertSymbol): Promise<Symbol> {
    const symbol: Symbol = { 
      ...insertSymbol, 
      id: this.currentSymbolId++,
      exchange: insertSymbol.exchange || null,
      sector: insertSymbol.sector || null,
      isActive: true,
      createdAt: new Date()
    };
    this.symbols.set(symbol.id, symbol);
    return symbol;
  }

  // Chart data operations
  async getChartData(symbolId: number, timeframe: string, limit = 100): Promise<ChartData[]> {
    const key = `${symbolId}-${timeframe}`;
    const data = this.chartDataMap.get(key) || [];
    return data.slice(-limit).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createChartData(insertData: InsertChartData): Promise<ChartData> {
    const data: ChartData = { 
      ...insertData, 
      id: this.currentChartDataId++,
      open: insertData.open.toString(),
      high: insertData.high.toString(),
      low: insertData.low.toString(),
      close: insertData.close.toString(),
      volume: insertData.volume.toString(),
    };
    
    const key = `${data.symbolId}-${data.timeframe}`;
    if (!this.chartDataMap.has(key)) {
      this.chartDataMap.set(key, []);
    }
    this.chartDataMap.get(key)!.push(data);
    return data;
  }

  async bulkCreateChartData(insertDataArray: InsertChartData[]): Promise<ChartData[]> {
    const results: ChartData[] = [];
    for (const insertData of insertDataArray) {
      const result = await this.createChartData(insertData);
      results.push(result);
    }
    return results;
  }

  // Indicator operations
  async getAllIndicators(): Promise<Indicator[]> {
    return Array.from(this.indicators.values()).filter(i => i.isActive);
  }

  async createIndicator(insertIndicator: InsertIndicator): Promise<Indicator> {
    const indicator: Indicator = { 
      ...insertIndicator, 
      id: this.currentIndicatorId++,
      parameters: insertIndicator.parameters || {},
      isActive: true
    };
    this.indicators.set(indicator.id, indicator);
    return indicator;
  }

  // White label operations
  async getWhiteLabel(id: number): Promise<WhiteLabel | undefined> {
    return this.whiteLabels.get(id);
  }

  async createWhiteLabel(insertWhiteLabel: InsertWhiteLabel): Promise<WhiteLabel> {
    const whiteLabel: WhiteLabel = { 
      ...insertWhiteLabel, 
      id: this.currentWhiteLabelId++,
      logo: insertWhiteLabel.logo || null,
      primaryColor: insertWhiteLabel.primaryColor || null,
      secondaryColor: insertWhiteLabel.secondaryColor || null,
      theme: insertWhiteLabel.theme || null,
      customCss: insertWhiteLabel.customCss || null,
      features: insertWhiteLabel.features || {},
      createdAt: new Date()
    };
    this.whiteLabels.set(whiteLabel.id, whiteLabel);
    return whiteLabel;
  }

  async updateWhiteLabel(id: number, updateData: Partial<InsertWhiteLabel>): Promise<WhiteLabel | undefined> {
    const existing = this.whiteLabels.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData };
    this.whiteLabels.set(id, updated);
    return updated;
  }

  // Trade operations
  async getRecentTrades(symbolId: number, limit = 50): Promise<Trade[]> {
    const trades = this.tradesMap.get(symbolId) || [];
    return trades.slice(-limit).sort((a, b) => {
      const aTime = a.timestamp ? a.timestamp.getTime() : 0;
      const bTime = b.timestamp ? b.timestamp.getTime() : 0;
      return bTime - aTime;
    });
  }

  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const trade: Trade = { 
      ...insertTrade, 
      id: this.currentTradeId++,
      price: insertTrade.price.toString(),
      size: insertTrade.size.toString(),
      timestamp: new Date()
    };
    
    if (!this.tradesMap.has(trade.symbolId)) {
      this.tradesMap.set(trade.symbolId, []);
    }
    this.tradesMap.get(trade.symbolId)!.push(trade);
    return trade;
  }

  // Order book operations
  async getOrderBook(symbolId: number): Promise<OrderBook[]> {
    return this.orderBookMap.get(symbolId) || [];
  }

  async createOrderBookEntry(insertEntry: InsertOrderBook): Promise<OrderBook> {
    const entry: OrderBook = { 
      ...insertEntry, 
      id: this.currentOrderBookId++,
      price: insertEntry.price.toString(),
      size: insertEntry.size.toString(),
      timestamp: new Date()
    };
    
    if (!this.orderBookMap.has(entry.symbolId)) {
      this.orderBookMap.set(entry.symbolId, []);
    }
    this.orderBookMap.get(entry.symbolId)!.push(entry);
    return entry;
  }

  async clearOrderBook(symbolId: number): Promise<void> {
    this.orderBookMap.set(symbolId, []);
  }
}

export const storage = new MemStorage();
