import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export function SettingsModal() {
  const { whiteLabel, setSettingsOpen, updateWhiteLabel } = useSettingsStore();
  const [formData, setFormData] = useState(whiteLabel);

  const handleSave = () => {
    updateWhiteLabel(formData);
    setSettingsOpen(false);
  };

  const handleCancel = () => {
    setFormData(whiteLabel);
    setSettingsOpen(false);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string;
        setFormData(prev => ({ ...prev, logo: logoUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-md mx-4">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Settings</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <Label htmlFor="companyName" className="text-sm font-medium text-slate-300">
              Company Name
            </Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              className="mt-1 bg-slate-700 border-slate-600 text-slate-100"
              placeholder="Enter company name"
            />
          </div>

          <div>
            <Label htmlFor="tagline" className="text-sm font-medium text-slate-300">
              Tagline
            </Label>
            <Input
              id="tagline"
              value={formData.tagline}
              onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
              className="mt-1 bg-slate-700 border-slate-600 text-slate-100"
              placeholder="Enter tagline"
            />
          </div>

          <div>
            <Label htmlFor="theme" className="text-sm font-medium text-slate-300">
              Theme
            </Label>
            <Select
              value={formData.theme}
              onValueChange={(value: 'light' | 'dark') => setFormData(prev => ({ ...prev, theme: value }))}
            >
              <SelectTrigger className="mt-1 bg-slate-700 border-slate-600 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="primaryColor" className="text-sm font-medium text-slate-300">
              Primary Color
            </Label>
            <div className="mt-1 flex items-center space-x-2">
              <input
                id="primaryColor"
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-12 h-10 bg-slate-700 border border-slate-600 rounded cursor-pointer"
              />
              <Input
                value={formData.primaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="flex-1 bg-slate-700 border-slate-600 text-slate-100"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="secondaryColor" className="text-sm font-medium text-slate-300">
              Secondary Color
            </Label>
            <div className="mt-1 flex items-center space-x-2">
              <input
                id="secondaryColor"
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                className="w-12 h-10 bg-slate-700 border border-slate-600 rounded cursor-pointer"
              />
              <Input
                value={formData.secondaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                className="flex-1 bg-slate-700 border-slate-600 text-slate-100"
                placeholder="#1E293B"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="logo" className="text-sm font-medium text-slate-300">
              Company Logo
            </Label>
            <div className="mt-1">
              <label htmlFor="logoUpload" className="cursor-pointer">
                <div className="w-full py-8 border-2 border-dashed border-slate-600 rounded-lg text-center hover:border-slate-500 transition-colors">
                  {formData.logo ? (
                    <div className="space-y-2">
                      <img
                        src={formData.logo}
                        alt="Logo preview"
                        className="mx-auto h-16 w-16 object-contain"
                      />
                      <p className="text-xs text-slate-400">Click to change logo</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto h-8 w-8 text-slate-400" />
                      <p className="text-sm text-slate-400">Upload Logo</p>
                      <p className="text-xs text-slate-500">PNG, JPG, SVG up to 2MB</p>
                    </div>
                  )}
                </div>
              </label>
              <input
                id="logoUpload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-300">Features</Label>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showToolbar"
                  checked={formData.features.showToolbar}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      features: { ...prev.features, showToolbar: !!checked }
                    }))
                  }
                />
                <Label htmlFor="showToolbar" className="text-sm text-slate-300">
                  Show toolbar
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showIndicators"
                  checked={formData.features.showIndicators}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      features: { ...prev.features, showIndicators: !!checked }
                    }))
                  }
                />
                <Label htmlFor="showIndicators" className="text-sm text-slate-300">
                  Show indicators
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showVolume"
                  checked={formData.features.showVolume}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      features: { ...prev.features, showVolume: !!checked }
                    }))
                  }
                />
                <Label htmlFor="showVolume" className="text-sm text-slate-300">
                  Show volume
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showWatermark"
                  checked={formData.features.showWatermark}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      features: { ...prev.features, showWatermark: !!checked }
                    }))
                  }
                />
                <Label htmlFor="showWatermark" className="text-sm text-slate-300">
                  Show watermark
                </Label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-700">
          <div className="flex space-x-3">
            <Button
              onClick={handleSave}
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
            >
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
