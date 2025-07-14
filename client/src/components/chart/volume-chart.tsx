import { useChartStore } from '@/store/chart-store';
import { ChartUtils } from '@/utils/chart-utils';

export function VolumeChart() {
  const { volumeData, selectedSymbol } = useChartStore();

  // Generate mock volume bars for visual representation
  const generateVolumeBar = (height: number, index: number) => (
    <div
      key={index}
      className="flex-1 bg-slate-600 rounded-t mx-px"
      style={{ height: `${height}%` }}
    />
  );

  const mockVolumeBars = Array.from({ length: 50 }, (_, i) => 
    generateVolumeBar(Math.random() * 100, i)
  );

  return (
    <div className="h-24 bg-slate-800 border-t border-slate-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-medium text-slate-400">VOLUME</h4>
        <span className="text-xs text-slate-500">
          {selectedSymbol?.volume ? ChartUtils.formatVolume(selectedSymbol.volume) : '2.4M'}
        </span>
      </div>
      
      <div className="h-12 flex items-end">
        {mockVolumeBars}
      </div>
    </div>
  );
}
