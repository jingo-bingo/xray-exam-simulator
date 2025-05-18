
import React from "react";
import { CheckCircle2 } from "lucide-react";
import { type AnswerSubmission } from "@/hooks/useQuestions";

interface AnsweredQuestionDisplayProps {
  questionText: string;
  answer: AnswerSubmission;
  explanation: string | null;
}

export const AnsweredQuestionDisplay: React.FC<AnsweredQuestionDisplayProps> = ({
  questionText,
  answer,
  explanation
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{questionText}</h3>
      <div className="bg-gray-700 p-4 rounded-md">
        <p className="mb-2 text-sm font-medium text-gray-300">Your Answer:</p>
        <p className="text-white">{answer.responseText}</p>
      </div>
      
      {answer.isCorrect !== undefined && (
        <div className={`p-4 rounded-md ${
          answer.isCorrect 
            ? "bg-green-900/30 border border-green-600" 
            : "bg-red-900/30 border border-red-600"
        }`}>
          <div className="flex items-center">
            {answer.isCorrect ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <div className="h-5 w-5 text-red-500 mr-2">✗</div>
            )}
            <p className={answer.isCorrect ? "text-green-400" : "text-red-400"}>
              {answer.feedback}
            </p>
          </div>
          
          {explanation && (
            <div className="mt-3 pt-3 border-t border-gray-600">
              <p className="text-sm font-medium text-gray-300 mb-1">Explanation:</p>
              <p className="text-white text-sm">{explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
