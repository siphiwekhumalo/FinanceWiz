import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, TrendingUp, TrendingDown, Target, DollarSign, Calendar } from 'lucide-react';
import { BacktestStrategy, BacktestResults, StrategyCondition } from '@/types/advanced-types';

interface StrategyBacktestingProps {
  onRunBacktest: (strategy: BacktestStrategy, symbol: string, timeframe: string) => Promise<BacktestResults>;
  currentSymbol: string;
  currentTimeframe: string;
}

export function StrategyBacktesting({
  onRunBacktest,
  currentSymbol,
  currentTimeframe
}: StrategyBacktestingProps) {
  const [isCreatingStrategy, setIsCreatingStrategy] = useState(false);
  const [strategyName, setStrategyName] = useState('');
  const [strategyDescription, setStrategyDescription] = useState('');
  const [entryConditions, setEntryConditions] = useState<StrategyCondition[]>([]);
  const [exitConditions, setExitConditions] = useState<StrategyCondition[]>([]);
  const [backtestResults, setBacktestResults] = useState<BacktestResults | null>(null);
  const [isRunningBacktest, setIsRunningBacktest] = useState(false);
  const [savedStrategies, setSavedStrategies] = useState<BacktestStrategy[]>([]);

  const handleCreateStrategy = () => {
    if (!strategyName.trim()) return;

    const strategy: BacktestStrategy = {
      id: `strategy_${Date.now()}`,
      name: strategyName,
      description: strategyDescription,
      conditions: {
        entry: entryConditions,
        exit: exitConditions
      }
    };

    setSavedStrategies(prev => [...prev, strategy]);
    setStrategyName('');
    setStrategyDescription('');
    setEntryConditions([]);
    setExitConditions([]);
    setIsCreatingStrategy(false);
  };

  const handleRunBacktest = async (strategy: BacktestStrategy) => {
    setIsRunningBacktest(true);
    try {
      const results = await onRunBacktest(strategy, currentSymbol, currentTimeframe);
      setBacktestResults(results);
      
      // Update strategy with results
      const updatedStrategy = { ...strategy, results };
      setSavedStrategies(prev => 
        prev.map(s => s.id === strategy.id ? updatedStrategy : s)
      );
    } catch (error) {
      console.error('Backtest failed:', error);
    } finally {
      setIsRunningBacktest(false);
    }
  };

  const addCondition = (type: 'entry' | 'exit') => {
    const newCondition: StrategyCondition = {
      indicator: 'rsi',
      operator: '>',
      value: 70,
      timeframe: currentTimeframe
    };

    if (type === 'entry') {
      setEntryConditions(prev => [...prev, newCondition]);
    } else {
      setExitConditions(prev => [...prev, newCondition]);
    }
  };

  const removeCondition = (type: 'entry' | 'exit', index: number) => {
    if (type === 'entry') {
      setEntryConditions(prev => prev.filter((_, i) => i !== index));
    } else {
      setExitConditions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateCondition = (type: 'entry' | 'exit', index: number, field: keyof StrategyCondition, value: any) => {
    const updateFunction = (prev: StrategyCondition[]) => 
      prev.map((condition, i) => 
        i === index ? { ...condition, [field]: value } : condition
      );

    if (type === 'entry') {
      setEntryConditions(updateFunction);
    } else {
      setExitConditions(updateFunction);
    }
  };

  const renderConditionBuilder = (
    conditions: StrategyCondition[],
    type: 'entry' | 'exit',
    onChange: (index: number, field: keyof StrategyCondition, value: any) => void
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {type === 'entry' ? 'Entry Conditions' : 'Exit Conditions'}
        </Label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => addCondition(type)}
        >
          Add Condition
        </Button>
      </div>
      
      {conditions.map((condition, index) => (
        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded">
          <Select
            value={condition.indicator}
            onValueChange={(value) => onChange(index, 'indicator', value)}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rsi">RSI</SelectItem>
              <SelectItem value="sma">SMA</SelectItem>
              <SelectItem value="ema">EMA</SelectItem>
              <SelectItem value="macd">MACD</SelectItem>
              <SelectItem value="price">Price</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={condition.operator}
            onValueChange={(value) => onChange(index, 'operator', value)}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=">">{'>'}</SelectItem>
              <SelectItem value="<">{'<'}</SelectItem>
              <SelectItem value="=">=</SelectItem>
              <SelectItem value="crossover">Cross Above</SelectItem>
              <SelectItem value="crossunder">Cross Below</SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            type="number"
            value={condition.value}
            onChange={(e) => onChange(index, 'value', parseFloat(e.target.value))}
            className="w-20"
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeCondition(type, index)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
      ))}
    </div>
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Strategy Backtesting</h3>
        <Dialog open={isCreatingStrategy} onOpenChange={setIsCreatingStrategy}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Target className="w-4 h-4 mr-1" />
              Create Strategy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Trading Strategy</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Strategy Name</Label>
                <Input
                  value={strategyName}
                  onChange={(e) => setStrategyName(e.target.value)}
                  placeholder="e.g., RSI Mean Reversion"
                />
              </div>
              
              <div>
                <Label>Description</Label>
                <Input
                  value={strategyDescription}
                  onChange={(e) => setStrategyDescription(e.target.value)}
                  placeholder="Brief description of the strategy"
                />
              </div>
              
              {renderConditionBuilder(
                entryConditions,
                'entry',
                (index, field, value) => updateCondition('entry', index, field, value)
              )}
              
              {renderConditionBuilder(
                exitConditions,
                'exit',
                (index, field, value) => updateCondition('exit', index, field, value)
              )}
              
              <div className="flex gap-2">
                <Button onClick={handleCreateStrategy} className="flex-1">
                  Create Strategy
                </Button>
                <Button variant="outline" onClick={() => setIsCreatingStrategy(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Saved Strategies */}
      <div className="space-y-3">
        {savedStrategies.map((strategy) => (
          <Card key={strategy.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium">{strategy.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {strategy.description}
                </p>
              </div>
              <Button
                onClick={() => handleRunBacktest(strategy)}
                disabled={isRunningBacktest}
                size="sm"
              >
                <PlayCircle className="w-4 h-4 mr-1" />
                {isRunningBacktest ? 'Running...' : 'Run Backtest'}
              </Button>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Entry: {strategy.conditions.entry.length} conditions</span>
              <span>Exit: {strategy.conditions.exit.length} conditions</span>
              <span>Symbol: {currentSymbol}</span>
              <span>Timeframe: {currentTimeframe}</span>
            </div>
            
            {strategy.results && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{strategy.results.totalTrades}</div>
                    <div className="text-xs text-gray-500">Total Trades</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${strategy.results.winRate >= 0.5 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(strategy.results.winRate)}
                    </div>
                    <div className="text-xs text-gray-500">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${strategy.results.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(strategy.results.profitLoss)}
                    </div>
                    <div className="text-xs text-gray-500">P&L</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-600">
                      {formatCurrency(strategy.results.maxDrawdown)}
                    </div>
                    <div className="text-xs text-gray-500">Max Drawdown</div>
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Sharpe Ratio</span>
                    <span className={strategy.results.sharpeRatio > 1 ? 'text-green-600' : 'text-gray-600'}>
                      {strategy.results.sharpeRatio.toFixed(2)}
                    </span>
                  </div>
                  <Progress 
                    value={Math.max(0, Math.min(100, strategy.results.sharpeRatio * 50))} 
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {savedStrategies.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No strategies created</p>
          <p className="text-xs">Create trading strategies to backtest historical performance</p>
        </div>
      )}

      {/* Backtest Results Detail */}
      {backtestResults && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Backtest Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {backtestResults.totalTrades}
                  </div>
                  <div className="text-sm text-blue-600">Total Trades</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {formatPercentage(backtestResults.winRate)}
                  </div>
                  <div className="text-sm text-green-600">Win Rate</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <div className={`text-2xl font-bold ${backtestResults.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(backtestResults.profitLoss)}
                  </div>
                  <div className="text-sm text-purple-600">Total P&L</div>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(backtestResults.maxDrawdown)}
                  </div>
                  <div className="text-sm text-red-600">Max Drawdown</div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                <h4 className="font-medium mb-2">Recent Trades</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {backtestResults.trades.slice(-5).map((trade, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant={trade.side === 'long' ? 'default' : 'secondary'}>
                          {trade.side}
                        </Badge>
                        <span>{formatCurrency(trade.entryPrice)}</span>
                        <span>→</span>
                        <span>{formatCurrency(trade.exitPrice)}</span>
                      </div>
                      <span className={`font-medium ${trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trade.profit >= 0 ? '+' : ''}{formatCurrency(trade.profit)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}