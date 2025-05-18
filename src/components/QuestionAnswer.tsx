
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Question {
  id: string;
  question_text: string;
  type: string;
  explanation: string | null;
}

interface AnswerSubmission {
  questionId: string;
  responseText: string;
  feedback?: string;
}

interface QuestionAnswerProps {
  caseId: string;
  attemptId: string;
  question: Question;
  userId: string;
  onAnswerSubmitted: (submission: AnswerSubmission) => void;
  isSubmitting?: boolean;
}

export const QuestionAnswer = ({
  caseId,
  attemptId,
  question,
  userId,
  onAnswerSubmitted,
  isSubmitting = false,
}: QuestionAnswerProps) => {
  const [answerText, setAnswerText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    
    // Validate answer
    if (!answerText.trim()) {
      setError("Please enter your answer");
      return;
    }

    try {
      // Create answer record
      const { data, error } = await supabase
        .from("answers")
        .insert({
          question_id: question.id,
          case_id: caseId,
          user_id: userId,
          response_text: answerText,
        })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Answer submitted",
        description: "Your answer has been recorded",
      });
      
      onAnswerSubmitted({
        questionId: question.id,
        responseText: answerText
      });
      
    } catch (error) {
      console.error("Error submitting answer:", error);
      setError("Failed to submit answer. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{question.question_text}</h3>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Textarea
        placeholder="Enter your answer..."
        value={answerText}
        onChange={(e) => setAnswerText(e.target.value)}
        className="min-h-[150px]"
      />
      
      <Button 
        onClick={handleSubmit} 
        disabled={isSubmitting}
        className="w-full"
      >
        Submit Answer
      </Button>
    </div>
  );
};
