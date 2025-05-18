
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type QuestionType = Database["public"]["Enums"]["question_type"];

export interface Question {
  id?: string;
  case_id?: string;
  question_text: string;
  type: QuestionType;
  display_order: number;
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
    <div className="border border-gray-700 p-4 rounded-md mb-4 relative bg-gray-800">
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
            placeholder="e.g., Provide a short report for this case"
            className="bg-gray-700 border-gray-600"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`explanation-${index}`}>Model Answer/Explanation</Label>
          <Textarea 
            id={`explanation-${index}`}
            value={localQuestion.explanation || ''} 
            onChange={(e) => handleChange("explanation", e.target.value)}
            rows={3}
            placeholder="Provide a model answer or explanation for reference"
            className="bg-gray-700 border-gray-600"
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
            className="bg-gray-700 border-gray-600"
          />
        </div>
      </div>
    </div>
  );
};
