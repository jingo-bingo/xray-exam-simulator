
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    <div className="bg-gray-800 text-white h-12 flex items-center justify-between px-4 text-sm">
      {/* Left side - Navigation buttons */}
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
      
      {/* Center - Menu items */}
      <div className="flex items-center space-x-6">
        <button className="hover:bg-gray-700 px-2 py-1 rounded">OVERVIEW</button>
        <button className="hover:bg-gray-700 px-2 py-1 rounded">FINISH</button>
        <button className="hover:bg-gray-700 px-2 py-1 rounded">COLOUR</button>
        <button className="hover:bg-gray-700 px-2 py-1 rounded">TIME REMAINING</button>
        <button className="hover:bg-gray-700 px-2 py-1 rounded">NOTES</button>
        <button className="hover:bg-gray-700 px-2 py-1 rounded">USER ID</button>
      </div>
      
      {/* Right side - Case info and time */}
      <div className="flex items-center space-x-4">
        <span>Case {currentCase} of {totalCases}</span>
        <span className="text-yellow-400 font-medium">{examTimeRemaining}</span>
      </div>
    </div>
  );
};
