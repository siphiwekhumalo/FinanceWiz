import { apiRequest } from '@/lib/queryClient';
import { ChartDataPoint, VolumeDataPoint, SymbolData } from '@/types/chart-types';
import { DummyDataService } from './dummy-data-service';

export class ChartService {
  private static instance: ChartService;
  public dummyService: DummyDataService;
  
  private constructor() {
    this.dummyService = DummyDataService.getInstance();
  }
  
  static getInstance(): ChartService {
    if (!ChartService.instance) {
      ChartService.instance = new ChartService();
    }
    return ChartService.instance;
  }

  async getSymbols(): Promise<any[]> {
    const response = await apiRequest('GET', '/api/symbols');
    return response.json();
  }

  async getSymbol(symbol: string): Promise<any> {
    const response = await apiRequest('GET', `/api/symbols/${symbol}`);
    return response.json();
  }

  async getChartData(
    symbolId: number, 
    timeframe: string, 
    useDummy: boolean = true,
    limit: number = 100
  ): Promise<ChartDataPoint[]> {
    if (useDummy) {
      return this.dummyService.generateChartData('AAPL', timeframe, limit);
    }
    
    const response = await apiRequest('GET', `/api/chart-data/${symbolId}/${timeframe}?limit=${limit}`);
    const data = await response.json();
    
    return data.map((point: any) => ({
      time: Math.floor(new Date(point.timestamp).getTime() / 1000),
      open: parseFloat(point.open),
      high: parseFloat(point.high),
      low: parseFloat(point.low),
      close: parseFloat(point.close),
      volume: parseInt(point.volume)
    }));
  }

  async generateDummyData(symbolId: number, timeframe: string, count: number = 100): Promise<any> {
    const response = await apiRequest('POST', `/api/generate-dummy-data/${symbolId}`, {
      timeframe,
      count
    });
    return response.json();
  }

  async getIndicators(): Promise<any[]> {
    const response = await apiRequest('GET', '/api/indicators');
    return response.json();
  }

  async getWhiteLabel(id: number): Promise<any> {
    const response = await apiRequest('GET', `/api/white-label/${id}`);
    return response.json();
  }

  async updateWhiteLabel(id: number, config: any): Promise<any> {
    const response = await apiRequest('PUT', `/api/white-label/${id}`, config);
    return response.json();
  }

  async getTrades(symbolId: number, limit: number = 50): Promise<any[]> {
    const response = await apiRequest('GET', `/api/trades/${symbolId}?limit=${limit}`);
    return response.json();
  }

  async getOrderBook(symbolId: number): Promise<any[]> {
    const response = await apiRequest('GET', `/api/order-book/${symbolId}`);
    return response.json();
  }

  getVolumeData(chartData: ChartDataPoint[]): VolumeDataPoint[] {
    return this.dummyService.generateVolumeData(chartData);
  }

  getSymbolData(symbol: string): SymbolData {
    return this.dummyService.generateSymbolData(symbol);
  }

  getOrderBookData(symbol: string) {
    return this.dummyService.generateOrderBook(symbol);
  }

  getRecentTrades(symbol: string, count: number = 20) {
    return this.dummyService.generateRecentTrades(symbol, count);
  }

  exportChart(format: 'png' | 'pdf' | 'svg' = 'png'): void {
    // Implementation would depend on the chart library being used
    console.log(`Exporting chart as ${format}`);
  }

  generateEmbedCode(config: any): string {
    const embedConfig = {
      symbol: config.symbol,
      chartType: config.chartType,
      timeframe: config.timeframe,
      showToolbar: config.showToolbar,
      showIndicators: config.showIndicators,
      showVolume: config.showVolume,
      theme: config.theme,
      primaryColor: config.primaryColor
    };
    
    return `<iframe src="${window.location.origin}/embed?${new URLSearchParams(embedConfig).toString()}" width="800" height="600" frameborder="0"></iframe>`;
  }
}
