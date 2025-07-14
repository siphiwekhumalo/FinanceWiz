import { useState } from 'react';
import { ChevronDown, Clock } from 'lucide-react';
import { Timeframe } from '@/types/chart-types';
import { useChartStore } from '@/store/chart-store';
import { Button } from '@/components/ui/button';

const timeframeOptions: { value: Timeframe; label: string; description: string }[] = [
  { value: '1m', label: '1M', description: '1 minute' },
  { value: '5m', label: '5M', description: '5 minutes' },
  { value: '15m', label: '15M', description: '15 minutes' },
  { value: '1h', label: '1H', description: '1 hour' },
  { value: '4h', label: '4H', description: '4 hours' },
  { value: '1d', label: '1D', description: '1 day' },
  { value: '1w', label: '1W', description: '1 week' },
  { value: '1y', label: '1Y', description: '1 year' },
];

export function TimeframeDropdown() {
  const { config, setTimeframe } = useChartStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentTimeframe = timeframeOptions.find(option => option.value === config.timeframe);

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="h-8 px-3 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Clock className="w-4 h-4 mr-2" />
        {currentTimeframe?.label || 'Timeframe'}
        <ChevronDown className="w-4 h-4 ml-2" />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {timeframeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setTimeframe(option.value);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-700 flex items-center justify-between first:rounded-t-md last:rounded-b-md"
            >
              <div className="flex items-center">
                <span className="font-medium">{option.label}</span>
                <span className="ml-2 text-sm text-slate-400">{option.description}</span>
              </div>
              {config.timeframe === option.value && (
                <span className="text-green-400">✓</span>
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