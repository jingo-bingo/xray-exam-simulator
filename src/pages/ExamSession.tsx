import React, { useState, useEffect } from 'react';
import { ExamTopBar } from '@/components/exam/ExamTopBar';
import { ExamTimer } from '@/components/exam/ExamTimer';
import { CaseNavigation } from '@/components/exam/CaseNavigation';
import { ExamImageViewer } from '@/components/exam/ExamImageViewer';
import { ExamAnswerSection } from '@/components/exam/ExamAnswerSection';

const ExamSession = () => {
  const [currentCase, setCurrentCase] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(360); // 6 minutes per case
  const [totalExamTime, setTotalExamTime] = useState(10800); // 3 hours total
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [completedCases, setCompletedCases] = useState<Set<number>>(new Set());

  // Timer countdown logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-advance to next case when time expires
          handleNextCase();
          return 360; // Reset timer for next case
        }
        return prev - 1;
      });

      setTotalExamTime(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [currentCase]);

  const handleCaseSelect = (caseNumber: number) => {
    // Only allow navigation to current or previous cases
    if (caseNumber <= currentCase) {
      setCurrentCase(caseNumber);
      setTimeRemaining(360); // Reset timer
    }
  };

  const handleNextCase = () => {
    if (currentCase < 30) {
      setCompletedCases(prev => new Set([...prev, currentCase]));
      setCurrentCase(prev => prev + 1);
      setTimeRemaining(360);
    }
  };

  const handlePreviousCase = () => {
    if (currentCase > 1) {
      setCurrentCase(prev => prev - 1);
      setTimeRemaining(360);
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

  const formatExamTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Top Navigation Bar */}
      <ExamTopBar 
        currentCase={currentCase}
        totalCases={30}
        onPrevious={handlePreviousCase}
        onNext={handleNextCase}
        canGoPrevious={currentCase > 1}
        canGoNext={currentCase < 30}
        examTimeRemaining={formatTime(timeRemaining)}
      />
      
      {/* Timer Bar */}
      <ExamTimer 
        timeRemaining={formatTime(timeRemaining)}
        totalExamTime={formatExamTime(totalExamTime)}
      />
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Case Navigation */}
        <CaseNavigation 
          currentCase={currentCase}
          totalCases={30}
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
              timeRemaining={timeRemaining}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamSession;
