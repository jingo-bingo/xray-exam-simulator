
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
      {/* Answer Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Answer</h3>
      </div>
      
      {/* Question and Flag Button */}
      <div className="p-4 border-b border-gray-200">
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
            className={`flex items-center gap-1 text-xs ${
              isFlagged 
                ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500' 
                : 'text-gray-600 hover:bg-gray-50 border-gray-300'
            }`}
          >
            <Flag className="h-3 w-3" />
            {isFlagged ? 'Flagged' : 'Flag'}
          </Button>
        </div>
      </div>
      
      {/* Answer area */}
      <div className="flex-1 p-4 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-gray-500">{wordCount} words</span>
        </div>
        
        <Textarea
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Type your radiology report here..."
          className="flex-1 resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm p-3"
        />
      </div>
    </div>
  );
};
