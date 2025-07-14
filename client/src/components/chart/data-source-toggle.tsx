import { Database, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChartStore } from '@/store/chart-store';
import { useWebSocket } from '@/hooks/use-websocket';

export function DataSourceToggle() {
  const { config, setDataSource } = useChartStore();
  const { isConnected } = useWebSocket();

  const handleToggle = () => {
    setDataSource(config.dataSource === 'dummy' ? 'real' : 'dummy');
  };

  return (
    <Button
      variant={config.dataSource === 'real' ? 'default' : 'ghost'}
      size="sm"
      onClick={handleToggle}
      className="px-3 py-1 h-8 text-slate-300 hover:bg-slate-700"
      title={`Switch to ${config.dataSource === 'dummy' ? 'real' : 'dummy'} data`}
    >
      {config.dataSource === 'dummy' ? (
        <>
          <Database className="h-4 w-4 mr-1" />
          <span className="text-sm">Dummy</span>
        </>
      ) : (
        <>
          {isConnected ? (
            <Wifi className="h-4 w-4 mr-1 text-green-400" />
          ) : (
            <WifiOff className="h-4 w-4 mr-1 text-red-400" />
          )}
          <span className="text-sm">Live</span>
        </>
      )}
    </Button>
  );
}