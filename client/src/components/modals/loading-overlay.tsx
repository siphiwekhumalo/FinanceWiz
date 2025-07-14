import { useChartStore } from '@/store/chart-store';

export function LoadingOverlay() {
  const { isLoading, config } = useChartStore();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          <div className="text-slate-200">
            <h3 className="font-medium">Loading chart data...</h3>
            <p className="text-sm text-slate-400 mt-1">
              {config.dataSource === 'dummy' ? 'Generating dummy data' : 'Fetching real-time data'} for {config.symbol}
            </p>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-xs text-slate-400">
            <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
            Symbol: {config.symbol}
          </div>
          <div className="flex items-center text-xs text-slate-400">
            <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
            Timeframe: {config.timeframe}
          </div>
          <div className="flex items-center text-xs text-slate-400">
            <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
            Chart Type: {config.chartType}
          </div>
        </div>
      </div>
    </div>
  );
}
