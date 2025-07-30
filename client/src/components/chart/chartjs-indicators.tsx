import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { ChartDataPoint, TechnicalIndicator } from '@/types/chart-types';
import { ChartUtils } from '@/utils/chart-utils';

interface ChartJSIndicatorsProps {
  data: ChartDataPoint[];
  indicators: TechnicalIndicator[];
  symbol: string;
  height?: number;
}

export function ChartJSIndicators({ data, indicators, symbol, height = 200 }: ChartJSIndicatorsProps) {
  const indicatorData = useMemo(() => {
    if (!data?.length || !indicators?.length) return null;

    const labels = data.map(point => new Date(point.time));
    const datasets: any[] = [];

    indicators.forEach(indicator => {
      if (!indicator.enabled) return;

      const values = calculateIndicator(data, indicator);
      
      datasets.push({
        label: indicator.name,
        data: values,
        borderColor: indicator.color,
        backgroundColor: `${indicator.color}20`,
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 4,
      });
    });

    return {
      labels,
      datasets
    };
  }, [data, indicators]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'start' as const,
        labels: {
          color: 'hsl(var(--foreground))',
          usePointStyle: true,
          boxHeight: 6,
        }
      },
      tooltip: {
        backgroundColor: 'hsl(var(--popover))',
        titleColor: 'hsl(var(--popover-foreground))',
        bodyColor: 'hsl(var(--popover-foreground))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${ChartUtils.formatPrice(value)}`;
          }
        }
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          displayFormats: {
            minute: 'HH:mm',
            hour: 'HH:mm',
            day: 'MMM dd',
            week: 'MMM dd',
            month: 'MMM yyyy'
          }
        },
        grid: {
          color: 'hsl(var(--border))',
          drawOnChartArea: false,
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          maxTicksLimit: 8,
        }
      },
      y: {
        position: 'right' as const,
        grid: {
          color: 'hsl(var(--border))',
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          callback: (value: any) => ChartUtils.formatPrice(value),
          maxTicksLimit: 6,
        }
      }
    }
  }), []);

  if (!indicatorData || indicatorData.datasets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No indicators enabled</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-800 rounded-lg p-3" style={{ height: `${height}px` }}>
      <div className="h-full">
        <Line data={indicatorData} options={options} height={height - 24} />
      </div>
    </div>
  );
}

// Technical indicator calculations
function calculateIndicator(data: ChartDataPoint[], indicator: TechnicalIndicator): number[] {
  const prices = data.map(point => point.close);
  const volumes = data.map(point => point.volume);

  switch (indicator.type) {
    case 'sma':
      return calculateSMA(prices, indicator.parameters.period || 20);
    case 'ema':
      return calculateEMA(prices, indicator.parameters.period || 20);
    case 'rsi':
      return calculateRSI(prices, indicator.parameters.period || 14);
    case 'macd':
      return calculateMACD(prices, indicator.parameters.fast || 12, indicator.parameters.slow || 26);
    case 'bollinger':
      return calculateBollingerBands(prices, indicator.parameters.period || 20, indicator.parameters.deviation || 2).middle;
    case 'volume_sma':
      return calculateSMA(volumes, indicator.parameters.period || 20);
    default:
      return prices;
  }
}

function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = [];
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(NaN);
    } else {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
  }
  
  return sma;
}

function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // Start with SMA for the first value
  let sum = 0;
  for (let i = 0; i < Math.min(period, prices.length); i++) {
    sum += prices[i];
    if (i < period - 1) {
      ema.push(NaN);
    } else {
      ema.push(sum / period);
    }
  }
  
  // Calculate EMA for remaining values
  for (let i = period; i < prices.length; i++) {
    const emaValue = (prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier));
    ema.push(emaValue);
  }
  
  return ema;
}

function calculateRSI(prices: number[], period: number): number[] {
  const rsi: number[] = [];
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      rsi.push(NaN);
      continue;
    }
    
    let gains = 0;
    let losses = 0;
    
    for (let j = i - period + 1; j <= i; j++) {
      const change = prices[j] - prices[j - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / avgLoss;
    const rsiValue = 100 - (100 / (1 + rs));
    
    rsi.push(rsiValue);
  }
  
  return rsi;
}

function calculateMACD(prices: number[], fastPeriod: number, slowPeriod: number): number[] {
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  const macd: number[] = [];
  
  for (let i = 0; i < prices.length; i++) {
    if (isNaN(fastEMA[i]) || isNaN(slowEMA[i])) {
      macd.push(NaN);
    } else {
      macd.push(fastEMA[i] - slowEMA[i]);
    }
  }
  
  return macd;
}

function calculateBollingerBands(prices: number[], period: number, deviation: number) {
  const sma = calculateSMA(prices, period);
  const upper: number[] = [];
  const lower: number[] = [];
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      upper.push(NaN);
      lower.push(NaN);
    } else {
      const slice = prices.slice(i - period + 1, i + 1);
      const mean = sma[i];
      const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      
      upper.push(mean + (stdDev * deviation));
      lower.push(mean - (stdDev * deviation));
    }
  }
  
  return { upper, middle: sma, lower };
}