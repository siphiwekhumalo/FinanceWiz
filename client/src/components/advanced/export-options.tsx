import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileImage, FileText, FileSpreadsheet, Database, Settings } from 'lucide-react';
import { ExportOptions } from '@/types/advanced-types';

interface ExportOptionsProps {
  onExport: (options: ExportOptions) => Promise<void>;
  currentSymbol: string;
}

const EXPORT_FORMATS = [
  {
    id: 'png',
    name: 'PNG Image',
    icon: FileImage,
    description: 'High-quality image for presentations',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'pdf',
    name: 'PDF Document',
    icon: FileText,
    description: 'Professional document format',
    color: 'bg-red-100 text-red-800'
  },
  {
    id: 'csv',
    name: 'CSV Data',
    icon: FileSpreadsheet,
    description: 'Raw data for analysis',
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'json',
    name: 'JSON Data',
    icon: Database,
    description: 'Structured data format',
    color: 'bg-purple-100 text-purple-800'
  }
];

const RESOLUTION_OPTIONS = [
  { id: 'standard', name: 'Standard (1920x1080)', description: 'Good for web display' },
  { id: 'high', name: 'High (2560x1440)', description: 'Better for presentations' },
  { id: 'ultra', name: 'Ultra (3840x2160)', description: 'Best for print' }
];

export function ExportOptionsComponent({ onExport, currentSymbol }: ExportOptionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'pdf' | 'csv' | 'json'>('png');
  const [resolution, setResolution] = useState<'standard' | 'high' | 'ultra'>('standard');
  const [includeLogo, setIncludeLogo] = useState(true);
  const [includeWatermark, setIncludeWatermark] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const options: ExportOptions = {
        format: exportFormat,
        resolution,
        includeLogo,
        includeWatermark,
        timeRange: {
          start: startDate ? new Date(startDate).getTime() : Date.now() - 30 * 24 * 60 * 60 * 1000,
          end: endDate ? new Date(endDate).getTime() : Date.now()
        }
      };

      await onExport(options);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (format: string) => {
    const config = EXPORT_FORMATS.find(f => f.id === format);
    return config?.icon || FileImage;
  };

  const getFormatColor = (format: string) => {
    const config = EXPORT_FORMATS.find(f => f.id === format);
    return config?.color || 'bg-gray-100 text-gray-800';
  };

  const getFormatDescription = (format: string) => {
    const config = EXPORT_FORMATS.find(f => f.id === format);
    return config?.description || '';
  };

  const isImageFormat = exportFormat === 'png' || exportFormat === 'pdf';
  const isDataFormat = exportFormat === 'csv' || exportFormat === 'json';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Export Options</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export Chart
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Export Chart</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Format Selection */}
              <div>
                <Label>Export Format</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {EXPORT_FORMATS.map((format) => {
                    const Icon = format.icon;
                    return (
                      <Card
                        key={format.id}
                        className={`cursor-pointer transition-all ${
                          exportFormat === format.id
                            ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                        }`}
                        onClick={() => setExportFormat(format.id as any)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span className="font-medium text-sm">{format.name}</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {format.description}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Resolution for image formats */}
              {isImageFormat && (
                <div>
                  <Label>Resolution</Label>
                  <Select value={resolution} onValueChange={(value: any) => setResolution(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOLUTION_OPTIONS.map((res) => (
                        <SelectItem key={res.id} value={res.id}>
                          <div>
                            <div className="font-medium">{res.name}</div>
                            <div className="text-sm text-gray-600">{res.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Image Options */}
              {isImageFormat && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Include Logo</Label>
                    <Switch
                      checked={includeLogo}
                      onCheckedChange={setIncludeLogo}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Include Watermark</Label>
                    <Switch
                      checked={includeWatermark}
                      onCheckedChange={setIncludeWatermark}
                    />
                  </div>
                </div>
              )}

              {/* Time Range */}
              <div>
                <Label>Time Range</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label className="text-xs">Start Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">End Date</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Export Preview */}
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Export Preview</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Format:</span>
                    <Badge variant="outline" className={getFormatColor(exportFormat)}>
                      {exportFormat.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Symbol:</span>
                    <span className="font-medium">{currentSymbol}</span>
                  </div>
                  {isImageFormat && (
                    <div className="flex items-center justify-between">
                      <span>Resolution:</span>
                      <span className="font-medium">{resolution}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Logo:</span>
                    <span className="font-medium">{includeLogo ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleExport} disabled={isExporting} className="flex-1">
                  <Download className="w-4 h-4 mr-1" />
                  {isExporting ? 'Exporting...' : 'Export'}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Export Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setExportFormat('png');
            handleExport();
          }}
          disabled={isExporting}
        >
          <FileImage className="w-4 h-4 mr-1" />
          PNG
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setExportFormat('pdf');
            handleExport();
          }}
          disabled={isExporting}
        >
          <FileText className="w-4 h-4 mr-1" />
          PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setExportFormat('csv');
            handleExport();
          }}
          disabled={isExporting}
        >
          <FileSpreadsheet className="w-4 h-4 mr-1" />
          CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setExportFormat('json');
            handleExport();
          }}
          disabled={isExporting}
        >
          <Database className="w-4 h-4 mr-1" />
          JSON
        </Button>
      </div>

      {/* Export Information */}
      <div className="text-xs text-gray-500 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-900 rounded">
        <p>
          <strong>PNG/PDF:</strong> Include chart visualization with customizable resolution
        </p>
        <p>
          <strong>CSV/JSON:</strong> Export raw data for external analysis
        </p>
      </div>
    </div>
  );
}