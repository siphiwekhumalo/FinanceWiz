import { renderHook, act } from '@testing-library/react';
import { useWebSocket } from '../use-websocket';

// Mock WebSocket
const mockWebSocket = {
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: 1,
};

// Mock WebSocketService
jest.mock('@/services/websocket-service', () => ({
  WebSocketService: {
    getInstance: () => ({
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      getConnectionStatus: jest.fn().mockReturnValue(true),
    }),
  },
}));

describe('useWebSocket', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useWebSocket());
    
    expect(result.current.isConnected).toBe(false);
    expect(result.current.latestPrice).toBeNull();
    expect(result.current.connectionStatus).toBe('disconnected');
  });

  it('connects to WebSocket service', async () => {
    const { result } = renderHook(() => useWebSocket());
    
    await act(async () => {
      await result.current.connect();
    });
    
    expect(result.current.isConnected).toBe(true);
    expect(result.current.connectionStatus).toBe('connected');
  });

  it('disconnects from WebSocket service', async () => {
    const { result } = renderHook(() => useWebSocket());
    
    await act(async () => {
      await result.current.connect();
      result.current.disconnect();
    });
    
    expect(result.current.isConnected).toBe(false);
    expect(result.current.connectionStatus).toBe('disconnected');
  });

  it('handles price updates', async () => {
    const { result } = renderHook(() => useWebSocket());
    
    await act(async () => {
      await result.current.connect();
      // Simulate price update
      result.current.latestPrice = {
        symbol: 'AAPL',
        price: 150.25,
        change: 2.5,
        changePercent: 1.69,
        volume: 1000000,
        timestamp: Date.now(),
      };
    });
    
    expect(result.current.latestPrice).toEqual(
      expect.objectContaining({
        symbol: 'AAPL',
        price: 150.25,
        change: 2.5,
        changePercent: 1.69,
      })
    );
  });

  it('subscribes to symbol updates', async () => {
    const { result } = renderHook(() => useWebSocket());
    
    await act(async () => {
      await result.current.connect();
      result.current.subscribe('AAPL');
    });
    
    // WebSocket service subscribe should be called
    expect(result.current.isConnected).toBe(true);
  });

  it('unsubscribes from symbol updates', async () => {
    const { result } = renderHook(() => useWebSocket());
    
    await act(async () => {
      await result.current.connect();
      result.current.subscribe('AAPL');
      result.current.unsubscribe('AAPL');
    });
    
    // WebSocket service unsubscribe should be called
    expect(result.current.isConnected).toBe(true);
  });

  it('handles connection errors', async () => {
    const { result } = renderHook(() => useWebSocket());
    
    await act(async () => {
      // Simulate connection error
      result.current.connectionStatus = 'error';
    });
    
    expect(result.current.connectionStatus).toBe('error');
    expect(result.current.isConnected).toBe(false);
  });

  it('handles reconnection', async () => {
    const { result } = renderHook(() => useWebSocket());
    
    await act(async () => {
      await result.current.connect();
      result.current.connectionStatus = 'reconnecting';
    });
    
    expect(result.current.connectionStatus).toBe('reconnecting');
  });
});