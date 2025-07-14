import { ChartService } from '../chart-service';
import { ChartDataPoint } from '@/types/chart-types';

describe('ChartService', () => {
  let chartService: ChartService;

  beforeEach(() => {
    chartService = ChartService.getInstance();
  });

  describe('getInstance', () => {
    it('returns the same instance (singleton)', () => {
      const instance1 = ChartService.getInstance();
      const instance2 = ChartService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getSymbols', () => {
    it('returns an array of symbols', async () => {
      const symbols = await chartService.getSymbols();
      expect(Array.isArray(symbols)).toBe(true);
      expect(symbols.length).toBeGreaterThan(0);
    });
  });

  describe('getSymbol', () => {
    it('returns symbol data for valid symbol', async () => {
      const symbol = await chartService.getSymbol('AAPL');
      expect(symbol).toBeDefined();
      expect(symbol.symbol).toBe('AAPL');
      expect(symbol.name).toBe('Apple Inc.');
    });
  });

  describe('getChartData', () => {
    it('returns chart data for valid parameters', async () => {
      const data = await chartService.getChartData('AAPL', '1d', 100);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(100);
      
      if (data.length > 0) {
        const point = data[0];
        expect(point).toHaveProperty('time');
        expect(point).toHaveProperty('open');
        expect(point).toHaveProperty('high');
        expect(point).toHaveProperty('low');
        expect(point).toHaveProperty('close');
        expect(point).toHaveProperty('volume');
      }
    });

    it('returns correct data structure', async () => {
      const data = await chartService.getChartData('AAPL', '1h', 50);
      expect(data).toHaveLength(50);
      
      data.forEach((point: ChartDataPoint) => {
        expect(typeof point.time).toBe('number');
        expect(typeof point.open).toBe('number');
        expect(typeof point.high).toBe('number');
        expect(typeof point.low).toBe('number');
        expect(typeof point.close).toBe('number');
        expect(typeof point.volume).toBe('number');
        expect(point.high).toBeGreaterThanOrEqual(point.low);
        expect(point.high).toBeGreaterThanOrEqual(point.open);
        expect(point.high).toBeGreaterThanOrEqual(point.close);
      });
    });
  });

  describe('getVolumeData', () => {
    it('transforms chart data to volume data', async () => {
      const chartData = await chartService.getChartData('AAPL', '1d', 10);
      const volumeData = chartService.getVolumeData(chartData);
      
      expect(volumeData).toHaveLength(chartData.length);
      
      volumeData.forEach((point, index) => {
        expect(point.time).toBe(chartData[index].time);
        expect(point.volume).toBe(chartData[index].volume);
        expect(typeof point.color).toBe('string');
      });
    });
  });

  describe('getSymbolData', () => {
    it('returns symbol data with price information', () => {
      const symbolData = chartService.getSymbolData('AAPL');
      
      expect(symbolData).toHaveProperty('symbol', 'AAPL');
      expect(symbolData).toHaveProperty('name', 'Apple Inc.');
      expect(symbolData).toHaveProperty('price');
      expect(symbolData).toHaveProperty('change');
      expect(symbolData).toHaveProperty('changePercent');
      expect(symbolData).toHaveProperty('volume');
      expect(typeof symbolData.price).toBe('number');
    });
  });

  describe('exportChart', () => {
    it('calls exportChart without throwing error', () => {
      expect(() => chartService.exportChart('png')).not.toThrow();
      expect(() => chartService.exportChart('pdf')).not.toThrow();
      expect(() => chartService.exportChart('svg')).not.toThrow();
    });
  });

  describe('generateEmbedCode', () => {
    it('generates embed code string', () => {
      const config = {
        symbol: 'AAPL',
        timeframe: '1d',
        chartType: 'candlestick',
        width: 800,
        height: 600,
      };
      
      const embedCode = chartService.generateEmbedCode(config);
      expect(typeof embedCode).toBe('string');
      expect(embedCode).toContain('iframe');
      expect(embedCode).toContain('800');
      expect(embedCode).toContain('600');
    });
  });
});