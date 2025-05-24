
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExamInstructions } from '@/components/exam/ExamInstructions';

const ExamHolding = () => {
  const navigate = useNavigate();

  const handleStartExam = () => {
    // TODO: Navigate to actual exam interface once created
    console.log('Starting FRCR Part 2B examination...');
    // navigate('/exam/session');
  };

  return <ExamInstructions onStartExam={handleStartExam} />;
};

export default ExamHolding;
