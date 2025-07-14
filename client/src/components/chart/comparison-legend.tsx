import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, X } from 'lucide-react';
import { useChartStore } from '@/store/chart-store';

export function ComparisonLegend() {
  const { config, toggleComparisonSymbol, removeComparisonSymbol } = useChartStore();

  if (!config.comparisonSymbols.length) return null;

  return (
    <div className="absolute top-4 left-4 z-10 space-y-2">
      {config.comparisonSymbols.map((compSymbol) => (
        <div
          key={compSymbol.symbol}
          className="flex items-center space-x-2 bg-slate-800/95 backdrop-blur-sm rounded-lg p-2 border border-slate-700/50"
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: compSymbol.color }}
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-white">{compSymbol.symbol}</span>
              {compSymbol.changePercent && (
                <span
                  className={`text-xs ${
                    compSymbol.changePercent > 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {compSymbol.changePercent > 0 ? '+' : ''}
                  {compSymbol.changePercent.toFixed(2)}%
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400">{compSymbol.name}</div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleComparisonSymbol(compSymbol.symbol)}
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
              onClick={() => removeComparisonSymbol(compSymbol.symbol)}
              className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}