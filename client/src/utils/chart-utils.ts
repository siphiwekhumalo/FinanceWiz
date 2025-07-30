import { ChartDataPoint } from '@/types/chart-types';

export class ChartUtils {
  static formatPrice(price: number): string {
    return price.toFixed(2);
  }

  static formatVolume(volume: number): string {
    if (volume >= 1000000000) {
      return `${(volume / 1000000000).toFixed(1)}B`;
    } else if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  }

  static formatMarketCap(marketCap: number): string {
    if (marketCap >= 1000000000000) {
      return `$${(marketCap / 1000000000000).toFixed(1)}T`;
    } else if (marketCap >= 1000000000) {
      return `$${(marketCap / 1000000000).toFixed(1)}B`;
    } else if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(1)}M`;
    } else if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(1)}K`;
    }
    return `$${marketCap.toFixed(0)}`;
  }

  static formatPercentage(percentage: number): string {
    const sign = percentage > 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  }

  static calculateChange(current: number, previous: number): { change: number; changePercent: number } {
    const change = current - previous;
    const changePercent = previous !== 0 ? (change / previous) * 100 : 0;
    return { change, changePercent };
  }

  static getTimeframeMs(timeframe: string): number {
    const timeframes: Record<string, number> = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
      '1w': 7 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000,
    };
    return timeframes[timeframe] || timeframes['1d'];
  }

  static isValidOHLCV(data: any): data is ChartDataPoint {
    return (
      typeof data === 'object' &&
      typeof data.time === 'number' &&
      typeof data.open === 'number' &&
      typeof data.high === 'number' &&
      typeof data.low === 'number' &&
      typeof data.close === 'number' &&
      typeof data.volume === 'number' &&
      data.high >= data.low &&
      data.high >= data.open &&
      data.high >= data.close &&
      data.low <= data.open &&
      data.low <= data.close &&
      data.volume >= 0
    );
  }

  static normalize(values: number[]): number[] {
    if (!values.length) return [];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    if (range === 0) return values.map(() => 0.5); // All values are the same
    
    return values.map(value => (value - min) / range);
  }

  static generateTimeLabels(startTime: number, timeframe: string, count: number): string[] {
    const labels: string[] = [];
    const intervalMs = this.getTimeframeMs(timeframe);
    
    for (let i = 0; i < count; i++) {
      const time = new Date((startTime + i * intervalMs / 1000) * 1000);
      
      if (timeframe.includes('m') || timeframe.includes('h')) {
        labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      } else if (timeframe === '1d' || timeframe === '1w') {
        labels.push(time.toLocaleDateString([], { month: 'short', day: 'numeric' }));
      } else {
        labels.push(time.toLocaleDateString([], { year: 'numeric' }));
      }
    }
    
    return labels;
  }

  static normalizeDataForComparison(data: ChartDataPoint[], baseValue?: number): ChartDataPoint[] {
    if (!data.length) return [];
    
    const base = baseValue || data[0].close;
    return data.map(point => ({
      ...point,
      open: ((point.open - base) / base) * 100,
      high: ((point.high - base) / base) * 100,
      low: ((point.low - base) / base) * 100,
      close: ((point.close - base) / base) * 100,
    }));
  }

  static calculateSMA(data: ChartDataPoint[], period: number): number[] {
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

  static calculateRSI(data: ChartDataPoint[], period: number = 14): number[] {
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
    
    return [0, ...rsi]; // Add 0 for first data point
  }

  static detectPricePatterns(data: ChartDataPoint[]): { type: string; confidence: number }[] {
    const patterns: { type: string; confidence: number }[] = [];
    
    if (data.length < 20) return patterns;
    
    // Simple pattern detection examples
    const recent = data.slice(-10);
    const closes = recent.map(d => d.close);
    
    // Ascending triangle
    const highs = recent.map(d => d.high);
    const lows = recent.map(d => d.low);
    
    if (this.isAscendingTriangle(highs, lows)) {
      patterns.push({ type: 'ascending-triangle', confidence: 0.7 });
    }
    
    // Head and shoulders
    if (this.isHeadAndShoulders(closes)) {
      patterns.push({ type: 'head-and-shoulders', confidence: 0.8 });
    }
    
    return patterns;
  }

  private static isAscendingTriangle(highs: number[], lows: number[]): boolean {
    // Simplified ascending triangle detection
    const avgHigh = highs.reduce((a, b) => a + b) / highs.length;
    const lowTrend = lows.slice(-5).every((low, i, arr) => i === 0 || low >= arr[i - 1]);
    const highResistance = highs.slice(-5).every(high => Math.abs(high - avgHigh) < avgHigh * 0.02);
    
    return lowTrend && highResistance;
  }

  private static isHeadAndShoulders(closes: number[]): boolean {
    if (closes.length < 7) return false;
    
    // Simplified head and shoulders detection
    const mid = Math.floor(closes.length / 2);
    const leftShoulder = closes.slice(0, mid - 1);
    const head = closes.slice(mid - 1, mid + 2);
    const rightShoulder = closes.slice(mid + 1);
    
    const leftMax = Math.max(...leftShoulder);
    const headMax = Math.max(...head);
    const rightMax = Math.max(...rightShoulder);
    
    return headMax > leftMax && headMax > rightMax && Math.abs(leftMax - rightMax) < leftMax * 0.05;
  }
}