import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createChart, IChartApi, ISeriesApi, LineData, CandlestickData } from 'lightweight-charts';
import { useChartStore } from '@/store/chart-store';
import { ChartService } from '@/services/chart-service';
import { ChartDataPoint, VolumeDataPoint } from '@/types/chart-types';

export const useChart = (containerId: string) => {
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  
  const { config, setChartData, setVolumeData, setLoading, selectedSymbol } = useChartStore();
  const chartService = ChartService.getInstance();

  // Fetch chart data
  const { data: chartData, isLoading, error } = useQuery({
    queryKey: ['/api/chart-data', config.symbol, config.timeframe, config.dataSource],
    queryFn: async () => {
      setLoading(true);
      try {
        const symbolData = await chartService.getSymbol(config.symbol);
        const data = await chartService.getChartData(
          symbolData?.id || 1,
          config.timeframe,
          config.dataSource === 'dummy'
        );
        setChartData(data);
        
        const volumeData = chartService.getVolumeData(data);
        setVolumeData(volumeData);
        
        return data;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!config.symbol,
    refetchInterval: config.dataSource === 'real' ? 5000 : false,
  });

  // Initialize chart
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Create chart
    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { type: 'solid', color: '#0F172A' },
        textColor: '#F1F5F9',
      },
      grid: {
        vertLines: { color: '#334155' },
        horzLines: { color: '#334155' },
      },
      crosshair: {
        mode: config.showCrosshair ? 1 : 0,
      },
      rightPriceScale: {
        borderColor: '#334155',
      },
      timeScale: {
        borderColor: '#334155',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Handle resize
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        chart.applyOptions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [containerId]);

  // Update chart type and data
  useEffect(() => {
    if (!chartRef.current || !chartData) return;

    const chart = chartRef.current;

    // Remove existing series
    if (candlestickSeriesRef.current) {
      chart.removeSeries(candlestickSeriesRef.current);
      candlestickSeriesRef.current = null;
    }
    if (lineSeriesRef.current) {
      chart.removeSeries(lineSeriesRef.current);
      lineSeriesRef.current = null;
    }
    if (volumeSeriesRef.current) {
      chart.removeSeries(volumeSeriesRef.current);
      volumeSeriesRef.current = null;
    }

    // Add appropriate series based on chart type
    if (config.chartType === 'candlestick') {
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#10B981',
        downColor: '#EF4444',
        borderDownColor: '#EF4444',
        borderUpColor: '#10B981',
        wickDownColor: '#EF4444',
        wickUpColor: '#10B981',
      });
      
      const candlestickData: CandlestickData[] = chartData.map(point => ({
        time: point.time,
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
      }));
      
      candlestickSeries.setData(candlestickData);
      candlestickSeriesRef.current = candlestickSeries;
    } else if (config.chartType === 'line') {
      const lineSeries = chart.addLineSeries({
        color: '#3B82F6',
        lineWidth: 2,
      });
      
      const lineData: LineData[] = chartData.map(point => ({
        time: point.time,
        value: point.close,
      }));
      
      lineSeries.setData(lineData);
      lineSeriesRef.current = lineSeries;
    } else if (config.chartType === 'area') {
      const areaSeries = chart.addAreaSeries({
        topColor: 'rgba(59, 130, 246, 0.3)',
        bottomColor: 'rgba(59, 130, 246, 0.1)',
        lineColor: '#3B82F6',
        lineWidth: 2,
      });
      
      const areaData: LineData[] = chartData.map(point => ({
        time: point.time,
        value: point.close,
      }));
      
      areaSeries.setData(areaData);
      lineSeriesRef.current = areaSeries;
    }

    // Add volume series if enabled
    if (config.showVolume) {
      const volumeSeries = chart.addHistogramSeries({
        color: '#64748B',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume',
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      const volumeData = chartData.map(point => ({
        time: point.time,
        value: point.volume,
        color: point.close >= point.open ? '#10B981' : '#EF4444',
      }));

      volumeSeries.setData(volumeData);
      volumeSeriesRef.current = volumeSeries;
    }

    // Fit content
    chart.timeScale().fitContent();
  }, [chartData, config.chartType, config.showVolume]);

  // Update crosshair
  useEffect(() => {
    if (!chartRef.current) return;
    
    chartRef.current.applyOptions({
      crosshair: {
        mode: config.showCrosshair ? 1 : 0,
      },
    });
  }, [config.showCrosshair]);

  const exportChart = (format: 'png' | 'pdf' | 'svg' = 'png') => {
    if (!chartRef.current) return;
    
    // This would need to be implemented based on the chart library's export capabilities
    chartService.exportChart(format);
  };

  const resetZoom = () => {
    if (!chartRef.current) return;
    chartRef.current.timeScale().fitContent();
  };

  return {
    chartRef,
    isLoading,
    error,
    exportChart,
    resetZoom,
  };
};
