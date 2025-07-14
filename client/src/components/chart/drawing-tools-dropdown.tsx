import { useState } from 'react';
import { ChevronDown, MousePointer, TrendingUp, Square, Type, Divide } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useChartStore } from '@/store/chart-store';
import { DrawingTool } from '@/types/chart-types';

interface DrawingToolItem {
  tool: DrawingTool;
  icon: React.ReactNode;
  label: string;
  description: string;
}

const drawingTools: DrawingToolItem[] = [
  { 
    tool: 'cursor', 
    icon: <MousePointer className="h-4 w-4" />, 
    label: 'Cursor', 
    description: 'Default selection tool' 
  },
  { 
    tool: 'trendline', 
    icon: <TrendingUp className="h-4 w-4" />, 
    label: 'Trend Line', 
    description: 'Draw trend lines' 
  },
  { 
    tool: 'fibonacci', 
    icon: <Divide className="h-4 w-4" />, 
    label: 'Fibonacci', 
    description: 'Fibonacci retracement' 
  },
  { 
    tool: 'rectangle', 
    icon: <Square className="h-4 w-4" />, 
    label: 'Rectangle', 
    description: 'Draw rectangles' 
  },
  { 
    tool: 'text', 
    icon: <Type className="h-4 w-4" />, 
    label: 'Text', 
    description: 'Add text annotations' 
  },
];

export function DrawingToolsDropdown() {
  const { config, setSelectedTool } = useChartStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleToolSelect = (tool: DrawingTool) => {
    setSelectedTool(tool);
    setIsOpen(false);
  };

  const currentTool = drawingTools.find(t => t.tool === config.selectedTool);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="px-3 py-1 h-8 text-slate-300 hover:bg-slate-700">
          {currentTool?.icon || <MousePointer className="h-4 w-4" />}
          <span className="text-sm ml-1">Tools</span>
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 bg-slate-800 border-slate-700">
        <DropdownMenuLabel className="text-slate-300">Drawing Tools</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700" />
        
        {drawingTools.map(({ tool, icon, label, description }) => (
          <DropdownMenuItem
            key={tool}
            className={`flex items-center space-x-3 p-3 hover:bg-slate-700 cursor-pointer ${
              config.selectedTool === tool ? 'bg-slate-700' : ''
            }`}
            onClick={() => handleToolSelect(tool)}
          >
            <div className="flex items-center justify-center w-8 h-8 bg-slate-700 rounded-md">
              <div className="text-slate-300">{icon}</div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-200">{label}</div>
              <div className="text-xs text-slate-400">{description}</div>
            </div>
            {config.selectedTool === tool && (
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}