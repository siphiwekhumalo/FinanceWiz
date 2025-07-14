import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { StickyNote, MessageSquare, User, Clock, X } from 'lucide-react';
import { ChartNote } from '@/types/advanced-types';

interface ChartNotesProps {
  notes: ChartNote[];
  onAddNote: (timestamp: number, price: number, text: string, author: string) => void;
  onRemoveNote: (noteId: string) => void;
  currentSymbol: string;
}

export function ChartNotes({ notes, onAddNote, onRemoveNote, currentSymbol }: ChartNotesProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('Trader');
  const [notePrice, setNotePrice] = useState('');
  const [noteDate, setNoteDate] = useState('');
  const [noteTime, setNoteTime] = useState('');

  const handleAddNote = () => {
    if (!noteText.trim() || !noteDate || !noteTime || !notePrice) return;

    const noteDateTime = new Date(`${noteDate}T${noteTime}`);
    const price = parseFloat(notePrice);

    onAddNote(noteDateTime.getTime(), price, noteText, noteAuthor);
    resetForm();
  };

  const resetForm = () => {
    setNoteText('');
    setNoteAuthor('Trader');
    setNotePrice('');
    setNoteDate('');
    setNoteTime('');
    setIsAddingNote(false);
  };

  const formatNoteDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatNoteTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const getRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const sortedNotes = [...notes].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Chart Notes</h3>
        <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
          <DialogTrigger asChild>
            <Button size="sm">
              <StickyNote className="w-4 h-4 mr-1" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Chart Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Note Text</Label>
                <Textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Enter your trading note..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Author</Label>
                <Input
                  value={noteAuthor}
                  onChange={(e) => setNoteAuthor(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={noteDate}
                    onChange={(e) => setNoteDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={noteTime}
                    onChange={(e) => setNoteTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Price Level</Label>
                <Input
                  type="number"
                  value={notePrice}
                  onChange={(e) => setNotePrice(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddNote} className="flex-1">
                  Add Note
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notes List */}
      <div className="space-y-2">
        {sortedNotes.map((note) => (
          <div
            key={note.id}
            className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                  <StickyNote className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-gray-500" />
                      <span className="text-sm font-medium">{note.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">
                        {getRelativeTime(note.created)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {note.text}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatNoteDate(note.timestamp)}</span>
                    <span>{formatNoteTime(note.timestamp)}</span>
                    <Badge variant="outline" className="text-xs">
                      {formatPrice(note.price)}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveNote(note.id)}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {sortedNotes.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No chart notes</p>
          <p className="text-xs">Add notes to document your trading decisions</p>
        </div>
      )}

      {/* Notes Summary */}
      {sortedNotes.length > 0 && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Recent Notes</h4>
          <div className="space-y-1">
            {sortedNotes.slice(0, 3).map((note) => (
              <div key={note.id} className="flex items-center justify-between text-sm">
                <span className="truncate flex-1 mr-2">
                  {note.text.length > 30 ? `${note.text.substring(0, 30)}...` : note.text}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {formatPrice(note.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}