import { MemStorage } from '../storage';
import { InsertSymbol, InsertChartData, InsertIndicator, InsertWhiteLabel } from '@shared/schema';

describe('MemStorage', () => {
  let storage: MemStorage;

  beforeEach(() => {
    storage = new MemStorage();
  });

  describe('Symbol Operations', () => {
    it('should get all symbols', async () => {
      const symbols = await storage.getAllSymbols();
      expect(symbols).toHaveLength(6); // Default symbols
      expect(symbols[0].symbol).toBe('AAPL');
      expect(symbols[0].name).toBe('Apple Inc.');
    });

    it('should get symbol by ID', async () => {
      const symbol = await storage.getSymbol(1);
      expect(symbol).toBeDefined();
      expect(symbol!.symbol).toBe('AAPL');
      expect(symbol!.name).toBe('Apple Inc.');
    });

    it('should get symbol by symbol string', async () => {
      const symbol = await storage.getSymbolBySymbol('AAPL');
      expect(symbol).toBeDefined();
      expect(symbol!.id).toBe(1);
      expect(symbol!.symbol).toBe('AAPL');
    });

    it('should create new symbol', async () => {
      const newSymbol: InsertSymbol = {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        exchange: 'NASDAQ',
        sector: 'Technology',
      };

      const created = await storage.createSymbol(newSymbol);
      expect(created.symbol).toBe('TSLA');
      expect(created.name).toBe('Tesla Inc.');
      expect(created.id).toBeDefined();

      // Verify it's in the collection
      const retrieved = await storage.getSymbolBySymbol('TSLA');
      expect(retrieved).toBeDefined();
      expect(retrieved!.id).toBe(created.id);
    });

    it('should return undefined for non-existent symbol', async () => {
      const symbol = await storage.getSymbol(999);
      expect(symbol).toBeUndefined();
    });
  });

  describe('Chart Data Operations', () => {
    it('should get chart data for symbol', async () => {
      const data = await storage.getChartData(1, '1d', 50);
      expect(data).toHaveLength(50);
      
      data.forEach(point => {
        expect(point.symbolId).toBe(1);
        expect(point.timeframe).toBe('1d');
        expect(typeof point.timestamp).toBe('number');
        expect(typeof point.open).toBe('number');
        expect(typeof point.high).toBe('number');
        expect(typeof point.low).toBe('number');
        expect(typeof point.close).toBe('number');
        expect(typeof point.volume).toBe('number');
      });
    });

    it('should create chart data', async () => {
      const newData: InsertChartData = {
        symbolId: 1,
        timeframe: '1h',
        timestamp: Date.now(),
        open: 150.00,
        high: 155.00,
        low: 148.00,
        close: 152.00,
        volume: 1000000,
      };

      const created = await storage.createChartData(newData);
      expect(created.symbolId).toBe(1);
      expect(created.timeframe).toBe('1h');
      expect(created.open).toBe(150.00);
      expect(created.id).toBeDefined();
    });

    it('should bulk create chart data', async () => {
      const bulkData: InsertChartData[] = [
        {
          symbolId: 1,
          timeframe: '1h',
          timestamp: Date.now(),
          open: 150.00,
          high: 155.00,
          low: 148.00,
          close: 152.00,
          volume: 1000000,
        },
        {
          symbolId: 1,
          timeframe: '1h',
          timestamp: Date.now() + 3600000,
          open: 152.00,
          high: 157.00,
          low: 150.00,
          close: 155.00,
          volume: 1200000,
        },
      ];

      const created = await storage.bulkCreateChartData(bulkData);
      expect(created).toHaveLength(2);
      expect(created[0].symbolId).toBe(1);
      expect(created[1].symbolId).toBe(1);
    });

    it('should limit chart data results', async () => {
      const data = await storage.getChartData(1, '1d', 10);
      expect(data).toHaveLength(10);
    });
  });

  describe('Indicator Operations', () => {
    it('should get all indicators', async () => {
      const indicators = await storage.getAllIndicators();
      expect(indicators).toHaveLength(7); // Default indicators
      expect(indicators[0].name).toBe('Moving Average (20)');
      expect(indicators[0].type).toBe('sma');
    });

    it('should create new indicator', async () => {
      const newIndicator: InsertIndicator = {
        name: 'Custom RSI',
        type: 'rsi',
        parameters: { period: 14 },
        color: '#ff9800',
      };

      const created = await storage.createIndicator(newIndicator);
      expect(created.name).toBe('Custom RSI');
      expect(created.type).toBe('rsi');
      expect(created.parameters).toEqual({ period: 14 });
      expect(created.id).toBeDefined();

      // Verify it's in the collection
      const indicators = await storage.getAllIndicators();
      expect(indicators).toHaveLength(8);
    });
  });

  describe('White Label Operations', () => {
    it('should get white label configuration', async () => {
      const whiteLabel = await storage.getWhiteLabel(1);
      expect(whiteLabel).toBeDefined();
      expect(whiteLabel!.name).toBe('Default Theme');
      expect(whiteLabel!.primaryColor).toBe('#3b82f6');
    });

    it('should create white label configuration', async () => {
      const newWhiteLabel: InsertWhiteLabel = {
        name: 'Custom Theme',
        primaryColor: '#10b981',
        secondaryColor: '#f59e0b',
        logoUrl: 'https://example.com/logo.png',
        showLogo: true,
        showVolume: true,
        showIndicators: true,
        enableDrawingTools: true,
        enableComparison: true,
        theme: 'dark',
      };

      const created = await storage.createWhiteLabel(newWhiteLabel);
      expect(created.name).toBe('Custom Theme');
      expect(created.primaryColor).toBe('#10b981');
      expect(created.id).toBeDefined();
    });

    it('should update white label configuration', async () => {
      const updates = {
        name: 'Updated Theme',
        primaryColor: '#ef4444',
      };

      const updated = await storage.updateWhiteLabel(1, updates);
      expect(updated).toBeDefined();
      expect(updated!.name).toBe('Updated Theme');
      expect(updated!.primaryColor).toBe('#ef4444');
    });

    it('should return undefined for non-existent white label', async () => {
      const whiteLabel = await storage.getWhiteLabel(999);
      expect(whiteLabel).toBeUndefined();
    });
  });

  describe('Trade Operations', () => {
    it('should get recent trades', async () => {
      const trades = await storage.getRecentTrades(1, 20);
      expect(trades).toHaveLength(20);
      
      trades.forEach(trade => {
        expect(trade.symbolId).toBe(1);
        expect(typeof trade.price).toBe('number');
        expect(typeof trade.quantity).toBe('number');
        expect(typeof trade.timestamp).toBe('number');
        expect(['buy', 'sell']).toContain(trade.side);
      });
    });

    it('should create new trade', async () => {
      const newTrade = {
        symbolId: 1,
        price: 150.25,
        quantity: 100,
        side: 'buy' as const,
        timestamp: Date.now(),
      };

      const created = await storage.createTrade(newTrade);
      expect(created.symbolId).toBe(1);
      expect(created.price).toBe(150.25);
      expect(created.quantity).toBe(100);
      expect(created.side).toBe('buy');
      expect(created.id).toBeDefined();
    });
  });

  describe('Order Book Operations', () => {
    it('should get order book', async () => {
      const orderBook = await storage.getOrderBook(1);
      expect(orderBook).toHaveLength(20); // 10 bids + 10 asks
      
      const bids = orderBook.filter(entry => entry.side === 'bid');
      const asks = orderBook.filter(entry => entry.side === 'ask');
      
      expect(bids).toHaveLength(10);
      expect(asks).toHaveLength(10);
      
      orderBook.forEach(entry => {
        expect(entry.symbolId).toBe(1);
        expect(typeof entry.price).toBe('number');
        expect(typeof entry.quantity).toBe('number');
        expect(['bid', 'ask']).toContain(entry.side);
      });
    });

    it('should create order book entry', async () => {
      const newEntry = {
        symbolId: 1,
        price: 150.00,
        quantity: 500,
        side: 'bid' as const,
      };

      const created = await storage.createOrderBookEntry(newEntry);
      expect(created.symbolId).toBe(1);
      expect(created.price).toBe(150.00);
      expect(created.quantity).toBe(500);
      expect(created.side).toBe('bid');
      expect(created.id).toBeDefined();
    });

    it('should clear order book', async () => {
      await storage.clearOrderBook(1);
      const orderBook = await storage.getOrderBook(1);
      expect(orderBook).toHaveLength(0);
    });
  });
});