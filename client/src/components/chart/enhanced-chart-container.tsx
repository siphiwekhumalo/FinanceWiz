import { useMemo } from 'react';
import { useChartStore } from '@/store/chart-store';
import { ChartService } from '@/services/chart-service';
import { ChartJSWrapper } from './chartjs-wrapper';
import { ChartJSIndicators } from './chartjs-indicators';
import { ChartContainer } from './chart-container';
import { ChartType } from '@/types/chart-types';

const FINANCIAL_CHART_TYPES: ChartType[] = ['candlestick', 'line', 'area'];
const STATISTICAL_CHART_TYPES: ChartType[] = ['bar', 'pie', 'doughnut', 'radar', 'polarArea', 'scatter'];

export function EnhancedChartContainer() {
  const { config, isLoading, selectedSymbol } = useChartStore();
  const chartService = ChartService.getInstance();

  // Determine which chart engine to use
  const useFinancialChart = FINANCIAL_CHART_TYPES.includes(config.chartType);
  const useStatisticalChart = STATISTICAL_CHART_TYPES.includes(config.chartType);

  // Get chart data for statistical charts  
  const chartData = useMemo(() => {
    if (!useStatisticalChart) return [];
    
    try {
      // Use dummy data service directly for synchronous data
      return chartService.dummyService.generateChartData(config.symbol, config.timeframe, 200);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      return [];
    }
  }, [config.symbol, config.timeframe, useStatisticalChart, chartService]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-900 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
        <span className="ml-3 text-slate-400">Loading chart data...</span>
      </div>
    );
  }

  // Render the appropriate chart type
  if (useFinancialChart) {
    // Use the custom canvas-based chart for financial data
    return <ChartContainer />;
  }

  if (useStatisticalChart) {
    // Use Chart.js for statistical visualizations
    return (
      <div className="h-full w-full bg-slate-900 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-200">
            {selectedSymbol || config.symbol} - {config.chartType.charAt(0).toUpperCase() + config.chartType.slice(1)} Chart
          </h3>
          <div className="text-sm text-slate-400">
            Timeframe: {config.timeframe}
          </div>
        </div>
        
        <div className="h-96">
          <ChartJSWrapper
            data={chartData}
            chartType={config.chartType}
            symbol={selectedSymbol || config.symbol}
            className="w-full h-full"
            height={384}
          />
        </div>

        {/* Technical Indicators Panel for Statistical Charts */}
        {config.indicators.length > 0 && (
          <div className="mt-4">
            <ChartJSIndicators
              data={chartData}
              indicators={config.indicators}
              symbol={selectedSymbol || config.symbol}
              height={150}
            />
          </div>
        )}

        {/* Chart description for statistical charts */}
        <div className="mt-4 p-3 bg-slate-800 rounded-lg">
          <p className="text-sm text-slate-300">
            {getChartDescription(config.chartType)}
          </p>
          {config.indicators.length > 0 && (
            <p className="text-xs text-slate-400 mt-2">
              Active indicators: {config.indicators.filter(i => i.enabled).map(i => i.name).join(', ')}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Fallback to financial chart
  return <ChartContainer />;
}

function getChartDescription(chartType: ChartType): string {
  const descriptions: Record<string, string> = {
    bar: 'Bar chart showing price movements over time with color-coded bars for gains/losses.',
    pie: 'Pie chart displaying price distribution across different time periods.',
    doughnut: 'Doughnut chart showing proportional price segments with a hollow center.',
    radar: 'Radar chart comparing multiple financial metrics (price, volume, volatility) on normalized scales.',
    polarArea: 'Polar area chart displaying current OHLC values and volume in a radial format.',
    scatter: 'Scatter plot analyzing the relationship between trading volume and price movements.',
  };
  
  return descriptions[chartType] || 'Advanced chart visualization for market data analysis.';
}