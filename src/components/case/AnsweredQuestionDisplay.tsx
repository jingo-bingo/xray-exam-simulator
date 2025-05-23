
import React from "react";
import { type AnswerSubmission } from "@/hooks/useQuestions";

interface AnsweredQuestionDisplayProps {
  questionText: string;
  answer: AnswerSubmission;
  explanation: string | null;
  modelAnswer: string | null;
}

export const AnsweredQuestionDisplay: React.FC<AnsweredQuestionDisplayProps> = ({
  questionText,
  answer,
  explanation,
  modelAnswer
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-medical-dark">{questionText}</h3>
      
      {/* Student's Answer */}
      <div className="bg-medical-lighter p-4 rounded-md border border-medical-border">
        <p className="mb-2 text-sm font-medium text-medical-muted">Your Answer:</p>
        <p className="text-medical-dark">{answer.responseText}</p>
      </div>
      
      {/* Model Answer */}
      {modelAnswer && (
        <div className="bg-medical-primary/5 p-4 rounded-md border border-medical-primary/20">
          <p className="mb-2 text-sm font-medium text-medical-primary">Model Answer:</p>
          <p className="text-medical-dark">{modelAnswer}</p>
        </div>
      )}
      
      {/* Feedback & Explanation (now de-emphasized) */}
      <div className="space-y-3">
        {answer.feedback && (
          <div className="bg-white p-3 rounded-md border border-medical-border">
            <p className="text-sm font-medium text-medical-muted mb-1">Feedback:</p>
            <p className="text-medical-dark text-sm">{answer.feedback}</p>
          </div>
        )}
        
        {explanation && (
          <div className="bg-white p-3 rounded-md border border-medical-border">
            <p className="text-sm font-medium text-medical-muted mb-1">Additional Notes:</p>
            <p className="text-medical-dark text-sm">{explanation}</p>
          </div>
        )}
      </div>
      
      {/* Status indicator - now smaller and less prominent */}
      {answer.isCorrect !== undefined && (
        <div className="text-sm flex items-center">
          <span className={`h-2 w-2 rounded-full mr-2 ${
            answer.isCorrect ? "bg-medical-success" : "bg-medical-warning"
          }`}></span>
          <span className={answer.isCorrect ? "text-medical-success" : "text-medical-warning"}>
            {answer.isCorrect ? 'Correct' : 'Review recommended'}
          </span>
        </div>
      )}
    </div>
  );
};
