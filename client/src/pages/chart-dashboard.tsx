import { useEffect, useState } from 'react';
import { useChartStore } from '@/store/chart-store';
import { useSettingsStore } from '@/store/settings-store';
import { AppHeader } from '@/components/header/app-header';
import { ChartContainer } from '@/components/chart/chart-container';
import { ChartToolbar } from '@/components/chart/chart-toolbar';
import { ChartZoomControls } from '@/components/chart/chart-zoom-controls';
import { VolumeChart } from '@/components/chart/volume-chart';
import { RightPanel } from '@/components/right-panel/right-panel';
import { AdvancedFeaturesPanel } from '@/components/advanced/advanced-features-panel';
import { SettingsModal } from '@/components/modals/settings-modal';
import { LoadingOverlay } from '@/components/modals/loading-overlay';
import { useWebSocket } from '@/hooks/use-websocket';
import { AdvancedFeaturesService } from '@/services/advanced-features-service';
import { 
  CompareSymbol, 
  TechnicalIndicator, 
  BacktestStrategy, 
  BacktestResults,
  MarketEvent,
  ChartNote,
  ExportOptions,
  ReplaySession 
} from '@/types/advanced-types';

export default function ChartDashboard() {
  const { config, isLoading } = useChartStore();
  const { isSettingsOpen, whiteLabel, isFullscreen } = useSettingsStore();
  const { isConnected } = useWebSocket();

  // Advanced features state
  const [compareSymbols, setCompareSymbols] = useState<CompareSymbol[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([]);
  const [marketEvents, setMarketEvents] = useState<MarketEvent[]>([]);
  const [chartNotes, setChartNotes] = useState<ChartNote[]>([]);
  const [replaySession, setReplaySession] = useState<ReplaySession | null>(null);
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(true);

  const advancedService = AdvancedFeaturesService.getInstance();

  useEffect(() => {
    // Apply custom CSS variables based on white label config
    const root = document.documentElement;
    root.style.setProperty('--primary-color', whiteLabel.primaryColor);
    root.style.setProperty('--secondary-color', whiteLabel.secondaryColor);
  }, [whiteLabel]);

  // Advanced features handlers
  const handleAddCompareSymbol = async (symbol: string, compareMode: 'percentage' | 'price') => {
    try {
      const compareSymbol = await advancedService.addCompareSymbol(symbol, config.selectedSymbol, compareMode);
      setCompareSymbols(prev => [...prev, compareSymbol]);
    } catch (error) {
      console.error('Failed to add compare symbol:', error);
    }
  };

  const handleRemoveCompareSymbol = (symbolId: string) => {
    advancedService.removeCompareSymbol(symbolId);
    setCompareSymbols(prev => prev.filter(s => s.id !== symbolId));
  };

  const handleToggleCompareSymbol = (symbolId: string) => {
    advancedService.toggleCompareSymbolVisibility(symbolId);
    setCompareSymbols(prev => prev.map(s => 
      s.id === symbolId ? { ...s, visible: !s.visible } : s
    ));
  };

  const handleAddIndicator = (type: string, parameters: Record<string, any>) => {
    const indicator = advancedService.addIndicator(type, parameters);
    setIndicators(prev => [...prev, indicator]);
  };

  const handleRemoveIndicator = (indicatorId: string) => {
    setIndicators(prev => prev.filter(i => i.id !== indicatorId));
  };

  const handleToggleIndicator = (indicatorId: string) => {
    setIndicators(prev => prev.map(i => 
      i.id === indicatorId ? { ...i, visible: !i.visible } : i
    ));
  };

  const handleUpdateIndicatorSettings = (indicatorId: string, settings: Record<string, any>) => {
    setIndicators(prev => prev.map(i => 
      i.id === indicatorId ? { ...i, parameters: settings } : i
    ));
  };

  const handleRunBacktest = async (strategy: BacktestStrategy, symbol: string, timeframe: string): Promise<BacktestResults> => {
    return await advancedService.runBacktest(strategy, symbol, timeframe);
  };

  const handleAddMarketEvent = (event: MarketEvent) => {
    advancedService.addMarketEvent(event);
    setMarketEvents(prev => [...prev, event]);
  };

  const handleRemoveMarketEvent = (eventId: string) => {
    setMarketEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const handleAddChartNote = (timestamp: number, price: number, text: string, author: string) => {
    const note = advancedService.addChartNote(config.selectedSymbol, timestamp, price, text, author);
    setChartNotes(prev => [...prev, note]);
  };

  const handleRemoveChartNote = (noteId: string) => {
    setChartNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const handleExport = async (options: ExportOptions) => {
    try {
      const blob = await advancedService.exportChart(options);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.selectedSymbol}_chart.${options.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleStartReplay = (symbol: string, startTime: number, endTime: number) => {
    const session = advancedService.createReplaySession(symbol, startTime, endTime);
    setReplaySession(session);
  };

  const handleStopReplay = () => {
    setReplaySession(null);
  };

  const handleReplayControl = (action: 'play' | 'pause' | 'speed') => {
    if (!replaySession) return;
    
    switch (action) {
      case 'play':
        setReplaySession(prev => prev ? { ...prev, isPlaying: true } : null);
        break;
      case 'pause':
        setReplaySession(prev => prev ? { ...prev, isPlaying: false } : null);
        break;
      case 'speed':
        setReplaySession(prev => prev ? { ...prev, speed: prev.speed === 1 ? 2 : prev.speed === 2 ? 4 : 1 } : null);
        break;
    }
  };

  // Handle fullscreen mode
  if (isFullscreen) {
    return (
      <div className="h-screen flex flex-col bg-slate-900 text-slate-100">
        <ChartToolbar />
        
        <div className="flex-1 bg-slate-900 relative border-b border-slate-700">
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
        <main className="flex-1 flex flex-col mr-72">
          <ChartToolbar />
          
          <div className="flex-1 bg-slate-900 relative border-b border-slate-700">
            <ChartContainer />
            <ChartZoomControls />
          </div>
          
          {config.showVolume && (
            <VolumeChart />
          )}
        </main>
        
        <RightPanel />
      </div>
      
      {showAdvancedPanel && (
        <AdvancedFeaturesPanel
          currentSymbol={config.selectedSymbol}
          currentTimeframe={config.selectedTimeframe}
          compareSymbols={compareSymbols}
          indicators={indicators}
          marketEvents={marketEvents}
          chartNotes={chartNotes}
          replaySession={replaySession}
          fullScreenMode={isFullscreen}
          onAddCompareSymbol={handleAddCompareSymbol}
          onRemoveCompareSymbol={handleRemoveCompareSymbol}
          onToggleCompareSymbol={handleToggleCompareSymbol}
          onAddIndicator={handleAddIndicator}
          onRemoveIndicator={handleRemoveIndicator}
          onToggleIndicator={handleToggleIndicator}
          onUpdateIndicatorSettings={handleUpdateIndicatorSettings}
          onRunBacktest={handleRunBacktest}
          onAddMarketEvent={handleAddMarketEvent}
          onRemoveMarketEvent={handleRemoveMarketEvent}
          onAddChartNote={handleAddChartNote}
          onRemoveChartNote={handleRemoveChartNote}
          onExport={handleExport}
          onToggleFullScreen={() => {}}
          onStartReplay={handleStartReplay}
          onStopReplay={handleStopReplay}
          onReplayControl={handleReplayControl}
        />
      )}
      
      {isSettingsOpen && <SettingsModal />}
      {isLoading && <LoadingOverlay />}
    </div>
  );
}
