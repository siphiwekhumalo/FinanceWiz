import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, TrendingUp, BarChart3, Activity, X } from 'lucide-react';
import { TechnicalIndicator } from '@/types/advanced-types';

interface IndicatorsPanelProps {
  indicators: TechnicalIndicator[];
  onAddIndicator: (type: string, parameters: Record<string, any>) => void;
  onRemoveIndicator: (indicatorId: string) => void;
  onToggleIndicator: (indicatorId: string) => void;
  onUpdateIndicatorSettings: (indicatorId: string, settings: Record<string, any>) => void;
}

const AVAILABLE_INDICATORS = [
  {
    id: 'sma',
    name: 'Simple Moving Average',
    type: 'overlay',
    icon: TrendingUp,
    defaultParams: { period: 20, source: 'close' },
    description: 'Average price over a specified period'
  },
  {
    id: 'ema',
    name: 'Exponential Moving Average',
    type: 'overlay',
    icon: TrendingUp,
    defaultParams: { period: 20, source: 'close' },
    description: 'Weighted average giving more importance to recent prices'
  },
  {
    id: 'rsi',
    name: 'Relative Strength Index',
    type: 'oscillator',
    icon: Activity,
    defaultParams: { period: 14, source: 'close' },
    description: 'Momentum oscillator measuring speed and change of price movements'
  },
  {
    id: 'macd',
    name: 'MACD',
    type: 'oscillator',
    icon: BarChart3,
    defaultParams: { fast: 12, slow: 26, signal: 9 },
    description: 'Moving Average Convergence Divergence'
  },
  {
    id: 'bb',
    name: 'Bollinger Bands',
    type: 'overlay',
    icon: TrendingUp,
    defaultParams: { period: 20, stdDev: 2, source: 'close' },
    description: 'Price channels based on standard deviation'
  },
  {
    id: 'vwap',
    name: 'Volume Weighted Average Price',
    type: 'overlay',
    icon: BarChart3,
    defaultParams: {},
    description: 'Average price weighted by volume'
  }
];

export function IndicatorsPanel({
  indicators,
  onAddIndicator,
  onRemoveIndicator,
  onToggleIndicator,
  onUpdateIndicatorSettings
}: IndicatorsPanelProps) {
  const [selectedIndicator, setSelectedIndicator] = useState<string>('');
  const [indicatorParams, setIndicatorParams] = useState<Record<string, any>>({});
  const [isAddingIndicator, setIsAddingIndicator] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<TechnicalIndicator | null>(null);

  const handleAddIndicator = () => {
    if (!selectedIndicator) return;
    
    const indicatorConfig = AVAILABLE_INDICATORS.find(ind => ind.id === selectedIndicator);
    if (!indicatorConfig) return;

    const params = { ...indicatorConfig.defaultParams, ...indicatorParams };
    onAddIndicator(selectedIndicator, params);
    
    setSelectedIndicator('');
    setIndicatorParams({});
    setIsAddingIndicator(false);
  };

  const handleParamChange = (key: string, value: any) => {
    setIndicatorParams(prev => ({ ...prev, [key]: value }));
  };

  const handleEditIndicator = (indicator: TechnicalIndicator) => {
    setEditingIndicator(indicator);
  };

  const handleUpdateIndicator = () => {
    if (!editingIndicator) return;
    
    onUpdateIndicatorSettings(editingIndicator.id, indicatorParams);
    setEditingIndicator(null);
    setIndicatorParams({});
  };

  const getIndicatorIcon = (type: string) => {
    const config = AVAILABLE_INDICATORS.find(ind => ind.id === type);
    return config?.icon || Activity;
  };

  const getIndicatorColor = (type: string) => {
    if (type === 'overlay') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
  };

  const renderParameterInputs = (indicatorId: string, currentParams: Record<string, any> = {}) => {
    const config = AVAILABLE_INDICATORS.find(ind => ind.id === indicatorId);
    if (!config) return null;

    return Object.entries(config.defaultParams).map(([key, defaultValue]) => {
      const currentValue = currentParams[key] !== undefined ? currentParams[key] : defaultValue;
      
      if (key === 'source') {
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>Source</Label>
            <Select 
              value={currentValue} 
              onValueChange={(value) => handleParamChange(key, value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="close">Close</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="hlc3">HLC3</SelectItem>
                <SelectItem value="ohlc4">OHLC4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      }

      return (
        <div key={key} className="space-y-2">
          <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
          <Input
            id={key}
            type="number"
            value={currentValue}
            onChange={(e) => handleParamChange(key, parseInt(e.target.value) || defaultValue)}
            min="1"
          />
        </div>
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Technical Indicators</h3>
        <Dialog open={isAddingIndicator} onOpenChange={setIsAddingIndicator}>
          <DialogTrigger asChild>
            <Button size="sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              Add Indicator
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Technical Indicator</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Indicator Type</Label>
                <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select indicator" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_INDICATORS.map((indicator) => {
                      const Icon = indicator.icon;
                      return (
                        <SelectItem key={indicator.id} value={indicator.id}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span>{indicator.name}</span>
                            <Badge variant="outline" className={getIndicatorColor(indicator.type)}>
                              {indicator.type}
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedIndicator && (
                <>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {AVAILABLE_INDICATORS.find(ind => ind.id === selectedIndicator)?.description}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {renderParameterInputs(selectedIndicator, indicatorParams)}
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <Button onClick={handleAddIndicator} disabled={!selectedIndicator} className="flex-1">
                  Add Indicator
                </Button>
                <Button variant="outline" onClick={() => setIsAddingIndicator(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Indicators List */}
      <div className="space-y-2">
        {indicators.map((indicator) => {
          const Icon = getIndicatorIcon(indicator.name.toLowerCase());
          return (
            <div
              key={indicator.id}
              className={`p-3 rounded-lg border transition-all ${
                indicator.visible
                  ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={indicator.visible}
                    onCheckedChange={() => onToggleIndicator(indicator.id)}
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: indicator.color }}
                  />
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{indicator.name}</span>
                  <Badge variant="outline" className={getIndicatorColor(indicator.type)}>
                    {indicator.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditIndicator(indicator)}
                    className="h-6 w-6 p-0"
                  >
                    <Settings className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveIndicator(indicator.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              {/* Indicator Parameters Display */}
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {Object.entries(indicator.parameters).map(([key, value]) => (
                  <span key={key} className="mr-3">
                    {key}: {value}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {indicators.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No indicators added</p>
          <p className="text-xs">Add technical indicators to analyze price movements</p>
        </div>
      )}

      {/* Edit Indicator Dialog */}
      <Dialog open={!!editingIndicator} onOpenChange={() => setEditingIndicator(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {editingIndicator?.name}</DialogTitle>
          </DialogHeader>
          {editingIndicator && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {renderParameterInputs(editingIndicator.name.toLowerCase(), editingIndicator.parameters)}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateIndicator} className="flex-1">
                  Update Indicator
                </Button>
                <Button variant="outline" onClick={() => setEditingIndicator(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}