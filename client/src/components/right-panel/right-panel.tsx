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
    <aside className="w-72 bg-slate-800 border-l border-slate-700 overflow-y-auto">
      <OrderBook />
      <RecentTrades />
      <MarketStats />
      
      {/* Embed Code Section */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Embed Chart</h4>
        
        <Button
          onClick={handleGenerateEmbedCode}
          className="w-full bg-primary hover:bg-primary/90 text-white"
        >
          <Code className="h-4 w-4 mr-2" />
          Generate Embed Code
        </Button>
        
        <div className="mt-3 p-3 bg-slate-700 rounded-lg">
          <p className="text-xs text-slate-400 mb-2">Customization Options:</p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showToolbar"
                checked={embedOptions.showToolbar}
                onCheckedChange={(checked) => 
                  setEmbedOptions(prev => ({ ...prev, showToolbar: !!checked }))
                }
              />
              <label htmlFor="showToolbar" className="text-xs text-slate-300">
                Show toolbar
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showIndicators"
                checked={embedOptions.showIndicators}
                onCheckedChange={(checked) => 
                  setEmbedOptions(prev => ({ ...prev, showIndicators: !!checked }))
                }
              />
              <label htmlFor="showIndicators" className="text-xs text-slate-300">
                Show indicators
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showVolume"
                checked={embedOptions.showVolume}
                onCheckedChange={(checked) => 
                  setEmbedOptions(prev => ({ ...prev, showVolume: !!checked }))
                }
              />
              <label htmlFor="showVolume" className="text-xs text-slate-300">
                Show volume
              </label>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
