
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnsweredQuestionDisplay } from "./AnsweredQuestionDisplay";
import { type Question, type AnswerSubmission } from "@/hooks/useQuestions";

interface CompletedCaseReviewProps {
  caseId: string;
  userId: string;
  attemptId: string;
}

export const CompletedCaseReview = ({ 
  caseId, 
  userId, 
  attemptId 
}: CompletedCaseReviewProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerSubmission>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchQuestionsAndAnswers() {
      setIsLoading(true);
      try {
        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("*")
          .eq("case_id", caseId)
          .order("display_order");

        if (questionsError) throw questionsError;

        // Fetch answers
        const { data: answersData, error: answersError } = await supabase
          .from("answers")
          .select("*")
          .eq("case_id", caseId)
          .eq("user_id", userId);

        if (answersError) throw answersError;

        // Process answers into a map by question ID
        const answersMap: Record<string, AnswerSubmission> = {};
        answersData.forEach((answer) => {
          answersMap[answer.question_id] = {
            questionId: answer.question_id,
            responseText: answer.response_text,
            isCorrect: answer.is_correct,
            feedback: answer.feedback
          };
        });

        setQuestions(questionsData);
        setAnswers(answersMap);
      } catch (err) {
        console.error("Error fetching questions and answers:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuestionsAndAnswers();
  }, [caseId, userId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-medical-danger/10 border border-medical-danger/20 rounded-md p-4 text-medical-danger">
        <p>Error loading your answers: {error.message}</p>
      </div>
    );
  }

  if (!questions.length) {
    return <p className="text-medical-muted">No questions found for this case.</p>;
  }

  return (
    <Card className="bg-white border-medical-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-medical-dark flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-medical-success" />
          Case Review
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Simplified completion message */}
        <div className="mb-6 py-2">
          <p className="text-medical-muted max-w-md">
            You've completed this case study. Review your answers below.
          </p>
        </div>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-8">
            {questions.map((question) => (
              <div key={question.id} className="border-b border-medical-border pb-6 last:border-b-0">
                {answers[question.id] ? (
                  <AnsweredQuestionDisplay 
                    questionText={question.question_text}
                    answer={answers[question.id]}
                    explanation={question.explanation}
                    modelAnswer={question.correct_answer}
                  />
                ) : (
                  <div className="bg-medical-warning/10 p-4 rounded-md border border-medical-warning/20">
                    <h3 className="text-lg font-medium mb-2 text-medical-dark">{question.question_text}</h3>
                    <p className="text-medical-warning">You didn't provide an answer for this question.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
