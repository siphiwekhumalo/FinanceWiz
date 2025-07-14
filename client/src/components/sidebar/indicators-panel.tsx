import { Plus, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useChartStore } from '@/store/chart-store';
import { ChartService } from '@/services/chart-service';
import { ChartUtils } from '@/utils/chart-utils';

export function IndicatorsPanel() {
  const { config, toggleIndicator, addIndicator } = useChartStore();
  const chartService = ChartService.getInstance();

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
  };

  return (
    <div className="p-4 border-b border-slate-700">
      <h4 className="text-sm font-medium text-slate-300 mb-3">
        Technical Indicators
      </h4>
      
      <div className="space-y-2">
        {config.indicators.map(indicator => (
          <div
            key={indicator.id}
            className="flex items-center justify-between p-2 hover:bg-slate-700 rounded-lg cursor-pointer"
            onClick={() => toggleIndicator(indicator.id)}
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: indicator.enabled ? indicator.color : '#64748B' }}
              />
              <span className="text-sm text-slate-200">
                {indicator.name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white h-6 w-6"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        {availableIndicators.length > 0 && (
          <div className="pt-2">
            <div className="text-xs text-slate-400 mb-2">Available Indicators:</div>
            {availableIndicators.map(indicator => (
              <Button
                key={indicator.id}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-slate-300 hover:bg-slate-700 mb-1"
                onClick={() => handleAddIndicator(indicator)}
              >
                <Plus className="h-3 w-3 mr-2" />
                {indicator.name}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
