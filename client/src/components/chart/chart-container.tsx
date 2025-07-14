import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChartStore } from '@/store/chart-store';
import { ChartUtils } from '@/utils/chart-utils';
import { ChartService } from '@/services/chart-service';
import { ChartDataPoint, DrawingObject } from '@/types/chart-types';
import { nanoid } from 'nanoid';
import { ComparisonLegend } from './comparison-legend';

export function ChartContainer() {
  const { isLoading, selectedSymbol, isConnected, config, setChartInstance, addDrawingObject, updateDrawingObject, removeDrawingObject } = useChartStore();
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
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawingObject, setCurrentDrawingObject] = useState<DrawingObject | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInputValue, setTextInputValue] = useState('');
  const [pendingTextObject, setPendingTextObject] = useState<DrawingObject | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [isDraggingEndpoint, setIsDraggingEndpoint] = useState(false);
  const [dragPointIndex, setDragPointIndex] = useState<number>(-1);
  const [hoveredObjectId, setHoveredObjectId] = useState<string | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [previewPoint, setPreviewPoint] = useState<{ x: number; y: number; price: number; time: number } | null>(null);
  const [isInDrawMode, setIsInDrawMode] = useState(false);
  const [crosshairPosition, setCrosshairPosition] = useState<{ x: number; y: number; price: number; time: number } | null>(null);
  const crosshairPositionRef = useRef<{ x: number; y: number; price: number; time: number } | null>(null);
  const chartService = ChartService.getInstance();

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString();
  };

  // Handle keyboard events for deleting selected objects and ESC to exit draw mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedObjectId) {
          e.preventDefault();
          removeDrawingObject(selectedObjectId);
          setSelectedObjectId(null);
        }
      } else if (e.key === 'Escape') {
        // Exit draw mode and cancel current drawing
        setIsInDrawMode(false);
        setCurrentDrawingObject(null);
        setIsDrawing(false);
        setSelectedObjectId(null);
        setShowContextMenu(false);
        setPreviewPoint(null);
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        // Undo last drawing (basic implementation)
        if (config.drawingObjects.length > 0) {
          const lastObject = config.drawingObjects[config.drawingObjects.length - 1];
          removeDrawingObject(lastObject.id);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectId, removeDrawingObject, config.drawingObjects, isInDrawMode]);

  // Automatically enter draw mode when a drawing tool is selected
  useEffect(() => {
    setIsInDrawMode(config.selectedTool !== 'cursor');
  }, [config.selectedTool]);

  // Convert canvas coordinates to chart data coordinates
  const canvasToChartCoords = useCallback((canvasX: number, canvasY: number, data: ChartDataPoint[]) => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return null;

    const rect = canvas.getBoundingClientRect();
    const { width, height } = canvas;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Calculate price range
    const prices = data.flatMap(d => [d.open, d.high, d.low, d.close]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // Calculate time and price from canvas coordinates
    const normalizedX = (canvasX - padding) / chartWidth;
    const normalizedY = (canvasY - padding) / chartHeight;
    
    const price = maxPrice - (normalizedY * priceRange);
    const timeIndex = Math.floor(normalizedX * (data.length - 1));
    const time = data[timeIndex]?.time || Date.now() / 1000;

    return { x: canvasX, y: canvasY, price, time };
  }, []);

  // Convert chart data coordinates to canvas coordinates
  const chartToCanvasCoords = useCallback((price: number, time: number, data: ChartDataPoint[]) => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return null;

    const { width, height } = canvas;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Calculate price range
    const prices = data.flatMap(d => [d.open, d.high, d.low, d.close]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // Find closest time index
    const timeIndex = data.findIndex(d => d.time >= time);
    const normalizedX = timeIndex / (data.length - 1);
    const normalizedY = (maxPrice - price) / priceRange;

    return {
      x: padding + (normalizedX * chartWidth),
      y: padding + (normalizedY * chartHeight)
    };
  }, []);

  // Utility function to calculate distance from point to line
  const getDistanceToLine = useCallback((px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Utility function to check if point is near rectangle border
  const isPointNearRectangle = useCallback((px: number, py: number, rect: { x: number; y: number; width: number; height: number }, tolerance: number): boolean => {
    const { x, y, width, height } = rect;
    
    // Check if point is near any of the four sides
    const nearLeft = Math.abs(px - x) <= tolerance && py >= y - tolerance && py <= y + height + tolerance;
    const nearRight = Math.abs(px - (x + width)) <= tolerance && py >= y - tolerance && py <= y + height + tolerance;
    const nearTop = Math.abs(py - y) <= tolerance && px >= x - tolerance && px <= x + width + tolerance;
    const nearBottom = Math.abs(py - (y + height)) <= tolerance && px >= x - tolerance && px <= x + width + tolerance;
    
    return nearLeft || nearRight || nearTop || nearBottom;
  }, []);

  // Check if mouse is over an endpoint for editing
  const getEndpointAtPosition = useCallback((x: number, y: number) => {
    const ENDPOINT_RADIUS = 8;
    
    for (const obj of config.drawingObjects) {
      if (!obj.completed) continue;
      
      for (let i = 0; i < obj.points.length; i++) {
        const canvasPoint = chartToCanvasCoords(obj.points[i].price, obj.points[i].time, chartDataRef.current);
        if (!canvasPoint) continue;
        
        const distance = Math.sqrt(
          Math.pow(x - canvasPoint.x, 2) + Math.pow(y - canvasPoint.y, 2)
        );
        
        if (distance <= ENDPOINT_RADIUS) {
          return { objectId: obj.id, pointIndex: i };
        }
      }
    }
    
    return null;
  }, [config.drawingObjects, chartToCanvasCoords]);

  // Handle mouse down for drawing
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const chartCoords = canvasToChartCoords(x, y, chartDataRef.current);
    if (!chartCoords) return;

    // Only prevent default behavior when using drawing tools, not cursor
    if (config.selectedTool !== 'cursor') {
      e.preventDefault();
      e.stopPropagation();
    }

    // Check if clicking on an endpoint for editing
    const endpoint = getEndpointAtPosition(x, y);
    if (endpoint && config.selectedTool === 'cursor') {
      setSelectedObjectId(endpoint.objectId);
      setIsDraggingEndpoint(true);
      setDragPointIndex(endpoint.pointIndex);
      return;
    }

    // Handle object selection/deselection with cursor tool
    if (config.selectedTool === 'cursor') {
      // Check if clicking on an existing object to select it
      const clickedObject = config.drawingObjects.find(obj => {
        if (obj.type === 'text' && obj.points.length > 0) {
          const canvasPoint = chartToCanvasCoords(obj.points[0].price, obj.points[0].time, chartDataRef.current);
          if (canvasPoint) {
            const distance = Math.sqrt(
              Math.pow(x - canvasPoint.x, 2) + Math.pow(y - canvasPoint.y, 2)
            );
            return distance <= 30; // Larger hit area for text
          }
        }
        return false;
      });

      if (clickedObject) {
        setSelectedObjectId(clickedObject.id);
      } else {
        setSelectedObjectId(null);
      }
      return;
    }

    if (config.selectedTool === 'text') {
      // Handle text tool differently - show input dialog
      const textObject: DrawingObject = {
        id: nanoid(),
        type: 'text',
        points: [chartCoords],
        color: '#10b981',
        lineWidth: 2,
        text: '',
        completed: false,
      };
      setPendingTextObject(textObject);
      setShowTextInput(true);
      return;
    }

    const newDrawingObject: DrawingObject = {
      id: nanoid(),
      type: config.selectedTool,
      points: [chartCoords],
      color: '#10b981',
      lineWidth: 2,
      completed: false,
    };

    setCurrentDrawingObject(newDrawingObject);
    setIsDrawing(true);
  }, [config.selectedTool, canvasToChartCoords, getEndpointAtPosition, isInDrawMode]);

  // Handle mouse move for drawing, editing, and hover effects
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const chartCoords = canvasToChartCoords(x, y, chartDataRef.current);
    if (!chartCoords) return;

    // Only prevent default behavior when drawing (not in cursor mode)
    if (config.selectedTool !== 'cursor') {
      e.preventDefault();
      e.stopPropagation();
    }

    // Handle endpoint dragging
    if (isDraggingEndpoint && selectedObjectId) {
      updateDrawingObject(selectedObjectId, {
        points: config.drawingObjects
          .find(obj => obj.id === selectedObjectId)
          ?.points.map((point, index) => 
            index === dragPointIndex ? chartCoords : point
          ) || []
      });
      return;
    }

    // Handle new drawing
    if (isDrawing && currentDrawingObject) {
      const updatedObject = {
        ...currentDrawingObject,
        points: currentDrawingObject.points.length === 1 
          ? [currentDrawingObject.points[0], chartCoords]
          : [...currentDrawingObject.points.slice(0, -1), chartCoords]
      };

      setCurrentDrawingObject(updatedObject);
      return;
    }

    // Handle drawing preview for first point (only for drawing tools)
    if (config.selectedTool !== 'cursor' && !isDrawing) {
      setPreviewPoint(chartCoords);
    }

    // Update crosshair position when enabled and not dragging (only for cursor tool)
    if (config.showCrosshair && config.selectedTool === 'cursor' && !isDrawing && !isDraggingEndpoint && !isDraggingRef.current) {
      setCrosshairPosition(chartCoords);
    }

    // Handle hover effects and cursor changes (only for cursor tool)
    if (config.selectedTool === 'cursor') {
      const endpoint = getEndpointAtPosition(x, y);
      
      // Find hovered drawing object
      const hoveredObject = config.drawingObjects.find(obj => {
        if (obj.type === 'text' && obj.points.length > 0) {
          const canvasPoint = chartToCanvasCoords(obj.points[0].price, obj.points[0].time, chartDataRef.current);
          if (canvasPoint) {
            const distance = Math.sqrt(Math.pow(x - canvasPoint.x, 2) + Math.pow(y - canvasPoint.y, 2));
            return distance <= 30;
          }
        } else if (obj.type === 'trendline' && obj.points.length >= 2) {
          const start = chartToCanvasCoords(obj.points[0].price, obj.points[0].time, chartDataRef.current);
          const end = chartToCanvasCoords(obj.points[1].price, obj.points[1].time, chartDataRef.current);
          if (start && end) {
            // Check if mouse is near the line
            const distanceToLine = getDistanceToLine(x, y, start.x, start.y, end.x, end.y);
            return distanceToLine <= 8; // 8 pixel tolerance
          }
        } else if (obj.type === 'rectangle' && obj.points.length >= 2) {
          const start = chartToCanvasCoords(obj.points[0].price, obj.points[0].time, chartDataRef.current);
          const end = chartToCanvasCoords(obj.points[1].price, obj.points[1].time, chartDataRef.current);
          if (start && end) {
            // Check if mouse is near rectangle border
            const rect = { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y), width: Math.abs(end.x - start.x), height: Math.abs(end.y - start.y) };
            return isPointNearRectangle(x, y, rect, 8);
          }
        }
        return false;
      });

      setHoveredObjectId(hoveredObject?.id || null);
      canvas.style.cursor = endpoint ? 'pointer' : (hoveredObject ? 'pointer' : 'default');
    } else if (isInDrawMode) {
      canvas.style.cursor = 'crosshair';
    }
  }, [isDrawing, currentDrawingObject, isDraggingEndpoint, selectedObjectId, dragPointIndex, canvasToChartCoords, config.drawingObjects, config.selectedTool, updateDrawingObject, getEndpointAtPosition, isInDrawMode, chartToCanvasCoords]);

  // Handle mouse up for drawing and editing
  const handleMouseUp = useCallback(() => {
    // Handle endpoint dragging completion
    if (isDraggingEndpoint) {
      setIsDraggingEndpoint(false);
      // Keep object selected after editing
      setDragPointIndex(-1);
      return;
    }

    // Handle new drawing completion
    if (isDrawing && currentDrawingObject) {
      const completedObject = {
        ...currentDrawingObject,
        completed: true,
      };

      addDrawingObject(completedObject);
      setCurrentDrawingObject(null);
      setIsDrawing(false);
      return;
    }
  }, [isDrawing, currentDrawingObject, isDraggingEndpoint, addDrawingObject]);

  // Handle right-click context menu
  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if right-clicking on a drawing object
    const clickedObject = config.drawingObjects.find(obj => {
      if (obj.type === 'text' && obj.points.length > 0) {
        const canvasPoint = chartToCanvasCoords(obj.points[0].price, obj.points[0].time, chartDataRef.current);
        if (canvasPoint) {
          const distance = Math.sqrt(Math.pow(x - canvasPoint.x, 2) + Math.pow(y - canvasPoint.y, 2));
          return distance <= 30;
        }
      }
      return false;
    });

    if (clickedObject) {
      setSelectedObjectId(clickedObject.id);
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
      setShowContextMenu(true);
    } else {
      setShowContextMenu(false);
    }
  }, [config.drawingObjects, chartToCanvasCoords]);

  // Handle text input completion
  const handleTextInputSubmit = useCallback(() => {
    if (!pendingTextObject || !textInputValue.trim()) return;

    const completedTextObject = {
      ...pendingTextObject,
      text: textInputValue,
      completed: true,
    };

    addDrawingObject(completedTextObject);
    setPendingTextObject(null);
    setTextInputValue('');
    setShowTextInput(false);
  }, [pendingTextObject, textInputValue, addDrawingObject]);

  // Handle text input cancel
  const handleTextInputCancel = useCallback(() => {
    setPendingTextObject(null);
    setTextInputValue('');
    setShowTextInput(false);
  }, []);

  const mockOHLC = {
    open: selectedSymbol?.price ? (selectedSymbol.price * 0.995).toFixed(2) : '174.22',
    high: selectedSymbol?.price ? (selectedSymbol.price * 1.005).toFixed(2) : '175.88',
    low: selectedSymbol?.price ? (selectedSymbol.price * 0.985).toFixed(2) : '173.45',
    close: selectedSymbol?.price ? selectedSymbol.price.toFixed(2) : '175.43',
  };

  // Draw all drawing objects
  const drawDrawingObjects = useCallback((ctx: CanvasRenderingContext2D, data: ChartDataPoint[]) => {
    const allObjects = [...config.drawingObjects];
    if (currentDrawingObject) {
      allObjects.push(currentDrawingObject);
    }

    allObjects.forEach(obj => {
      if (obj.points.length < 1) return;

      const isSelected = obj.id === selectedObjectId;
      const isHovered = obj.id === hoveredObjectId;
      
      // Enhanced styling for hovered and selected objects
      if (isSelected || isHovered) {
        ctx.shadowColor = isSelected ? '#3b82f6' : '#60a5fa';
        ctx.shadowBlur = isSelected ? 8 : 4;
        ctx.strokeStyle = isSelected ? '#3b82f6' : (isHovered ? '#60a5fa' : obj.color);
        ctx.lineWidth = (isSelected || isHovered) ? obj.lineWidth + 1 : obj.lineWidth;
      } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = obj.lineWidth;
      }
      
      ctx.lineCap = 'round';

      switch (obj.type) {
        case 'trendline':
          if (obj.points.length >= 2) drawTrendline(ctx, obj, data);
          break;
        case 'rectangle':
          if (obj.points.length >= 2) drawRectangle(ctx, obj, data);
          break;
        case 'fibonacci':
          if (obj.points.length >= 2) drawFibonacci(ctx, obj, data);
          break;
        case 'text':
          if (obj.points.length >= 1) drawText(ctx, obj, data);
          break;
      }

      // Draw endpoints for completed objects when cursor tool is active
      if (obj.completed && config.selectedTool === 'cursor') {
        drawEndpoints(ctx, obj, data, isSelected);
      }
    });

    // Draw preview point for first click
    if (previewPoint && isInDrawMode && config.selectedTool !== 'cursor' && !isDrawing) {
      const canvasPoint = chartToCanvasCoords(previewPoint.price, previewPoint.time, data);
      if (canvasPoint) {
        ctx.save();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#3b82f6';
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(canvasPoint.x, canvasPoint.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      }
    }
  }, [config.drawingObjects, currentDrawingObject, selectedObjectId, hoveredObjectId, previewPoint, isInDrawMode, isDrawing, config.selectedTool, chartToCanvasCoords]);

  // Draw crosshair lines
  const drawCrosshair = useCallback((ctx: CanvasRenderingContext2D, data: ChartDataPoint[]) => {
    const crosshair = crosshairPositionRef.current;
    if (!config.showCrosshair || !crosshair) return;

    const canvas = ctx.canvas;
    const { width, height } = canvas;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const canvasPoint = chartToCanvasCoords(crosshair.price, crosshair.time, data);
    if (!canvasPoint) return;

    ctx.save();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.globalAlpha = 0.7;

    // Draw vertical line
    ctx.beginPath();
    ctx.moveTo(canvasPoint.x, padding);
    ctx.lineTo(canvasPoint.x, height - padding);
    ctx.stroke();

    // Draw horizontal line
    ctx.beginPath();
    ctx.moveTo(padding, canvasPoint.y);
    ctx.lineTo(width - padding, canvasPoint.y);
    ctx.stroke();

    // Draw price and time labels
    ctx.setLineDash([]);
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;

    // Price label on Y-axis
    const priceText = crosshair.price.toFixed(2);
    ctx.font = '12px monospace';
    const priceTextWidth = ctx.measureText(priceText).width;
    const priceLabelX = width - padding + 2;
    const priceLabelY = canvasPoint.y;
    
    ctx.fillRect(priceLabelX, priceLabelY - 8, priceTextWidth + 8, 16);
    ctx.strokeRect(priceLabelX, priceLabelY - 8, priceTextWidth + 8, 16);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(priceText, priceLabelX + 4, priceLabelY + 4);

    // Time label on X-axis
    const timeText = new Date(crosshair.time * 1000).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const timeTextWidth = ctx.measureText(timeText).width;
    const timeLabelX = canvasPoint.x - timeTextWidth / 2 - 4;
    const timeLabelY = height - padding + 2;
    
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(timeLabelX, timeLabelY, timeTextWidth + 8, 16);
    ctx.strokeRect(timeLabelX, timeLabelY, timeTextWidth + 8, 16);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(timeText, timeLabelX + 4, timeLabelY + 12);

    ctx.restore();
  }, [config.showCrosshair, chartToCanvasCoords]);

  // Draw comparison symbols as independent series with time synchronization
  const drawComparisonSymbols = useCallback((ctx: CanvasRenderingContext2D, data: ChartDataPoint[], minPrice: number, maxPrice: number, priceRange: number, visibleData: ChartDataPoint[]) => {
    if (!config.comparisonSymbols.length) return;

    const canvas = ctx.canvas;
    const { width, height } = canvas;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Ensure we have valid visible data
    if (visibleData.length === 0) return;
    if (priceRange === 0) return;

    config.comparisonSymbols.forEach(compSymbol => {
      if (!compSymbol.enabled) return;

      ctx.save();
      ctx.strokeStyle = compSymbol.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);

      // Use stored comparison data if available, otherwise generate aligned data
      let alignedVisibleData;
      if (compSymbol.data && compSymbol.data.length > 0) {
        // Use the same slice logic as the main chart
        const currentScrollOffset = Math.max(0, Math.min(scrollOffsetRef.current, Math.max(0, compSymbol.data.length - visibleData.length)));
        alignedVisibleData = compSymbol.data.slice(currentScrollOffset, currentScrollOffset + visibleData.length);
      } else {
        // Generate aligned data as fallback
        const mainTimestamps = visibleData.map(point => point.time);
        const chartService = ChartService.getInstance();
        const alignedCompData = chartService.dummyService.generateChartData(
          compSymbol.symbol,
          config.timeframe,
          100,
          mainTimestamps
        );
        alignedVisibleData = alignedCompData.slice(0, visibleData.length);
      }
      
      if (alignedVisibleData.length === 0) {
        ctx.restore();
        return;
      }

      ctx.beginPath();
      
      // Use combined price range so all symbols are visible on the chart
      alignedVisibleData.forEach((point, index) => {
        const x = padding + (index * chartWidth) / Math.max(1, visibleData.length - 1);
        
        // Map comparison symbol using the combined price range (same as main chart)
        const y = padding + ((maxPrice - point.close) / priceRange) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      // Apply different stroke styles based on comparison symbol style
      if (compSymbol.style === 'area') {
        // Create area fill
        ctx.lineTo(padding + chartWidth, padding + chartHeight); // Bottom right
        ctx.lineTo(padding, padding + chartHeight); // Bottom left
        ctx.closePath();
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = compSymbol.color;
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // Redraw the line on top
        ctx.beginPath();
        alignedVisibleData.forEach((point, index) => {
          const x = padding + (index * chartWidth) / Math.max(1, visibleData.length - 1);
          const y = padding + ((maxPrice - point.close) / priceRange) * chartHeight;
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
      }
      
      ctx.stroke();
      ctx.restore();
    });
  }, [config.comparisonSymbols, config.comparisonMode]);

  // Draw draggable endpoints
  const drawEndpoints = useCallback((ctx: CanvasRenderingContext2D, obj: DrawingObject, data: ChartDataPoint[], isSelected: boolean) => {
    const ENDPOINT_RADIUS = 6;
    
    obj.points.forEach(point => {
      const canvasPoint = chartToCanvasCoords(point.price, point.time, data);
      if (!canvasPoint) return;

      // Draw endpoint circle
      ctx.fillStyle = isSelected ? '#3b82f6' : obj.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.arc(canvasPoint.x, canvasPoint.y, ENDPOINT_RADIUS, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Add a smaller inner circle for better visibility
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(canvasPoint.x, canvasPoint.y, ENDPOINT_RADIUS - 3, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [chartToCanvasCoords]);

  // Draw trendline
  const drawTrendline = useCallback((ctx: CanvasRenderingContext2D, obj: DrawingObject, data: ChartDataPoint[]) => {
    const start = chartToCanvasCoords(obj.points[0].price, obj.points[0].time, data);
    const end = chartToCanvasCoords(obj.points[1].price, obj.points[1].time, data);
    
    if (!start || !end) return;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }, [chartToCanvasCoords]);

  // Draw rectangle
  const drawRectangle = useCallback((ctx: CanvasRenderingContext2D, obj: DrawingObject, data: ChartDataPoint[]) => {
    const start = chartToCanvasCoords(obj.points[0].price, obj.points[0].time, data);
    const end = chartToCanvasCoords(obj.points[1].price, obj.points[1].time, data);
    
    if (!start || !end) return;

    const width = end.x - start.x;
    const height = end.y - start.y;

    ctx.strokeRect(start.x, start.y, width, height);
  }, [chartToCanvasCoords]);

  // Draw fibonacci retracement
  const drawFibonacci = useCallback((ctx: CanvasRenderingContext2D, obj: DrawingObject, data: ChartDataPoint[]) => {
    const start = chartToCanvasCoords(obj.points[0].price, obj.points[0].time, data);
    const end = chartToCanvasCoords(obj.points[1].price, obj.points[1].time, data);
    
    if (!start || !end) return;

    const fibLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
    const priceRange = obj.points[1].price - obj.points[0].price;

    fibLevels.forEach((level, index) => {
      const price = obj.points[0].price + (priceRange * level);
      const levelStart = chartToCanvasCoords(price, obj.points[0].time, data);
      const levelEnd = chartToCanvasCoords(price, obj.points[1].time, data);
      
      if (!levelStart || !levelEnd) return;

      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = index === 0 || index === fibLevels.length - 1 ? obj.color : `${obj.color}80`;
      ctx.beginPath();
      ctx.moveTo(levelStart.x, levelStart.y);
      ctx.lineTo(levelEnd.x, levelEnd.y);
      ctx.stroke();

      // Draw level label
      ctx.fillStyle = obj.color;
      ctx.font = '12px monospace';
      ctx.fillText(`${(level * 100).toFixed(1)}%`, levelEnd.x + 5, levelEnd.y - 5);
    });

    ctx.globalAlpha = 1;
  }, [chartToCanvasCoords]);

  // Draw text annotation
  const drawText = useCallback((ctx: CanvasRenderingContext2D, obj: DrawingObject, data: ChartDataPoint[]) => {
    const position = chartToCanvasCoords(obj.points[0].price, obj.points[0].time, data);
    
    if (!position) return;

    ctx.fillStyle = obj.color;
    ctx.font = '14px Arial';
    ctx.fillText(obj.text || 'Text', position.x, position.y);
  }, [chartToCanvasCoords]);

  // Custom chart drawing function with HD support and scrolling
  const drawChart = useCallback((canvas: HTMLCanvasElement, data: ChartDataPoint[]) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !data.length) return;

    const rect = canvas.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = rect.height;
    const padding = 40; // Reduced padding for more chart space
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

    // Calculate visible data range with scroll offset and zoom first
    const baseVisibleCount = Math.max(20, Math.floor(chartWidth / 8));
    const zoomedVisibleCount = Math.max(15, Math.floor(baseVisibleCount / zoomLevelRef.current));
    const visibleDataCount = Math.min(data.length, zoomedVisibleCount);
    const maxScrollOffset = Math.max(0, data.length - visibleDataCount);
    
    // Ensure scroll offset stays within bounds
    scrollOffsetRef.current = Math.max(0, Math.min(scrollOffsetRef.current, maxScrollOffset));
    const currentScrollOffset = scrollOffsetRef.current;

    // Calculate combined price range including all active comparison symbols
    let allPrices = data.flatMap(d => [d.open, d.high, d.low, d.close]);
    
    // Add comparison symbol prices to the range calculation
    config.comparisonSymbols.forEach(compSymbol => {
      if (!compSymbol.enabled) return;
      
      let compData;
      if (compSymbol.data && compSymbol.data.length > 0) {
        const currentScrollOffset = Math.max(0, Math.min(scrollOffsetRef.current, Math.max(0, compSymbol.data.length - visibleDataCount)));
        compData = compSymbol.data.slice(currentScrollOffset, currentScrollOffset + visibleDataCount);
      } else {
        // Generate comparison data for range calculation
        const mainTimestamps = data.slice(currentScrollOffset, currentScrollOffset + visibleDataCount).map(point => point.time);
        const chartService = ChartService.getInstance();
        compData = chartService.dummyService.generateChartData(
          compSymbol.symbol,
          config.timeframe,
          100,
          mainTimestamps
        ).slice(0, visibleDataCount);
      }
      
      if (compData.length > 0) {
        const compPrices = compData.flatMap(d => [d.open, d.high, d.low, d.close]);
        allPrices = allPrices.concat(compPrices);
      }
    });
    
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
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

    // Draw price axis labels (Y-axis) - always show main symbol's price values
    ctx.fillStyle = '#F1F5F9';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * chartHeight) / 5;
      const price = maxPrice - (i * priceRange) / 5;
      
      // Format price based on value for better readability
      let formattedPrice = '';
      if (price >= 1000000) {
        formattedPrice = `$${(price / 1000000).toFixed(1)}M`;
      } else if (price >= 1000) {
        formattedPrice = `$${(price / 1000).toFixed(1)}K`;
      } else if (price >= 1) {
        formattedPrice = `$${price.toFixed(2)}`;
      } else {
        formattedPrice = `$${price.toFixed(4)}`;
      }
      
      ctx.fillText(formattedPrice, width - padding + 5, y + 4);
    }
    const visibleData = data.slice(currentScrollOffset, currentScrollOffset + visibleDataCount);

    // Draw time axis labels (X-axis) with proper date formatting for large datasets
    ctx.textAlign = 'center';
    ctx.font = '10px monospace';
    const visibleDataForLabels = visibleData.length > 0 ? visibleData : data;
    
    // Determine number of labels based on chart width to avoid overlap
    const maxLabels = Math.min(8, Math.floor(chartWidth / 80));
    
    for (let i = 0; i <= maxLabels; i++) {
      const x = padding + (i * chartWidth) / maxLabels;
      const dataIndex = Math.floor((i / maxLabels) * (visibleDataForLabels.length - 1));
      
      if (dataIndex < visibleDataForLabels.length) {
        const time = new Date(visibleDataForLabels[dataIndex].time * 1000);
        let timeStr = '';
        
        // Format based on timeframe for optimal readability
        switch (config.timeframe) {
          case '1m':
          case '5m':
          case '15m':
            timeStr = time.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false
            });
            break;
          case '1h':
          case '4h':
            timeStr = time.toLocaleDateString([], { 
              month: 'short', 
              day: 'numeric',
              hour: 'numeric'
            });
            break;
          case '1d':
            timeStr = time.toLocaleDateString([], { 
              month: 'short', 
              day: 'numeric'
            });
            break;
          case '1w':
            timeStr = time.toLocaleDateString([], { 
              month: 'short', 
              day: 'numeric',
              year: '2-digit'
            });
            break;
          case '1y':
            timeStr = time.toLocaleDateString([], { 
              month: 'short', 
              year: 'numeric'
            });
            break;
          default:
            timeStr = time.toLocaleDateString([], { 
              month: 'short', 
              day: 'numeric'
            });
        }
        
        ctx.fillText(timeStr, x, height - padding + 20);
      }
    }

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

    // Draw drawing objects
    drawDrawingObjects(ctx, data);

    // Draw comparison symbols (before crosshair to avoid interference)
    drawComparisonSymbols(ctx, data, minPrice, maxPrice, priceRange, visibleData);

    // Draw crosshair
    drawCrosshair(ctx, data);

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
  }, [config.chartType, config.showVolume, drawDrawingObjects, drawCrosshair, drawComparisonSymbols]);

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
      // Always allow wheel events for chart navigation
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
      // Only start dragging for chart navigation in cursor mode
      if (config.selectedTool !== 'cursor') {
        return;
      }
      
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

    // Handle mouse leave to clear crosshair
    const handleMouseLeave = () => {
      crosshairPositionRef.current = null;
      setCrosshairPosition(null);
      if (canvas) {
        drawChart(canvas, chartDataRef.current);
      }
    };

    // Handle mouse move for crosshair (only when cursor tool is active)
    const handleMouseMoveNative = (e: MouseEvent) => {
      if (config.selectedTool !== 'cursor' || isDraggingRef.current) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const chartCoords = canvasToChartCoords(x, y, chartDataRef.current);
      if (chartCoords && config.showCrosshair) {
        crosshairPositionRef.current = chartCoords;
        // Immediately redraw just the crosshair without triggering React re-render
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawChart(canvas, chartDataRef.current);
        }
      }
    };

    // Add event listeners
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('mousemove', handleMouseMoveNative);
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
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('mousemove', handleMouseMoveNative);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [config.symbol, config.chartType, config.timeframe, config.dataSource, config.showVolume, drawChart, isInDrawMode, config.selectedTool]);

  // Update chart when data changes
  useEffect(() => {
    if (canvasRef.current && chartDataRef.current.length > 0) {
      drawChart(canvasRef.current, chartDataRef.current);
    }
  }, [config.showCrosshair, drawChart]);

  // Initialize chart instance for store
  useEffect(() => {
    setChartInstance({
      redraw: () => {
        if (canvasRef.current && chartDataRef.current.length > 0) {
          drawChart(canvasRef.current, chartDataRef.current);
        }
      },
      zoomIn: () => {
        const newZoom = Math.min(5, zoomLevelRef.current * 1.2);
        zoomLevelRef.current = newZoom;
        if (canvasRef.current && chartDataRef.current.length > 0) {
          drawChart(canvasRef.current, chartDataRef.current);
        }
      },
      zoomOut: () => {
        const newZoom = Math.max(0.1, zoomLevelRef.current * 0.8);
        zoomLevelRef.current = newZoom;
        if (canvasRef.current && chartDataRef.current.length > 0) {
          drawChart(canvasRef.current, chartDataRef.current);
        }
      },
      resetZoom: () => {
        zoomLevelRef.current = 1;
        scrollOffsetRef.current = 0;
        if (canvasRef.current && chartDataRef.current.length > 0) {
          drawChart(canvasRef.current, chartDataRef.current);
        }
      }
    });
  }, [drawChart, setChartInstance]);

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
          className={`w-full h-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-sm ${
            config.selectedTool === 'cursor' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
          }`}
          style={{ display: 'block' }}
          onMouseDown={handleMouseDown}
          onMouseMove={config.selectedTool === 'cursor' ? undefined : handleMouseMove}
          onMouseUp={handleMouseUp}
          onContextMenu={handleContextMenu}
        />
        
        {/* Comparison Legend */}
        <ComparisonLegend />
        
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
        
        {/* Connection Status - Bottom Left of Chart */}
        <div className="absolute bottom-4 left-4 z-10">
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

        {/* Text Input Dialog */}
        <AnimatePresence>
          {showTextInput && (
            <motion.div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-slate-800 border border-slate-600 rounded-lg p-6 min-w-[300px]"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <h3 className="text-lg font-medium text-white mb-4">Add Text Annotation</h3>
                <input
                  type="text"
                  value={textInputValue}
                  onChange={(e) => setTextInputValue(e.target.value)}
                  placeholder="Enter text..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleTextInputSubmit();
                    } else if (e.key === 'Escape') {
                      handleTextInputCancel();
                    }
                  }}
                />
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={handleTextInputCancel}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTextInputSubmit}
                    disabled={!textInputValue.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                  >
                    Add Text
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Context Menu */}
        <AnimatePresence>
          {showContextMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-lg overflow-hidden"
              style={{
                left: Math.min(contextMenuPosition.x, window.innerWidth - 180),
                top: Math.min(contextMenuPosition.y, window.innerHeight - 120),
              }}
              onMouseLeave={() => setShowContextMenu(false)}
            >
              <div className="py-1">
                <button
                  className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                  onClick={() => {
                    if (selectedObjectId) {
                      removeDrawingObject(selectedObjectId);
                      setSelectedObjectId(null);
                    }
                    setShowContextMenu(false);
                  }}
                >
                  🗑️ Delete
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                  onClick={() => {
                    // Future: Add styling options
                    setShowContextMenu(false);
                  }}
                >
                  🎨 Style
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                  onClick={() => {
                    setShowContextMenu(false);
                  }}
                >
                  🔒 Lock
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
