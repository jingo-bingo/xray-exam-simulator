
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, Strikethrough, Type } from 'lucide-react';

interface ExamNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export const ExamNotesModal: React.FC<ExamNotesModalProps> = ({
  isOpen,
  onClose,
  notes,
  onNotesChange
}) => {
  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader className="bg-gray-800 text-white -m-6 mb-4 p-4">
          <DialogTitle className="text-lg font-semibold">Notes</DialogTitle>
        </DialogHeader>
        
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Underline className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Strikethrough className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
            H1
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
            H2
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Type className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Text Area */}
        <div className="flex-1">
          <Textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Enter your notes here..."
            className="min-h-[300px] border-0 resize-none focus-visible:ring-0"
          />
        </div>
        
        {/* Word Count */}
        <div className="text-right text-sm text-gray-500">
          Words: {wordCount}
        </div>
      </DialogContent>
    </Dialog>
  );
};
