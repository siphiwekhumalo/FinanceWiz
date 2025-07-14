import { useChartStore } from '@/store/chart-store';
import { ChartService } from '@/services/chart-service';
import { ChartUtils } from '@/utils/chart-utils';

export function OrderBook() {
  const { config } = useChartStore();
  const chartService = ChartService.getInstance();
  
  const orderBookData = chartService.getOrderBookData(config.symbol);
  const sellOrders = orderBookData.filter(order => order.side === 'sell').slice(0, 5);
  const buyOrders = orderBookData.filter(order => order.side === 'buy').slice(0, 5);
  
  const currentPrice = 175.43; // This would come from real data

  return (
    <div className="p-4 border-b border-slate-700">
      <h4 className="text-sm font-medium text-slate-300 mb-3">Order Book</h4>
      
      <div className="space-y-1">
        <div className="text-xs text-slate-400 flex justify-between">
          <span>Price</span>
          <span>Size</span>
        </div>
        
        {/* Sell Orders */}
        {sellOrders.map((order, index) => (
          <div key={`sell-${index}`} className="flex justify-between text-xs py-1 hover:bg-slate-700 rounded">
            <span className="text-danger">{ChartUtils.formatPrice(order.price)}</span>
            <span className="text-slate-300">{order.size.toLocaleString()}</span>
          </div>
        ))}
        
        {/* Current Price */}
        <div className="py-2 text-center border-t border-b border-slate-600">
          <span className="text-lg font-mono text-white">
            {ChartUtils.formatPrice(currentPrice)}
          </span>
        </div>
        
        {/* Buy Orders */}
        {buyOrders.map((order, index) => (
          <div key={`buy-${index}`} className="flex justify-between text-xs py-1 hover:bg-slate-700 rounded">
            <span className="text-success">{ChartUtils.formatPrice(order.price)}</span>
            <span className="text-slate-300">{order.size.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
