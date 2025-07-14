import { ZoomIn, ZoomOut, RotateCcw, Grid, Crosshair, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChartStore } from '@/store/chart-store';
import { Timeframe } from '@/types/chart-types';

export function ChartToolbar() {
  const { config, setTimeframe, toggleVolume, toggleCrosshair, resetZoom } = useChartStore();

  const timeframes: { value: Timeframe; label: string }[] = [
    { value: '1m', label: '1M' },
    { value: '5m', label: '5M' },
    { value: '15m', label: '15M' },
    { value: '1h', label: '1H' },
    { value: '4h', label: '4H' },
    { value: '1d', label: '1D' },
    { value: '1w', label: '1W' },
  ];

  return (
    <div className="flex items-center justify-between bg-slate-800 border-b border-slate-700 p-2">
      {/* Left side - Timeframe selector */}
      <div className="flex items-center space-x-1">
        {timeframes.map((timeframe) => (
          <Button
            key={timeframe.value}
            variant={config.timeframe === timeframe.value ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeframe(timeframe.value)}
            className="px-3 py-1 h-8 text-xs"
          >
            {timeframe.label}
          </Button>
        ))}
      </div>

      {/* Right side - Chart controls */}
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {/* TODO: Implement zoom in */}}
          className="px-2 py-1 h-8"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {/* TODO: Implement zoom out */}}
          className="px-2 py-1 h-8"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={resetZoom}
          className="px-2 py-1 h-8"
          title="Reset Zoom"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <div className="w-px h-4 bg-slate-600 mx-1" />
        
        <Button
          variant={config.showVolume ? "default" : "ghost"}
          size="sm"
          onClick={toggleVolume}
          className="px-2 py-1 h-8"
          title="Toggle Volume"
        >
          <Volume2 className="h-4 w-4" />
        </Button>
        
        <Button
          variant={config.showCrosshair ? "default" : "ghost"}
          size="sm"
          onClick={toggleCrosshair}
          className="px-2 py-1 h-8"
          title="Toggle Crosshair"
        >
          <Crosshair className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}