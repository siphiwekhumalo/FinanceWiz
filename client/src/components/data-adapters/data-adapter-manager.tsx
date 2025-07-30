import { useState, useEffect } from 'react';
import { Plus, Trash2, Wifi, WifiOff, Settings, Database, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { dataService } from '@/services/data-service';
import { webSocketService } from '@/services/websocket-service';
import { useToast } from '@/hooks/use-toast';
import { DataAdapterInfo } from '@shared/types';

const adapterConfigSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['alpha_vantage', 'binance', 'csv', 'dummy']),
  priority: z.number().min(0).max(10),
  apiKey: z.string().optional(),
  filePath: z.string().optional(),
  baseUrl: z.string().optional(),
});

type AdapterConfig = z.infer<typeof adapterConfigSchema>;

export function DataAdapterManager() {
  const [adapters, setAdapters] = useState<DataAdapterInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<AdapterConfig>({
    resolver: zodResolver(adapterConfigSchema),
    defaultValues: {
      name: '',
      type: 'dummy',
      priority: 1,
      apiKey: '',
      filePath: '',
      baseUrl: '',
    },
  });

  useEffect(() => {
    loadAdapters();
  }, []);

  const loadAdapters = async () => {
    try {
      const adapterList = await dataService.getDataAdapters();
      setAdapters(adapterList);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data adapters',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdapter = async (values: AdapterConfig) => {
    try {
      const config: any = {};
      
      if (values.type === 'alpha_vantage') {
        config.apiKey = values.apiKey;
      } else if (values.type === 'csv') {
        config.filePath = values.filePath;
      } else if (values.type === 'binance') {
        config.baseUrl = values.baseUrl;
      }

      const result = await dataService.addDataAdapter(
        values.name,
        values.type,
        config,
        values.priority
      );

      if (result.success) {
        toast({
          title: 'Success',
          description: `Added adapter: ${values.name}`,
        });
        form.reset();
        setIsDialogOpen(false);
        loadAdapters();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to add adapter: ${error}`,
        variant: 'destructive',
      });
    }
  };

  const handleRemoveAdapter = async (name: string) => {
    try {
      const result = await dataService.removeDataAdapter(name);
      if (result.success) {
        toast({
          title: 'Success',
          description: `Removed adapter: ${name}`,
        });
        loadAdapters();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to remove adapter: ${error}`,
        variant: 'destructive',
      });
    }
  };

  const getAdapterIcon = (type: string) => {
    switch (type) {
      case 'AlphaVantageAdapter':
        return <TrendingUp className="h-4 w-4" />;
      case 'BinanceAdapter':
        return <Database className="h-4 w-4" />;
      case 'CSVAdapter':
        return <Settings className="h-4 w-4" />;
      default:
        return <Wifi className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (adapter: DataAdapterInfo) => {
    const isConnected = adapter.isConnected ?? true;
    return (
      <Badge variant={isConnected ? "default" : "destructive"}>
        {isConnected ? (
          <>
            <Wifi className="h-3 w-3 mr-1" />
            Connected
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3 mr-1" />
            Disconnected
          </>
        )}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Adapter Management</h2>
          <p className="text-muted-foreground">
            Configure and manage multiple market data sources for enhanced chart functionality
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Adapter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Data Adapter</DialogTitle>
              <DialogDescription>
                Configure a new data source for market data integration
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddAdapter)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adapter Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Data Source" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adapter Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select adapter type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="alpha_vantage">Alpha Vantage</SelectItem>
                            <SelectItem value="binance">Binance</SelectItem>
                            <SelectItem value="csv">CSV File</SelectItem>
                            <SelectItem value="dummy">Dummy Data</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority (1-10)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="10" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Higher priority adapters are tried first for data requests
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Tabs defaultValue="config" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="config">Configuration</TabsTrigger>
                    <TabsTrigger value="examples">Examples</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="config" className="space-y-4">
                    {form.watch('type') === 'alpha_vantage' && (
                      <FormField
                        control={form.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Your Alpha Vantage API key" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Get your free API key from{' '}
                              <a 
                                href="https://www.alphavantage.co/support/#api-key" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                Alpha Vantage
                              </a>
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {form.watch('type') === 'csv' && (
                      <FormField
                        control={form.control}
                        name="filePath"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CSV File Path</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="/path/to/your/data.csv" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Path to your CSV file with OHLCV data
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {form.watch('type') === 'binance' && (
                      <FormField
                        control={form.control}
                        name="baseUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Base URL (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://api.binance.com" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Custom API endpoint (leave empty for default)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="examples" className="space-y-4">
                    <div className="text-sm space-y-3">
                      <div>
                        <h4 className="font-medium">Alpha Vantage</h4>
                        <p className="text-muted-foreground">
                          Professional market data with 5 requests/minute free tier. 
                          Supports stocks, forex, crypto, and technical indicators.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Binance</h4>
                        <p className="text-muted-foreground">
                          Real-time cryptocurrency data via WebSocket. 
                          No API key required for public data.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">CSV</h4>
                        <p className="text-muted-foreground">
                          Load historical data from CSV files. 
                          Expected columns: symbol, timestamp, open, high, low, close, volume.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Adapter</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading adapters...</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {adapters.map((adapter) => (
            <Card key={adapter.name} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getAdapterIcon(adapter.type)}
                    <CardTitle className="text-lg">{adapter.name}</CardTitle>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveAdapter(adapter.name)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="flex items-center justify-between">
                  <span>{adapter.type}</span>
                  {getStatusBadge(adapter)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Priority:</span>
                    <Badge variant="outline">{adapter.priority}</Badge>
                  </div>
                  {adapter.lastUpdate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Update:</span>
                      <span className="text-xs">
                        {new Date(adapter.lastUpdate).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {adapters.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Database className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Data Adapters</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Add your first data adapter to start integrating with market data sources
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Adapter
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Real-time Data Status</CardTitle>
          <CardDescription>
            WebSocket connection status and active subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            {webSocketService.isConnected() ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-green-500">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-red-500">Disconnected</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}