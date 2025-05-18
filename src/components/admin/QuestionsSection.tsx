
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Question, QuestionForm } from "@/components/admin/QuestionForm";
import { PlusCircle } from "lucide-react";

interface QuestionsSectionProps {
  questions: Question[];
  onUpdateQuestion: (index: number, updatedQuestion: Question) => void;
  onDeleteQuestion: (index: number) => void;
  onAddQuestion: () => void;
}

export const QuestionsSection = ({ 
  questions, 
  onUpdateQuestion, 
  onDeleteQuestion, 
  onAddQuestion 
}: QuestionsSectionProps) => {
  
  console.log("QuestionsSection: Rendering with questions", questions.length);

  return (
    <div className="border-t border-gray-700 pt-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Questions</h2>
        <Button 
          type="button"
          variant="outline"
          onClick={onAddQuestion}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>
      
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="text-center py-8 bg-gray-800 border border-gray-700 rounded-md">
            <p className="text-gray-400">No questions added yet.</p>
            <Button 
              type="button" 
              variant="outline" 
              className="mt-2"
              onClick={onAddQuestion}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Your First Question
            </Button>
          </div>
        ) : (
          questions.map((question, index) => (
            <QuestionForm 
              key={question.id || `new-${index}`}
              question={question}
              index={index}
              onUpdate={onUpdateQuestion}
              onDelete={onDeleteQuestion}
            />
          ))
        )}
      </div>
    </div>
  );
};
