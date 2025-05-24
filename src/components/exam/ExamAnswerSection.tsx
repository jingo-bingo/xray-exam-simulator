
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface ExamAnswerSectionProps {
  caseNumber: number;
  answer: string;
  onAnswerChange: (answer: string) => void;
  onSubmit: () => void;
  timeRemaining: number;
}

export const ExamAnswerSection: React.FC<ExamAnswerSectionProps> = ({
  caseNumber,
  answer,
  onAnswerChange,
  onSubmit,
  timeRemaining
}) => {
  const wordCount = answer.trim().split(/\s+/).filter(word => word.length > 0).length;
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900 mb-2">Case {caseNumber}</h3>
        <div className="text-sm text-gray-600">
          Time remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
        </div>
      </div>
      
      {/* Question */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="text-sm font-medium text-gray-900 mb-2">Question:</div>
        <div className="text-sm text-gray-700 leading-relaxed">
          Please provide a short report for this patient and include your recommended next step for onward management.
        </div>
      </div>
      
      {/* Answer area */}
      <div className="flex-1 p-4 flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-900">Your Answer:</label>
          <span className="text-xs text-gray-500">{wordCount} words</span>
        </div>
        
        <Textarea
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Type your radiology report here..."
          className="flex-1 resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
        
        {/* Submit button */}
        <div className="mt-4 flex justify-end">
          <Button
            onClick={onSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            Submit & Continue
          </Button>
        </div>
      </div>
    </div>
  );
};
