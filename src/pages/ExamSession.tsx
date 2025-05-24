
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
  const { cases, isLoading: casesLoading, error: casesError } = useExamCases();
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [examTimeRemaining, setExamTimeRemaining] = useState(1800); // 30 minutes total
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedCases, setFlaggedCases] = useState<Set<number>>(new Set());
  const [completedCases, setCompletedCases] = useState<Set<number>>(new Set());
  const [showOverview, setShowOverview] = useState(true);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [examNotes, setExamNotes] = useState('');
  const [isTimeExpired, setIsTimeExpired] = useState(false);

  const currentCase = cases[currentCaseIndex] || null;
  const totalCases = cases.length;

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
    if (currentCaseIndex < totalCases - 1) {
      setCurrentCaseIndex(prev => prev + 1);
    }
  };

  const handlePreviousCase = () => {
    if (currentCaseIndex > 0) {
      setCurrentCaseIndex(prev => prev - 1);
    }
  };

  const handleCaseSelect = (caseIndex: number) => {
    setCurrentCaseIndex(caseIndex);
  };

  const handleAnswerChange = (answer: string) => {
    if (!currentCase) return;
    
    setAnswers(prev => ({
      ...prev,
      [currentCase.id]: answer
    }));
    
    // Mark case as completed if there's an answer, remove if empty
    setCompletedCases(prev => {
      const newSet = new Set(prev);
      if (answer.trim()) {
        newSet.add(currentCaseIndex);
      } else {
        newSet.delete(currentCaseIndex);
      }
      return newSet;
    });
  };

  const handleFlagToggle = () => {
    setFlaggedCases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentCaseIndex)) {
        newSet.delete(currentCaseIndex);
      } else {
        newSet.add(currentCaseIndex);
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

  const unansweredCount = totalCases - completedCases.size;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show loading or error state
  if (casesLoading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg">Loading exam cases...</div>
        </div>
      </div>
    );
  }

  if (casesError) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center text-red-600">
          <div className="text-lg mb-2">Error loading exam</div>
          <div className="text-sm">{casesError}</div>
        </div>
      </div>
    );
  }

  if (totalCases === 0) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-2">No exam cases available</div>
          <div className="text-sm text-gray-600">Please contact your administrator</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Top Navigation Bar */}
      <ExamTopBar 
        currentCase={currentCaseIndex + 1}
        totalCases={totalCases}
        onPrevious={handlePreviousCase}
        onNext={handleNextCase}
        canGoPrevious={currentCaseIndex > 0}
        canGoNext={currentCaseIndex < totalCases - 1}
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
            currentCaseIndex={currentCaseIndex}
            cases={cases}
            completedCases={completedCases}
            flaggedCases={flaggedCases}
            onCaseSelect={handleCaseSelect}
            isLoading={casesLoading}
          />
        )}
        
        {/* Center Column - Case Header and Image Viewer */}
        <div className="flex-1 bg-black flex flex-col border-r-4 border-gray-300">
          <CaseHeader examCase={currentCase} isLoading={casesLoading} />
          <div className="flex-1">
            <ExamImageViewer examCase={currentCase} isLoading={casesLoading} />
          </div>
        </div>
        
        {/* Answer Section - fixed width */}
        <div className="w-96 bg-white">
          <ExamAnswerSection 
            answer={currentCase ? (answers[currentCase.id] || '') : ''}
            onAnswerChange={handleAnswerChange}
            isFlagged={flaggedCases.has(currentCaseIndex)}
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
