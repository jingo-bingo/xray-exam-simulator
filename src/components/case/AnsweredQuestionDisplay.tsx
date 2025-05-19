
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
      <h3 className="text-lg font-medium">{questionText}</h3>
      
      {/* Student's Answer */}
      <div className="bg-gray-700 p-4 rounded-md">
        <p className="mb-2 text-sm font-medium text-gray-300">Your Answer:</p>
        <p className="text-white">{answer.responseText}</p>
      </div>
      
      {/* Model Answer */}
      {modelAnswer && (
        <div className="bg-gray-700/50 p-4 rounded-md border border-gray-600">
          <p className="mb-2 text-sm font-medium text-gray-300">Model Answer:</p>
          <p className="text-white">{modelAnswer}</p>
        </div>
      )}
      
      {/* Feedback & Explanation (now de-emphasized) */}
      <div className="space-y-3">
        {answer.feedback && (
          <div className="bg-gray-800 p-3 rounded-md border border-gray-700">
            <p className="text-sm font-medium text-gray-300 mb-1">Feedback:</p>
            <p className="text-gray-200 text-sm">{answer.feedback}</p>
          </div>
        )}
        
        {explanation && (
          <div className="bg-gray-800 p-3 rounded-md border border-gray-700">
            <p className="text-sm font-medium text-gray-300 mb-1">Additional Notes:</p>
            <p className="text-gray-200 text-sm">{explanation}</p>
          </div>
        )}
      </div>
      
      {/* Status indicator - now smaller and less prominent */}
      {answer.isCorrect !== undefined && (
        <div className="text-sm flex items-center">
          <span className={`h-2 w-2 rounded-full mr-2 ${
            answer.isCorrect ? "bg-green-500" : "bg-amber-500"
          }`}></span>
          <span className={answer.isCorrect ? "text-green-400" : "text-amber-400"}>
            {answer.isCorrect ? 'Correct' : 'Review recommended'}
          </span>
        </div>
      )}
    </div>
  );
};
