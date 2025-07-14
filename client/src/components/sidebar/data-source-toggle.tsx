import { useChartStore } from '@/store/chart-store';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function DataSourceToggle() {
  const { config, setDataSource, isConnected } = useChartStore();

  return (
    <div className="p-4">
      <h4 className="text-sm font-medium text-slate-300 mb-3">
        Data Source
      </h4>
      
      <RadioGroup
        value={config.dataSource}
        onValueChange={(value: 'dummy' | 'real') => setDataSource(value)}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="dummy" id="dummy" />
          <Label htmlFor="dummy" className="text-sm text-slate-200">
            Dummy Data
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="real" id="real" />
          <Label htmlFor="real" className="text-sm text-slate-200">
            Real-time Data
          </Label>
        </div>
      </RadioGroup>
      
      <div className="mt-3 p-2 bg-slate-700 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-slate-500'}`} />
          <span className="text-xs text-slate-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </div>
  );
}
