
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Question } from "@/hooks/useQuestions";

interface QuestionNavigationProps {
  currentQuestionIndex: number;
  questionsCount: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const QuestionNavigation: React.FC<QuestionNavigationProps> = ({
  currentQuestionIndex,
  questionsCount,
  onPrevious,
  onNext
}) => {
  return (
    <div className="flex justify-between">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentQuestionIndex === 0}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
      </Button>
      <Button
        variant="outline"
        onClick={onNext}
        disabled={currentQuestionIndex === questionsCount - 1}
      >
        Next <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};
