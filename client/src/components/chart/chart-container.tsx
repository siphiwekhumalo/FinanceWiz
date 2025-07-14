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
  const scrollOffsetRef = useRef<number>(0);
  const isScrollingRef = useRef<boolean>(false);
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

  // Custom chart drawing function with HD support and scrolling
  const drawChart = useCallback((canvas: HTMLCanvasElement, data: ChartDataPoint[]) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !data.length) return;

    const rect = canvas.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = rect.height;
    const padding = 60;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    // Enable HD rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

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

    // Draw grid (almost invisible)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    
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

    // Calculate visible data range with scroll offset
    const visibleDataCount = Math.min(data.length, Math.floor(chartWidth / 8)); // Show reasonable number of candles
    const maxScrollOffset = Math.max(0, data.length - visibleDataCount);
    const currentScrollOffset = Math.min(scrollOffsetRef.current, maxScrollOffset);
    const visibleData = data.slice(currentScrollOffset, currentScrollOffset + visibleDataCount);

    // Draw chart based on type
    if (config.chartType === 'candlestick') {
      // Draw candlesticks
      visibleData.forEach((point, index) => {
        const x = padding + (index * chartWidth) / (visibleData.length - 1);
        const openY = padding + ((maxPrice - point.open) * chartHeight) / priceRange;
        const highY = padding + ((maxPrice - point.high) * chartHeight) / priceRange;
        const lowY = padding + ((maxPrice - point.low) * chartHeight) / priceRange;
        const closeY = padding + ((maxPrice - point.close) * chartHeight) / priceRange;

        const isUp = point.close > point.open;
        const candleWidth = Math.max(3, chartWidth / visibleData.length * 0.8);

        // Draw wick with HD quality
        ctx.strokeStyle = isUp ? '#22c55e' : '#ef4444';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Draw candle body
        ctx.fillStyle = isUp ? '#22c55e' : '#ef4444';
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(1, Math.abs(closeY - openY));
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      });
    } else if (config.chartType === 'line') {
      // Draw line chart with HD quality
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      visibleData.forEach((point, index) => {
        const x = padding + (index * chartWidth) / (visibleData.length - 1);
        const y = padding + ((maxPrice - point.close) * chartHeight) / priceRange;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    } else if (config.chartType === 'area') {
      // Draw area chart with HD quality
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      
      visibleData.forEach((point, index) => {
        const x = padding + (index * chartWidth) / (visibleData.length - 1);
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
      visibleData.forEach((point, index) => {
        const x = padding + (index * chartWidth) / (visibleData.length - 1);
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
      const maxVolume = Math.max(...visibleData.map(d => d.volume));
      
      visibleData.forEach((point, index) => {
        const x = padding + (index * chartWidth) / (visibleData.length - 1);
        const barHeight = (point.volume / maxVolume) * volumeHeight;
        const barWidth = Math.max(2, chartWidth / visibleData.length * 0.8);
        
        ctx.fillStyle = point.close > point.open ? '#22c55e' : '#ef4444';
        ctx.fillRect(x - barWidth / 2, volumeY + volumeHeight - barHeight, barWidth, barHeight);
      });
    }

    // Draw scroll indicator
    if (data.length > visibleDataCount) {
      const scrollbarHeight = 4;
      const scrollbarY = height - padding + 40;
      const scrollbarWidth = chartWidth;
      const scrollProgress = currentScrollOffset / maxScrollOffset;
      
      // Draw scrollbar track
      ctx.fillStyle = '#334155';
      ctx.fillRect(padding, scrollbarY, scrollbarWidth, scrollbarHeight);
      
      // Draw scrollbar thumb
      const thumbWidth = (visibleDataCount / data.length) * scrollbarWidth;
      const thumbX = padding + (scrollProgress * (scrollbarWidth - thumbWidth));
      ctx.fillStyle = '#64748b';
      ctx.fillRect(thumbX, scrollbarY, thumbWidth, scrollbarHeight);
    }
  }, [config.chartType, config.showVolume]);

  // Initialize canvas and load data
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    // Set canvas size with HD pixel ratio
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      
      // Set actual canvas size in memory (HD)
      canvas.width = rect.width * pixelRatio;
      canvas.height = rect.height * pixelRatio;
      
      // Set display size (CSS pixels)
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      // Scale canvas context for HD rendering
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(pixelRatio, pixelRatio);
      }
    };

    resizeCanvas();
    
    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
      // Redraw chart after resize
      if (chartDataRef.current.length > 0) {
        drawChart(canvas, chartDataRef.current);
      }
    });
    resizeObserver.observe(container);

    // Mouse event handlers for scrolling
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const data = chartDataRef.current;
      if (data.length === 0) return;
      
      const visibleDataCount = Math.min(data.length, Math.floor((container.offsetWidth - 120) / 8));
      const maxScrollOffset = Math.max(0, data.length - visibleDataCount);
      
      const scrollSpeed = 3;
      const deltaX = e.deltaX || e.deltaY;
      scrollOffsetRef.current = Math.max(0, Math.min(maxScrollOffset, scrollOffsetRef.current + (deltaX > 0 ? scrollSpeed : -scrollSpeed)));
      
      drawChart(canvas, data);
    };

    const handleMouseDown = (e: MouseEvent) => {
      isScrollingRef.current = true;
      const startX = e.clientX;
      const startScrollOffset = scrollOffsetRef.current;
      
      const handleMouseMove = (e: MouseEvent) => {
        if (!isScrollingRef.current) return;
        
        const data = chartDataRef.current;
        const visibleDataCount = Math.min(data.length, Math.floor((container.offsetWidth - 120) / 8));
        const maxScrollOffset = Math.max(0, data.length - visibleDataCount);
        const dragSpeed = 0.5;
        
        const deltaX = e.clientX - startX;
        scrollOffsetRef.current = Math.max(0, Math.min(maxScrollOffset, startScrollOffset - deltaX * dragSpeed));
        
        drawChart(canvas, data);
      };
      
      const handleMouseUp = () => {
        isScrollingRef.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    // Add event listeners
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);

    // Load and draw chart data
    const loadData = async () => {
      try {
        const chartData = chartService.dummyService.generateChartData(
          config.symbol,
          config.timeframe,
          100
        );
        
        chartDataRef.current = chartData;
        scrollOffsetRef.current = Math.max(0, chartData.length - 50); // Start near the end
        drawChart(canvas, chartData);
      } catch (error) {
        console.error('Error loading chart data:', error);
      }
    };

    loadData();

    return () => {
      resizeObserver.disconnect();
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
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

      {/* Chart Canvas - Always Display */}
      <div ref={containerRef} id="chart-container" className="w-full h-full bg-slate-900 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          style={{ display: 'block' }}
        />
        
        {isLoading && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-slate-400 mb-2">Loading Chart...</h3>
              <p className="text-sm text-slate-500">Generating market data...</p>
            </div>
          </div>
        )}
        
        {/* Scroll instruction overlay */}
        {!isLoading && (
          <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            Mouse wheel or drag to scroll
          </div>
        )}
      </div>
    </div>
  );
}
