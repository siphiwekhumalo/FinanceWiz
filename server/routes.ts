import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertSymbolSchema, insertChartDataSchema, insertIndicatorSchema, insertWhiteLabelConfigSchema } from "@shared/schema";
import { DataManager } from "./data-adapters/data-manager";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const dataManager = new DataManager();

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
      const whiteLabel = await storage.getWhiteLabelConfig(id);
      if (!whiteLabel) {
        return res.status(404).json({ message: 'White label configuration not found' });
      }
      res.json(whiteLabel);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch white label configuration' });
    }
  });

  app.get('/api/white-label', async (req, res) => {
    try {
      const whiteLabel = await storage.getActiveWhiteLabelConfig();
      res.json(whiteLabel);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch white label configuration' });
    }
  });

  app.post('/api/white-label', async (req, res) => {
    try {
      const validatedData = insertWhiteLabelConfigSchema.parse(req.body);
      const whiteLabel = await storage.createWhiteLabelConfig(validatedData);
      res.json(whiteLabel);
    } catch (error) {
      res.status(400).json({ message: 'Invalid white label data' });
    }
  });

  app.put('/api/white-label/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertWhiteLabelConfigSchema.partial().parse(req.body);
      const whiteLabel = await storage.updateWhiteLabelConfig(id, validatedData);
      if (!whiteLabel) {
        return res.status(404).json({ message: 'White label configuration not found' });
      }
      res.json(whiteLabel);
    } catch (error) {
      res.status(400).json({ message: 'Invalid white label data' });
    }
  });

  // Data adapter management routes
  app.get('/api/data-adapters', (req, res) => {
    const adapters = dataManager.getAvailableAdapters();
    res.json(adapters);
  });

  app.post('/api/data-adapters', async (req, res) => {
    try {
      const { name, type, config, priority } = req.body;
      await dataManager.addAdapter(name, { type, config, priority });
      res.json({ success: true, message: `Added adapter: ${name}` });
    } catch (error) {
      res.status(400).json({ success: false, message: `Failed to add adapter: ${error}` });
    }
  });

  app.delete('/api/data-adapters/:name', async (req, res) => {
    try {
      await dataManager.removeAdapter(req.params.name);
      res.json({ success: true, message: `Removed adapter: ${req.params.name}` });
    } catch (error) {
      res.status(400).json({ success: false, message: `Failed to remove adapter: ${error}` });
    }
  });

  // Enhanced chart data with multiple sources
  app.get('/api/chart-data-enhanced/:symbol', async (req, res) => {
    try {
      const symbol = req.params.symbol;
      const timeframe = req.query.timeframe as string || '1h';
      const startDate = req.query.start ? new Date(req.query.start as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const endDate = req.query.end ? new Date(req.query.end as string) : new Date();
      const preferredSource = req.query.source as string;

      const data = await dataManager.getHistoricalData({
        symbol,
        timeframe,
        start: startDate,
        end: endDate,
        preferredSource
      });

      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch enhanced chart data' });
    }
  });

  // Realtime quotes
  app.get('/api/quote/:symbol', async (req, res) => {
    try {
      const symbol = req.params.symbol;
      const preferredSource = req.query.source as string;
      
      const quote = await dataManager.getRealtimeQuote(symbol, preferredSource);
      if (!quote) {
        return res.status(404).json({ message: 'Quote not found' });
      }
      
      res.json(quote);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch quote' });
    }
  });

  // Corporate actions
  app.get('/api/corporate-actions/:symbol', async (req, res) => {
    try {
      const symbol = req.params.symbol;
      const startDate = req.query.start ? new Date(req.query.start as string) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      const endDate = req.query.end ? new Date(req.query.end as string) : new Date();

      const actions = await dataManager.getCorporateActions(symbol, startDate, endDate);
      res.json(actions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch corporate actions' });
    }
  });

  // News events
  app.get('/api/news/:symbol', async (req, res) => {
    try {
      const symbol = req.params.symbol;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const news = await dataManager.getNews(symbol, limit);
      res.json(news);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch news' });
    }
  });

  // Symbol validation
  app.get('/api/validate-symbol/:symbol', async (req, res) => {
    try {
      const symbol = req.params.symbol;
      const validation = await dataManager.validateSymbol(symbol);
      res.json(validation);
    } catch (error) {
      res.status(500).json({ message: 'Failed to validate symbol' });
    }
  });

  // WebSocket enhancements for real-time data
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'subscribe_quotes':
            await dataManager.subscribe(data.symbol, 'quotes', (quote) => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'quote_update',
                  symbol: data.symbol,
                  data: quote
                }));
              }
            });
            ws.send(JSON.stringify({ 
              type: 'subscribed', 
              symbol: data.symbol,
              dataType: 'quotes',
              status: 'success'
            }));
            break;
            
          case 'subscribe_trades':
            await dataManager.subscribe(data.symbol, 'trades', (trade) => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'trade_update',
                  symbol: data.symbol,
                  data: trade
                }));
              }
            });
            ws.send(JSON.stringify({ 
              type: 'subscribed', 
              symbol: data.symbol,
              dataType: 'trades',
              status: 'success'
            }));
            break;
            
          case 'subscribe_news':
            await dataManager.subscribe(data.symbol, 'news', (news) => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'news_update',
                  symbol: data.symbol,
                  data: news
                }));
              }
            });
            ws.send(JSON.stringify({ 
              type: 'subscribed', 
              symbol: data.symbol,
              dataType: 'news',
              status: 'success'
            }));
            break;
            
          case 'unsubscribe':
            await dataManager.unsubscribe(data.symbol, data.dataType);
            ws.send(JSON.stringify({ 
              type: 'unsubscribed', 
              symbol: data.symbol,
              dataType: data.dataType,
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

  return httpServer;
}
