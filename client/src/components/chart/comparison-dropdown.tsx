import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Check, Plus, X, TrendingUp } from 'lucide-react';
import { useChartStore } from '@/store/chart-store';
import { ComparisonSymbol } from '@/types/chart-types';
import { ChartService } from '@/services/chart-service';

// Available symbols for comparison
const availableSymbols = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust' },
];

// Predefined colors for comparison symbols
const comparisonColors = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

export function ComparisonDropdown() {
  const [open, setOpen] = useState(false);
  const { config, addComparisonSymbol, removeComparisonSymbol, toggleComparisonSymbol } = useChartStore();
  const chartService = ChartService.getInstance();

  const handleAddSymbol = async (symbolData: { symbol: string; name: string }) => {
    if (config.comparisonSymbols.some(s => s.symbol === symbolData.symbol)) {
      return; // Already added
    }

    try {
      // Generate data for the comparison symbol
      const chartData = chartService.dummyService.generateChartData(
        symbolData.symbol,
        config.timeframe,
        100
      );

      const colorIndex = config.comparisonSymbols.length % comparisonColors.length;
      const comparisonSymbol: ComparisonSymbol = {
        symbol: symbolData.symbol,
        name: symbolData.name,
        data: chartData,
        color: comparisonColors[colorIndex],
        enabled: true,
      };

      addComparisonSymbol(comparisonSymbol);
      setOpen(false);
    } catch (error) {
      console.error('Error adding comparison symbol:', error);
    }
  };

  const handleRemoveSymbol = (symbol: string) => {
    removeComparisonSymbol(symbol);
  };

  const handleToggleSymbol = (symbol: string) => {
    toggleComparisonSymbol(symbol);
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Show comparison symbols as badges */}
      {config.comparisonSymbols.map((compSymbol) => (
        <Badge
          key={compSymbol.symbol}
          variant={compSymbol.enabled ? "default" : "secondary"}
          className="px-2 py-1 text-xs flex items-center space-x-1 cursor-pointer"
          style={{
            backgroundColor: compSymbol.enabled ? compSymbol.color : 'rgb(71 85 105)',
            color: 'white',
          }}
          onClick={() => handleToggleSymbol(compSymbol.symbol)}
        >
          <span>{compSymbol.symbol}</span>
          <X 
            className="h-3 w-3 ml-1 hover:bg-black/20 rounded-full p-0.5" 
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveSymbol(compSymbol.symbol);
            }}
          />
        </Badge>
      ))}

      {/* Add comparison symbol button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="px-2 py-1 h-8 text-slate-300 hover:text-white"
            title="Add Comparison Symbol"
          >
            <Plus className="h-4 w-4 mr-1" />
            Compare
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0 bg-slate-800 border-slate-700">
          <Command className="bg-slate-800">
            <CommandInput 
              placeholder="Search symbols..." 
              className="bg-slate-800 border-slate-700 text-white"
            />
            <CommandList className="bg-slate-800">
              <CommandEmpty className="text-slate-400 p-4">No symbols found.</CommandEmpty>
              <CommandGroup>
                {availableSymbols
                  .filter(s => s.symbol !== config.symbol) // Don't show current symbol
                  .filter(s => !config.comparisonSymbols.some(cs => cs.symbol === s.symbol)) // Don't show already added symbols
                  .map((symbolData) => (
                    <CommandItem
                      key={symbolData.symbol}
                      value={symbolData.symbol}
                      onSelect={() => handleAddSymbol(symbolData)}
                      className="px-3 py-2 cursor-pointer hover:bg-slate-700 text-white"
                    >
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-slate-400" />
                        <div>
                          <div className="font-medium">{symbolData.symbol}</div>
                          <div className="text-xs text-slate-400">{symbolData.name}</div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}