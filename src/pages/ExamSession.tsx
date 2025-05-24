
import React, { useState, useEffect } from 'react';
import { ExamTopBar } from '@/components/exam/ExamTopBar';
import { ExamTimer } from '@/components/exam/ExamTimer';
import { ExamImageViewer } from '@/components/exam/ExamImageViewer';
import { ExamAnswerSection } from '@/components/exam/ExamAnswerSection';

const ExamSession = () => {
  const [currentCase, setCurrentCase] = useState(1);
  const [examTimeRemaining, setExamTimeRemaining] = useState(1800); // 30 minutes total
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedCases, setFlaggedCases] = useState<Set<number>>(new Set());

  // Single exam timer countdown logic
  useEffect(() => {
    const timer = setInterval(() => {
      setExamTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - exam ends
          // TODO: Handle exam completion
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleNextCase = () => {
    if (currentCase < 25) {
      setCurrentCase(prev => prev + 1);
    }
  };

  const handlePreviousCase = () => {
    if (currentCase > 1) {
      setCurrentCase(prev => prev - 1);
    }
  };

  const handleAnswerChange = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentCase]: answer
    }));
  };

  const handleFlagToggle = () => {
    setFlaggedCases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentCase)) {
        newSet.delete(currentCase);
      } else {
        newSet.add(currentCase);
      }
      return newSet;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Top Navigation Bar */}
      <ExamTopBar 
        currentCase={currentCase}
        totalCases={25}
        onPrevious={handlePreviousCase}
        onNext={handleNextCase}
        canGoPrevious={currentCase > 1}
        canGoNext={currentCase < 25}
        examTimeRemaining={formatTime(examTimeRemaining)}
      />
      
      {/* Timer Bar */}
      <ExamTimer 
        timeRemaining={formatTime(examTimeRemaining)}
        totalExamTime="30 minutes"
      />
      
      {/* Main Content - No sidebar, just image viewer and answer section */}
      <div className="flex flex-1 overflow-hidden">
        {/* Image Viewer - takes up more space now */}
        <div className="flex-1 bg-black">
          <ExamImageViewer caseNumber={currentCase} />
        </div>
        
        {/* Answer Section - fixed width */}
        <div className="w-96 bg-white border-l border-gray-300">
          <ExamAnswerSection 
            answer={answers[currentCase] || ''}
            onAnswerChange={handleAnswerChange}
            isFlagged={flaggedCases.has(currentCase)}
            onFlagToggle={handleFlagToggle}
          />
        </div>
      </div>
    </div>
  );
};

export default ExamSession;
