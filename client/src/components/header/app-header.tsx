import { Palette, Expand, Settings, TrendingUp, Activity } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import { useChartStore } from '@/store/chart-store';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function AppHeader() {
  const { whiteLabel, setSettingsOpen, setFullscreen, isFullscreen } = useSettingsStore();
  const { selectedSymbol, config } = useChartStore();

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  return (
    <header className="toolbar bg-slate-800 border-b border-slate-700 shadow-lg">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <motion.div 
            className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <TrendingUp className="h-6 w-6 text-white" />
          </motion.div>
          
          <div>
            <h1 className="text-xl font-bold text-white bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              {whiteLabel.companyName}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {whiteLabel.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {/* Current Symbol Display */}
          <div className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 rounded-lg border border-slate-600/50">
            <Activity className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-mono text-white">{config.symbol}</span>
            <span className="text-xs text-slate-400">{selectedSymbol?.price || '175.43'}</span>
          </div>

          <div className="w-px h-6 bg-slate-600 mx-2" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            className="button-premium h-10 w-10 rounded-xl"
            title="Theme Settings"
          >
            <Palette className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFullscreen}
            className="button-premium h-10 w-10 rounded-xl"
            title="Fullscreen"
          >
            <Expand className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            className="button-premium h-10 w-10 rounded-xl"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
