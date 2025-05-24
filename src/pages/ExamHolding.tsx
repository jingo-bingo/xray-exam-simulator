
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExamInstructions } from '@/components/exam/ExamInstructions';
import { AppHeader } from '@/components/AppHeader';

const ExamHolding = () => {
  const navigate = useNavigate();

  const handleStartExam = () => {
    // TODO: Navigate to actual exam interface once created
    console.log('Starting FRCR Part 2B examination...');
    // navigate('/exam/session');
  };

  return (
    <div className="min-h-screen bg-medical-light text-medical-dark">
      <AppHeader title="FRCR Part 2B Exam" />
      <ExamInstructions onStartExam={handleStartExam} />
    </div>
  );
};

export default ExamHolding;
