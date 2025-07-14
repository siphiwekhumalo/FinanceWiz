import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { CompareSymbol } from '@/types/advanced-types';
import { AdvancedFeaturesService } from '@/services/advanced-features-service';

interface CompareModeProps {
  baseSymbol: string;
  compareSymbols: CompareSymbol[];
  onAddCompareSymbol: (symbol: string, compareMode: 'percentage' | 'price') => void;
  onRemoveCompareSymbol: (symbolId: string) => void;
  onToggleSymbolVisibility: (symbolId: string) => void;
}

export function CompareMode({
  baseSymbol,
  compareSymbols,
  onAddCompareSymbol,
  onRemoveCompareSymbol,
  onToggleSymbolVisibility
}: CompareModeProps) {
  const [newSymbol, setNewSymbol] = useState('');
  const [compareMode, setCompareMode] = useState<'percentage' | 'price'>('percentage');
  const [isAddingSymbol, setIsAddingSymbol] = useState(false);

  const handleAddSymbol = async () => {
    if (!newSymbol.trim()) return;
    
    setIsAddingSymbol(true);
    try {
      await onAddCompareSymbol(newSymbol.toUpperCase(), compareMode);
      setNewSymbol('');
    } catch (error) {
      console.error('Error adding compare symbol:', error);
    } finally {
      setIsAddingSymbol(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSymbol();
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3" />;
    if (change < 0) return <TrendingDown className="w-3 h-3" />;
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold">Compare Mode</h3>
        <Badge variant="outline">{compareMode === 'percentage' ? '%' : '$'}</Badge>
      </div>

      {/* Add Symbol Section */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Add symbol (e.g., GOOGL)"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Select value={compareMode} onValueChange={(value: 'percentage' | 'price') => setCompareMode(value)}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">%</SelectItem>
            <SelectItem value="price">$</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={handleAddSymbol}
          disabled={!newSymbol.trim() || isAddingSymbol}
          size="sm"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Base Symbol Display */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="font-medium">{baseSymbol}</span>
            <Badge variant="secondary">Base</Badge>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {compareMode === 'percentage' ? '0.00%' : 'Base Price'}
          </span>
        </div>
      </div>

      {/* Compare Symbols List */}
      <div className="space-y-2">
        {compareSymbols.map((symbol) => (
          <div
            key={symbol.id}
            className={`p-3 rounded-lg border transition-all ${
              symbol.visible
                ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleSymbolVisibility(symbol.id)}
                  className="flex items-center gap-2 hover:opacity-75 transition-opacity"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: symbol.color }}
                  />
                  <span className="font-medium">{symbol.symbol}</span>
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {symbol.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {compareMode === 'percentage' ? (
                    <span className={`text-sm font-medium ${getChangeColor(symbol.normalizedData[symbol.normalizedData.length - 1]?.close || 0)}`}>
                      {getChangeIcon(symbol.normalizedData[symbol.normalizedData.length - 1]?.close || 0)}
                      {(symbol.normalizedData[symbol.normalizedData.length - 1]?.close || 0).toFixed(2)}%
                    </span>
                  ) : (
                    <span className="text-sm font-medium">
                      ${(symbol.data[symbol.data.length - 1]?.close || 0).toFixed(2)}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveCompareSymbol(symbol.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {compareSymbols.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No symbols to compare</p>
          <p className="text-xs">Add symbols to overlay on the chart</p>
        </div>
      )}

      {/* Compare Mode Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-900 rounded">
        <p>
          <strong>Percentage Mode:</strong> Shows relative performance vs. base symbol
        </p>
        <p>
          <strong>Price Mode:</strong> Shows absolute price movements
        </p>
      </div>
    </div>
  );
}