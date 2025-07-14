import { useChartStore } from '@/store/chart-store';
import { ChartService } from '@/services/chart-service';
import { ChartUtils } from '@/utils/chart-utils';

export function RecentTrades() {
  const { config } = useChartStore();
  const chartService = ChartService.getInstance();
  
  const recentTrades = chartService.getRecentTrades(config.symbol);

  return (
    <div className="p-4 border-b border-slate-700">
      <h4 className="text-sm font-medium text-slate-300 mb-3">Recent Trades</h4>
      
      <div className="space-y-2">
        <div className="text-xs text-slate-400 flex justify-between">
          <span>Time</span>
          <span>Price</span>
          <span>Size</span>
        </div>
        
        {recentTrades.map((trade, index) => (
          <div key={index} className="flex justify-between text-xs py-1">
            <span className="text-slate-400">{trade.time}</span>
            <span className={trade.side === 'buy' ? 'text-success' : 'text-danger'}>
              {ChartUtils.formatPrice(trade.price)}
            </span>
            <span className="text-slate-300">{trade.size}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
