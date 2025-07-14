import { 
  CompareSymbol, 
  TechnicalIndicator, 
  BacktestStrategy, 
  BacktestResults,
  MarketEvent,
  PriceGap,
  ReplaySession,
  ChartNote,
  ThemeCustomization,
  RealTimeUpdate,
  ExportOptions
} from '@/types/advanced-types';
import { ChartDataPoint, VolumeDataPoint } from '@/types/chart-types';

export class AdvancedFeaturesService {
  private static instance: AdvancedFeaturesService;
  private compareSymbols: Map<string, CompareSymbol> = new Map();
  private indicators: Map<string, TechnicalIndicator> = new Map();
  private marketEvents: Map<string, MarketEvent[]> = new Map();
  private priceGaps: Map<string, PriceGap[]> = new Map();
  private chartNotes: Map<string, ChartNote[]> = new Map();
  private themes: Map<string, ThemeCustomization> = new Map();

  static getInstance(): AdvancedFeaturesService {
    if (!AdvancedFeaturesService.instance) {
      AdvancedFeaturesService.instance = new AdvancedFeaturesService();
    }
    return AdvancedFeaturesService.instance;
  }

  private constructor() {
    this.initializeDefaultThemes();
    this.initializeDefaultIndicators();
  }

  // Compare Mode Implementation
  async addCompareSymbol(symbol: string, baseSymbol: string, compareMode: 'percentage' | 'price' = 'percentage'): Promise<CompareSymbol> {
    const symbolData = await this.fetchSymbolData(symbol);
    const baseData = await this.fetchSymbolData(baseSymbol);
    
    const compareSymbol: CompareSymbol = {
      id: `compare_${symbol}_${Date.now()}`,
      symbol,
      name: symbolData.name,
      color: this.generateRandomColor(),
      visible: true,
      data: symbolData.data,
      normalizedData: this.normalizeData(symbolData.data, baseData.data, compareMode),
      basePrice: baseData.data[0]?.close || 0,
      compareMode
    };

    this.compareSymbols.set(compareSymbol.id, compareSymbol);
    return compareSymbol;
  }

  removeCompareSymbol(symbolId: string): void {
    this.compareSymbols.delete(symbolId);
  }

  getCompareSymbols(): CompareSymbol[] {
    return Array.from(this.compareSymbols.values());
  }

  toggleCompareSymbolVisibility(symbolId: string): void {
    const symbol = this.compareSymbols.get(symbolId);
    if (symbol) {
      symbol.visible = !symbol.visible;
    }
  }

  // Technical Indicators Implementation
  addIndicator(type: string, parameters: Record<string, any>): TechnicalIndicator {
    const indicator: TechnicalIndicator = {
      id: `indicator_${type}_${Date.now()}`,
      name: this.getIndicatorName(type),
      type: this.getIndicatorType(type),
      parameters,
      data: [],
      color: this.generateRandomColor(),
      visible: true,
      settings: { ...parameters }
    };

    this.indicators.set(indicator.id, indicator);
    return indicator;
  }

  calculateIndicator(indicatorId: string, data: ChartDataPoint[]): number[] {
    const indicator = this.indicators.get(indicatorId);
    if (!indicator) return [];

    switch (indicator.name) {
      case 'Simple Moving Average':
        return this.calculateSMA(data, indicator.settings.period || 20);
      case 'Exponential Moving Average':
        return this.calculateEMA(data, indicator.settings.period || 20);
      case 'Relative Strength Index':
        return this.calculateRSI(data, indicator.settings.period || 14);
      case 'MACD':
        return this.calculateMACD(data, indicator.settings);
      case 'Bollinger Bands':
        return this.calculateBollingerBands(data, indicator.settings);
      case 'Volume Weighted Average Price':
        return this.calculateVWAP(data);
      default:
        return [];
    }
  }

  // Strategy Backtesting Implementation
  async runBacktest(strategy: BacktestStrategy, symbol: string, timeframe: string): Promise<BacktestResults> {
    const data = await this.fetchSymbolData(symbol);
    const results: BacktestResults = {
      totalTrades: 0,
      winRate: 0,
      profitLoss: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
      trades: []
    };

    let position: 'long' | 'short' | null = null;
    let entryPrice = 0;
    let entryTime = 0;

    for (let i = 0; i < data.data.length; i++) {
      const currentBar = data.data[i];
      
      // Check entry conditions
      if (!position && this.evaluateConditions(strategy.conditions.entry, data.data, i)) {
        position = 'long'; // Simplified for demo
        entryPrice = currentBar.close;
        entryTime = currentBar.time;
      }

      // Check exit conditions
      if (position && this.evaluateConditions(strategy.conditions.exit, data.data, i)) {
        const exitPrice = currentBar.close;
        const profit = position === 'long' ? exitPrice - entryPrice : entryPrice - exitPrice;
        
        results.trades.push({
          entryTime,
          exitTime: currentBar.time,
          entryPrice,
          exitPrice,
          profit,
          side: position
        });

        results.totalTrades++;
        results.profitLoss += profit;
        position = null;
      }
    }

    // Calculate statistics
    const winningTrades = results.trades.filter(t => t.profit > 0);
    results.winRate = winningTrades.length / results.totalTrades;
    results.maxDrawdown = this.calculateMaxDrawdown(results.trades);
    results.sharpeRatio = this.calculateSharpeRatio(results.trades);

    return results;
  }

  // Market Events Implementation
  async getMarketEvents(symbol: string, startTime: number, endTime: number): Promise<MarketEvent[]> {
    const events = this.marketEvents.get(symbol) || [];
    return events.filter(event => 
      event.timestamp >= startTime && event.timestamp <= endTime
    );
  }

  addMarketEvent(event: MarketEvent): void {
    const events = this.marketEvents.get(event.symbol) || [];
    events.push(event);
    this.marketEvents.set(event.symbol, events);
  }

  // Price Gap Detection
  detectPriceGaps(data: ChartDataPoint[], threshold: number = 0.02): PriceGap[] {
    const gaps: PriceGap[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const previous = data[i - 1];
      const current = data[i];
      
      const gapPercent = Math.abs(current.open - previous.close) / previous.close;
      
      if (gapPercent > threshold) {
        gaps.push({
          id: `gap_${i}_${Date.now()}`,
          timestamp: current.time,
          gapType: current.open > previous.close ? 'up' : 'down',
          gapSize: Math.abs(current.open - previous.close),
          gapPercent,
          previousClose: previous.close,
          currentOpen: current.open,
          filled: false
        });
      }
    }
    
    return gaps;
  }

  // Replay Mode Implementation
  createReplaySession(symbol: string, startTime: number, endTime: number): ReplaySession {
    const session: ReplaySession = {
      id: `replay_${symbol}_${Date.now()}`,
      symbol,
      startTime,
      endTime,
      currentTime: startTime,
      speed: 1,
      isPlaying: false,
      data: [],
      currentIndex: 0
    };

    return session;
  }

  // Chart Notes Implementation
  addChartNote(symbol: string, timestamp: number, price: number, text: string, author: string): ChartNote {
    const note: ChartNote = {
      id: `note_${timestamp}_${Date.now()}`,
      timestamp,
      price,
      text,
      color: '#ffeb3b',
      author,
      created: Date.now()
    };

    const notes = this.chartNotes.get(symbol) || [];
    notes.push(note);
    this.chartNotes.set(symbol, notes);

    return note;
  }

  getChartNotes(symbol: string): ChartNote[] {
    return this.chartNotes.get(symbol) || [];
  }

  // Theme Customization
  createCustomTheme(theme: ThemeCustomization): void {
    this.themes.set(theme.id, theme);
  }

  getTheme(themeId: string): ThemeCustomization | null {
    return this.themes.get(themeId) || null;
  }

  getAllThemes(): ThemeCustomization[] {
    return Array.from(this.themes.values());
  }

  // Export Options
  async exportChart(options: ExportOptions): Promise<Blob> {
    // Implementation would depend on the chart library
    // For demonstration, return a mock blob
    return new Blob(['chart data'], { type: 'application/octet-stream' });
  }

  // Real-time Updates
  processRealTimeUpdate(update: RealTimeUpdate): void {
    // Process real-time market data
    // This would integrate with WebSocket service
    console.log('Processing real-time update:', update);
  }

  // Private helper methods
  private async fetchSymbolData(symbol: string): Promise<{ name: string; data: ChartDataPoint[] }> {
    // Mock implementation - in real app, this would fetch from API
    return {
      name: symbol,
      data: this.generateMockData(symbol)
    };
  }

  private generateMockData(symbol: string): ChartDataPoint[] {
    const data: ChartDataPoint[] = [];
    let basePrice = 100;
    const now = Date.now();

    for (let i = 0; i < 100; i++) {
      const timestamp = now - (100 - i) * 60000;
      const volatility = 0.02;
      const change = (Math.random() - 0.5) * 2 * volatility;
      
      basePrice *= (1 + change);
      const high = basePrice * (1 + Math.random() * 0.01);
      const low = basePrice * (1 - Math.random() * 0.01);
      
      data.push({
        time: timestamp / 1000,
        open: basePrice,
        high,
        low,
        close: basePrice,
        volume: Math.random() * 1000000
      });
    }

    return data;
  }

  private normalizeData(data: ChartDataPoint[], baseData: ChartDataPoint[], mode: 'percentage' | 'price'): ChartDataPoint[] {
    if (mode === 'percentage') {
      const basePrice = baseData[0]?.close || 0;
      return data.map(point => ({
        ...point,
        open: ((point.open - basePrice) / basePrice) * 100,
        high: ((point.high - basePrice) / basePrice) * 100,
        low: ((point.low - basePrice) / basePrice) * 100,
        close: ((point.close - basePrice) / basePrice) * 100
      }));
    }
    return data; // Return as-is for price mode
  }

  private generateRandomColor(): string {
    const colors = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#00BCD4'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private getIndicatorName(type: string): string {
    const names: Record<string, string> = {
      'sma': 'Simple Moving Average',
      'ema': 'Exponential Moving Average',
      'rsi': 'Relative Strength Index',
      'macd': 'MACD',
      'bb': 'Bollinger Bands',
      'vwap': 'Volume Weighted Average Price'
    };
    return names[type] || type;
  }

  private getIndicatorType(type: string): 'overlay' | 'oscillator' {
    const overlays = ['sma', 'ema', 'bb', 'vwap'];
    return overlays.includes(type) ? 'overlay' : 'oscillator';
  }

  // Technical Analysis Calculations
  private calculateSMA(data: ChartDataPoint[], period: number): number[] {
    const sma: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        sma.push(0);
      } else {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, point) => acc + point.close, 0);
        sma.push(sum / period);
      }
    }
    return sma;
  }

  private calculateEMA(data: ChartDataPoint[], period: number): number[] {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    ema[0] = data[0].close;
    for (let i = 1; i < data.length; i++) {
      ema[i] = (data[i].close - ema[i - 1]) * multiplier + ema[i - 1];
    }
    return ema;
  }

  private calculateRSI(data: ChartDataPoint[], period: number): number[] {
    const rsi: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    for (let i = 0; i < gains.length; i++) {
      if (i < period - 1) {
        rsi.push(0);
      } else {
        const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b) / period;
        const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b) / period;
        
        if (avgLoss === 0) {
          rsi.push(100);
        } else {
          const rs = avgGain / avgLoss;
          rsi.push(100 - (100 / (1 + rs)));
        }
      }
    }
    
    return [0, ...rsi];
  }

  private calculateMACD(data: ChartDataPoint[], settings: any): number[] {
    const fast = settings.fast || 12;
    const slow = settings.slow || 26;
    const signal = settings.signal || 9;
    
    const emaFast = this.calculateEMA(data, fast);
    const emaSlow = this.calculateEMA(data, slow);
    const macd = emaFast.map((val, i) => val - emaSlow[i]);
    
    return macd;
  }

  private calculateBollingerBands(data: ChartDataPoint[], settings: any): number[] {
    const period = settings.period || 20;
    const stdDev = settings.stdDev || 2;
    
    const sma = this.calculateSMA(data, period);
    const bands: number[] = [];
    
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        bands.push(0);
      } else {
        const slice = data.slice(i - period + 1, i + 1);
        const variance = slice.reduce((acc, point) => acc + Math.pow(point.close - sma[i], 2), 0) / period;
        const standardDeviation = Math.sqrt(variance);
        
        bands.push(sma[i] + (stdDev * standardDeviation)); // Upper band
      }
    }
    
    return bands;
  }

  private calculateVWAP(data: ChartDataPoint[]): number[] {
    const vwap: number[] = [];
    let cumulativeVolume = 0;
    let cumulativeVolumePrice = 0;
    
    for (let i = 0; i < data.length; i++) {
      const typicalPrice = (data[i].high + data[i].low + data[i].close) / 3;
      cumulativeVolumePrice += typicalPrice * data[i].volume;
      cumulativeVolume += data[i].volume;
      
      vwap.push(cumulativeVolumePrice / cumulativeVolume);
    }
    
    return vwap;
  }

  private evaluateConditions(conditions: any[], data: ChartDataPoint[], index: number): boolean {
    // Simplified condition evaluation
    return Math.random() > 0.8; // 20% chance for demo
  }

  private calculateMaxDrawdown(trades: any[]): number {
    let peak = 0;
    let maxDrawdown = 0;
    let runningPnL = 0;
    
    for (const trade of trades) {
      runningPnL += trade.profit;
      if (runningPnL > peak) {
        peak = runningPnL;
      }
      const drawdown = peak - runningPnL;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    return maxDrawdown;
  }

  private calculateSharpeRatio(trades: any[]): number {
    if (trades.length === 0) return 0;
    
    const returns = trades.map(trade => trade.profit);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((acc, ret) => acc + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev === 0 ? 0 : avgReturn / stdDev;
  }

  private initializeDefaultThemes(): void {
    const darkTheme: ThemeCustomization = {
      id: 'dark',
      name: 'Dark Theme',
      colors: {
        background: '#1a1a1a',
        foreground: '#ffffff',
        grid: '#333333',
        upColor: '#4caf50',
        downColor: '#f44336',
        textColor: '#ffffff',
        borderColor: '#555555',
        volumeColor: '#2196f3'
      },
      fonts: {
        primary: 'Inter, sans-serif',
        secondary: 'Monaco, monospace',
        size: 12
      },
      layout: {
        showGrid: true,
        showVolume: true,
        showCrosshair: true,
        chartType: 'candlestick'
      }
    };

    const lightTheme: ThemeCustomization = {
      id: 'light',
      name: 'Light Theme',
      colors: {
        background: '#ffffff',
        foreground: '#000000',
        grid: '#e0e0e0',
        upColor: '#4caf50',
        downColor: '#f44336',
        textColor: '#000000',
        borderColor: '#cccccc',
        volumeColor: '#2196f3'
      },
      fonts: {
        primary: 'Inter, sans-serif',
        secondary: 'Monaco, monospace',
        size: 12
      },
      layout: {
        showGrid: true,
        showVolume: true,
        showCrosshair: true,
        chartType: 'candlestick'
      }
    };

    this.themes.set('dark', darkTheme);
    this.themes.set('light', lightTheme);
  }

  private initializeDefaultIndicators(): void {
    // Initialize some default indicators
    const defaultIndicators = [
      { type: 'sma', params: { period: 20 } },
      { type: 'ema', params: { period: 20 } },
      { type: 'rsi', params: { period: 14 } },
      { type: 'macd', params: { fast: 12, slow: 26, signal: 9 } }
    ];

    defaultIndicators.forEach(indicator => {
      this.addIndicator(indicator.type, indicator.params);
    });
  }
}