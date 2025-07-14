# Financial Chart Dashboard

A comprehensive white-label financial charting platform offering professional-grade visualization with advanced multi-symbol comparison and synchronized trading insights.

## Features

- **Professional Chart Types**: Candlestick, line, and area charts with HD rendering
- **Multi-Symbol Comparison**: ChartIQ-style symbol overlays with combined price scaling
- **Technical Analysis**: Full suite of indicators and drawing tools
- **Interactive Navigation**: Smooth scrolling, zoom controls, and keyboard shortcuts
- **Real-time Data**: WebSocket-based live market data updates
- **White-label Customization**: Logo upload, color themes, and feature toggles
- **Embeddable Widgets**: Generate iframe-based chart embeds for SaaS dashboards
- **Responsive Design**: Mobile-first approach with adaptive layouts

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with custom CSS variables for theming
- **Zustand** for client-side state management
- **Radix UI** primitives with shadcn/ui component library
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management
- **Framer Motion** for smooth animations
- **Custom HTML5 Canvas** chart engine with HD rendering

### Backend
- **Node.js** with Express.js server
- **PostgreSQL** with Drizzle ORM
- **WebSocket** server for real-time data streaming
- **Express sessions** with PostgreSQL storage
- **In-memory storage** for development (MemStorage)

## Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn**
- **PostgreSQL** (optional, uses in-memory storage by default)

## Local Development Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd financial-chart-dashboard
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Development environment
NODE_ENV=development

# Database (optional - uses in-memory storage by default)
DATABASE_URL=postgresql://username:password@localhost:5432/chart_dashboard

# WebSocket configuration
WS_PORT=3001
```

### 3. Database Setup (Optional)

If you want to use PostgreSQL instead of in-memory storage:

```bash
# Install PostgreSQL locally
# Create database
createdb chart_dashboard

# Run migrations
npm run db:migrate

# Generate database schema
npm run db:generate
```

### 4. Start Development Server

```bash
npm run dev
```

This command starts:
- **Frontend**: Vite dev server on `http://localhost:5000`
- **Backend**: Express server on `http://localhost:5000`
- **WebSocket**: WebSocket server on `/ws` path

The app will be available at `http://localhost:5000`

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── chart/     # Chart-specific components
│   │   │   ├── header/    # Application header
│   │   │   ├── modals/    # Modal dialogs
│   │   │   ├── right-panel/ # Market data panel
│   │   │   └── ui/        # shadcn/ui components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API and data services
│   │   ├── store/         # Zustand state management
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   └── index.html         # HTML template
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Storage interface and implementation
│   └── vite.ts           # Vite integration
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema with Drizzle
└── package.json          # Dependencies and scripts
```

## Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Database
npm run db:generate     # Generate database schema
npm run db:migrate      # Run database migrations
npm run db:push         # Push schema to database
npm run db:studio       # Open Drizzle Studio

# Development tools
npm run type-check      # TypeScript type checking
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
```

## Chart Controls

### Navigation
- **Mouse Wheel**: Horizontal scrolling
- **Ctrl/Cmd + Mouse Wheel**: Zoom in/out
- **Arrow Keys**: Navigate left/right
- **Space + Drag**: Pan chart

### Keyboard Shortcuts
- **Ctrl/Cmd + R**: Reset zoom
- **Ctrl/Cmd + +**: Zoom in
- **Ctrl/Cmd + -**: Zoom out
- **C**: Toggle crosshair
- **V**: Toggle volume display

### UI Controls
- **Zoom Controls**: Bottom-center floating controls
- **Symbol Dropdown**: Change primary symbol
- **Comparison**: Add/remove comparison symbols
- **Timeframes**: 1m, 5m, 15m, 1h, 4h, 1d, 1w, yearly
- **Chart Types**: Candlestick, line, area
- **Indicators**: Moving averages, RSI, MACD
- **Drawing Tools**: Lines, rectangles, text annotations

## API Endpoints

### Symbols
- `GET /api/symbols` - Get all available symbols
- `GET /api/symbols/:symbol` - Get symbol details

### Chart Data
- `GET /api/chart-data/:symbolId` - Get chart data for symbol
- `POST /api/chart-data` - Create chart data

### Indicators
- `GET /api/indicators` - Get all available indicators
- `POST /api/indicators` - Create custom indicator

### White Label
- `GET /api/white-label/:id` - Get white label configuration
- `PUT /api/white-label/:id` - Update white label settings

### WebSocket Events
- `price_update` - Real-time price updates
- `symbol_subscribe` - Subscribe to symbol updates
- `symbol_unsubscribe` - Unsubscribe from symbol

## Configuration

### Chart Configuration
Modify `client/src/store/chart-store.ts` for default settings:

```typescript
const defaultConfig: ChartConfig = {
  symbol: 'AAPL',
  chartType: 'candlestick',
  timeframe: '1h',
  dataSource: 'dummy',
  showVolume: false,
  showCrosshair: true,
  comparisonSymbols: [],
  comparisonMode: 'absolute',
};
```

### Theme Customization
Update CSS variables in `client/src/index.css`:

```css
:root {
  --primary-color: hsl(215, 100%, 50%);
  --secondary-color: hsl(215, 100%, 60%);
  --background: hsl(224, 71%, 4%);
  --foreground: hsl(213, 31%, 91%);
}
```

## Development Tips

### Hot Reload
- Frontend changes auto-reload via Vite HMR
- Backend changes restart the server automatically
- WebSocket connections reconnect automatically

### Data Sources
- **Dummy Data**: Generated realistic financial data for development
- **Real Data**: Configure API keys for live market data
- **WebSocket**: Real-time price updates simulation

### Debugging
- **Browser DevTools**: Full React DevTools support
- **Console Logs**: Detailed logging for chart operations
- **Network Tab**: API request monitoring
- **WebSocket**: Connection status in developer tools

### Performance
- **Canvas Rendering**: Hardware-accelerated HD charts
- **Data Virtualization**: Efficient handling of large datasets
- **Lazy Loading**: Components load on demand
- **Optimized Scrolling**: Smooth 60fps chart navigation

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process using port 5000
   lsof -ti:5000 | xargs kill -9
   ```

2. **Database Connection Error**
   ```bash
   # Check PostgreSQL is running
   pg_ctl status
   
   # Start PostgreSQL
   pg_ctl start
   ```

3. **WebSocket Connection Failed**
   - Check if port 3001 is available
   - Verify WebSocket URL in browser console
   - Check firewall settings

4. **Build Errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

5. **Type Errors**
   ```bash
   # Run type checking
   npm run type-check
   
   # Update TypeScript types
   npm update @types/node @types/react
   ```

## Production Deployment

### Build Commands
```bash
# Build frontend and backend
npm run build

# Preview production build
npm run preview
```

### Environment Variables
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
PORT=5000
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Automatic formatting
- **Components**: Functional components with hooks
- **State**: Zustand for global state, useState for local state

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- **Issues**: Create GitHub issue
- **Documentation**: See `/docs` folder
- **Examples**: Check `/examples` folder