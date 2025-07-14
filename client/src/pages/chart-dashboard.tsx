import { useEffect } from 'react';
import { useChartStore } from '@/store/chart-store';
import { useSettingsStore } from '@/store/settings-store';
import { AppHeader } from '@/components/header/app-header';
import { ChartContainer } from '@/components/chart/chart-container';
import { ChartToolbar } from '@/components/chart/chart-toolbar';
import { ChartZoomControls } from '@/components/chart/chart-zoom-controls';
import { VolumeChart } from '@/components/chart/volume-chart';
import { RightPanel } from '@/components/right-panel/right-panel';
import { SettingsModal } from '@/components/modals/settings-modal';
import { LoadingOverlay } from '@/components/modals/loading-overlay';
import { useWebSocket } from '@/hooks/use-websocket';

export default function ChartDashboard() {
  const { config, isLoading } = useChartStore();
  const { isSettingsOpen, whiteLabel, isFullscreen } = useSettingsStore();
  const { isConnected } = useWebSocket();

  useEffect(() => {
    // Apply custom CSS variables based on white label config
    const root = document.documentElement;
    root.style.setProperty('--primary-color', whiteLabel.primaryColor);
    root.style.setProperty('--secondary-color', whiteLabel.secondaryColor);
  }, [whiteLabel]);

  // Handle fullscreen mode
  if (isFullscreen) {
    return (
      <div className="h-screen flex flex-col bg-slate-900 text-slate-100">
        <ChartToolbar />
        
        <div className="flex-1 bg-slate-900 relative">
          <ChartContainer />
          <ChartZoomControls />
        </div>
        
        {config.showVolume && (
          <VolumeChart />
        )}
        
        {isSettingsOpen && <SettingsModal />}
        {isLoading && <LoadingOverlay />}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-slate-100">
      <AppHeader />
      
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col">
          <ChartToolbar />
          
          <div className="flex-1 bg-slate-900 relative">
            <ChartContainer />
            <ChartZoomControls />
          </div>
          
          {config.showVolume && (
            <VolumeChart />
          )}
        </main>
        
        <RightPanel />
      </div>
      
      {isSettingsOpen && <SettingsModal />}
      {isLoading && <LoadingOverlay />}
    </div>
  );
}
