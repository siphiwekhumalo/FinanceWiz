import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../routes';
import { MemStorage } from '../storage';

const app = express();
app.use(express.json());

// Mock storage
const mockStorage = new MemStorage();

describe('API Routes', () => {
  beforeAll(async () => {
    await registerRoutes(app);
  });

  describe('GET /api/symbols', () => {
    it('returns all symbols', async () => {
      const response = await request(app)
        .get('/api/symbols')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('symbol');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('exchange');
    });
  });

  describe('GET /api/symbols/:symbol', () => {
    it('returns specific symbol data', async () => {
      const response = await request(app)
        .get('/api/symbols/AAPL')
        .expect(200);

      expect(response.body).toHaveProperty('symbol', 'AAPL');
      expect(response.body).toHaveProperty('name', 'Apple Inc.');
      expect(response.body).toHaveProperty('exchange');
    });

    it('returns 404 for non-existent symbol', async () => {
      const response = await request(app)
        .get('/api/symbols/NONEXISTENT')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/chart-data/:symbol', () => {
    it('returns chart data for symbol', async () => {
      const response = await request(app)
        .get('/api/chart-data/AAPL')
        .query({ timeframe: '1d', limit: '50' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(50);
      
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('timestamp');
        expect(response.body[0]).toHaveProperty('open');
        expect(response.body[0]).toHaveProperty('high');
        expect(response.body[0]).toHaveProperty('low');
        expect(response.body[0]).toHaveProperty('close');
        expect(response.body[0]).toHaveProperty('volume');
      }
    });

    it('validates query parameters', async () => {
      const response = await request(app)
        .get('/api/chart-data/AAPL')
        .query({ timeframe: 'invalid', limit: 'abc' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/indicators', () => {
    it('returns all indicators', async () => {
      const response = await request(app)
        .get('/api/indicators')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('type');
      expect(response.body[0]).toHaveProperty('parameters');
    });
  });

  describe('GET /api/white-label/:id', () => {
    it('returns white label configuration', async () => {
      const response = await request(app)
        .get('/api/white-label/1')
        .expect(200);

      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('primaryColor');
      expect(response.body).toHaveProperty('theme');
    });

    it('returns 404 for non-existent white label', async () => {
      const response = await request(app)
        .get('/api/white-label/999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/white-label/:id', () => {
    it('updates white label configuration', async () => {
      const updateData = {
        name: 'Updated Theme',
        primaryColor: '#ff0000',
        theme: 'light',
      };

      const response = await request(app)
        .put('/api/white-label/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Updated Theme');
      expect(response.body).toHaveProperty('primaryColor', '#ff0000');
      expect(response.body).toHaveProperty('theme', 'light');
    });

    it('validates update data', async () => {
      const invalidData = {
        primaryColor: 'invalid-color',
        theme: 'invalid-theme',
      };

      const response = await request(app)
        .put('/api/white-label/1')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/trades/:symbol', () => {
    it('returns recent trades for symbol', async () => {
      const response = await request(app)
        .get('/api/trades/AAPL')
        .query({ limit: '20' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(20);
      
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('price');
        expect(response.body[0]).toHaveProperty('quantity');
        expect(response.body[0]).toHaveProperty('side');
        expect(response.body[0]).toHaveProperty('timestamp');
      }
    });
  });

  describe('GET /api/order-book/:symbol', () => {
    it('returns order book for symbol', async () => {
      const response = await request(app)
        .get('/api/order-book/AAPL')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('price');
        expect(response.body[0]).toHaveProperty('quantity');
        expect(response.body[0]).toHaveProperty('side');
        expect(['bid', 'ask']).toContain(response.body[0].side);
      }
    });
  });

  describe('POST /api/symbols', () => {
    it('creates new symbol', async () => {
      const newSymbol = {
        symbol: 'TEST',
        name: 'Test Company',
        exchange: 'NASDAQ',
        sector: 'Technology',
      };

      const response = await request(app)
        .post('/api/symbols')
        .send(newSymbol)
        .expect(201);

      expect(response.body).toHaveProperty('symbol', 'TEST');
      expect(response.body).toHaveProperty('name', 'Test Company');
      expect(response.body).toHaveProperty('id');
    });

    it('validates symbol data', async () => {
      const invalidSymbol = {
        symbol: '',
        name: '',
      };

      const response = await request(app)
        .post('/api/symbols')
        .send(invalidSymbol)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Error Handling', () => {
    it('handles 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('handles malformed JSON', async () => {
      const response = await request(app)
        .post('/api/symbols')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('CORS Headers', () => {
    it('includes CORS headers', async () => {
      const response = await request(app)
        .get('/api/symbols')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});