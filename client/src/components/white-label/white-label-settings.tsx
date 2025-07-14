import { useState } from 'react';
import { useSettingsStore } from '@/store/settings-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, Eye, Code, Palette, Settings, Monitor } from 'lucide-react';

export function WhiteLabelSettings() {
  const { whiteLabel, updateWhiteLabel } = useSettingsStore();
  const [embedCode, setEmbedCode] = useState('');

  const handleColorChange = (field: string, value: string) => {
    updateWhiteLabel({ [field]: value });
  };

  const handleFeatureToggle = (feature: string, enabled: boolean) => {
    updateWhiteLabel({
      features: { ...whiteLabel.features, [feature]: enabled }
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateWhiteLabel({ logo: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const generateEmbedCode = () => {
    const config = {
      symbol: 'AAPL',
      theme: whiteLabel.theme,
      primaryColor: whiteLabel.primaryColor,
      showToolbar: whiteLabel.features.showToolbar,
      showIndicators: whiteLabel.features.showIndicators,
      showVolume: whiteLabel.features.showVolume,
      companyName: whiteLabel.companyName,
      logo: whiteLabel.logo,
    };

    const encodedConfig = btoa(JSON.stringify(config));
    const embedUrl = `${window.location.origin}/embed?config=${encodedConfig}`;
    
    const iframe = `<iframe 
  src="${embedUrl}" 
  width="800" 
  height="600" 
  frameborder="0" 
  style="border: 1px solid #e2e8f0; border-radius: 8px;">
</iframe>`;
    
    setEmbedCode(iframe);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100 mb-2">White-Label Settings</h1>
        <p className="text-slate-400">Customize your trading platform's appearance and features</p>
      </div>

      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="embed" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Embed
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={whiteLabel.companyName}
                    onChange={(e) => updateWhiteLabel({ companyName: e.target.value })}
                    placeholder="Your Trading Platform"
                  />
                </div>
                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={whiteLabel.tagline}
                    onChange={(e) => updateWhiteLabel({ tagline: e.target.value })}
                    placeholder="Professional Trading Solutions"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="logo">Logo Upload</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
                {whiteLabel.logo && (
                  <div className="mt-2">
                    <img 
                      src={whiteLabel.logo} 
                      alt="Logo preview" 
                      className="h-12 w-auto rounded border"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Theme & Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="theme"
                  checked={whiteLabel.theme === 'dark'}
                  onCheckedChange={(checked) => updateWhiteLabel({ theme: checked ? 'dark' : 'light' })}
                />
                <Label htmlFor="theme">Dark Theme</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={whiteLabel.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={whiteLabel.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={whiteLabel.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={whiteLabel.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      placeholder="#64748b"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showToolbar">Show Toolbar</Label>
                    <p className="text-sm text-slate-500">Display chart controls and timeframe buttons</p>
                  </div>
                  <Switch
                    id="showToolbar"
                    checked={whiteLabel.features.showToolbar}
                    onCheckedChange={(checked) => handleFeatureToggle('showToolbar', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showIndicators">Show Indicators</Label>
                    <p className="text-sm text-slate-500">Enable technical indicators panel</p>
                  </div>
                  <Switch
                    id="showIndicators"
                    checked={whiteLabel.features.showIndicators}
                    onCheckedChange={(checked) => handleFeatureToggle('showIndicators', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showVolume">Show Volume</Label>
                    <p className="text-sm text-slate-500">Display volume chart below main chart</p>
                  </div>
                  <Switch
                    id="showVolume"
                    checked={whiteLabel.features.showVolume}
                    onCheckedChange={(checked) => handleFeatureToggle('showVolume', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showWatermark">Show Watermark</Label>
                    <p className="text-sm text-slate-500">Display company watermark on charts</p>
                  </div>
                  <Switch
                    id="showWatermark"
                    checked={whiteLabel.features.showWatermark}
                    onCheckedChange={(checked) => handleFeatureToggle('showWatermark', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Embed Code Generator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button onClick={generateEmbedCode} className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Generate Embed Code
                </Button>
                {embedCode && (
                  <Button variant="outline" onClick={copyToClipboard}>
                    Copy to Clipboard
                  </Button>
                )}
              </div>

              {embedCode && (
                <div className="space-y-2">
                  <Label>Embed Code</Label>
                  <textarea
                    value={embedCode}
                    readOnly
                    className="w-full h-32 p-3 bg-slate-800 border border-slate-700 rounded font-mono text-sm resize-none"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-slate-700 rounded-lg p-4 bg-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {whiteLabel.logo && (
                      <img src={whiteLabel.logo} alt="Logo" className="h-8 w-auto" />
                    )}
                    <div>
                      <h3 className="font-bold">{whiteLabel.companyName}</h3>
                      <p className="text-sm text-slate-400">{whiteLabel.tagline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: whiteLabel.primaryColor }}
                    />
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: whiteLabel.secondaryColor }}
                    />
                  </div>
                </div>
                <div className="h-48 bg-slate-900 rounded border flex items-center justify-center">
                  <Monitor className="w-12 h-12 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}