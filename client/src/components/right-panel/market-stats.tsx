import { useChartStore } from '@/store/chart-store';
import { ChartUtils } from '@/utils/chart-utils';

export function MarketStats() {
  const { selectedSymbol } = useChartStore();
  
  const stats = {
    high24h: selectedSymbol?.high24h || 176.82,
    low24h: selectedSymbol?.low24h || 172.15,
    volume24h: selectedSymbol?.volume || 45200000,
    marketCap: selectedSymbol?.marketCap || 2800000000000,
  };

  return (
    <div className="p-4 border-b border-slate-700">
      <h4 className="text-sm font-medium text-slate-300 mb-3">Market Stats</h4>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-400">24h High</p>
          <p className="text-sm font-mono text-success">
            ${ChartUtils.formatPrice(stats.high24h)}
          </p>
        </div>
        
        <div>
          <p className="text-xs text-slate-400">24h Low</p>
          <p className="text-sm font-mono text-danger">
            ${ChartUtils.formatPrice(stats.low24h)}
          </p>
        </div>
        
        <div>
          <p className="text-xs text-slate-400">24h Volume</p>
          <p className="text-sm font-mono text-slate-200">
            {ChartUtils.formatVolume(stats.volume24h)}
          </p>
        </div>
        
        <div>
          <p className="text-xs text-slate-400">Market Cap</p>
          <p className="text-sm font-mono text-slate-200">
            ${ChartUtils.formatMarketCap(stats.marketCap)}
          </p>
        </div>
      </div>
    </div>
  );
}
