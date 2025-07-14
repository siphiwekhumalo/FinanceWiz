import { useEffect, useRef } from 'react';
import { useChartStore } from '@/store/chart-store';
import { ChartUtils } from '@/utils/chart-utils';

export function ChartContainer() {
  const { isLoading, selectedSymbol, isConnected } = useChartStore();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const error = null; // Temporarily remove chart functionality to test the UI

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString();
  };

  const mockOHLC = {
    open: selectedSymbol?.price ? (selectedSymbol.price * 0.995).toFixed(2) : '174.22',
    high: selectedSymbol?.price ? (selectedSymbol.price * 1.005).toFixed(2) : '175.88',
    low: selectedSymbol?.price ? (selectedSymbol.price * 0.985).toFixed(2) : '173.45',
    close: selectedSymbol?.price ? selectedSymbol.price.toFixed(2) : '175.43',
  };

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-400 mb-2">Error Loading Chart</h3>
          <p className="text-sm text-slate-500">Failed to load chart data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Real-time Status Indicator */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-slate-800 rounded-lg p-2 border border-slate-700">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-xs text-slate-400">
              {isConnected ? 'Live' : 'Offline'}
            </span>
            <span className="text-xs text-slate-400">
              {getCurrentTime()}
            </span>
          </div>
        </div>
      </div>

      {/* Price Display Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-xs text-slate-400">OPEN</p>
              <p className="text-sm font-mono text-slate-200">${mockOHLC.open}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">HIGH</p>
              <p className="text-sm font-mono text-success">${mockOHLC.high}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">LOW</p>
              <p className="text-sm font-mono text-danger">${mockOHLC.low}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">CLOSE</p>
              <p className="text-sm font-mono text-slate-200">${mockOHLC.close}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">VOLUME</p>
              <p className="text-sm font-mono text-slate-200">
                {selectedSymbol?.volume ? ChartUtils.formatVolume(selectedSymbol.volume) : '2.4M'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div ref={chartContainerRef} id="chart-container" className="w-full h-full bg-slate-900">
        {isLoading && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-slate-400 mb-2">Loading Chart...</h3>
              <p className="text-sm text-slate-500">Fetching market data...</p>
            </div>
          </div>
        )}
        
        {!isLoading && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-300 mb-2">Chart Ready</h3>
              <p className="text-sm text-slate-500">Financial chart will render here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
