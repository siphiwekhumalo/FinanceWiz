# Financial Chart Dashboard

## Overview

This is a white-label financial charting application built with React, TypeScript, and Express.js. The application provides real-time financial data visualization with customizable theming, technical indicators, and embeddable chart widgets. It features a modern dark theme interface with comprehensive trading tools and market data displays.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: Zustand for client-side state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query (React Query) for server state management

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time Communication**: WebSocket server for live data streaming
- **API Design**: RESTful API with structured error handling
- **Session Management**: Express sessions with PostgreSQL storage

### Chart Integration
- **Library**: Lightweight Charts (TradingView's charting library)
- **Chart Types**: Candlestick, line, and area charts
- **Technical Indicators**: Moving averages, RSI, MACD, and custom indicators
- **Drawing Tools**: Trend lines, Fibonacci retracements, rectangles, and text annotations

## Key Components

### Data Management
- **Dummy Data Service**: Generates realistic financial data for development and testing
- **Real-time Data Service**: Handles live market data through WebSocket connections
- **Chart Service**: Manages data transformation and chart configuration
- **Storage Layer**: Abstracted storage interface supporting both in-memory and PostgreSQL backends

### White-label Customization
- **Theme System**: CSS variables for colors, fonts, and UI elements
- **Logo Management**: Upload and display custom company logos
- **Feature Toggles**: Configurable UI elements (toolbar, indicators, volume charts)
- **Embed Generation**: Create embeddable chart widgets with custom configurations

### User Interface
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Dark Theme**: Financial market-optimized color scheme
- **Component Library**: Consistent UI components using Radix UI primitives
- **Interactive Elements**: Hover states, tooltips, and contextual menus

## Data Flow

1. **Chart Initialization**: User selects symbol and timeframe
2. **Data Fetching**: Chart service requests data from API or generates dummy data
3. **WebSocket Connection**: Real-time data updates through WebSocket for live mode
4. **Chart Rendering**: Lightweight Charts library renders financial data
5. **State Updates**: Zustand stores manage chart configuration and real-time updates
6. **User Interactions**: Drawing tools, indicators, and settings modify chart state

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **lightweight-charts**: Financial charting library
- **ws**: WebSocket implementation for real-time data
- **@tanstack/react-query**: Server state management

### UI and Styling
- **@radix-ui/react-***: Unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Tools
- **typescript**: Static type checking
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for Node.js
- **@replit/vite-plugin-***: Replit-specific development plugins

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express.js backend
- **Hot Reload**: Automatic refresh for both frontend and backend changes
- **Database**: PostgreSQL with Drizzle migrations
- **WebSocket**: Development WebSocket server for testing real-time features

### Production Build
- **Frontend**: Vite builds optimized React application to `dist/public`
- **Backend**: esbuild bundles Node.js server to `dist/index.js`
- **Database**: Production PostgreSQL with connection pooling
- **Static Assets**: Served through Express.js static middleware

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **NODE_ENV**: Environment-specific configurations
- **WebSocket**: Production WebSocket server for real-time data streaming

### Key Features
- **Embeddable Charts**: Generate iframe-based embeddable widgets
- **White-label Theming**: Complete customization of colors, logos, and branding
- **Technical Analysis**: Comprehensive set of indicators and drawing tools
- **Real-time Data**: WebSocket-based live market data updates
- **Responsive Design**: Works across desktop and mobile devices
- **Data Sources**: Support for both dummy data and real market data feeds

## HD Interface Implementation

### High-Definition Rendering
- **Canvas HD Support**: Custom HTML5 Canvas engine with devicePixelRatio scaling for crisp rendering
- **Anti-aliased Graphics**: Smooth lines and shapes with proper subpixel rendering
- **Retina Display**: Automatic scaling for high-DPI displays (2x, 3x pixel density)
- **Responsive Layout**: Adaptive scaling using ResizeObserver and CSS Grid

### User Interface Framework
- **Tailwind CSS**: Utility-first CSS for consistent, theme-able UI components
- **Radix UI**: Headless UI primitives for dropdowns, modals, and interactive elements
- **Framer Motion**: Smooth animations and transitions for enhanced user experience
- **TypeScript**: Full type safety for scalable, maintainable code

### Interactive Features
- **Smooth Scrolling**: Momentum-based horizontal/vertical navigation with wheel, drag, and keyboard support
- **Zoom Controls**: Multi-level zoom with Ctrl/Cmd + wheel for detailed analysis
- **Draggable Elements**: Repositionable OHLC display blocks and dismissible overlays
- **Chart Types**: Candlestick, line, and area charts with dropdown selection
- **Timeframe Support**: Complete range from 1-minute to yearly with consistent scrolling

### Recent Updates
- Built complete custom HTML5 Canvas-based chart engine from scratch with HD rendering
- Implemented candlestick, line, and area chart types with professional styling
- Added comprehensive timeframe support (1m, 5m, 15m, 1h, 4h, 1d, 1w, yearly)
- Enhanced scrolling system with smooth navigation, momentum, zoom, and keyboard controls
- Created draggable OHLC display block and dismissible help overlay
- Fixed scrolling consistency across all timeframes with minimum 200 data points
- Enhanced HD interface with devicePixelRatio scaling and anti-aliased rendering
- **Implemented ChartIQ-style comparison symbols with percentage-based overlays (January 2025)**
- **Fixed comparison symbol positioning to use normalized percentage changes from baseline**
- **Added dynamic Y-axis that switches to percentage format when comparison symbols are active**
- **Resolved cursor movement interference with comparison symbol stability**
- **Fixed comparison symbol visibility with combined price range approach (July 2025)**
- **Improved toolbar layout by moving zoom controls to bottom-center of chart**
- **Set volume indicator to disabled by default, removed dummy DataSourceToggle button**
- **Created comprehensive README.md with local development documentation**
- **Fixed zoom functionality with proper chart instance integration (July 2025)**
- **Added comprehensive SonarQube testing suite with Jest, ESLint, and code quality analysis**
- **Implemented test coverage for components, services, and store management**
- **Created testing documentation and automated test runner scripts**