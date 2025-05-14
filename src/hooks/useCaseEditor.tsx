
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";
import { Question } from "@/components/admin/QuestionForm";
import { Case } from "@/components/admin/CaseForm";

export const useCaseEditor = (id: string | undefined, navigateCallback: (path: string) => void) => {
  const { user } = useAuth();
  const isNewCase = !id || id === "new";
  
  const [caseData, setCaseData] = useState<Case>({
    title: "",
    description: "",
    region: "chest",
    age_group: "adult",
    difficulty: "medium",
    is_free_trial: false,
    published: false,
    clinical_history: "",
    dicom_path: null,
    case_number: `CASE-${Date.now().toString().slice(-6)}`
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  
  const { isLoading: isLoadingCase } = useQuery({
    queryKey: ["admin-case-detail", id],
    queryFn: async () => {
      if (isNewCase) {
        console.log("useCaseEditor: New case, skipping fetch");
        return null;
      }
      
      console.log("useCaseEditor: Fetching case details", { id });
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) {
        console.error("useCaseEditor: Error fetching case details", error);
        toast.error("Failed to load case");
        return null;
      }
      
      console.log("useCaseEditor: Case fetched successfully", data);
      setCaseData(data);
      
      // Now fetch questions for this case
      fetchQuestionsForCase(id);
      
      return data;
    },
    enabled: !isNewCase
  });
  
  const fetchQuestionsForCase = async (caseId: string) => {
    console.log("useCaseEditor: Fetching questions for case:", caseId);
    
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("case_id", caseId)
      .order("display_order", { ascending: true });
    
    if (error) {
      console.error("useCaseEditor: Error fetching questions:", error);
      toast.error("Failed to load questions");
      return;
    }
    
    console.log("useCaseEditor: Questions fetched successfully:", data);
    setQuestions(data || []);
  };
  
  const saveCaseMutation = useMutation({
    mutationFn: async (data: Case) => {
      console.log("useCaseEditor: Starting case save mutation");
      
      try {
        let caseId: string;
        
        // First save the case
        if (isNewCase) {
          console.log("useCaseEditor: Creating new case", data);
          const { data: createdCase, error } = await supabase
            .from("cases")
            .insert({
              ...data,
              created_by: user?.id
            })
            .select()
            .single();
          
          if (error) {
            console.error("useCaseEditor: Error creating case", error);
            throw error;
          }
          
          caseId = createdCase.id;
          console.log("useCaseEditor: Case created successfully with ID:", caseId);
        } else {
          console.log("useCaseEditor: Updating case", { id, ...data });
          const { data: updatedCase, error } = await supabase
            .from("cases")
            .update(data)
            .eq("id", id)
            .select()
            .single();
          
          if (error) {
            console.error("useCaseEditor: Error updating case", error);
            throw error;
          }
          
          caseId = id as string;
          console.log("useCaseEditor: Case updated successfully");
        }
        
        // Now handle questions
        console.log("useCaseEditor: Processing questions for case:", caseId);
        
        // For each question, determine if it's new, existing, or deleted
        for (const question of questions) {
          if (question.isDeleted && question.id) {
            // Delete existing question
            console.log("useCaseEditor: Deleting question:", question.id);
            const { error } = await supabase
              .from("questions")
              .delete()
              .eq("id", question.id);
              
            if (error) {
              console.error("useCaseEditor: Error deleting question:", error);
              throw error;
            }
          } else if (question.isNew || !question.id) {
            // Create new question
            console.log("useCaseEditor: Creating new question:", question);
            const { error } = await supabase
              .from("questions")
              .insert({
                ...question,
                case_id: caseId,
              });
              
            if (error) {
              console.error("useCaseEditor: Error creating question:", error);
              throw error;
            }
          } else {
            // Update existing question
            console.log("useCaseEditor: Updating question:", question.id);
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
              console.error("useCaseEditor: Error updating question:", error);
              throw error;
            }
          }
        }
        
        console.log("useCaseEditor: Case and questions saved successfully");
        return { id: caseId };
      } catch (error) {
        console.error("useCaseEditor: Error in saveCaseMutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success(isNewCase ? "Case created successfully" : "Case updated successfully");
      navigateCallback("/admin/cases");
    },
    onError: (error) => {
      console.error("useCaseEditor: Mutation error", error);
      toast.error(`Failed to save case: ${(error as Error).message}`);
    }
  });
  
  const handleInputChange = (field: keyof Case, value: any) => {
    console.log("useCaseEditor: Input changed", { field, value });
    setCaseData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleDicomUpload = (filePath: string) => {
    console.log("useCaseEditor: DICOM upload complete, path:", filePath);
    handleInputChange("dicom_path", filePath || null);
  };
  
  const handleAddQuestion = () => {
    console.log("useCaseEditor: Adding new question");
    const newQuestion: Question = {
      question_text: "",
      type: "multiple_choice",
      display_order: questions.length + 1,
      isNew: true
    };
    setQuestions([...questions, newQuestion]);
  };
  
  const handleUpdateQuestion = (index: number, updatedQuestion: Question) => {
    console.log("useCaseEditor: Updating question at index:", index);
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };
  
  const handleDeleteQuestion = (index: number) => {
    console.log("useCaseEditor: Deleting question at index:", index);
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
  
  const submitCase = () => {
    console.log("useCaseEditor: Submitting case", caseData);
    console.log("useCaseEditor: With questions", questions);
    saveCaseMutation.mutate(caseData);
  };
  
  return {
    caseData,
    questions,
    isLoadingCase,
    isNewCase,
    isPendingSave: saveCaseMutation.isPending,
    handleInputChange,
    handleDicomUpload,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    submitCase
  };
};
