import { ZoomIn, ZoomOut, RotateCcw, Grid, Crosshair, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChartStore } from '@/store/chart-store';
import { ChartTypeDropdown } from './chart-type-dropdown';
import { TimeframeDropdown } from './timeframe-dropdown';

export function ChartToolbar() {
  const { toggleVolume, toggleCrosshair, resetZoom, config } = useChartStore();

  return (
    <div className="flex items-center justify-between bg-slate-800 border-b border-slate-700 p-2">
      {/* Left side - Chart type and timeframe selector */}
      <div className="flex items-center space-x-3">
        <ChartTypeDropdown />
        
        <div className="w-px h-4 bg-slate-600" />
        
        <TimeframeDropdown />
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