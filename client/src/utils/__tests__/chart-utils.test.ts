import { ChartUtils } from '../chart-utils';

describe('ChartUtils', () => {
  describe('formatPrice', () => {
    it('formats price with 2 decimal places', () => {
      expect(ChartUtils.formatPrice(123.456)).toBe('123.46');
      expect(ChartUtils.formatPrice(123.4)).toBe('123.40');
      expect(ChartUtils.formatPrice(123)).toBe('123.00');
    });

    it('handles negative prices', () => {
      expect(ChartUtils.formatPrice(-123.456)).toBe('-123.46');
    });

    it('handles zero price', () => {
      expect(ChartUtils.formatPrice(0)).toBe('0.00');
    });
  });

  describe('formatVolume', () => {
    it('formats volume in millions', () => {
      expect(ChartUtils.formatVolume(1500000)).toBe('1.5M');
      expect(ChartUtils.formatVolume(2000000)).toBe('2.0M');
    });

    it('formats volume in thousands', () => {
      expect(ChartUtils.formatVolume(1500)).toBe('1.5K');
      expect(ChartUtils.formatVolume(2000)).toBe('2.0K');
    });

    it('formats volume in billions', () => {
      expect(ChartUtils.formatVolume(1500000000)).toBe('1.5B');
    });

    it('handles small volumes', () => {
      expect(ChartUtils.formatVolume(500)).toBe('500');
      expect(ChartUtils.formatVolume(0)).toBe('0');
    });
  });

  describe('formatPercentage', () => {
    it('formats positive percentages', () => {
      expect(ChartUtils.formatPercentage(5.25)).toBe('+5.25%');
      expect(ChartUtils.formatPercentage(0.5)).toBe('+0.50%');
    });

    it('formats negative percentages', () => {
      expect(ChartUtils.formatPercentage(-3.75)).toBe('-3.75%');
    });

    it('handles zero percentage', () => {
      expect(ChartUtils.formatPercentage(0)).toBe('0.00%');
    });
  });

  describe('calculateChange', () => {
    it('calculates positive change', () => {
      const result = ChartUtils.calculateChange(100, 105);
      expect(result.change).toBe(5);
      expect(result.changePercent).toBe(5);
    });

    it('calculates negative change', () => {
      const result = ChartUtils.calculateChange(100, 95);
      expect(result.change).toBe(-5);
      expect(result.changePercent).toBe(-5);
    });

    it('handles zero change', () => {
      const result = ChartUtils.calculateChange(100, 100);
      expect(result.change).toBe(0);
      expect(result.changePercent).toBe(0);
    });

    it('handles zero current price', () => {
      const result = ChartUtils.calculateChange(0, 100);
      expect(result.change).toBe(100);
      expect(result.changePercent).toBe(0);
    });
  });

  describe('getTimeframeMs', () => {
    it('returns correct milliseconds for timeframes', () => {
      expect(ChartUtils.getTimeframeMs('1m')).toBe(60000);
      expect(ChartUtils.getTimeframeMs('5m')).toBe(300000);
      expect(ChartUtils.getTimeframeMs('15m')).toBe(900000);
      expect(ChartUtils.getTimeframeMs('1h')).toBe(3600000);
      expect(ChartUtils.getTimeframeMs('4h')).toBe(14400000);
      expect(ChartUtils.getTimeframeMs('1d')).toBe(86400000);
    });

    it('returns default for unknown timeframe', () => {
      expect(ChartUtils.getTimeframeMs('unknown')).toBe(86400000);
    });
  });

  describe('isValidOHLCV', () => {
    it('validates correct OHLCV data', () => {
      const validData = {
        time: Date.now() / 1000,
        open: 100,
        high: 105,
        low: 95,
        close: 102,
        volume: 1000000,
      };
      expect(ChartUtils.isValidOHLCV(validData)).toBe(true);
    });

    it('rejects invalid OHLCV data', () => {
      const invalidData = {
        time: Date.now() / 1000,
        open: 100,
        high: 95, // High should be >= low
        low: 105, // Low should be <= high
        close: 102,
        volume: 1000000,
      };
      expect(ChartUtils.isValidOHLCV(invalidData)).toBe(false);
    });

    it('rejects data with negative volume', () => {
      const invalidData = {
        time: Date.now() / 1000,
        open: 100,
        high: 105,
        low: 95,
        close: 102,
        volume: -1000,
      };
      expect(ChartUtils.isValidOHLCV(invalidData)).toBe(false);
    });

    it('rejects data with missing fields', () => {
      const invalidData = {
        time: Date.now() / 1000,
        open: 100,
        high: 105,
        // Missing low, close, volume
      };
      expect(ChartUtils.isValidOHLCV(invalidData as any)).toBe(false);
    });
  });

  describe('generateTimeLabels', () => {
    it('generates correct time labels for intraday', () => {
      const startTime = new Date('2023-01-01T09:00:00Z').getTime() / 1000;
      const labels = ChartUtils.generateTimeLabels(startTime, '1h', 4);
      
      expect(labels).toHaveLength(4);
      expect(labels[0]).toBe('09:00');
      expect(labels[1]).toBe('10:00');
      expect(labels[2]).toBe('11:00');
      expect(labels[3]).toBe('12:00');
    });

    it('generates correct time labels for daily', () => {
      const startTime = new Date('2023-01-01T00:00:00Z').getTime() / 1000;
      const labels = ChartUtils.generateTimeLabels(startTime, '1d', 3);
      
      expect(labels).toHaveLength(3);
      expect(labels[0]).toBe('Jan 1');
      expect(labels[1]).toBe('Jan 2');
      expect(labels[2]).toBe('Jan 3');
    });
  });
});