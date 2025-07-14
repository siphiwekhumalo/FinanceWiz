import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Activity, 
  Target, 
  CalendarDays, 
  StickyNote, 
  Download,
  Maximize2,
  Settings,
  Play,
  Pause
} from 'lucide-react';

import { CompareMode } from './compare-mode';
import { IndicatorsPanel } from './indicators-panel';
import { StrategyBacktesting } from './strategy-backtesting';
import { MarketEvents } from './market-events';
import { ChartNotes } from './chart-notes';
import { ExportOptionsComponent } from './export-options';

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

interface AdvancedFeaturesPanelProps {
  currentSymbol: string;
  currentTimeframe: string;
  compareSymbols: CompareSymbol[];
  indicators: TechnicalIndicator[];
  marketEvents: MarketEvent[];
  chartNotes: ChartNote[];
  replaySession: ReplaySession | null;
  fullScreenMode: boolean;
  onAddCompareSymbol: (symbol: string, compareMode: 'percentage' | 'price') => void;
  onRemoveCompareSymbol: (symbolId: string) => void;
  onToggleCompareSymbol: (symbolId: string) => void;
  onAddIndicator: (type: string, parameters: Record<string, any>) => void;
  onRemoveIndicator: (indicatorId: string) => void;
  onToggleIndicator: (indicatorId: string) => void;
  onUpdateIndicatorSettings: (indicatorId: string, settings: Record<string, any>) => void;
  onRunBacktest: (strategy: BacktestStrategy, symbol: string, timeframe: string) => Promise<BacktestResults>;
  onAddMarketEvent: (event: MarketEvent) => void;
  onRemoveMarketEvent: (eventId: string) => void;
  onAddChartNote: (timestamp: number, price: number, text: string, author: string) => void;
  onRemoveChartNote: (noteId: string) => void;
  onExport: (options: ExportOptions) => Promise<void>;
  onToggleFullScreen: () => void;
  onStartReplay: (symbol: string, startTime: number, endTime: number) => void;
  onStopReplay: () => void;
  onReplayControl: (action: 'play' | 'pause' | 'speed') => void;
}

export function AdvancedFeaturesPanel({
  currentSymbol,
  currentTimeframe,
  compareSymbols,
  indicators,
  marketEvents,
  chartNotes,
  replaySession,
  fullScreenMode,
  onAddCompareSymbol,
  onRemoveCompareSymbol,
  onToggleCompareSymbol,
  onAddIndicator,
  onRemoveIndicator,
  onToggleIndicator,
  onUpdateIndicatorSettings,
  onRunBacktest,
  onAddMarketEvent,
  onRemoveMarketEvent,
  onAddChartNote,
  onRemoveChartNote,
  onExport,
  onToggleFullScreen,
  onStartReplay,
  onStopReplay,
  onReplayControl
}: AdvancedFeaturesPanelProps) {
  const [activeTab, setActiveTab] = useState('compare');

  const getTabBadgeCount = (tab: string) => {
    switch (tab) {
      case 'compare':
        return compareSymbols.length;
      case 'indicators':
        return indicators.filter(i => i.visible).length;
      case 'events':
        return marketEvents.length;
      case 'notes':
        return chartNotes.length;
      default:
        return 0;
    }
  };

  const handleStartReplay = () => {
    const endTime = Date.now();
    const startTime = endTime - 30 * 24 * 60 * 60 * 1000; // 30 days ago
    onStartReplay(currentSymbol, startTime, endTime);
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Advanced Features</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFullScreen}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Current Symbol & Timeframe */}
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary">{currentSymbol}</Badge>
          <Badge variant="outline">{currentTimeframe}</Badge>
          {fullScreenMode && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Full Screen
            </Badge>
          )}
        </div>
      </div>

      {/* Replay Controls */}
      {replaySession && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="default">Replay Mode</Badge>
              <span className="text-sm text-blue-600 dark:text-blue-400">
                {replaySession.speed}x Speed
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReplayControl(replaySession.isPlaying ? 'pause' : 'play')}
              >
                {replaySession.isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onStopReplay}
              >
                Stop
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="compare" className="relative">
              <TrendingUp className="w-4 h-4 mr-1" />
              Compare
              {getTabBadgeCount('compare') > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {getTabBadgeCount('compare')}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="indicators" className="relative">
              <Activity className="w-4 h-4 mr-1" />
              Indicators
              {getTabBadgeCount('indicators') > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {getTabBadgeCount('indicators')}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="more" className="relative">
              More
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="compare" className="p-4">
              <CompareMode
                baseSymbol={currentSymbol}
                compareSymbols={compareSymbols}
                onAddCompareSymbol={onAddCompareSymbol}
                onRemoveCompareSymbol={onRemoveCompareSymbol}
                onToggleSymbolVisibility={onToggleCompareSymbol}
              />
            </TabsContent>

            <TabsContent value="indicators" className="p-4">
              <IndicatorsPanel
                indicators={indicators}
                onAddIndicator={onAddIndicator}
                onRemoveIndicator={onRemoveIndicator}
                onToggleIndicator={onToggleIndicator}
                onUpdateIndicatorSettings={onUpdateIndicatorSettings}
              />
            </TabsContent>

            <TabsContent value="more" className="p-4">
              <Tabs defaultValue="backtest" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="backtest">
                    <Target className="w-4 h-4 mr-1" />
                    Backtest
                  </TabsTrigger>
                  <TabsTrigger value="events">
                    <CalendarDays className="w-4 h-4 mr-1" />
                    Events
                    {getTabBadgeCount('events') > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {getTabBadgeCount('events')}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="backtest" className="mt-4">
                  <StrategyBacktesting
                    onRunBacktest={onRunBacktest}
                    currentSymbol={currentSymbol}
                    currentTimeframe={currentTimeframe}
                  />
                </TabsContent>

                <TabsContent value="events" className="mt-4">
                  <MarketEvents
                    events={marketEvents}
                    onAddEvent={onAddMarketEvent}
                    onRemoveEvent={onRemoveMarketEvent}
                    currentSymbol={currentSymbol}
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notes">
              <StickyNote className="w-4 h-4 mr-1" />
              Notes
              {getTabBadgeCount('notes') > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {getTabBadgeCount('notes')}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="export">
              <Download className="w-4 h-4 mr-1" />
              Export
            </TabsTrigger>
            <TabsTrigger value="replay">
              <Play className="w-4 h-4 mr-1" />
              Replay
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="mt-4">
            <ChartNotes
              notes={chartNotes}
              onAddNote={onAddChartNote}
              onRemoveNote={onRemoveChartNote}
              currentSymbol={currentSymbol}
            />
          </TabsContent>

          <TabsContent value="export" className="mt-4">
            <ExportOptionsComponent
              onExport={onExport}
              currentSymbol={currentSymbol}
            />
          </TabsContent>

          <TabsContent value="replay" className="mt-4">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Replay Mode</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Step through historical price movements bar by bar
                </p>
                {!replaySession ? (
                  <Button onClick={handleStartReplay} className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Start Replay
                  </Button>
                ) : (
                  <Button onClick={onStopReplay} variant="destructive" className="w-full">
                    Stop Replay
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}