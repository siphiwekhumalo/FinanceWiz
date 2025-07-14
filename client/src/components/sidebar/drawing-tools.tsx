import { useChartStore } from '@/store/chart-store';
import { Button } from '@/components/ui/button';
import { DrawingTool } from '@/types/chart-types';

interface DrawingToolButton {
  tool: DrawingTool;
  icon: string;
  label: string;
}

const drawingTools: DrawingToolButton[] = [
  { tool: 'trendline', icon: 'fas fa-slash', label: 'Trend Line' },
  { tool: 'fibonacci', icon: 'fas fa-wave-square', label: 'Fibonacci' },
  { tool: 'rectangle', icon: 'fas fa-square', label: 'Rectangle' },
  { tool: 'text', icon: 'fas fa-font', label: 'Text' },
];

export function DrawingTools() {
  const { config, setSelectedTool } = useChartStore();

  return (
    <div className="p-4 border-b border-slate-700">
      <h4 className="text-sm font-medium text-slate-300 mb-3">
        Drawing Tools
      </h4>
      
      <div className="grid grid-cols-2 gap-2">
        {drawingTools.map(({ tool, icon, label }) => (
          <Button
            key={tool}
            variant={config.selectedTool === tool ? 'default' : 'ghost'}
            size="sm"
            className="flex flex-col items-center p-2 h-auto space-y-1 hover:bg-slate-700"
            onClick={() => setSelectedTool(tool)}
          >
            <i className={`${icon} text-slate-400 text-sm`} />
            <span className="text-xs text-slate-400">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
