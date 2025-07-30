# Data Adapter System

## Overview

The Financial Chart Dashboard features a comprehensive pluggable data adapter system that enables integration with multiple market data vendors. This flexible architecture supports real-time data streaming, historical data fetching, corporate actions, and news integration.

## Supported Data Sources

### 1. Alpha Vantage
- **Type**: Professional Market Data
- **Coverage**: Stocks, Forex, Crypto, Technical Indicators
- **Real-time**: Limited (5 requests/minute free tier)
- **Features**: News sentiment, corporate actions
- **Setup**: Requires API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)

### 2. Binance
- **Type**: Cryptocurrency Exchange
- **Coverage**: 500+ crypto pairs
- **Real-time**: WebSocket streaming
- **Features**: Live trades, order book, klines
- **Setup**: No API key required for public data

### 3. CSV Files
- **Type**: Local/Historical Data
- **Coverage**: Custom datasets
- **Real-time**: Replay simulation
- **Features**: Flexible column mapping
- **Setup**: CSV file with OHLCV columns

### 4. Database Integration
- **Type**: PostgreSQL Storage
- **Coverage**: Cached and custom data
- **Real-time**: Yes (via WebSocket)
- **Features**: Persistent storage, custom indicators
- **Setup**: Automatic with PostgreSQL database

## Architecture

### Base Adapter Interface

```typescript
abstract class BaseDataAdapter {
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract getHistoricalData(symbol: string, timeframe: string, start: Date, end: Date): Promise<MarketDataPoint[]>;
  abstract getRealtimeQuote(symbol: string): Promise<MarketDataPoint | null>;
  abstract subscribe(subscription: DataSubscription): Promise<void>;
  abstract unsubscribe(symbol: string, dataType: string): Promise<void>;
}
```

### Data Manager

The `DataManager` class orchestrates multiple adapters:

- **Priority-based routing**: Higher priority adapters are tried first
- **Fallback mechanism**: Automatically tries next adapter if one fails
- **Data aggregation**: Combines data from multiple sources
- **Real-time subscriptions**: WebSocket-based live data streaming

## Configuration Examples

### Alpha Vantage Setup

```json
{
  "name": "AlphaVantage_Primary",
  "type": "alpha_vantage",
  "config": {
    "apiKey": "your_api_key_here"
  },
  "priority": 5
}
```

### Binance Setup

```json
{
  "name": "Binance_Crypto",
  "type": "binance",
  "config": {
    "baseUrl": "https://api.binance.com"
  },
  "priority": 3
}
```

### CSV Setup

```json
{
  "name": "Historical_Data",
  "type": "csv",
  "config": {
    "filePath": "/data/historical_prices.csv",
    "delimiter": ",",
    "dateFormat": "YYYY-MM-DD HH:mm:ss"
  },
  "priority": 1
}
```

## API Endpoints

### Adapter Management

- `GET /api/data-adapters` - List all adapters
- `POST /api/data-adapters` - Add new adapter
- `DELETE /api/data-adapters/:name` - Remove adapter

### Enhanced Data Access

- `GET /api/chart-data-enhanced/:symbol` - Multi-source historical data
- `GET /api/quote/:symbol` - Real-time quote with source fallback
- `GET /api/corporate-actions/:symbol` - Corporate actions and events
- `GET /api/news/:symbol` - Financial news and sentiment
- `GET /api/validate-symbol/:symbol` - Symbol validation across sources

## WebSocket Integration

### Real-time Subscriptions

```javascript
// Subscribe to quotes
webSocketService.subscribeToQuotes('AAPL', (quote) => {
  console.log('Real-time quote:', quote);
});

// Subscribe to trades
webSocketService.subscribeToTrades('BTCUSDT', (trade) => {
  console.log('New trade:', trade);
});

// Subscribe to news
webSocketService.subscribeToNews('AAPL', (news) => {
  console.log('Breaking news:', news);
});
```

### Message Types

- `quote_update` - Real-time price updates
- `trade_update` - Individual trade executions
- `news_update` - Breaking news and events
- `corporate_action` - Dividends, splits, earnings

## Corporate Actions Support

### Supported Action Types

1. **Dividends**
   - Regular dividends
   - Special dividends
   - Dividend reinvestment plans (DRIP)

2. **Stock Splits**
   - Forward splits
   - Reverse splits
   - Stock dividends

3. **Earnings**
   - Quarterly reports
   - Annual reports
   - Guidance updates

4. **Mergers & Acquisitions**
   - Cash mergers
   - Stock mergers
   - Spin-offs

5. **Custom Events**
   - Insider trades
   - Analyst upgrades/downgrades
   - Regulatory filings

## Data Quality & Validation

### Symbol Validation

```typescript
const validation = await dataService.validateSymbol('AAPL');
// Returns: { isValid: true, sources: ['alpha_vantage', 'binance'] }
```

### Data Integrity Checks

- **Timestamp validation**: Ensures chronological order
- **Price validation**: Checks for outliers and gaps
- **Volume validation**: Validates trading volume ranges
- **Source attribution**: Tracks data origin for audit trails

## Performance Optimizations

### Caching Strategy

- **Database caching**: Historical data cached in PostgreSQL
- **Memory caching**: Recent quotes cached in memory
- **CDN integration**: Static resources served via CDN

### Rate Limiting

- **Per-adapter limits**: Respects individual API rate limits
- **Intelligent queuing**: Batches requests when possible
- **Exponential backoff**: Handles rate limit errors gracefully

## Error Handling

### Adapter Failures

```typescript
try {
  const data = await dataManager.getHistoricalData(request);
} catch (error) {
  // Automatic fallback to next priority adapter
  console.log('Fallback adapter used:', error.source);
}
```

### Connection Monitoring

- **Health checks**: Regular adapter connectivity tests
- **Automatic reconnection**: WebSocket auto-reconnect with exponential backoff
- **Status reporting**: Real-time adapter status in UI

## Extending the System

### Creating Custom Adapters

1. **Extend BaseDataAdapter**
2. **Implement required methods**
3. **Add to DataManager**
4. **Configure via UI or API**

Example custom adapter:

```typescript
export class CustomDataAdapter extends BaseDataAdapter {
  async connect() {
    // Custom connection logic
  }
  
  async getHistoricalData(symbol, timeframe, start, end) {
    // Custom data fetching logic
    return marketDataPoints;
  }
  
  // Implement other required methods...
}
```

### Integration Patterns

- **Microservices**: Deploy adapters as separate services
- **Event-driven**: Use message queues for data distribution
- **Multi-region**: Deploy adapters in multiple regions for latency optimization

## Security Considerations

### API Key Management

- **Environment variables**: Store sensitive keys securely
- **Encryption**: Encrypt keys at rest
- **Rotation**: Regular key rotation policies

### Data Privacy

- **No PII storage**: Only market data, no personal information
- **Audit logging**: Track all data access and modifications
- **Compliance**: Adheres to financial data regulations

## Monitoring & Analytics

### Metrics Tracking

- **Request latency**: Track response times per adapter
- **Error rates**: Monitor failure rates and types
- **Data quality**: Track missing data and outliers
- **Usage patterns**: Analyze most requested symbols and timeframes

### Alerting

- **Adapter failures**: Immediate alerts for adapter disconnections
- **Data quality issues**: Alerts for missing or suspicious data
- **Rate limit warnings**: Proactive alerts before hitting limits

## Future Enhancements

### Planned Features

1. **Machine Learning Integration**
   - Predictive data quality scoring
   - Anomaly detection in real-time feeds
   - Intelligent source selection

2. **Advanced Corporate Actions**
   - Options expiry tracking
   - Warrant exercises
   - Rights offerings

3. **Alternative Data Sources**
   - Social sentiment data
   - Satellite imagery analysis
   - Economic indicators integration

4. **Performance Improvements**
   - Edge computing deployment
   - Advanced caching strategies
   - GPU-accelerated data processing

This pluggable data adapter system provides a robust foundation for integrating with any market data vendor while maintaining high performance, reliability, and flexibility.