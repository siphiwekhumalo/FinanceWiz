import { useEffect, useRef, useCallback } from 'react';
import { useChartStore } from '@/store/chart-store';
import { ChartUtils } from '@/utils/chart-utils';
import { ChartService } from '@/services/chart-service';
import { ChartDataPoint } from '@/types/chart-types';

export function ChartContainer() {
  const { isLoading, selectedSymbol, isConnected, config, setChartInstance } = useChartStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartDataRef = useRef<ChartDataPoint[]>([]);
  const animationRef = useRef<number>();
  const chartService = ChartService.getInstance();

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString();
  };

  const mockOHLC = {
    open: selectedSymbol?.price ? (selectedSymbol.price * 0.995).toFixed(2) : '174.22',
    high: selectedSymbol?.price ? (selectedSymbol.price * 1.005).toFixed(2) : '175.88',
    low: selectedSymbol?.price ? (selectedSymbol.price * 0.985).toFixed(2) : '173.45',
    close: selectedSymbol?.price ? selectedSymbol.price.toFixed(2) : '175.43',
  };

  // Custom chart drawing function
  const drawChart = useCallback((canvas: HTMLCanvasElement, data: ChartDataPoint[]) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !data.length) return;

    const { width, height } = canvas;
    const padding = 60;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set canvas background
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, width, height);

    // Calculate price and time ranges
    const prices = data.flatMap(d => [d.open, d.high, d.low, d.close]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    const times = data.map(d => d.time);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const timeRange = maxTime - minTime;

    // Draw grid
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * chartHeight) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i <= 8; i++) {
      const x = padding + (i * chartWidth) / 8;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // Draw price axis labels
    ctx.fillStyle = '#F1F5F9';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const price = maxPrice - (i * priceRange) / 5;
      const y = padding + (i * chartHeight) / 5;
      ctx.fillText(price.toFixed(2), width - padding + 5, y + 4);
    }

    // Draw time axis labels
    ctx.textAlign = 'center';
    for (let i = 0; i <= 4; i++) {
      const time = minTime + (i * timeRange) / 4;
      const x = padding + (i * chartWidth) / 4;
      const date = new Date(time * 1000);
      const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      ctx.fillText(timeString, x, height - padding + 20);
    }

    // Draw chart based on type
    if (config.chartType === 'candlestick') {
      // Draw candlesticks
      data.forEach((point, index) => {
        const x = padding + (index * chartWidth) / (data.length - 1);
        const openY = padding + ((maxPrice - point.open) * chartHeight) / priceRange;
        const highY = padding + ((maxPrice - point.high) * chartHeight) / priceRange;
        const lowY = padding + ((maxPrice - point.low) * chartHeight) / priceRange;
        const closeY = padding + ((maxPrice - point.close) * chartHeight) / priceRange;

        const isUp = point.close > point.open;
        const candleWidth = Math.max(2, chartWidth / data.length * 0.8);

        // Draw wick
        ctx.strokeStyle = isUp ? '#22c55e' : '#ef4444';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Draw candle body
        ctx.fillStyle = isUp ? '#22c55e' : '#ef4444';
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.abs(closeY - openY);
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      });
    } else if (config.chartType === 'line') {
      // Draw line chart
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      data.forEach((point, index) => {
        const x = padding + (index * chartWidth) / (data.length - 1);
        const y = padding + ((maxPrice - point.close) * chartHeight) / priceRange;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    } else if (config.chartType === 'area') {
      // Draw area chart
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      
      data.forEach((point, index) => {
        const x = padding + (index * chartWidth) / (data.length - 1);
        const y = padding + ((maxPrice - point.close) * chartHeight) / priceRange;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      // Close the path to create area
      const lastX = padding + chartWidth;
      const bottomY = height - padding;
      ctx.lineTo(lastX, bottomY);
      ctx.lineTo(padding, bottomY);
      ctx.closePath();
      ctx.fill();
      
      // Draw the line on top
      ctx.beginPath();
      data.forEach((point, index) => {
        const x = padding + (index * chartWidth) / (data.length - 1);
        const y = padding + ((maxPrice - point.close) * chartHeight) / priceRange;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // Draw volume chart if enabled
    if (config.showVolume) {
      const volumeHeight = chartHeight * 0.2;
      const volumeY = height - padding - volumeHeight;
      const maxVolume = Math.max(...data.map(d => d.volume));
      
      data.forEach((point, index) => {
        const x = padding + (index * chartWidth) / (data.length - 1);
        const barHeight = (point.volume / maxVolume) * volumeHeight;
        const barWidth = chartWidth / data.length * 0.8;
        
        ctx.fillStyle = point.close > point.open ? '#22c55e' : '#ef4444';
        ctx.fillRect(x - barWidth / 2, volumeY + volumeHeight - barHeight, barWidth, barHeight);
      });
    }
  }, [config.chartType, config.showVolume]);

  // Initialize canvas and load data
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    // Set canvas size
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resizeCanvas();
    
    // Handle resize
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    // Load and draw chart data
    const loadData = async () => {
      try {
        const chartData = chartService.dummyService.generateChartData(
          config.symbol,
          config.timeframe,
          100
        );
        
        chartDataRef.current = chartData;
        drawChart(canvas, chartData);
      } catch (error) {
        console.error('Error loading chart data:', error);
      }
    };

    loadData();

    return () => {
      resizeObserver.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [config.symbol, config.chartType, config.timeframe, config.dataSource, config.showVolume, drawChart]);

  // Update chart when data changes
  useEffect(() => {
    if (canvasRef.current && chartDataRef.current.length > 0) {
      drawChart(canvasRef.current, chartDataRef.current);
    }
  }, [config.showCrosshair, drawChart]);

  return (
    <div className="w-full h-full relative">
      {/* Real-time Status Indicator */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-slate-800 rounded-lg p-2 border border-slate-700">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-xs text-slate-400">
              {isConnected ? 'Live' : 'Offline'}
            </span>
            <span className="text-xs text-slate-400">
              {getCurrentTime()}
            </span>
          </div>
        </div>
      </div>

      {/* Price Display Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-xs text-slate-400">OPEN</p>
              <p className="text-sm font-mono text-slate-200">${mockOHLC.open}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">HIGH</p>
              <p className="text-sm font-mono text-success">${mockOHLC.high}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">LOW</p>
              <p className="text-sm font-mono text-danger">${mockOHLC.low}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">CLOSE</p>
              <p className="text-sm font-mono text-slate-200">${mockOHLC.close}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">VOLUME</p>
              <p className="text-sm font-mono text-slate-200">
                {selectedSymbol?.volume ? ChartUtils.formatVolume(selectedSymbol.volume) : '2.4M'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div ref={containerRef} id="chart-container" className="w-full h-full bg-slate-900 relative">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-slate-400 mb-2">Loading Chart...</h3>
              <p className="text-sm text-slate-500">Fetching market data...</p>
            </div>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ display: 'block' }}
          />
        )}
      </div>
    </div>
  );
}
