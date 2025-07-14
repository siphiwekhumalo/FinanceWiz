import { useState } from 'react';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useChartStore } from '@/store/chart-store';
import { ChartService } from '@/services/chart-service';

export function SymbolSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const { setSymbol, setSelectedSymbol } = useChartStore();
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
    setSelectedSymbol(chartService.getSymbolData(symbol.symbol));
    setSearchTerm('');
  };

  return (
    <div className="p-4 border-b border-slate-700">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Search symbols..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
        />
      </div>
      
      {searchTerm && (
        <div className="mt-2 max-h-48 overflow-y-auto">
          {filteredSymbols.map(symbol => (
            <Button
              key={symbol.id}
              variant="ghost"
              className="w-full justify-start p-2 text-left hover:bg-slate-700"
              onClick={() => handleSymbolSelect(symbol)}
            >
              <div>
                <div className="font-medium text-white">{symbol.symbol}</div>
                <div className="text-sm text-slate-400">{symbol.name}</div>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
