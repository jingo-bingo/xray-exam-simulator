
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Question = Database["public"]["Tables"]["questions"]["Row"];
type Answer = Database["public"]["Tables"]["answers"]["Row"];

interface QuestionPanelProps {
  question: Question;
  userId: string;
  caseId: string;
  caseAttemptId: string;
  onNext: () => void;
  isLastQuestion: boolean;
}

export const QuestionPanel = ({ 
  question, 
  userId, 
  caseId,
  caseAttemptId,
  onNext, 
  isLastQuestion 
}: QuestionPanelProps) => {
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [savedAnswer, setSavedAnswer] = useState<Answer | null>(null);

  console.log("QuestionPanel: Rendering question:", question.id, "for case:", caseId);

  useEffect(() => {
    // Check if the user has already answered this question
    const checkExistingAnswer = async () => {
      console.log("QuestionPanel: Checking for existing answer for question", question.id);
      try {
        const { data, error } = await supabase
          .from("answers")
          .select("*")
          .eq("question_id", question.id)
          .eq("user_id", userId)
          .eq("case_id", caseId)
          .maybeSingle();

        if (error) {
          console.error("QuestionPanel: Error fetching existing answer:", error);
          return;
        }

        if (data) {
          console.log("QuestionPanel: Found existing answer:", data);
          setSavedAnswer(data);
          setResponse(data.response_text);
          setSubmitted(true);
        } else {
          console.log("QuestionPanel: No existing answer found");
          setResponse("");
          setSubmitted(false);
          setSavedAnswer(null);
        }
      } catch (error) {
        console.error("QuestionPanel: Exception checking existing answer:", error);
      }
    };

    checkExistingAnswer();
  }, [question.id, userId, caseId]);

  const handleSubmit = async () => {
    if (!response.trim()) {
      toast({
        title: "Response required",
        description: "Please provide an answer to the question.",
        variant: "destructive",
      });
      return;
    }

    console.log("QuestionPanel: Submitting answer for question:", question.id);
    setSubmitting(true);

    try {
      // Check if the answer is correct (simple string comparison)
      const isCorrect = question.correct_answer ? 
        response.toLowerCase().includes(question.correct_answer.toLowerCase()) : 
        false;
      
      console.log("QuestionPanel: Answer evaluated as:", isCorrect ? "correct" : "incorrect");

      // Calculate a simple score based on correctness
      const score = isCorrect ? 10 : 0;

      const answerData = {
        question_id: question.id,
        user_id: userId,
        case_id: caseId,
        response_text: response,
        is_correct: isCorrect,
        score: score,
      };

      const { data, error } = await supabase
        .from("answers")
        .upsert(answerData, { onConflict: "question_id,user_id,case_id" })
        .select()
        .single();

      if (error) {
        console.error("QuestionPanel: Error submitting answer:", error);
        toast({
          title: "Error",
          description: "Failed to submit your answer. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log("QuestionPanel: Answer submitted successfully:", data);
      setSavedAnswer(data);
      setSubmitted(true);
      
      toast({
        title: "Answer submitted",
        description: isCorrect 
          ? "Great job! Your answer is correct."
          : "Your answer has been recorded.",
      });

      // If it's the last question, update the case attempt status
      if (isLastQuestion) {
        console.log("QuestionPanel: Last question answered, updating case attempt status");
        await updateCaseAttemptStatus();
      }
    } catch (error) {
      console.error("QuestionPanel: Exception submitting answer:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateCaseAttemptStatus = async () => {
    try {
      console.log("QuestionPanel: Updating case attempt status to completed", caseAttemptId);
      const { error } = await supabase
        .from("case_attempts")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", caseAttemptId);

      if (error) {
        console.error("QuestionPanel: Error updating case attempt status:", error);
        return;
      }

      console.log("QuestionPanel: Case attempt status updated successfully");
    } catch (error) {
      console.error("QuestionPanel: Exception updating case attempt status:", error);
    }
  };

  return (
    <Card className="bg-gray-800 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Question {question.display_order}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-medium">{question.question_text}</p>
        <Textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Type your answer here..."
          disabled={submitted}
          className="min-h-[100px] bg-gray-700 text-white border-gray-600"
        />
        {submitted && savedAnswer && question.correct_answer && (
          <div className={`p-3 rounded-md ${
            savedAnswer.is_correct ? "bg-green-900/50" : "bg-red-900/50"
          }`}>
            <p className="font-medium">
              {savedAnswer.is_correct 
                ? "Correct answer!" 
                : "Your answer was not correct."}
            </p>
            {question.explanation && (
              <p className="mt-2 text-sm opacity-90">{question.explanation}</p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!submitted ? (
          <Button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="ml-auto"
          >
            {submitting ? "Submitting..." : "Submit Answer"}
          </Button>
        ) : (
          <Button 
            onClick={onNext} 
            className="ml-auto"
            variant="secondary"
          >
            {isLastQuestion ? "Complete Case" : "Next Question"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
