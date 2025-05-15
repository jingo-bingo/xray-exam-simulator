
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface Question {
  id: string;
  question_text: string;
  type: string;
  correct_answer: string | null;
  explanation: string | null;
}

interface AnswerSubmission {
  questionId: string;
  responseText: string;
  isCorrect?: boolean;
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
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
  // For multiple choice questions, parse the correct answer into options
  const options = question.type === "multiple_choice" && question.correct_answer
    ? JSON.parse(question.correct_answer).options || []
    : [];

  const handleSubmit = async () => {
    setError(null);
    
    // Validate answer
    if (question.type === "multiple_choice") {
      if (!selectedOption) {
        setError("Please select an option");
        return;
      }
    } else {
      if (!answerText.trim()) {
        setError("Please enter your answer");
        return;
      }
    }

    try {
      const responseText = question.type === "multiple_choice" ? selectedOption : answerText;
      
      // Create answer record
      const { data, error } = await supabase
        .from("answers")
        .insert({
          question_id: question.id,
          case_id: caseId,
          user_id: userId,
          response_text: responseText,
        })
        .select()
        .single();

      if (error) throw error;
      
      // For multiple choice questions, we can determine if the answer is correct
      let isCorrect = undefined;
      let feedback = undefined;
      
      if (question.type === "multiple_choice" && question.correct_answer) {
        const parsedAnswer = JSON.parse(question.correct_answer);
        isCorrect = selectedOption === parsedAnswer.correct;
        feedback = isCorrect ? "Correct!" : "Incorrect";
        
        // Update the answer with the correctness and feedback
        await supabase
          .from("answers")
          .update({
            is_correct: isCorrect,
            feedback: feedback
          })
          .eq("id", data.id);
      }
      
      toast({
        title: "Answer submitted",
        description: feedback || "Your answer has been recorded",
      });
      
      onAnswerSubmitted({
        questionId: question.id,
        responseText,
        isCorrect,
        feedback
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
      
      {question.type === "multiple_choice" ? (
        <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
          {options.map((option: string, index: number) => (
            <div className="flex items-center space-x-2 p-2" key={index}>
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      ) : (
        <Textarea
          placeholder="Enter your answer..."
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          className="min-h-[150px] bg-gray-700 text-white"
        />
      )}
      
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
