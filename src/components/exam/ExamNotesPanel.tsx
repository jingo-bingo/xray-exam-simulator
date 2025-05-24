
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, Strikethrough, Type } from 'lucide-react';

interface ExamNotesPanelProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export const ExamNotesPanel: React.FC<ExamNotesPanelProps> = ({
  notes,
  onNotesChange
}) => {
  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-gray-800 text-white border-b">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-600">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-gray-700">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-gray-700">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-gray-700">
          <Underline className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-gray-700">
          <Strikethrough className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-600 mx-1" />
        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-white hover:bg-gray-700">
          H1
        </Button>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-white hover:bg-gray-700">
          H2
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-gray-700">
          <Type className="h-4 w-4" />
        </Button>
        
        {/* Word Count */}
        <div className="ml-auto text-sm text-gray-400">
          Words: {wordCount}
        </div>
      </div>
      
      {/* Text Area */}
      <div className="p-4">
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Enter your notes here..."
          className="min-h-[200px] bg-white text-black border-white resize-none focus-visible:ring-1 focus-visible:ring-gray-400"
        />
      </div>
    </div>
  );
};
