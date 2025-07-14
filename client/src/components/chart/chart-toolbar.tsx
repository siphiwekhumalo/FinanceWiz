import { Crosshair, Volume2, Maximize, Minimize, TrendingUp } from 'lucide-react';
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

interface ChartToolbarProps {
  onToggleAdvancedPanel?: () => void;
}

export function ChartToolbar({ onToggleAdvancedPanel }: ChartToolbarProps) {
  const { toggleVolume, toggleCrosshair, resetZoom, zoomIn, zoomOut, config } = useChartStore();
  const { isFullscreen, setFullscreen } = useSettingsStore();

  return (
    <div className="flex items-center justify-between bg-slate-800 border-b border-slate-700 p-2">
      {/* Left side - Symbol, chart type, timeframe, indicators and drawing tools */}
      <div className="flex items-center space-x-3">
        <SymbolDropdown />
        
        <div className="w-px h-4 bg-slate-600" />
        
        <ChartTypeDropdown />
        
        <div className="w-px h-4 bg-slate-600" />
        
        <TimeframeDropdown />
        
        <div className="w-px h-4 bg-slate-600" />
        
        <IndicatorsDropdown />
        
        <DrawingToolsDropdown />
        
        <div className="w-px h-4 bg-slate-600" />
        
        <ComparisonDropdown />
      </div>

      {/* Right side - Chart controls */}
      <div className="flex items-center space-x-1">

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
        
        <div className="w-px h-4 bg-slate-600 mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFullscreen(!isFullscreen)}
          className="px-2 py-1 h-8"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
        
        <div className="w-px h-4 bg-slate-600 mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleAdvancedPanel}
          className="px-2 py-1 h-8"
          title="Advanced Features"
        >
          <TrendingUp className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}