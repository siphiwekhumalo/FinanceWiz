import { useState, useEffect } from 'react';
import { Calendar, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dataService } from '@/services/data-service';
import { useToast } from '@/hooks/use-toast';
import { CorporateAction, NewsEvent } from '@shared/types';

interface CorporateActionsPanelProps {
  symbol: string;
  className?: string;
}

export function CorporateActionsPanel({ symbol, className }: CorporateActionsPanelProps) {
  const [corporateActions, setCorporateActions] = useState<CorporateAction[]>([]);
  const [news, setNews] = useState<NewsEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1y');
  const { toast } = useToast();

  useEffect(() => {
    if (symbol) {
      loadData();
    }
  }, [symbol, timeRange]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '3m':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case '6m':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        case '2y':
          startDate.setFullYear(endDate.getFullYear() - 2);
          break;
      }

      const [actionsData, newsData] = await Promise.all([
        dataService.getCorporateActions(symbol, startDate, endDate),
        dataService.getNews(symbol, 20)
      ]);

      setCorporateActions(actionsData);
      setNews(newsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load corporate actions and news',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'dividend':
        return <DollarSign className="h-4 w-4" />;
      case 'split':
        return <TrendingUp className="h-4 w-4" />;
      case 'earnings':
        return <Calendar className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'dividend':
        return 'text-green-500';
      case 'split':
        return 'text-blue-500';
      case 'earnings':
        return 'text-purple-500';
      default:
        return 'text-orange-500';
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    const variants = {
      positive: 'default',
      negative: 'destructive',
      neutral: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[sentiment as keyof typeof variants] || 'secondary'}>
        {sentiment}
      </Badge>
    );
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Corporate Actions & News</CardTitle>
              <CardDescription>
                Track dividends, splits, earnings, and market news for {symbol}
              </CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
                <SelectItem value="2y">2 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="actions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="actions">Corporate Actions</TabsTrigger>
              <TabsTrigger value="news">News & Events</TabsTrigger>
            </TabsList>
            
            <TabsContent value="actions" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : corporateActions.length > 0 ? (
                <div className="space-y-3">
                  {corporateActions.map((action, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
                      <div className={`mt-0.5 ${getActionColor(action.type)}`}>
                        {getActionIcon(action.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium capitalize">{action.type}</h4>
                          <span className="text-sm text-muted-foreground">
                            {action.date.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-1 space-y-1">
                          {Object.entries(action.data).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <span className="text-muted-foreground capitalize">{key}:</span>
                              <span className="ml-2">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {action.source}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Corporate Actions</h3>
                  <p className="text-muted-foreground">
                    No corporate actions found for the selected time period
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="news" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : news.length > 0 ? (
                <div className="space-y-3">
                  {news.slice(0, 10).map((item, index) => (
                    <div key={index} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm leading-5 flex-1 mr-3">
                          {item.title}
                        </h4>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {getSentimentBadge(item.sentiment)}
                          <span className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {item.content}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {item.source}
                      </Badge>
                    </div>
                  ))}
                  
                  {news.length > 10 && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {/* Implement load more */}}
                    >
                      Load More News
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No News Available</h3>
                  <p className="text-muted-foreground">
                    No recent news found for this symbol
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}