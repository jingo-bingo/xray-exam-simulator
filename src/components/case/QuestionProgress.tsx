
import React from "react";

interface QuestionProgressProps {
  currentIndex: number;
  totalQuestions: number;
}

export const QuestionProgress: React.FC<QuestionProgressProps> = ({
  currentIndex,
  totalQuestions
}) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-radiology-light">
        Question {currentIndex + 1} of {totalQuestions}
      </h2>
      <div className="flex items-center space-x-1">
        {Array.from({ length: totalQuestions }).map((_, index) => (
          <div 
            key={index} 
            className={`h-2 w-2 rounded-full ${
              index === currentIndex 
                ? "bg-primary" 
                : index < currentIndex 
                  ? "bg-green-500" 
                  : "bg-gray-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
