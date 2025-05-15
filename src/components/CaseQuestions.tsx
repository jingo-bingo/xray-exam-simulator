
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { QuestionAnswer } from "./QuestionAnswer";
import { toast } from "@/components/ui/use-toast";

interface CaseQuestionsProps {
  caseId: string;
  attemptId: string;
  userId: string;
  onComplete?: () => void;
}

interface Question {
  id: string;
  question_text: string;
  type: string;
  correct_answer: string | null;
  explanation: string | null;
  display_order: number;
}

interface AnswerSubmission {
  questionId: string;
  responseText: string;
  isCorrect?: boolean;
  feedback?: string;
}

export const CaseQuestions = ({
  caseId,
  attemptId,
  userId,
  onComplete
}: CaseQuestionsProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, AnswerSubmission>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch questions for the case
  const { data: questions, isLoading, error } = useQuery({
    queryKey: ["caseQuestions", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("case_id", caseId)
        .order("display_order");

      if (error) {
        throw new Error(error.message);
      }

      return data as Question[];
    },
    enabled: !!caseId,
  });

  // Check for existing answers
  useEffect(() => {
    const fetchExistingAnswers = async () => {
      if (!caseId || !userId || !questions) return;
      
      const { data, error } = await supabase
        .from("answers")
        .select("*")
        .eq("case_id", caseId)
        .eq("user_id", userId);
        
      if (error) {
        console.error("Error fetching existing answers:", error);
        return;
      }
      
      if (data && data.length > 0) {
        const answerMap: Record<string, AnswerSubmission> = {};
        data.forEach(answer => {
          answerMap[answer.question_id] = {
            questionId: answer.question_id,
            responseText: answer.response_text,
            isCorrect: answer.is_correct || undefined,
            feedback: answer.feedback || undefined
          };
        });
        setAnsweredQuestions(answerMap);
      }
    };
    
    fetchExistingAnswers();
  }, [caseId, userId, questions]);

  const handleAnswerSubmitted = (submission: AnswerSubmission) => {
    setAnsweredQuestions(prev => ({
      ...prev,
      [submission.questionId]: submission
    }));
    
    // Automatically go to next question if available
    if (questions && currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 1500);
    } else {
      // Check if all questions are answered
      setTimeout(() => {
        checkIfAllAnswered();
      }, 1500);
    }
  };
  
  const checkIfAllAnswered = async () => {
    if (!questions) return;
    
    const allQuestionsAnswered = questions.every(q => !!answeredQuestions[q.id]);
    
    if (allQuestionsAnswered) {
      // Mark the attempt as completed
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
  
  const handleNextQuestion = () => {
    if (questions && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-radiology-light">
          Question {currentQuestionIndex + 1} of {questions.length}
        </CardTitle>
        <div className="flex items-center space-x-1">
          {questions.map((_, index) => (
            <div 
              key={index} 
              className={`h-2 w-2 rounded-full ${
                index === currentQuestionIndex 
                  ? "bg-primary" 
                  : index < currentQuestionIndex 
                    ? "bg-green-500" 
                    : "bg-gray-500"
              }`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isAnswered ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{currentQuestion.question_text}</h3>
            <div className="bg-gray-700 p-4 rounded-md">
              <p className="mb-2 text-sm font-medium text-gray-300">Your Answer:</p>
              <p className="text-white">{answeredQuestions[currentQuestion.id].responseText}</p>
            </div>
            
            {answeredQuestions[currentQuestion.id].isCorrect !== undefined && (
              <div className={`p-4 rounded-md ${
                answeredQuestions[currentQuestion.id].isCorrect 
                  ? "bg-green-900/30 border border-green-600" 
                  : "bg-red-900/30 border border-red-600"
              }`}>
                <div className="flex items-center">
                  {answeredQuestions[currentQuestion.id].isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <div className="h-5 w-5 text-red-500 mr-2">✗</div>
                  )}
                  <p className={answeredQuestions[currentQuestion.id].isCorrect ? "text-green-400" : "text-red-400"}>
                    {answeredQuestions[currentQuestion.id].feedback}
                  </p>
                </div>
                
                {currentQuestion.explanation && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <p className="text-sm font-medium text-gray-300 mb-1">Explanation:</p>
                    <p className="text-white text-sm">{currentQuestion.explanation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
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
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button
          variant="outline"
          onClick={handleNextQuestion}
          disabled={currentQuestionIndex === questions.length - 1}
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CaseQuestions;
