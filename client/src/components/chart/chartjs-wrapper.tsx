import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
  ChartOptions,
  ChartData,
} from 'chart.js';
import {
  Line,
  Bar,
  Doughnut,
  Pie,
  Radar,
  PolarArea,
  Scatter,
} from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { ChartDataPoint, ChartType } from '@/types/chart-types';
import { ChartUtils } from '@/utils/chart-utils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartJSWrapperProps {
  data: ChartDataPoint[];
  chartType: ChartType;
  symbol: string;
  className?: string;
  height?: number;
}

export function ChartJSWrapper({ data, chartType, symbol, className = '', height = 400 }: ChartJSWrapperProps) {
  // Prepare data for different chart types
  const { chartData, chartOptions } = useMemo(() => {
    if (!data?.length) return { chartData: null, chartOptions: {} };

    const labels = data.map(point => new Date(point.time));
    const prices = data.map(point => point.close);
    const volumes = data.map(point => point.volume);
    const highs = data.map(point => point.high);
    const lows = data.map(point => point.low);

    let resultData: any = null;
    let resultOptions: any = {};

    switch (chartType) {
      case 'line':
        resultData = {
          labels,
          datasets: [{
            label: symbol,
            data: prices,
            borderColor: 'hsl(var(--chart-success))',
            backgroundColor: 'hsla(var(--chart-success), 0.1)',
            borderWidth: 2,
            fill: false,
          }]
        };
        break;

      case 'area':
        resultData = {
          labels,
          datasets: [{
            label: symbol,
            data: prices,
            borderColor: 'hsl(var(--chart-success))',
            backgroundColor: 'hsla(var(--chart-success), 0.2)',
            borderWidth: 2,
            fill: true,
          }]
        };
        break;

      case 'bar':
        resultData = {
          labels,
          datasets: [{
            label: symbol,
            data: prices,
            backgroundColor: prices.map((price, i) => 
              i === 0 || price >= data[i-1]?.close 
                ? 'hsl(var(--chart-success))' 
                : 'hsl(var(--chart-danger))'
            ),
            borderColor: 'hsl(var(--chart-success))',
            borderWidth: 2,
          }]
        };
        break;

      case 'scatter':
        resultData = {
          datasets: [{
            label: `${symbol} Price vs Volume`,
            data: data.map(point => ({
              x: point.volume,
              y: point.close
            })),
            backgroundColor: 'hsl(var(--chart-success))',
            borderColor: 'hsl(var(--chart-success))',
          }]
        };
        resultOptions.scales = {
          x: {
            type: 'linear' as const,
            title: {
              display: true,
              text: 'Volume',
              color: 'hsl(var(--foreground))',
            },
            grid: { color: 'hsl(var(--border))' },
            ticks: { color: 'hsl(var(--muted-foreground))' }
          },
          y: {
            title: {
              display: true,
              text: 'Price',
              color: 'hsl(var(--foreground))',
            },
            grid: { color: 'hsl(var(--border))' },
            ticks: { 
              color: 'hsl(var(--muted-foreground))',
              callback: (value: any) => ChartUtils.formatPrice(value),
            }
          }
        };
        break;

      case 'doughnut':
      case 'pie':
        const segments = 5;
        const segmentSize = Math.ceil(data.length / segments);
        const segmentData = [];
        const segmentLabels = [];
        
        for (let i = 0; i < segments; i++) {
          const start = i * segmentSize;
          const end = Math.min(start + segmentSize, data.length);
          const segmentPrices = data.slice(start, end);
          const avgPrice = segmentPrices.reduce((sum, p) => sum + p.close, 0) / segmentPrices.length;
          
          segmentData.push(avgPrice);
          segmentLabels.push(`Period ${i + 1}`);
        }

        resultData = {
          labels: segmentLabels,
          datasets: [{
            data: segmentData,
            backgroundColor: [
              'hsl(var(--chart-success))',
              'hsl(var(--chart-danger))',
              'hsl(var(--chart-warning))',
              'hsl(var(--chart-info))',
              'hsl(var(--chart-neutral))',
            ],
            borderWidth: 2,
            borderColor: 'hsl(var(--chart-border))',
          }]
        };
        break;

      case 'radar':
        const metrics = {
          'Price': ChartUtils.normalize(prices),
          'Volume': ChartUtils.normalize(volumes),
          'High': ChartUtils.normalize(highs),
          'Low': ChartUtils.normalize(lows),
          'Volatility': ChartUtils.normalize(data.map(point => point.high - point.low)),
        };

        resultData = {
          labels: Object.keys(metrics),
          datasets: [{
            label: symbol,
            data: Object.values(metrics).map(arr => arr[arr.length - 1] || 0),
            borderColor: 'hsl(var(--chart-success))',
            backgroundColor: 'hsla(var(--chart-success), 0.2)',
            borderWidth: 2,
          }]
        };
        break;

      case 'polarArea':
        resultData = {
          labels: ['Open', 'High', 'Low', 'Close', 'Volume'],
          datasets: [{
            data: [
              data[data.length - 1]?.open || 0,
              data[data.length - 1]?.high || 0,
              data[data.length - 1]?.low || 0,
              data[data.length - 1]?.close || 0,
              (data[data.length - 1]?.volume || 0) / 1000000,
            ],
            backgroundColor: [
              'hsla(var(--chart-info), 0.8)',
              'hsla(var(--chart-success), 0.8)',
              'hsla(var(--chart-danger), 0.8)',
              'hsla(var(--chart-warning), 0.8)',
              'hsla(var(--chart-neutral), 0.8)',
            ],
            borderWidth: 2,
            borderColor: 'hsl(var(--chart-border))',
          }]
        };
        break;

      default:
        resultData = {
          labels,
          datasets: [{
            label: symbol,
            data: prices,
            borderColor: 'hsl(var(--chart-success))',
            backgroundColor: 'hsla(var(--chart-success), 0.1)',
            borderWidth: 2,
            fill: false,
          }]
        };
    }

    return { chartData: resultData, chartOptions: resultOptions };
  }, [data, chartType, symbol]);

  const options = useMemo(() => {
    const baseOptions: any = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            color: 'hsl(var(--foreground))',
            usePointStyle: true,
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
              const value = context.parsed.y || context.parsed;
              return `${context.dataset.label}: ${ChartUtils.formatPrice(value)}`;
            }
          }
        },
      },
    };

    // Add scales for cartesian charts
    if (!['doughnut', 'pie', 'radar', 'polarArea'].includes(chartType)) {
      baseOptions.scales = {
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
          },
          ticks: {
            color: 'hsl(var(--muted-foreground))',
          }
        },
        y: {
          grid: {
            color: 'hsl(var(--border))',
          },
          ticks: {
            color: 'hsl(var(--muted-foreground))',
            callback: (value: any) => ChartUtils.formatPrice(value),
          }
        }
      };
    }

    // Merge with chart-specific options
    return { ...baseOptions, ...chartOptions };
  }, [chartType, chartOptions]);

  if (!chartData) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const renderChart = () => {
    const commonProps = {
      data: chartData as any,
      options,
      height,
    };

    switch (chartType) {
      case 'line':
      case 'area':
        return <Line {...commonProps} />;
      case 'bar':
        return <Bar {...commonProps} />;
      case 'doughnut':
        return <Doughnut {...commonProps} />;
      case 'pie':
        return <Pie {...commonProps} />;
      case 'radar':
        return <Radar {...commonProps} />;
      case 'polarArea':
        return <PolarArea {...commonProps} />;
      case 'scatter':
        return <Scatter {...commonProps} />;
      default:
        return <Line {...commonProps} />;
    }
  };

  return (
    <div className={`w-full ${className}`} style={{ height: `${height}px` }}>
      {renderChart()}
    </div>
  );
}