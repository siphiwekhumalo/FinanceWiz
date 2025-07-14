import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, TrendingUp, DollarSign, Newspaper, AlertCircle, Info } from 'lucide-react';
import { MarketEvent } from '@/types/advanced-types';

interface MarketEventsProps {
  events: MarketEvent[];
  onAddEvent: (event: MarketEvent) => void;
  onRemoveEvent: (eventId: string) => void;
  currentSymbol: string;
}

const EVENT_TYPES = [
  { id: 'earnings', name: 'Earnings', icon: DollarSign, color: 'bg-green-100 text-green-800' },
  { id: 'dividend', name: 'Dividend', icon: TrendingUp, color: 'bg-blue-100 text-blue-800' },
  { id: 'split', name: 'Stock Split', icon: TrendingUp, color: 'bg-purple-100 text-purple-800' },
  { id: 'news', name: 'News', icon: Newspaper, color: 'bg-orange-100 text-orange-800' },
  { id: 'economic', name: 'Economic', icon: AlertCircle, color: 'bg-red-100 text-red-800' }
];

const IMPACT_LEVELS = [
  { id: 'high', name: 'High', color: 'bg-red-100 text-red-800' },
  { id: 'medium', name: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'low', name: 'Low', color: 'bg-green-100 text-green-800' }
];

export function MarketEvents({ events, onAddEvent, onRemoveEvent, currentSymbol }: MarketEventsProps) {
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventType, setEventType] = useState<string>('earnings');
  const [eventImpact, setEventImpact] = useState<string>('medium');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');

  const handleAddEvent = () => {
    if (!eventTitle.trim() || !eventDate || !eventTime) return;

    const eventDateTime = new Date(`${eventDate}T${eventTime}`);
    const eventConfig = EVENT_TYPES.find(type => type.id === eventType);
    const impactConfig = IMPACT_LEVELS.find(level => level.id === eventImpact);

    const newEvent: MarketEvent = {
      id: `event_${Date.now()}`,
      symbol: currentSymbol,
      type: eventType as any,
      timestamp: eventDateTime.getTime(),
      title: eventTitle,
      description: eventDescription,
      impact: eventImpact as any,
      color: eventConfig?.color || '#2196F3',
      icon: eventConfig?.icon.name || 'Info'
    };

    onAddEvent(newEvent);
    resetForm();
  };

  const resetForm = () => {
    setEventTitle('');
    setEventDescription('');
    setEventType('earnings');
    setEventImpact('medium');
    setEventDate('');
    setEventTime('');
    setIsAddingEvent(false);
  };

  const getEventIcon = (type: string) => {
    const config = EVENT_TYPES.find(t => t.id === type);
    return config?.icon || Info;
  };

  const getEventColor = (type: string) => {
    const config = EVENT_TYPES.find(t => t.id === type);
    return config?.color || 'bg-gray-100 text-gray-800';
  };

  const getImpactColor = (impact: string) => {
    const config = IMPACT_LEVELS.find(l => l.id === impact);
    return config?.color || 'bg-gray-100 text-gray-800';
  };

  const formatEventDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatEventTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Market Events</h3>
        <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
          <DialogTrigger asChild>
            <Button size="sm">
              <CalendarDays className="w-4 h-4 mr-1" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Market Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Event Type</Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {type.name}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Title</Label>
                <Input
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g., Q4 Earnings Release"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Additional details about the event"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Impact Level</Label>
                <Select value={eventImpact} onValueChange={setEventImpact}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IMPACT_LEVELS.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        <Badge variant="outline" className={level.color}>
                          {level.name}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddEvent} className="flex-1">
                  Add Event
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Events List */}
      <div className="space-y-2">
        {sortedEvents.map((event) => {
          const Icon = getEventIcon(event.type);
          return (
            <div
              key={event.id}
              className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${getEventColor(event.type)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <Badge variant="outline" className={getEventColor(event.type)}>
                        {event.type}
                      </Badge>
                      <Badge variant="outline" className={getImpactColor(event.impact)}>
                        {event.impact}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatEventDate(event.timestamp)}</span>
                      <span>{formatEventTime(event.timestamp)}</span>
                      <span>{event.symbol}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveEvent(event.id)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {sortedEvents.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No market events</p>
          <p className="text-xs">Add earnings, dividends, splits, and news events</p>
        </div>
      )}

      {/* Upcoming Events Summary */}
      {sortedEvents.length > 0 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Upcoming Events</h4>
          <div className="space-y-1">
            {sortedEvents
              .filter(event => event.timestamp > Date.now())
              .slice(0, 3)
              .map((event) => (
                <div key={event.id} className="flex items-center justify-between text-sm">
                  <span>{event.title}</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {formatEventDate(event.timestamp)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}