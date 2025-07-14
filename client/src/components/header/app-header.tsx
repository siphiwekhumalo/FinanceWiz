import { Palette, Expand, Settings } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import { Button } from '@/components/ui/button';

export function AppHeader() {
  const { whiteLabel, setSettingsOpen, setFullscreen, isFullscreen } = useSettingsStore();

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
    <header className="bg-slate-800 border-b border-slate-700">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-chart-line text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">
              {whiteLabel.companyName}
            </h1>
            <p className="text-xs text-slate-400">
              {whiteLabel.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <Palette className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFullscreen}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <Expand className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
