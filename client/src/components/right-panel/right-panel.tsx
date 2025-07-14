import { OrderBook } from './order-book';
import { RecentTrades } from './recent-trades';
import { MarketStats } from './market-stats';
import { Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

export function RightPanel() {
  const [embedOptions, setEmbedOptions] = useState({
    showToolbar: true,
    showIndicators: true,
    showVolume: false,
  });

  const handleGenerateEmbedCode = () => {
    const embedCode = `<iframe src="${window.location.origin}/embed?symbol=AAPL&showToolbar=${embedOptions.showToolbar}&showIndicators=${embedOptions.showIndicators}&showVolume=${embedOptions.showVolume}" width="800" height="600" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    console.log('Embed code copied to clipboard');
  };

  return (
    <aside className="w-80 bg-slate-800 border-l border-slate-700 overflow-y-auto custom-scrollbar">
      <OrderBook />
      <RecentTrades />
      <MarketStats />
      
      {/* Embed Code Section */}
      <div className="p-4 border-t border-slate-700/50">
        <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center">
          <Code className="h-4 w-4 mr-2" />
          Embed Chart
        </h4>
        
        <Button
          onClick={handleGenerateEmbedCode}
          className="button-premium w-full h-10 rounded-lg mb-4"
        >
          <Code className="h-4 w-4 mr-2" />
          Generate Embed Code
        </Button>
        
        <div className="card-premium p-4 bg-slate-700/50 rounded-lg">
          <p className="text-xs font-medium text-slate-400 mb-3">Customization Options:</p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-600/20 transition-colors">
              <Checkbox
                id="showToolbar"
                checked={embedOptions.showToolbar}
                onCheckedChange={(checked) => 
                  setEmbedOptions(prev => ({ ...prev, showToolbar: !!checked }))
                }
                className="data-[state=checked]:bg-blue-600"
              />
              <label htmlFor="showToolbar" className="text-sm text-slate-300 font-medium cursor-pointer">
                Show toolbar
              </label>
            </div>
            
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-600/20 transition-colors">
              <Checkbox
                id="showIndicators"
                checked={embedOptions.showIndicators}
                onCheckedChange={(checked) => 
                  setEmbedOptions(prev => ({ ...prev, showIndicators: !!checked }))
                }
                className="data-[state=checked]:bg-blue-600"
              />
              <label htmlFor="showIndicators" className="text-sm text-slate-300 font-medium cursor-pointer">
                Show indicators
              </label>
            </div>
            
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-600/20 transition-colors">
              <Checkbox
                id="showVolume"
                checked={embedOptions.showVolume}
                onCheckedChange={(checked) => 
                  setEmbedOptions(prev => ({ ...prev, showVolume: !!checked }))
                }
                className="data-[state=checked]:bg-blue-600"
              />
              <label htmlFor="showVolume" className="text-sm text-slate-300 font-medium cursor-pointer">
                Show volume
              </label>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
