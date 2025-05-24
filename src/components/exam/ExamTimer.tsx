
import React from 'react';

interface ExamTimerProps {
  timeRemaining: string;
  totalExamTime: string;
}

export const ExamTimer: React.FC<ExamTimerProps> = ({ timeRemaining, totalExamTime }) => {
  return (
    <div className="bg-yellow-400 text-black h-10 flex items-center justify-center font-medium text-lg">
      <span>Exam time: {totalExamTime} | Case time remaining: {timeRemaining}</span>
    </div>
  );
};
