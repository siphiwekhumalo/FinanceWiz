import { SymbolSearch } from './symbol-search';
import { IndicatorsPanel } from './indicators-panel';
import { DrawingTools } from './drawing-tools';
import { DataSourceToggle } from './data-source-toggle';
import { useChartStore } from '@/store/chart-store';
import { ChartUtils } from '@/utils/chart-utils';

export function Sidebar() {
  const { selectedSymbol } = useChartStore();

  return (
    <aside className="w-80 bg-slate-800 border-r border-slate-700 overflow-y-auto">
      <SymbolSearch />
      
      {/* Active Symbol */}
      {selectedSymbol && (
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {selectedSymbol.symbol}
              </h3>
              <p className="text-sm text-slate-400">
                {selectedSymbol.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-success">
                ${ChartUtils.formatPrice(selectedSymbol.price)}
              </p>
              <p className={`text-sm ${selectedSymbol.change >= 0 ? 'text-success' : 'text-danger'}`}>
                {selectedSymbol.change >= 0 ? '+' : ''}
                {ChartUtils.formatPrice(selectedSymbol.change)} ({ChartUtils.formatPercentage(selectedSymbol.changePercent)})
              </p>
            </div>
          </div>
        </div>
      )}
      
      <IndicatorsPanel />
      <DrawingTools />
      <DataSourceToggle />
    </aside>
  );
}
