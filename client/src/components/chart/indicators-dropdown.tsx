import { useState } from 'react';
import { ChevronDown, Plus, Settings, TrendingUp } from 'lucide-react';
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
import { ChartService } from '@/services/chart-service';
import { ChartUtils } from '@/utils/chart-utils';
import { useQuery } from '@tanstack/react-query';

export function IndicatorsDropdown() {
  const { config, toggleIndicator, addIndicator } = useChartStore();
  const chartService = ChartService.getInstance();
  const [isOpen, setIsOpen] = useState(false);

  const { data: availableIndicators = [] } = useQuery({
    queryKey: ['/api/indicators'],
    queryFn: async () => {
      return await chartService.getIndicators();
    },
  });

  const handleAddIndicator = (indicatorData: any) => {
    const newIndicator = {
      id: ChartUtils.generateIndicatorId(),
      name: indicatorData.name,
      type: indicatorData.type,
      enabled: true,
      color: ChartUtils.getIndicatorColor(indicatorData.type),
      parameters: indicatorData.parameters,
    };
    addIndicator(newIndicator);
    setIsOpen(false);
  };

  const handleToggleIndicator = (id: string) => {
    toggleIndicator(id);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="px-3 py-1 h-8 text-slate-300 hover:bg-slate-700">
          <TrendingUp className="h-4 w-4 mr-1" />
          <span className="text-sm">Indicators</span>
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 bg-slate-800 border-slate-700">
        <DropdownMenuLabel className="text-slate-300">Technical Indicators</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700" />
        
        {/* Active Indicators */}
        {config.indicators.length > 0 && (
          <>
            <div className="px-2 py-1 text-xs text-slate-400 font-medium">Active Indicators</div>
            {config.indicators.map(indicator => (
              <DropdownMenuItem
                key={indicator.id}
                className="flex items-center justify-between p-2 hover:bg-slate-700 cursor-pointer"
                onClick={() => handleToggleIndicator(indicator.id)}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: indicator.enabled ? indicator.color : '#64748B' }}
                  />
                  <span className="text-sm text-slate-200">{indicator.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Open indicator settings
                  }}
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-slate-700" />
          </>
        )}
        
        {/* Available Indicators */}
        {availableIndicators.length > 0 && (
          <>
            <div className="px-2 py-1 text-xs text-slate-400 font-medium">Add Indicator</div>
            {availableIndicators.map(indicator => (
              <DropdownMenuItem
                key={indicator.id}
                className="flex items-center space-x-2 p-2 hover:bg-slate-700 cursor-pointer"
                onClick={() => handleAddIndicator(indicator)}
              >
                <Plus className="h-3 w-3 text-slate-400" />
                <span className="text-sm text-slate-300">{indicator.name}</span>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}