import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Menu, DoorClosed, Palette, FileText } from 'lucide-react';

interface ExamTopBarProps {
  currentCase: number;
  totalCases: number;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  examTimeRemaining: string;
}

export const ExamTopBar: React.FC<ExamTopBarProps> = ({
  currentCase,
  totalCases,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  examTimeRemaining
}) => {
  return (
    <div className="bg-gray-800 text-white h-16 flex items-center justify-between px-4 text-xs">
      {/* Left side - Menu items */}
      <div className="flex items-center space-x-6">
        <button className="flex flex-col items-center hover:bg-gray-700 px-2 py-1 rounded">
          <Menu className="h-4 w-4 mb-1" />
          <span>OVERVIEW</span>
        </button>
        
        <button className="flex flex-col items-center hover:bg-gray-700 px-2 py-1 rounded">
          <DoorClosed className="h-4 w-4 mb-1" />
          <span>FINISH</span>
        </button>
        
        <button className="flex flex-col items-center hover:bg-gray-700 px-2 py-1 rounded">
          <Palette className="h-4 w-4 mb-1" />
          <span>COLOUR</span>
        </button>
        
        <button className="flex flex-col items-center hover:bg-gray-700 px-2 py-1 rounded">
          <span className="text-white font-medium mb-1">30:00</span>
          <span>TIME REMAINING</span>
        </button>
        
        <button className="flex flex-col items-center hover:bg-gray-700 px-2 py-1 rounded">
          <FileText className="h-4 w-4 mb-1" />
          <span>NOTES</span>
        </button>
        
        <button className="flex flex-col items-center hover:bg-gray-700 px-2 py-1 rounded">
          <span className="text-white font-medium mb-1">11001</span>
          <span>USER ID</span>
        </button>
      </div>
      
      {/* Right side - Navigation only */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="text-white hover:bg-gray-700 disabled:opacity-50 h-8 px-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          PREVIOUS
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={!canGoNext}
          className="text-white hover:bg-gray-700 disabled:opacity-50 h-8 px-2"
        >
          NEXT
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
