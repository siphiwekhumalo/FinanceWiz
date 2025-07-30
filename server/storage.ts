import { 
  symbols, chartData, indicators, watchlists, whiteLabelConfigs, drawingObjects,
  type Symbol, type InsertSymbol, type ChartData, type InsertChartData, 
  type Indicator, type InsertIndicator, type Watchlist, type InsertWatchlist,
  type WhiteLabelConfig, type InsertWhiteLabelConfig, type DrawingObject, type InsertDrawingObject
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
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
  updateIndicator(id: number, indicator: Partial<InsertIndicator>): Promise<Indicator | undefined>;
  deleteIndicator(id: number): Promise<void>;
  
  // Watchlist operations
  getWatchlists(userId: string): Promise<Watchlist[]>;
  createWatchlist(watchlist: InsertWatchlist): Promise<Watchlist>;
  updateWatchlist(id: number, watchlist: Partial<InsertWatchlist>): Promise<Watchlist | undefined>;
  deleteWatchlist(id: number): Promise<void>;
  
  // White label operations
  getWhiteLabelConfig(id: number): Promise<WhiteLabelConfig | undefined>;
  getActiveWhiteLabelConfig(): Promise<WhiteLabelConfig | undefined>;
  createWhiteLabelConfig(config: InsertWhiteLabelConfig): Promise<WhiteLabelConfig>;
  updateWhiteLabelConfig(id: number, config: Partial<InsertWhiteLabelConfig>): Promise<WhiteLabelConfig | undefined>;
  
  // Drawing objects operations
  getDrawingObjects(symbolId: number, userId: string): Promise<DrawingObject[]>;
  createDrawingObject(object: InsertDrawingObject): Promise<DrawingObject>;
  updateDrawingObject(id: number, object: Partial<InsertDrawingObject>): Promise<DrawingObject | undefined>;
  deleteDrawingObject(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Symbol operations
  async getSymbol(id: number): Promise<Symbol | undefined> {
    const [symbol] = await db.select().from(symbols).where(eq(symbols.id, id));
    return symbol || undefined;
  }

  async getSymbolBySymbol(symbol: string): Promise<Symbol | undefined> {
    const [result] = await db.select().from(symbols).where(eq(symbols.symbol, symbol));
    return result || undefined;
  }

  async getAllSymbols(): Promise<Symbol[]> {
    return await db.select().from(symbols).where(eq(symbols.isActive, true));
  }

  async createSymbol(symbol: InsertSymbol): Promise<Symbol> {
    const [newSymbol] = await db.insert(symbols).values(symbol).returning();
    return newSymbol;
  }

  // Chart data operations
  async getChartData(symbolId: number, timeframe: string, limit: number = 100): Promise<ChartData[]> {
    return await db.select()
      .from(chartData)
      .where(and(eq(chartData.symbolId, symbolId), eq(chartData.timeframe, timeframe)))
      .orderBy(desc(chartData.timestamp))
      .limit(limit);
  }

  async createChartData(data: InsertChartData): Promise<ChartData> {
    const [newData] = await db.insert(chartData).values(data).returning();
    return newData;
  }

  async bulkCreateChartData(data: InsertChartData[]): Promise<ChartData[]> {
    return await db.insert(chartData).values(data).returning();
  }

  // Indicator operations
  async getAllIndicators(): Promise<Indicator[]> {
    return await db.select().from(indicators);
  }

  async createIndicator(indicator: InsertIndicator): Promise<Indicator> {
    const [newIndicator] = await db.insert(indicators).values(indicator).returning();
    return newIndicator;
  }

  async updateIndicator(id: number, indicator: Partial<InsertIndicator>): Promise<Indicator | undefined> {
    const [updated] = await db.update(indicators)
      .set({ ...indicator, updatedAt: new Date() })
      .where(eq(indicators.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteIndicator(id: number): Promise<void> {
    await db.delete(indicators).where(eq(indicators.id, id));
  }

  // Watchlist operations
  async getWatchlists(userId: string): Promise<Watchlist[]> {
    return await db.select().from(watchlists).where(eq(watchlists.userId, userId));
  }

  async createWatchlist(watchlist: InsertWatchlist): Promise<Watchlist> {
    const [newWatchlist] = await db.insert(watchlists).values(watchlist).returning();
    return newWatchlist;
  }

  async updateWatchlist(id: number, watchlist: Partial<InsertWatchlist>): Promise<Watchlist | undefined> {
    const [updated] = await db.update(watchlists)
      .set({ ...watchlist, updatedAt: new Date() })
      .where(eq(watchlists.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteWatchlist(id: number): Promise<void> {
    await db.delete(watchlists).where(eq(watchlists.id, id));
  }

  // White label operations
  async getWhiteLabelConfig(id: number): Promise<WhiteLabelConfig | undefined> {
    const [config] = await db.select().from(whiteLabelConfigs).where(eq(whiteLabelConfigs.id, id));
    return config || undefined;
  }

  async getActiveWhiteLabelConfig(): Promise<WhiteLabelConfig | undefined> {
    const [config] = await db.select().from(whiteLabelConfigs).where(eq(whiteLabelConfigs.isActive, true));
    return config || undefined;
  }

  async createWhiteLabelConfig(config: InsertWhiteLabelConfig): Promise<WhiteLabelConfig> {
    const [newConfig] = await db.insert(whiteLabelConfigs).values(config).returning();
    return newConfig;
  }

  async updateWhiteLabelConfig(id: number, config: Partial<InsertWhiteLabelConfig>): Promise<WhiteLabelConfig | undefined> {
    const [updated] = await db.update(whiteLabelConfigs)
      .set({ ...config, updatedAt: new Date() })
      .where(eq(whiteLabelConfigs.id, id))
      .returning();
    return updated || undefined;
  }

  // Drawing objects operations
  async getDrawingObjects(symbolId: number, userId: string): Promise<DrawingObject[]> {
    return await db.select()
      .from(drawingObjects)
      .where(and(eq(drawingObjects.symbolId, symbolId), eq(drawingObjects.userId, userId), eq(drawingObjects.isVisible, true)));
  }

  async createDrawingObject(object: InsertDrawingObject): Promise<DrawingObject> {
    const [newObject] = await db.insert(drawingObjects).values(object).returning();
    return newObject;
  }

  async updateDrawingObject(id: number, object: Partial<InsertDrawingObject>): Promise<DrawingObject | undefined> {
    const [updated] = await db.update(drawingObjects)
      .set({ ...object, updatedAt: new Date() })
      .where(eq(drawingObjects.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDrawingObject(id: number): Promise<void> {
    await db.delete(drawingObjects).where(eq(drawingObjects.id, id));
  }
}

export const storage = new DatabaseStorage();
