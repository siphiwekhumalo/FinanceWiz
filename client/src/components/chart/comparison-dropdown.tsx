import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, Plus, X, TrendingUp, Percent, DollarSign, Eye, EyeOff } from 'lucide-react';
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
  const { 
    config, 
    addComparisonSymbol, 
    removeComparisonSymbol, 
    toggleComparisonSymbol,
    updateComparisonSymbol,
    setComparisonMode 
  } = useChartStore();
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
      // Calculate percentage change for the symbol
      const firstPrice = chartData[0]?.close || 0;
      const lastPrice = chartData[chartData.length - 1]?.close || 0;
      const change = lastPrice - firstPrice;
      const changePercent = firstPrice > 0 ? (change / firstPrice) * 100 : 0;

      const comparisonSymbol: ComparisonSymbol = {
        symbol: symbolData.symbol,
        name: symbolData.name,
        data: chartData,
        color: comparisonColors[colorIndex],
        enabled: true,
        style: 'line',
        change,
        changePercent,
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

  const handleStyleChange = (symbol: string, style: 'line' | 'area' | 'bar') => {
    updateComparisonSymbol(symbol, { style });
  };

  const filteredSymbols = availableSymbols.filter(s => 
    s.symbol !== config.symbol && 
    !config.comparisonSymbols.some(cs => cs.symbol === s.symbol)
  );

  return (
    <div className="flex items-center space-x-2">
      {/* Show comparison symbols as badges */}
      {config.comparisonSymbols.map((compSymbol) => (
        <Badge
          key={compSymbol.symbol}
          variant={compSymbol.enabled ? "default" : "secondary"}
          className="px-2 py-1 text-xs flex items-center space-x-1 cursor-pointer relative group"
          style={{
            backgroundColor: compSymbol.enabled ? compSymbol.color : 'rgb(71 85 105)',
            color: 'white',
          }}
          onClick={() => handleToggleSymbol(compSymbol.symbol)}
        >
          <span>{compSymbol.symbol}</span>
          {compSymbol.changePercent && (
            <span className="text-xs opacity-80">
              {compSymbol.changePercent > 0 ? '+' : ''}{compSymbol.changePercent.toFixed(1)}%
            </span>
          )}
          {compSymbol.enabled ? (
            <Eye className="h-3 w-3 ml-1" />
          ) : (
            <EyeOff className="h-3 w-3 ml-1" />
          )}
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
        <PopoverContent className="w-80 p-0 bg-slate-800 border-slate-700">
          <div className="p-4 space-y-4">
            {/* Comparison Mode Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="comparison-mode" className="text-sm font-medium text-slate-300">
                Display Mode
              </Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant={config.comparisonMode === 'absolute' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setComparisonMode('absolute')}
                  className="h-7 px-2 text-xs"
                >
                  <DollarSign className="h-3 w-3 mr-1" />
                  Absolute
                </Button>
                <Button
                  variant={config.comparisonMode === 'percentage' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setComparisonMode('percentage')}
                  className="h-7 px-2 text-xs"
                >
                  <Percent className="h-3 w-3 mr-1" />
                  Percentage
                </Button>
              </div>
            </div>

            <Separator className="bg-slate-600" />

            {/* Current Comparison Symbols */}
            {config.comparisonSymbols.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Active Comparisons</Label>
                <div className="space-y-1">
                  {config.comparisonSymbols.map((compSymbol) => (
                    <div key={compSymbol.symbol} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: compSymbol.color }}
                        />
                        <div>
                          <div className="text-sm font-medium text-white">{compSymbol.symbol}</div>
                          <div className="text-xs text-slate-400">{compSymbol.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleSymbol(compSymbol.symbol)}
                          className="h-6 w-6 p-0"
                        >
                          {compSymbol.enabled ? (
                            <Eye className="h-3 w-3 text-green-400" />
                          ) : (
                            <EyeOff className="h-3 w-3 text-slate-400" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSymbol(compSymbol.symbol)}
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="bg-slate-600" />
              </div>
            )}

            {/* Add New Symbol */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-300">Add Symbol</Label>
              <Command className="bg-slate-800">
                <CommandInput 
                  placeholder="Search symbols..." 
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <CommandList className="bg-slate-800 max-h-32">
                  <CommandEmpty className="text-slate-400 p-4">No symbols found.</CommandEmpty>
                  <CommandGroup>
                    {filteredSymbols.map((symbolData) => (
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
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}