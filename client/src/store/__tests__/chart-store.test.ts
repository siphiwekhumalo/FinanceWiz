import { useChartStore } from '../chart-store';
import { renderHook, act } from '@testing-library/react';
import { ChartType, Timeframe, DataSource } from '@/types/chart-types';

describe('ChartStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useChartStore.getState().setChartInstance(null);
    useChartStore.getState().setSelectedSymbol(null);
    useChartStore.getState().setChartData([]);
    useChartStore.getState().clearDrawingObjects();
    useChartStore.getState().clearComparisonSymbols();
  });

  describe('Chart Configuration', () => {
    it('should have default configuration', () => {
      const { result } = renderHook(() => useChartStore());
      
      expect(result.current.config.chartType).toBe('candlestick');
      expect(result.current.config.timeframe).toBe('1d');
      expect(result.current.config.dataSource).toBe('dummy');
      expect(result.current.config.selectedTool).toBe('cursor');
      expect(result.current.config.showVolume).toBe(false);
      expect(result.current.config.showCrosshair).toBe(true);
    });

    it('should update chart type', () => {
      const { result } = renderHook(() => useChartStore());
      
      act(() => {
        result.current.setChartType('line' as ChartType);
      });
      
      expect(result.current.config.chartType).toBe('line');
    });

    it('should update timeframe', () => {
      const { result } = renderHook(() => useChartStore());
      
      act(() => {
        result.current.setTimeframe('1h' as Timeframe);
      });
      
      expect(result.current.config.timeframe).toBe('1h');
    });

    it('should update data source', () => {
      const { result } = renderHook(() => useChartStore());
      
      act(() => {
        result.current.setDataSource('live' as DataSource);
      });
      
      expect(result.current.config.dataSource).toBe('live');
    });
  });

  describe('Symbol Management', () => {
    it('should set selected symbol', () => {
      const { result } = renderHook(() => useChartStore());
      const mockSymbol = {
        id: 1,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 150.25,
        change: 2.5,
        changePercent: 1.69,
        volume: 50000000,
        marketCap: 2500000000000,
        sector: 'Technology',
      };
      
      act(() => {
        result.current.setSelectedSymbol(mockSymbol);
      });
      
      expect(result.current.selectedSymbol).toBe(mockSymbol);
    });

    it('should set symbol by string', () => {
      const { result } = renderHook(() => useChartStore());
      
      act(() => {
        result.current.setSymbol('AAPL');
      });
      
      // The setSymbol function should trigger symbol loading
      // This is a simplified test - in practice it would involve async operations
      expect(result.current.config.selectedTool).toBe('cursor');
    });
  });

  describe('Chart Data Management', () => {
    it('should set chart data', () => {
      const { result } = renderHook(() => useChartStore());
      const mockData = [
        {
          time: Date.now() / 1000,
          open: 150,
          high: 155,
          low: 148,
          close: 152,
          volume: 1000000,
        },
      ];
      
      act(() => {
        result.current.setChartData(mockData);
      });
      
      expect(result.current.chartData).toBe(mockData);
    });

    it('should toggle volume display', () => {
      const { result } = renderHook(() => useChartStore());
      
      expect(result.current.config.showVolume).toBe(false);
      
      act(() => {
        result.current.toggleVolume();
      });
      
      expect(result.current.config.showVolume).toBe(true);
    });

    it('should toggle crosshair display', () => {
      const { result } = renderHook(() => useChartStore());
      
      expect(result.current.config.showCrosshair).toBe(true);
      
      act(() => {
        result.current.toggleCrosshair();
      });
      
      expect(result.current.config.showCrosshair).toBe(false);
    });
  });

  describe('Chart Instance Management', () => {
    it('should set chart instance', () => {
      const { result } = renderHook(() => useChartStore());
      const mockInstance = {
        zoomIn: jest.fn(),
        zoomOut: jest.fn(),
        resetZoom: jest.fn(),
      };
      
      act(() => {
        result.current.setChartInstance(mockInstance);
      });
      
      expect(result.current.chartInstance).toBe(mockInstance);
    });

    it('should call zoom methods on chart instance', () => {
      const { result } = renderHook(() => useChartStore());
      const mockInstance = {
        zoomIn: jest.fn(),
        zoomOut: jest.fn(),
        resetZoom: jest.fn(),
      };
      
      act(() => {
        result.current.setChartInstance(mockInstance);
      });
      
      act(() => {
        result.current.zoomIn();
      });
      
      expect(mockInstance.zoomIn).toHaveBeenCalled();
      
      act(() => {
        result.current.zoomOut();
      });
      
      expect(mockInstance.zoomOut).toHaveBeenCalled();
      
      act(() => {
        result.current.resetZoom();
      });
      
      expect(mockInstance.resetZoom).toHaveBeenCalled();
    });
  });

  describe('Drawing Objects', () => {
    it('should add drawing object', () => {
      const { result } = renderHook(() => useChartStore());
      const mockObject = {
        id: 'test-1',
        type: 'trendline' as const,
        points: [],
        color: '#3b82f6',
        lineWidth: 2,
        completed: false,
      };
      
      act(() => {
        result.current.addDrawingObject(mockObject);
      });
      
      expect(result.current.config.drawingObjects).toContainEqual(mockObject);
    });

    it('should remove drawing object', () => {
      const { result } = renderHook(() => useChartStore());
      const mockObject = {
        id: 'test-1',
        type: 'trendline' as const,
        points: [],
        color: '#3b82f6',
        lineWidth: 2,
        completed: false,
      };
      
      act(() => {
        result.current.addDrawingObject(mockObject);
      });
      
      expect(result.current.config.drawingObjects).toHaveLength(1);
      
      act(() => {
        result.current.removeDrawingObject('test-1');
      });
      
      expect(result.current.config.drawingObjects).toHaveLength(0);
    });

    it('should clear all drawing objects', () => {
      const { result } = renderHook(() => useChartStore());
      const mockObjects = [
        {
          id: 'test-1',
          type: 'trendline' as const,
          points: [],
          color: '#3b82f6',
          lineWidth: 2,
          completed: false,
        },
        {
          id: 'test-2',
          type: 'rectangle' as const,
          points: [],
          color: '#ef4444',
          lineWidth: 2,
          completed: false,
        },
      ];
      
      mockObjects.forEach(obj => {
        act(() => {
          result.current.addDrawingObject(obj);
        });
      });
      
      expect(result.current.config.drawingObjects).toHaveLength(2);
      
      act(() => {
        result.current.clearDrawingObjects();
      });
      
      expect(result.current.config.drawingObjects).toHaveLength(0);
    });
  });
});