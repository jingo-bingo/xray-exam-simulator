
import React, { useState, useEffect } from 'react';
import { ExamTopBar } from '@/components/exam/ExamTopBar';
import { ExamTimer } from '@/components/exam/ExamTimer';
import { CaseNavigation } from '@/components/exam/CaseNavigation';
import { ExamImageViewer } from '@/components/exam/ExamImageViewer';
import { ExamAnswerSection } from '@/components/exam/ExamAnswerSection';

const ExamSession = () => {
  const [currentCase, setCurrentCase] = useState(1);
  const [examTimeRemaining, setExamTimeRemaining] = useState(1800); // 30 minutes total
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [completedCases, setCompletedCases] = useState<Set<number>>(new Set());

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

  const handleCaseSelect = (caseNumber: number) => {
    // Allow navigation to any case
    setCurrentCase(caseNumber);
  };

  const handleNextCase = () => {
    if (currentCase < 25) {
      setCompletedCases(prev => new Set([...prev, currentCase]));
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
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Case Navigation */}
        <CaseNavigation 
          currentCase={currentCase}
          totalCases={25}
          completedCases={completedCases}
          onCaseSelect={handleCaseSelect}
        />
        
        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Image Viewer */}
          <div className="flex-1 bg-black">
            <ExamImageViewer caseNumber={currentCase} />
          </div>
          
          {/* Answer Section */}
          <div className="w-96 bg-white border-l border-gray-300">
            <ExamAnswerSection 
              caseNumber={currentCase}
              answer={answers[currentCase] || ''}
              onAnswerChange={handleAnswerChange}
              onSubmit={handleNextCase}
              timeRemaining={examTimeRemaining}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamSession;
