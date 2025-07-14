import { render, screen } from '@testing-library/react';
import { ChartContainer } from '../chart-container';
import { useChartStore } from '@/store/chart-store';

// Mock the chart store
jest.mock('@/store/chart-store');
const mockUseChartStore = useChartStore as jest.MockedFunction<typeof useChartStore>;

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    canvas: 'canvas',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('ChartContainer', () => {
  beforeEach(() => {
    mockUseChartStore.mockReturnValue({
      isLoading: false,
      selectedSymbol: {
        id: 1,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 150.25,
        change: 2.5,
        changePercent: 1.69,
        volume: 50000000,
        marketCap: 2500000000000,
        sector: 'Technology',
      },
      isConnected: true,
      config: {
        chartType: 'candlestick',
        timeframe: '1d',
        dataSource: 'dummy',
        selectedTool: 'cursor',
        showVolume: false,
        showCrosshair: true,
        indicators: [],
        drawingObjects: [],
        comparisonSymbols: [],
        comparisonMode: 'absolute',
      },
      setChartInstance: jest.fn(),
      addDrawingObject: jest.fn(),
      updateDrawingObject: jest.fn(),
      removeDrawingObject: jest.fn(),
    });
  });

  it('renders chart container with canvas', () => {
    render(<ChartContainer />);
    
    const canvas = screen.getByRole('img', { hidden: true });
    expect(canvas).toBeInTheDocument();
  });

  it('displays loading state when isLoading is true', () => {
    mockUseChartStore.mockReturnValue({
      ...mockUseChartStore(),
      isLoading: true,
    });

    render(<ChartContainer />);
    
    expect(screen.getByText('Loading chart data...')).toBeInTheDocument();
  });

  it('displays offline indicator when not connected', () => {
    mockUseChartStore.mockReturnValue({
      ...mockUseChartStore(),
      isConnected: false,
    });

    render(<ChartContainer />);
    
    expect(screen.getByText('Offline Mode')).toBeInTheDocument();
  });

  it('displays OHLC data when symbol is selected', () => {
    render(<ChartContainer />);
    
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('150.25')).toBeInTheDocument();
  });
});