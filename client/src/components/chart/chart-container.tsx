import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const zoomLevelRef = useRef<number>(1);
  const isScrollingRef = useRef<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const velocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [ohlcPosition, setOhlcPosition] = useState({ x: 20, y: 20 });
  const [showHelpOverlay, setShowHelpOverlay] = useState(true);
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
    
    // Enable HD rendering with enhanced anti-aliasing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'start';
    
    // Pixel-perfect rendering adjustments
    const pixelOffset = 0.5; // For crisp 1px lines
    
    // Clear canvas with proper compositing
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);

    // Set canvas background with gradient for depth
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0F172A');
    gradient.addColorStop(1, '#1E293B');
    ctx.fillStyle = gradient;
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

    // Draw grid (almost invisible) with pixel-perfect lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines with pixel offset for crisp rendering
    for (let i = 0; i <= 5; i++) {
      const y = Math.floor(padding + (i * chartHeight) / 5) + pixelOffset;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Vertical grid lines with pixel offset
    for (let i = 0; i <= 8; i++) {
      const x = Math.floor(padding + (i * chartWidth) / 8) + pixelOffset;
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

    // Calculate visible data range with scroll offset and zoom
    const baseVisibleCount = Math.max(20, Math.floor(chartWidth / 8));
    const zoomedVisibleCount = Math.max(15, Math.floor(baseVisibleCount / zoomLevelRef.current));
    const visibleDataCount = Math.min(data.length, zoomedVisibleCount);
    const maxScrollOffset = Math.max(0, data.length - visibleDataCount);
    
    // Ensure scroll offset stays within bounds
    scrollOffsetRef.current = Math.max(0, Math.min(scrollOffsetRef.current, maxScrollOffset));
    const currentScrollOffset = scrollOffsetRef.current;
    const visibleData = data.slice(currentScrollOffset, currentScrollOffset + visibleDataCount);

    // Draw chart based on type
    if (config.chartType === 'candlestick') {
      // Draw candlesticks with enhanced HD rendering
      visibleData.forEach((point, index) => {
        const x = Math.floor(padding + (index * chartWidth) / (visibleData.length - 1));
        const openY = Math.floor(padding + ((maxPrice - point.open) * chartHeight) / priceRange);
        const highY = Math.floor(padding + ((maxPrice - point.high) * chartHeight) / priceRange);
        const lowY = Math.floor(padding + ((maxPrice - point.low) * chartHeight) / priceRange);
        const closeY = Math.floor(padding + ((maxPrice - point.close) * chartHeight) / priceRange);

        const isUp = point.close > point.open;
        const candleWidth = Math.max(4, Math.floor(chartWidth / visibleData.length * 0.8));

        // Enhanced color palette with better contrast
        const upColor = '#10b981';
        const downColor = '#ef4444';
        const shadowColor = 'rgba(0, 0, 0, 0.2)';

        // Draw subtle shadow for depth
        ctx.fillStyle = shadowColor;
        ctx.fillRect(x - candleWidth / 2 + 1, Math.min(openY, closeY) + 1, candleWidth, Math.max(1, Math.abs(closeY - openY)));

        // Draw wick with anti-aliasing
        ctx.strokeStyle = isUp ? upColor : downColor;
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x + pixelOffset, highY);
        ctx.lineTo(x + pixelOffset, lowY);
        ctx.stroke();

        // Draw candle body with rounded corners effect
        ctx.fillStyle = isUp ? upColor : downColor;
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(2, Math.abs(closeY - openY));
        
        // Add subtle gradient to candle body
        const bodyGradient = ctx.createLinearGradient(x - candleWidth / 2, bodyTop, x + candleWidth / 2, bodyTop);
        bodyGradient.addColorStop(0, isUp ? '#065f46' : '#7f1d1d');
        bodyGradient.addColorStop(0.5, isUp ? upColor : downColor);
        bodyGradient.addColorStop(1, isUp ? '#065f46' : '#7f1d1d');
        ctx.fillStyle = bodyGradient;
        
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
        
        // Add highlight on top edge
        ctx.fillStyle = isUp ? '#34d399' : '#f87171';
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, 1);
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

    // Enhanced mouse event handlers for smooth scrolling and zooming
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const data = chartDataRef.current;
      if (data.length === 0) return;
      
      // Handle zoom with Ctrl/Cmd key
      if (e.ctrlKey || e.metaKey) {
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        zoomLevelRef.current = Math.max(0.1, Math.min(5, zoomLevelRef.current * zoomFactor));
      } else {
        // Handle horizontal scrolling
        const baseVisibleCount = Math.max(20, Math.floor((container.offsetWidth - 120) / 8));
        const visibleDataCount = Math.max(15, Math.floor(baseVisibleCount / zoomLevelRef.current));
        const maxScrollOffset = Math.max(0, data.length - visibleDataCount);
        
        const scrollSpeed = Math.max(2, Math.floor(visibleDataCount * 0.1));
        const deltaX = e.deltaX || e.deltaY;
        scrollOffsetRef.current = Math.max(0, Math.min(maxScrollOffset, scrollOffsetRef.current + (deltaX > 0 ? scrollSpeed : -scrollSpeed)));
      }
      
      drawChart(canvas, data);
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      const startX = e.clientX;
      const startY = e.clientY;
      const startScrollOffset = scrollOffsetRef.current;
      
      lastMousePosRef.current = { x: startX, y: startY };
      velocityRef.current = { x: 0, y: 0 };
      
      const handleMouseMove = (e: MouseEvent) => {
        if (!isDraggingRef.current) return;
        
        const data = chartDataRef.current;
        const baseVisibleCount = Math.max(20, Math.floor((container.offsetWidth - 120) / 8));
        const visibleDataCount = Math.max(15, Math.floor(baseVisibleCount / zoomLevelRef.current));
        const maxScrollOffset = Math.max(0, data.length - visibleDataCount);
        
        const deltaX = e.clientX - startX;
        const dragSpeed = visibleDataCount / (container.offsetWidth - 120);
        
        // Calculate velocity for momentum scrolling
        velocityRef.current.x = (e.clientX - lastMousePosRef.current.x) * 0.1;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        
        scrollOffsetRef.current = Math.max(0, Math.min(maxScrollOffset, startScrollOffset - deltaX * dragSpeed));
        
        drawChart(canvas, data);
      };
      
      const handleMouseUp = () => {
        isDraggingRef.current = false;
        
        // Apply momentum scrolling
        const applyMomentum = () => {
          if (Math.abs(velocityRef.current.x) > 0.1) {
            const data = chartDataRef.current;
            const baseVisibleCount = Math.max(20, Math.floor((container.offsetWidth - 120) / 8));
            const visibleDataCount = Math.max(15, Math.floor(baseVisibleCount / zoomLevelRef.current));
            const maxScrollOffset = Math.max(0, data.length - visibleDataCount);
            
            scrollOffsetRef.current = Math.max(0, Math.min(maxScrollOffset, scrollOffsetRef.current - velocityRef.current.x));
            velocityRef.current.x *= 0.95; // Damping
            
            drawChart(canvas, data);
            requestAnimationFrame(applyMomentum);
          }
        };
        
        if (Math.abs(velocityRef.current.x) > 0.5) {
          applyMomentum();
        }
        
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    // Keyboard event handlers for enhanced navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      const data = chartDataRef.current;
      if (data.length === 0) return;
      
      const baseVisibleCount = Math.max(20, Math.floor((container.offsetWidth - 120) / 8));
      const visibleDataCount = Math.max(15, Math.floor(baseVisibleCount / zoomLevelRef.current));
      const maxScrollOffset = Math.max(0, data.length - visibleDataCount);
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          scrollOffsetRef.current = Math.max(0, scrollOffsetRef.current - 5);
          drawChart(canvas, data);
          break;
        case 'ArrowRight':
          e.preventDefault();
          scrollOffsetRef.current = Math.min(maxScrollOffset, scrollOffsetRef.current + 5);
          drawChart(canvas, data);
          break;
        case 'Home':
          e.preventDefault();
          scrollOffsetRef.current = 0;
          drawChart(canvas, data);
          break;
        case 'End':
          e.preventDefault();
          scrollOffsetRef.current = maxScrollOffset;
          drawChart(canvas, data);
          break;
        case '+':
        case '=':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            zoomLevelRef.current = Math.min(5, zoomLevelRef.current * 1.2);
            drawChart(canvas, data);
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            zoomLevelRef.current = Math.max(0.1, zoomLevelRef.current * 0.8);
            drawChart(canvas, data);
          }
          break;
      }
    };

    // Add event listeners
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('keydown', handleKeyDown);
    canvas.setAttribute('tabindex', '0'); // Make canvas focusable for keyboard events

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
      canvas.removeEventListener('keydown', handleKeyDown);
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
      {/* Draggable OHLC Display with Framer Motion */}
      <motion.div 
        className="absolute bg-slate-800/95 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50 cursor-move select-none z-20 draggable-element"
        style={{ 
          left: `${ohlcPosition.x}px`, 
          top: `${ohlcPosition.y}px`
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ 
          scale: 1.02, 
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
          borderColor: 'rgba(59, 130, 246, 0.5)'
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 20 
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          const startX = e.clientX;
          const startY = e.clientY;
          const startPos = { ...ohlcPosition };
          
          const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            setOhlcPosition({
              x: Math.max(0, Math.min(startPos.x + deltaX, (containerRef.current?.offsetWidth || 400) - 300)),
              y: Math.max(0, Math.min(startPos.y + deltaY, (containerRef.current?.offsetHeight || 400) - 80))
            });
          };
          
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      >
        <div className="flex items-center space-x-4">
          <div>
            <p className="text-xs text-slate-400">OPEN</p>
            <p className="text-sm font-mono text-slate-200">${mockOHLC.open}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">HIGH</p>
            <p className="text-sm font-mono text-green-400">${mockOHLC.high}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">LOW</p>
            <p className="text-sm font-mono text-red-400">${mockOHLC.low}</p>
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
      </motion.div>

      {/* Chart Canvas - Always Display */}
      <div ref={containerRef} id="chart-container" className="w-full h-full bg-slate-900 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-sm"
          style={{ display: 'block' }}
        />
        
        {isLoading && (
          <motion.div 
            className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <motion.div 
                className="rounded-full h-12 w-12 border-4 border-blue-500/20 border-t-blue-500 mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.h3 
                className="text-lg font-medium text-slate-300 mb-2"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Loading Chart...
              </motion.h3>
              <motion.p 
                className="text-sm text-slate-500"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Generating market data...
              </motion.p>
            </div>
          </motion.div>
        )}
        
        {/* Connection Status - Bottom of Chart */}
        <div className="absolute bottom-4 right-4 z-10">
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-2 border border-slate-700">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-xs text-slate-400">
                {isConnected ? 'Live' : 'Offline'}
              </span>
              <span className="text-xs text-slate-400">
                {getCurrentTime()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Dismissible Help Overlay with Animation */}
        <AnimatePresence>
          {!isLoading && showHelpOverlay && (
            <motion.div 
              className="absolute top-4 right-4 bg-black/90 backdrop-blur-md text-white text-xs px-4 py-3 rounded-lg border border-slate-600/50 z-10"
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center text-blue-400 mb-1">
                    <span className="mr-2">⌨️</span>
                    <span className="font-semibold">Controls</span>
                  </div>
                  <div className="text-slate-300">• Drag to scroll horizontally</div>
                  <div className="text-slate-300">• Ctrl/Cmd + Wheel to zoom</div>
                  <div className="text-slate-300">• Arrow keys to navigate</div>
                  <div className="text-slate-300">• Home/End for quick jump</div>
                </div>
                <motion.button 
                  onClick={() => setShowHelpOverlay(false)}
                  className="ml-4 text-slate-400 hover:text-white text-lg leading-none"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ×
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
