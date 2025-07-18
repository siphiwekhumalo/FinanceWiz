import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertSymbolSchema, insertChartDataSchema, insertIndicatorSchema, insertWhiteLabelSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time data
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        switch (data.type) {
          case 'subscribe':
            // Subscribe to symbol updates
            ws.send(JSON.stringify({ 
              type: 'subscribed', 
              symbol: data.symbol,
              status: 'success'
            }));
            break;
          case 'unsubscribe':
            // Unsubscribe from symbol updates
            ws.send(JSON.stringify({ 
              type: 'unsubscribed', 
              symbol: data.symbol,
              status: 'success'
            }));
            break;
          default:
            ws.send(JSON.stringify({ 
              type: 'error', 
              message: 'Unknown message type'
            }));
        }
      } catch (error) {
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Invalid message format'
        }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Broadcast real-time data to all connected clients
  const broadcastPriceUpdate = (symbol: string, data: any) => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'price_update',
          symbol,
          data
        }));
      }
    });
  };

  // Simulate real-time price updates
  setInterval(() => {
    storage.getAllSymbols().then(symbols => {
      symbols.forEach(symbol => {
        const mockPrice = {
          symbol: symbol.symbol,
          price: (Math.random() * 200 + 100).toFixed(2),
          change: (Math.random() * 10 - 5).toFixed(2),
          changePercent: (Math.random() * 5 - 2.5).toFixed(2),
          volume: Math.floor(Math.random() * 1000000),
          timestamp: new Date().toISOString()
        };
        
        broadcastPriceUpdate(symbol.symbol, mockPrice);
      });
    });
  }, 5000);

  // Symbol routes
  app.get('/api/symbols', async (req, res) => {
    try {
      const symbols = await storage.getAllSymbols();
      res.json(symbols);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch symbols' });
    }
  });

  app.get('/api/symbols/:symbol', async (req, res) => {
    try {
      const symbol = await storage.getSymbolBySymbol(req.params.symbol);
      if (!symbol) {
        return res.status(404).json({ message: 'Symbol not found' });
      }
      res.json(symbol);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch symbol' });
    }
  });

  app.post('/api/symbols', async (req, res) => {
    try {
      const validatedData = insertSymbolSchema.parse(req.body);
      const symbol = await storage.createSymbol(validatedData);
      res.json(symbol);
    } catch (error) {
      res.status(400).json({ message: 'Invalid symbol data' });
    }
  });

  // Chart data routes
  app.get('/api/chart-data/:symbolId/:timeframe', async (req, res) => {
    try {
      const symbolId = parseInt(req.params.symbolId);
      const timeframe = req.params.timeframe;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      
      const chartData = await storage.getChartData(symbolId, timeframe, limit);
      res.json(chartData);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch chart data' });
    }
  });

  app.post('/api/chart-data', async (req, res) => {
    try {
      const validatedData = insertChartDataSchema.parse(req.body);
      const chartData = await storage.createChartData(validatedData);
      res.json(chartData);
    } catch (error) {
      res.status(400).json({ message: 'Invalid chart data' });
    }
  });

  // Dummy data generation endpoint
  app.post('/api/generate-dummy-data/:symbolId', async (req, res) => {
    try {
      const symbolId = parseInt(req.params.symbolId);
      const { timeframe = '1h', count = 100 } = req.body;
      
      const symbol = await storage.getSymbol(symbolId);
      if (!symbol) {
        return res.status(404).json({ message: 'Symbol not found' });
      }

      const now = new Date();
      const timeframeMinutes: Record<string, number> = {
        '1m': 1,
        '5m': 5,
        '15m': 15,
        '1h': 60,
        '4h': 240,
        '1d': 1440,
        '1w': 10080
      };
      const intervalMinutes = timeframeMinutes[timeframe] || 60;

      const dummyData = [];
      let basePrice = 100 + Math.random() * 100;
      
      for (let i = count; i > 0; i--) {
        const timestamp = new Date(now.getTime() - i * intervalMinutes * 60 * 1000);
        const volatility = 0.02;
        const change = (Math.random() - 0.5) * volatility;
        
        const open = basePrice;
        const close = basePrice * (1 + change);
        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (1 - Math.random() * 0.01);
        const volume = Math.floor(Math.random() * 1000000);
        
        dummyData.push({
          symbolId,
          timeframe,
          timestamp,
          open: open.toFixed(4),
          high: high.toFixed(4),
          low: low.toFixed(4),
          close: close.toFixed(4),
          volume: volume.toString()
        });
        
        basePrice = close;
      }

      const createdData = await storage.bulkCreateChartData(dummyData);
      res.json(createdData);
    } catch (error) {
      res.status(500).json({ message: 'Failed to generate dummy data' });
    }
  });

  // Indicator routes
  app.get('/api/indicators', async (req, res) => {
    try {
      const indicators = await storage.getAllIndicators();
      res.json(indicators);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch indicators' });
    }
  });

  app.post('/api/indicators', async (req, res) => {
    try {
      const validatedData = insertIndicatorSchema.parse(req.body);
      const indicator = await storage.createIndicator(validatedData);
      res.json(indicator);
    } catch (error) {
      res.status(400).json({ message: 'Invalid indicator data' });
    }
  });

  // White label routes
  app.get('/api/white-label/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const whiteLabel = await storage.getWhiteLabel(id);
      if (!whiteLabel) {
        return res.status(404).json({ message: 'White label configuration not found' });
      }
      res.json(whiteLabel);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch white label configuration' });
    }
  });

  app.post('/api/white-label', async (req, res) => {
    try {
      const validatedData = insertWhiteLabelSchema.parse(req.body);
      const whiteLabel = await storage.createWhiteLabel(validatedData);
      res.json(whiteLabel);
    } catch (error) {
      res.status(400).json({ message: 'Invalid white label data' });
    }
  });

  app.put('/api/white-label/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertWhiteLabelSchema.partial().parse(req.body);
      const whiteLabel = await storage.updateWhiteLabel(id, validatedData);
      if (!whiteLabel) {
        return res.status(404).json({ message: 'White label configuration not found' });
      }
      res.json(whiteLabel);
    } catch (error) {
      res.status(400).json({ message: 'Invalid white label data' });
    }
  });

  // Trade routes
  app.get('/api/trades/:symbolId', async (req, res) => {
    try {
      const symbolId = parseInt(req.params.symbolId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const trades = await storage.getRecentTrades(symbolId, limit);
      res.json(trades);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch trades' });
    }
  });

  // Order book routes
  app.get('/api/order-book/:symbolId', async (req, res) => {
    try {
      const symbolId = parseInt(req.params.symbolId);
      const orderBook = await storage.getOrderBook(symbolId);
      res.json(orderBook);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch order book' });
    }
  });

  return httpServer;
}
