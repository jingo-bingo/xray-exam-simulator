
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Question } from "@/components/admin/QuestionForm";

export const useQuestionsManager = (caseId?: string) => {
  const [questions, setQuestions] = useState<Question[]>([]);

  const fetchQuestionsForCase = async (id: string) => {
    console.log("useQuestionsManager: Fetching questions for case:", id);
    
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("case_id", id)
      .order("display_order", { ascending: true });
    
    if (error) {
      console.error("useQuestionsManager: Error fetching questions:", error);
      toast({
        title: "Failed to load questions",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    
    console.log("useQuestionsManager: Questions fetched successfully:", data);
    setQuestions(data || []);
  };

  const handleAddQuestion = () => {
    console.log("useQuestionsManager: Adding new question");
    const newQuestion: Question = {
      question_text: "",
      type: "multiple_choice",
      display_order: questions.length + 1,
      isNew: true
    };
    setQuestions([...questions, newQuestion]);
  };
  
  const handleUpdateQuestion = (index: number, updatedQuestion: Question) => {
    console.log("useQuestionsManager: Updating question at index:", index);
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };
  
  const handleDeleteQuestion = (index: number) => {
    console.log("useQuestionsManager: Deleting question at index:", index);
    const newQuestions = [...questions];
    const questionToDelete = newQuestions[index];
    
    if (questionToDelete.id) {
      // If it's an existing question, mark it as deleted
      questionToDelete.isDeleted = true;
      newQuestions[index] = questionToDelete;
      setQuestions(newQuestions.filter(q => !q.isDeleted));
    } else {
      // If it's a new question, just remove it
      newQuestions.splice(index, 1);
      setQuestions(newQuestions);
    }
    
    // Update display order for remaining questions
    const updatedQuestions = newQuestions
      .filter(q => !q.isDeleted)
      .map((q, idx) => ({ ...q, display_order: idx + 1 }));
    
    setQuestions(updatedQuestions);
  };

  const saveQuestions = async (caseId: string) => {
    // For each question, determine if it's new, existing, or deleted
    for (const question of questions) {
      if (question.isDeleted && question.id) {
        // Delete existing question
        console.log("useQuestionsManager: Deleting question:", question.id);
        const { error } = await supabase
          .from("questions")
          .delete()
          .eq("id", question.id);
          
        if (error) {
          console.error("useQuestionsManager: Error deleting question:", error);
          throw error;
        }
      } else if (question.isNew || !question.id) {
        // Create new question
        console.log("useQuestionsManager: Creating new question:", question);
        const { error } = await supabase
          .from("questions")
          .insert({
            ...question,
            case_id: caseId,
          });
          
        if (error) {
          console.error("useQuestionsManager: Error creating question:", error);
          throw error;
        }
      } else {
        // Update existing question
        console.log("useQuestionsManager: Updating question:", question.id);
        const { error } = await supabase
          .from("questions")
          .update({
            question_text: question.question_text,
            type: question.type,
            display_order: question.display_order,
            correct_answer: question.correct_answer,
            explanation: question.explanation
          })
          .eq("id", question.id);
          
        if (error) {
          console.error("useQuestionsManager: Error updating question:", error);
          throw error;
        }
      }
    }
    
    console.log("useQuestionsManager: Questions saved successfully");
  };

  return {
    questions,
    setQuestions,
    fetchQuestionsForCase,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    saveQuestions
  };
};
