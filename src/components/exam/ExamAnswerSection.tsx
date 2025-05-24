
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';

interface ExamAnswerSectionProps {
  answer: string;
  onAnswerChange: (answer: string) => void;
  isFlagged: boolean;
  onFlagToggle: () => void;
}

export const ExamAnswerSection: React.FC<ExamAnswerSectionProps> = ({
  answer,
  onAnswerChange,
  isFlagged,
  onFlagToggle
}) => {
  const wordCount = answer.trim().split(/\s+/).filter(word => word.length > 0).length;
  
  return (
    <div className="h-full flex flex-col">
      {/* Answer Header with blue background matching top bar */}
      <div className="p-3 bg-gray-800 text-white">
        <h3 className="text-sm font-medium uppercase tracking-wide">Answer</h3>
      </div>
      
      {/* Question and Flag Button */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm text-gray-800 leading-relaxed">
              Please provide a short report for this patient and include your recommended next step for onward management.
            </p>
          </div>
          <Button
            variant={isFlagged ? "default" : "outline"}
            size="sm"
            onClick={onFlagToggle}
            className={`flex items-center text-xs p-2 ${
              isFlagged 
                ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500' 
                : 'text-gray-600 hover:bg-gray-50 border-gray-300'
            }`}
          >
            <Flag className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {/* Answer area with fixed height textarea */}
      <div className="p-4 bg-white">
        <Textarea
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Type your radiology report here..."
          className="h-64 resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm p-3 mb-3"
        />
        
        {/* Word count at bottom */}
        <div className="flex justify-end">
          <span className="text-xs text-gray-500">{wordCount} words</span>
        </div>
      </div>
    </div>
  );
};
