
import React, { useState, useEffect } from 'react';

interface ExamTimerProps {
  timeRemaining: string;
  totalExamTime: string;
}

export const ExamTimer: React.FC<ExamTimerProps> = ({ timeRemaining, totalExamTime }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide the yellow bar after 1 minute (60 seconds)
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 60000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-yellow-400 text-black h-10 flex items-center justify-center font-medium text-lg">
      <span>Exam time: 30 minutes</span>
    </div>
  );
};
