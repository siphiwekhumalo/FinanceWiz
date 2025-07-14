import { ZoomIn, ZoomOut, RotateCcw, Grid, Crosshair, Volume2, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChartStore } from '@/store/chart-store';
import { useSettingsStore } from '@/store/settings-store';
import { ChartTypeDropdown } from './chart-type-dropdown';
import { TimeframeDropdown } from './timeframe-dropdown';
import { IndicatorsDropdown } from './indicators-dropdown';
import { DrawingToolsDropdown } from './drawing-tools-dropdown';
import { SymbolDropdown } from './symbol-dropdown';
import { DataSourceToggle } from './data-source-toggle';
import { ComparisonDropdown } from './comparison-dropdown';

export function ChartToolbar() {
  const { toggleVolume, toggleCrosshair, resetZoom, config } = useChartStore();
  const { isFullscreen, setFullscreen } = useSettingsStore();

  return (
    <div className="toolbar flex items-center justify-between p-3 shadow-sm">
      {/* Left side - Symbol, chart type, timeframe, indicators and drawing tools */}
      <div className="flex items-center space-x-4">
        <SymbolDropdown />
        
        <div className="w-px h-5 bg-slate-600/50" />
        
        <ChartTypeDropdown />
        
        <div className="w-px h-5 bg-slate-600/50" />
        
        <TimeframeDropdown />
        
        <div className="w-px h-5 bg-slate-600/50" />
        
        <IndicatorsDropdown />
        
        <DrawingToolsDropdown />
        
        <div className="w-px h-5 bg-slate-600/50" />
        
        <ComparisonDropdown />
        
        <div className="w-px h-5 bg-slate-600/50" />
        
        <DataSourceToggle />
      </div>

      {/* Right side - Chart controls */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {/* TODO: Implement zoom in */}}
          className="button-premium px-3 py-2 h-9 rounded-lg"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {/* TODO: Implement zoom out */}}
          className="button-premium px-3 py-2 h-9 rounded-lg"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={resetZoom}
          className="button-premium px-3 py-2 h-9 rounded-lg"
          title="Reset Zoom"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <div className="w-px h-5 bg-slate-600/50 mx-2" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleVolume}
          className={`button-premium px-3 py-2 h-9 rounded-lg ${
            config.showVolume 
              ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' 
              : ''
          }`}
          title="Toggle Volume"
        >
          <Volume2 className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCrosshair}
          className={`button-premium px-3 py-2 h-9 rounded-lg ${
            config.showCrosshair 
              ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' 
              : ''
          }`}
          title="Toggle Crosshair"
        >
          <Crosshair className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-5 bg-slate-600/50 mx-2" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFullscreen(!isFullscreen)}
          className="button-premium px-3 py-2 h-9 rounded-lg"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}