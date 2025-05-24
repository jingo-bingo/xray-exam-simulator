
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExamInstructions } from '@/components/exam/ExamInstructions';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ExamHolding = () => {
  const navigate = useNavigate();

  const handleStartExam = () => {
    // TODO: Navigate to actual exam interface once created
    console.log('Starting FRCR Part 2B examination...');
    // navigate('/exam/session');
  };

  const backButton = (
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate('/dashboard')}
      className="flex items-center gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Dashboard
    </Button>
  );

  return (
    <div className="min-h-screen bg-medical-light text-medical-dark">
      <AppHeader title="FRCR Part 2B Exam" navigation={backButton} />
      <ExamInstructions onStartExam={handleStartExam} />
    </div>
  );
};

export default ExamHolding;
