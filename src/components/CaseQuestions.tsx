
import { useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { QuestionAnswer } from "./QuestionAnswer";
import { useQuestions } from "@/hooks/useQuestions";
import { QuestionNavigation } from "./case/QuestionNavigation";
import { QuestionProgress } from "./case/QuestionProgress";
import { AnsweredQuestionDisplay } from "./case/AnsweredQuestionDisplay";

interface CaseQuestionsProps {
  caseId: string;
  attemptId: string;
  userId: string;
  onComplete?: () => void;
}

const CaseQuestions = ({
  caseId,
  attemptId,
  userId,
  onComplete
}: CaseQuestionsProps) => {
  const {
    questions,
    isLoading,
    error,
    currentQuestionIndex,
    answeredQuestions,
    isSubmitting,
    setIsSubmitting,
    handleAnswerSubmitted,
    handleNextQuestion,
    handlePrevQuestion,
    checkIfAllAnswered
  } = useQuestions(caseId, userId);

  // Check if all questions are answered whenever answers change
  useEffect(() => {
    const checkCompletion = async () => {
      const allAnswered = checkIfAllAnswered();
      
      if (allAnswered) {
        try {
          const { error } = await supabase
            .from("case_attempts")
            .update({
              status: "completed",
              completed_at: new Date().toISOString()
            })
            .eq("id", attemptId);
            
          if (error) throw error;
          
          toast({
            title: "Case completed!",
            description: "You have answered all questions for this case.",
          });
          
          if (onComplete) {
            onComplete();
          }
        } catch (error) {
          console.error("Error updating case attempt:", error);
        }
      }
    };

    if (questions && questions.length > 0 && Object.keys(answeredQuestions).length > 0) {
      checkCompletion();
    }
  }, [answeredQuestions, questions, attemptId, onComplete, checkIfAllAnswered]);
  
  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-radiology-light">Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-radiology-light">Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-400">Error loading questions: {(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!questions || questions.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-radiology-light">Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">No questions available for this case.</p>
        </CardContent>
      </Card>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = !!answeredQuestions[currentQuestion.id];
  
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <QuestionProgress 
          currentIndex={currentQuestionIndex} 
          totalQuestions={questions.length} 
        />
      </CardHeader>
      <CardContent>
        {isAnswered ? (
          <AnsweredQuestionDisplay 
            questionText={currentQuestion.question_text}
            answer={answeredQuestions[currentQuestion.id]}
            explanation={currentQuestion.explanation}
          />
        ) : (
          <QuestionAnswer
            caseId={caseId}
            attemptId={attemptId}
            question={currentQuestion}
            userId={userId}
            onAnswerSubmitted={handleAnswerSubmitted}
            isSubmitting={isSubmitting}
          />
        )}
      </CardContent>
      <CardFooter>
        <QuestionNavigation 
          currentQuestionIndex={currentQuestionIndex}
          questionsCount={questions.length}
          onPrevious={handlePrevQuestion}
          onNext={handleNextQuestion}
        />
      </CardFooter>
    </Card>
  );
};

export default CaseQuestions;
