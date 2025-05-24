
import React, { useState, useEffect } from 'react';
import { ExamTopBar } from '@/components/exam/ExamTopBar';
import { ExamTimer } from '@/components/exam/ExamTimer';
import { ExamImageViewer } from '@/components/exam/ExamImageViewer';
import { ExamAnswerSection } from '@/components/exam/ExamAnswerSection';
import { CaseNavigation } from '@/components/exam/CaseNavigation';
import { CaseHeader } from '@/components/exam/CaseHeader';
import { ExamFinishModal } from '@/components/exam/ExamFinishModal';
import { ExamNotesPanel } from '@/components/exam/ExamNotesPanel';
import { useExamCases } from '@/hooks/useExamCases';

const ExamSession = () => {
  const [currentCase, setCurrentCase] = useState(1);
  const [examTimeRemaining, setExamTimeRemaining] = useState(1800); // 30 minutes total
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedCases, setFlaggedCases] = useState<Set<number>>(new Set());
  const [completedCases, setCompletedCases] = useState<Set<number>>(new Set());
  const [showOverview, setShowOverview] = useState(true);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [examNotes, setExamNotes] = useState('');
  const [isTimeExpired, setIsTimeExpired] = useState(false);

  // Fetch exam cases
  const { cases, isLoading: casesLoading, error: casesError } = useExamCases();

  // Get current case data
  const currentCaseData = cases[currentCase - 1]; // Convert 1-based to 0-based index

  // Single exam timer countdown logic
  useEffect(() => {
    const timer = setInterval(() => {
      setExamTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - exam ends
          setIsTimeExpired(true);
          setShowFinishModal(true);
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

  const handleCaseSelect = (caseNumber: number) => {
    setCurrentCase(caseNumber);
  };

  const handleAnswerChange = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentCase]: answer
    }));
    
    // Mark case as completed if there's an answer, remove if empty
    setCompletedCases(prev => {
      const newSet = new Set(prev);
      if (answer.trim()) {
        newSet.add(currentCase);
      } else {
        newSet.delete(currentCase);
      }
      return newSet;
    });
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

  const handleOverviewToggle = () => {
    setShowOverview(prev => !prev);
  };

  const handleFinishClick = () => {
    setIsTimeExpired(false);
    setShowFinishModal(true);
  };

  const handleNotesClick = () => {
    setShowNotesPanel(prev => !prev);
  };

  const handleSubmitExam = () => {
    // TODO: Handle exam submission logic
    console.log('Exam submitted');
    setShowFinishModal(false);
    // Navigate away or show completion screen
  };

  const handleCloseModal = () => {
    // Only allow closing if time hasn't expired
    if (!isTimeExpired) {
      setShowFinishModal(false);
    }
  };

  const unansweredCount = 25 - completedCases.size;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show error state if cases failed to load
  if (casesError) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Exam</h2>
          <p className="text-gray-600">{casesError}</p>
        </div>
      </div>
    );
  }

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
        onOverviewToggle={handleOverviewToggle}
        onFinishClick={handleFinishClick}
        onNotesClick={handleNotesClick}
      />
      
      {/* Timer Bar */}
      <ExamTimer 
        timeRemaining={formatTime(examTimeRemaining)}
        totalExamTime="30 minutes"
      />
      
      {/* Notes Panel - conditionally rendered */}
      {showNotesPanel && (
        <ExamNotesPanel
          notes={examNotes}
          onNotesChange={setExamNotes}
        />
      )}
      
      {/* White gap */}
      <div className="h-4 bg-white"></div>
      
      {/* Main Content - Three column layout: sidebar, image viewer, answer section */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Case Navigation (conditionally rendered) */}
        {showOverview && (
          <CaseNavigation
            currentCase={currentCase}
            totalCases={25}
            completedCases={completedCases}
            flaggedCases={flaggedCases}
            onCaseSelect={handleCaseSelect}
          />
        )}
        
        {/* Center Column - Case Header and Image Viewer */}
        <div className="flex-1 bg-black flex flex-col border-r-4 border-gray-300">
          <CaseHeader 
            caseNumber={currentCase} 
            caseData={currentCaseData}
            isLoading={casesLoading}
          />
          <div className="flex-1">
            <ExamImageViewer 
              caseNumber={currentCase}
              caseData={currentCaseData}
              isLoading={casesLoading}
            />
          </div>
        </div>
        
        {/* Answer Section - fixed width */}
        <div className="w-96 bg-white">
          <ExamAnswerSection 
            answer={answers[currentCase] || ''}
            onAnswerChange={handleAnswerChange}
            isFlagged={flaggedCases.has(currentCase)}
            onFlagToggle={handleFlagToggle}
          />
        </div>
      </div>

      {/* Finish Modal */}
      <ExamFinishModal
        isOpen={showFinishModal}
        onClose={handleCloseModal}
        onSubmitExam={handleSubmitExam}
        unansweredCount={unansweredCount}
        isTimeExpired={isTimeExpired}
      />
    </div>
  );
};

export default ExamSession;
