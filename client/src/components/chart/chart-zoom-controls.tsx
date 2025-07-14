import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChartStore } from '@/store/chart-store';

export function ChartZoomControls() {
  const { zoomIn, zoomOut, resetZoom } = useChartStore();

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-1 bg-slate-800 border border-slate-700 rounded-lg p-1 shadow-lg">
      <Button
        variant="ghost"
        size="sm"
        onClick={zoomIn}
        className="px-2 py-1 h-8"
        title="Zoom In (Ctrl/Cmd + Wheel Up)"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={zoomOut}
        className="px-2 py-1 h-8"
        title="Zoom Out (Ctrl/Cmd + Wheel Down)"
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
    </div>
  );
}