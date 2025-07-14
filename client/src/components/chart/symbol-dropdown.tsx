import { useState } from 'react';
import { ChevronDown, Search, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useChartStore } from '@/store/chart-store';
import { ChartService } from '@/services/chart-service';
import { ChartUtils } from '@/utils/chart-utils';
import { useQuery } from '@tanstack/react-query';

export function SymbolDropdown() {
  const { selectedSymbol, setSelectedSymbol, setSymbol } = useChartStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const chartService = ChartService.getInstance();

  const { data: symbols = [] } = useQuery({
    queryKey: ['/api/symbols'],
    queryFn: async () => {
      return await chartService.getSymbols();
    },
  });

  const filteredSymbols = symbols.filter(symbol =>
    symbol.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    symbol.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSymbolSelect = (symbol: any) => {
    setSymbol(symbol.symbol);
    const symbolData = chartService.getSymbolData(symbol.symbol);
    setSelectedSymbol(symbolData);
    setIsOpen(false);
    setSearchTerm('');
  };

  const displaySymbol = selectedSymbol?.symbol || 'AAPL';
  const displayPrice = selectedSymbol?.price || 0;
  const displayChange = selectedSymbol?.changePercent || 0;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="px-3 py-1 h-8 text-slate-300 hover:bg-slate-700">
          <TrendingUp className="h-4 w-4 mr-2" />
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{displaySymbol}</span>
            <span className="text-xs text-slate-400">
              ${ChartUtils.formatPrice(displayPrice)}
            </span>
            <span className={`text-xs ${displayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {displayChange >= 0 ? '+' : ''}{ChartUtils.formatPercentage(displayChange)}
            </span>
          </div>
          <ChevronDown className="h-3 w-3 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80 bg-slate-800 border-slate-700">
        <DropdownMenuLabel className="text-slate-300">Select Symbol</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700" />
        
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search symbols..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400"
            />
          </div>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {filteredSymbols.map((symbol) => (
            <DropdownMenuItem
              key={symbol.id}
              className="flex items-center justify-between p-3 hover:bg-slate-700 cursor-pointer"
              onClick={() => handleSymbolSelect(symbol)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-slate-700 rounded-full">
                  <span className="text-xs font-medium text-slate-300">
                    {symbol.symbol.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-200">{symbol.symbol}</div>
                  <div className="text-xs text-slate-400">{symbol.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-slate-200">
                  ${ChartUtils.formatPrice(symbol.price || 0)}
                </div>
                <div className={`text-xs ${(symbol.changePercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(symbol.changePercent || 0) >= 0 ? '+' : ''}
                  {ChartUtils.formatPercentage(symbol.changePercent || 0)}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}