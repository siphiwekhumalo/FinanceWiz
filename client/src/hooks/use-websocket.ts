import { useEffect, useRef } from 'react';
import { WebSocketService } from '@/services/websocket-service';
import { useChartStore } from '@/store/chart-store';
import { PriceUpdate } from '@/types/chart-types';

export const useWebSocket = () => {
  const wsRef = useRef<WebSocketService | null>(null);
  const { config, setSelectedSymbol, setConnected } = useChartStore();

  useEffect(() => {
    if (config.dataSource !== 'real') return;

    wsRef.current = WebSocketService.getInstance();
    
    const ws = wsRef.current;
    
    // Connect to WebSocket
    ws.connect()
      .then(() => {
        setConnected(true);
        
        // Subscribe to symbol updates
        ws.subscribe(config.symbol);
        
        // Listen for price updates
        ws.addListener('price_update', (data: PriceUpdate) => {
          if (data.symbol === config.symbol) {
            setSelectedSymbol({
              symbol: data.symbol,
              name: data.symbol,
              price: data.price,
              change: data.change,
              changePercent: data.changePercent,
              volume: data.volume,
              high24h: data.price * 1.05,
              low24h: data.price * 0.95,
            });
          }
        });

        // Listen for connection status
        ws.addListener('connected', () => {
          setConnected(true);
        });

        ws.addListener('disconnected', () => {
          setConnected(false);
        });

        ws.addListener('error', (error) => {
          console.error('WebSocket error:', error);
          setConnected(false);
        });
      })
      .catch((error) => {
        console.error('Failed to connect to WebSocket:', error);
        setConnected(false);
      });

    return () => {
      if (ws) {
        ws.unsubscribe(config.symbol);
        ws.disconnect();
      }
      setConnected(false);
    };
  }, [config.dataSource, config.symbol]);

  useEffect(() => {
    if (wsRef.current && config.dataSource === 'real') {
      // Subscribe to new symbol
      wsRef.current.subscribe(config.symbol);
    }
  }, [config.symbol, config.dataSource]);

  return {
    isConnected: wsRef.current?.getConnectionStatus() || false,
  };
};
