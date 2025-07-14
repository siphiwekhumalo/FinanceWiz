import { ChartDataPoint, VolumeDataPoint, TechnicalIndicator } from '@/types/chart-types';

export class ChartUtils {
  static formatPrice(price: number, decimals: number = 2): string {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  static formatVolume(volume: number): string {
    if (volume >= 1000000) {
      return (volume / 1000000).toFixed(1) + 'M';
    } else if (volume >= 1000) {
      return (volume / 1000).toFixed(1) + 'K';
    }
    return volume.toString();
  }

  static formatPercentage(value: number): string {
    return (value > 0 ? '+' : '') + value.toFixed(2) + '%';
  }

  static formatTimestamp(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString();
  }

  static calculateMovingAverage(data: ChartDataPoint[], period: number): number[] {
    if (data.length < period) return [];
    
    const ma: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      ma.push(sum / period);
    }
    return ma;
  }

  static calculateRSI(data: ChartDataPoint[], period: number = 14): number[] {
    if (data.length < period + 1) return [];
    
    const rsi: number[] = [];
    let gains = 0;
    let losses = 0;
    
    // Calculate initial average gain and loss
    for (let i = 1; i <= period; i++) {
      const change = data[i].close - data[i - 1].close;
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    // Calculate RSI for the rest of the data
    for (let i = period; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;
      
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      
      const rs = avgGain / avgLoss;
      const rsiValue = 100 - (100 / (1 + rs));
      rsi.push(rsiValue);
    }
    
    return rsi;
  }

  static calculateMACD(data: ChartDataPoint[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
    if (data.length < slowPeriod) return { macd: [], signal: [], histogram: [] };
    
    const fastEMA = this.calculateEMA(data.map(d => d.close), fastPeriod);
    const slowEMA = this.calculateEMA(data.map(d => d.close), slowPeriod);
    
    const macdLine: number[] = [];
    for (let i = 0; i < Math.min(fastEMA.length, slowEMA.length); i++) {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }
    
    const signalLine = this.calculateEMA(macdLine, signalPeriod);
    const histogram: number[] = [];
    
    for (let i = 0; i < Math.min(macdLine.length, signalLine.length); i++) {
      histogram.push(macdLine[i] - signalLine[i]);
    }
    
    return { macd: macdLine, signal: signalLine, histogram };
  }

  static calculateBollingerBands(data: ChartDataPoint[], period: number = 20, multiplier: number = 2) {
    if (data.length < period) return { upper: [], middle: [], lower: [] };
    
    const middle = this.calculateMovingAverage(data, period);
    const upper: number[] = [];
    const lower: number[] = [];
    
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += Math.pow(data[i - j].close - middle[i - period + 1], 2);
      }
      const stdDev = Math.sqrt(sum / period);
      const ma = middle[i - period + 1];
      
      upper.push(ma + (multiplier * stdDev));
      lower.push(ma - (multiplier * stdDev));
    }
    
    return { upper, middle, lower };
  }

  private static calculateEMA(data: number[], period: number): number[] {
    if (data.length < period) return [];
    
    const multiplier = 2 / (period + 1);
    const ema: number[] = [];
    
    // First EMA is SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += data[i];
    }
    ema.push(sum / period);
    
    // Calculate EMA for the rest
    for (let i = period; i < data.length; i++) {
      const emaValue = (data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
      ema.push(emaValue);
    }
    
    return ema;
  }

  static getIndicatorColor(type: string): string {
    const colors: Record<string, string> = {
      'MA': '#3B82F6',
      'RSI': '#F59E0B',
      'MACD': '#8B5CF6',
      'BB': '#10B981',
      'EMA': '#EF4444',
      'SMA': '#06B6D4',
    };
    return colors[type] || '#6B7280';
  }

  static generateIndicatorId(): string {
    return 'indicator_' + Math.random().toString(36).substr(2, 9);
  }

  static validateIndicatorParameters(type: string, parameters: any): boolean {
    switch (type) {
      case 'MA':
      case 'EMA':
      case 'SMA':
        return parameters.period && parameters.period > 0;
      case 'RSI':
        return parameters.period && parameters.period > 0 && parameters.period <= 100;
      case 'MACD':
        return parameters.fast && parameters.slow && parameters.signal &&
               parameters.fast > 0 && parameters.slow > 0 && parameters.signal > 0 &&
               parameters.fast < parameters.slow;
      case 'BB':
        return parameters.period && parameters.multiplier &&
               parameters.period > 0 && parameters.multiplier > 0;
      default:
        return false;
    }
  }

  static formatMarketCap(value: number): string {
    if (value >= 1e12) {
      return (value / 1e12).toFixed(1) + 'T';
    } else if (value >= 1e9) {
      return (value / 1e9).toFixed(1) + 'B';
    } else if (value >= 1e6) {
      return (value / 1e6).toFixed(1) + 'M';
    } else if (value >= 1e3) {
      return (value / 1e3).toFixed(1) + 'K';
    }
    return value.toString();
  }
}
