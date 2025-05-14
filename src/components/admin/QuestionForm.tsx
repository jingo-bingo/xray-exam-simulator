
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type QuestionType = Database["public"]["Enums"]["question_type"];

export interface Question {
  id?: string;
  case_id?: string;
  question_text: string;
  type: QuestionType;
  display_order: number;
  correct_answer?: string | null;
  explanation?: string | null;
  isNew?: boolean;
  isDeleted?: boolean;
}

interface QuestionFormProps {
  question: Question;
  index: number;
  onUpdate: (index: number, updatedQuestion: Question) => void;
  onDelete: (index: number) => void;
}

export const QuestionForm = ({ question, index, onUpdate, onDelete }: QuestionFormProps) => {
  const [localQuestion, setLocalQuestion] = useState<Question>(question);
  
  const handleChange = (field: keyof Question, value: any) => {
    console.log(`QuestionForm: Updating question ${index}, field: ${field}, value:`, value);
    const updatedQuestion = { ...localQuestion, [field]: value };
    setLocalQuestion(updatedQuestion);
    onUpdate(index, updatedQuestion);
  };

  return (
    <div className="border p-4 rounded-md mb-4 relative">
      <div className="absolute top-2 right-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onDelete(index)}
          aria-label="Delete question"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <h3 className="text-lg font-medium mb-4">Question {index + 1}</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`question-text-${index}`}>Question Text</Label>
          <Textarea 
            id={`question-text-${index}`}
            value={localQuestion.question_text} 
            onChange={(e) => handleChange("question_text", e.target.value)}
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`question-type-${index}`}>Question Type</Label>
          <Select 
            value={localQuestion.type} 
            onValueChange={(value: QuestionType) => handleChange("type", value)}
          >
            <SelectTrigger id={`question-type-${index}`}>
              <SelectValue placeholder="Select question type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="report">Report</SelectItem>
              <SelectItem value="management">Management</SelectItem>
              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
              <SelectItem value="short_answer">Short Answer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {(localQuestion.type === "multiple_choice" || localQuestion.type === "short_answer") && (
          <div className="space-y-2">
            <Label htmlFor={`correct-answer-${index}`}>Correct Answer</Label>
            <Textarea 
              id={`correct-answer-${index}`}
              value={localQuestion.correct_answer || ''} 
              onChange={(e) => handleChange("correct_answer", e.target.value)}
              rows={2}
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor={`explanation-${index}`}>Explanation</Label>
          <Textarea 
            id={`explanation-${index}`}
            value={localQuestion.explanation || ''} 
            onChange={(e) => handleChange("explanation", e.target.value)}
            rows={2}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`display-order-${index}`}>Display Order</Label>
          <Input 
            id={`display-order-${index}`}
            type="number" 
            value={localQuestion.display_order} 
            onChange={(e) => handleChange("display_order", parseInt(e.target.value) || 0)}
            min={1}
          />
        </div>
      </div>
    </div>
  );
};
