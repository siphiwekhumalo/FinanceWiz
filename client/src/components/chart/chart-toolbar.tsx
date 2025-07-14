import { BarChart3, TrendingUp, Activity, Download, ZoomOut, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChartStore } from '@/store/chart-store';
import { ChartType, Timeframe } from '@/types/chart-types';

const chartTypes: { type: ChartType; icon: React.ReactNode; label: string }[] = [
  { type: 'candlestick', icon: <BarChart3 className="h-4 w-4" />, label: 'Candlestick' },
  { type: 'line', icon: <TrendingUp className="h-4 w-4" />, label: 'Line' },
  { type: 'area', icon: <Activity className="h-4 w-4" />, label: 'Area' },
];

const timeframes: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];

export function ChartToolbar() {
  const { config, setChartType, setTimeframe, resetZoom, toggleCrosshair } = useChartStore();

  const handleExport = () => {
    // Implementation would depend on chart library
    console.log('Export chart');
  };

  return (
    <div className="bg-slate-800 border-b border-slate-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Chart Type Selector */}
          <div className="flex items-center space-x-2">
            {chartTypes.map(({ type, icon, label }) => (
              <Button
                key={type}
                variant={config.chartType === type ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center space-x-1"
                onClick={() => setChartType(type)}
              >
                {icon}
                <span>{label}</span>
              </Button>
            ))}
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center space-x-1 bg-slate-700 rounded-lg p-1">
            {timeframes.map(timeframe => (
              <Button
                key={timeframe}
                variant={config.timeframe === timeframe ? 'default' : 'ghost'}
                size="sm"
                className="px-2 py-1 text-xs"
                onClick={() => setTimeframe(timeframe)}
              >
                {timeframe}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExport}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <Download className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={resetZoom}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCrosshair}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <Crosshair className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
