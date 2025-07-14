import { useState } from 'react';
import { ChevronDown, BarChart3, TrendingUp, Activity } from 'lucide-react';
import { ChartType } from '@/types/chart-types';
import { useChartStore } from '@/store/chart-store';
import { Button } from '@/components/ui/button';

const chartTypeOptions: { value: ChartType; label: string; icon: any }[] = [
  { value: 'candlestick', label: 'Candlestick', icon: BarChart3 },
  { value: 'line', label: 'Line', icon: TrendingUp },
  { value: 'area', label: 'Area', icon: Activity },
];

export function ChartTypeDropdown() {
  const { config, setChartType } = useChartStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentChartType = chartTypeOptions.find(option => option.value === config.chartType);

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="h-8 px-3 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        {currentChartType && (
          <currentChartType.icon className="w-4 h-4 mr-2" />
        )}
        {currentChartType?.label || 'Chart Type'}
        <ChevronDown className="w-4 h-4 ml-2" />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-50">
          {chartTypeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setChartType(option.value);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-700 flex items-center first:rounded-t-md last:rounded-b-md"
            >
              <option.icon className="w-4 h-4 mr-2" />
              {option.label}
              {config.chartType === option.value && (
                <span className="ml-auto text-green-400">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
      
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}