
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { Question } from "@/components/admin/QuestionForm";
import { Case } from "@/components/admin/CaseForm";

/**
 * Checks if a file exists in storage
 */
const fileExists = async (filePath: string): Promise<boolean> => {
  if (!filePath) return false;
  
  try {
    const { data, error } = await supabase.storage
      .from("dicom_images")
      .createSignedUrl(filePath, 10); // Short expiry just to check existence
      
    return !error && !!data;
  } catch (error) {
    console.error("Error checking if file exists:", error);
    return false;
  }
};

/**
 * Makes a temporary file permanent by copying it with a non-temporary name
 */
const makeDicomFilePermanent = async (tempFilePath: string): Promise<string | null> => {
  if (!tempFilePath) return null;
  
  // Only process files with the temp_ prefix
  if (!tempFilePath.startsWith('temp_')) {
    console.log("File is already permanent:", tempFilePath);
    return tempFilePath;
  }
  
  try {
    console.log("Making file permanent:", tempFilePath);
    
    // Create a new permanent file path by removing the temp_ prefix
    const permanentFilePath = tempFilePath.replace('temp_', '');
    
    // First download the temp file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('dicom_images')
      .download(tempFilePath);
      
    if (downloadError || !fileData) {
      console.error("Error downloading temporary file:", downloadError);
      return null;
    }
    
    // Upload to the new permanent location
    const { error: uploadError } = await supabase.storage
      .from('dicom_images')
      .upload(permanentFilePath, fileData, {
        contentType: 'application/dicom',
        upsert: true
      });
      
    if (uploadError) {
      console.error("Error uploading permanent file:", uploadError);
      return null;
    }
    
    // Delete the temporary file
    await supabase.storage
      .from('dicom_images')
      .remove([tempFilePath]);
      
    console.log("File made permanent:", permanentFilePath);
    return permanentFilePath;
  } catch (error) {
    console.error("Error making file permanent:", error);
    return null;
  }
};

/**
 * Hook for managing case editing functionality
 */
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
  const [originalDicomPath, setOriginalDicomPath] = useState<string | null>(null);
  
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
        toast({
          title: "Failed to load case",
          description: error.message,
          variant: "destructive"
        });
        return null;
      }
      
      console.log("useCaseEditor: Case fetched successfully", data);
      setCaseData(data);
      
      // Store the original DICOM path for comparison later
      setOriginalDicomPath(data.dicom_path);
      
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
      toast({
        title: "Failed to load questions",
        description: error.message,
        variant: "destructive"
      });
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
        let updatedDicomPath = data.dicom_path;
        
        // If this is a new case or the DICOM path has changed and starts with 'temp_',
        // we need to make the file permanent
        if (data.dicom_path && 
            (isNewCase || data.dicom_path !== originalDicomPath) && 
            data.dicom_path.startsWith('temp_')) {
          console.log("useCaseEditor: Making temporary DICOM file permanent");
          
          // Make the file permanent by copying it to a permanent location
          updatedDicomPath = await makeDicomFilePermanent(data.dicom_path);
          
          if (!updatedDicomPath) {
            console.error("useCaseEditor: Failed to make DICOM file permanent");
            toast({
              title: "File Processing Error",
              description: "Failed to process the DICOM file. Please try uploading again.",
              variant: "destructive"
            });
            throw new Error("Failed to make DICOM file permanent");
          }
          
          // Update the case data with the permanent file path
          data.dicom_path = updatedDicomPath;
        }
        
        // If the DICOM path has changed and we have an original path,
        // clean up the old file
        if (originalDicomPath && 
            originalDicomPath !== data.dicom_path && 
            originalDicomPath !== updatedDicomPath) {
          console.log("useCaseEditor: Cleaning up old DICOM file:", originalDicomPath);
          
          // Check if the file exists before trying to delete it
          const exists = await fileExists(originalDicomPath);
          
          if (exists) {
            // Delete the old file
            const { error: removeError } = await supabase.storage
              .from('dicom_images')
              .remove([originalDicomPath]);
              
            if (removeError) {
              console.warn("useCaseEditor: Error removing old DICOM file:", removeError);
              // Continue with the save process even if file deletion fails
            }
          }
        }
        
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
      toast({
        title: isNewCase ? "Case created successfully" : "Case updated successfully",
      });
      navigateCallback("/admin/cases");
    },
    onError: (error) => {
      console.error("useCaseEditor: Mutation error", error);
      toast({
        title: `Failed to save case: ${(error as Error).message}`,
        variant: "destructive"
      });
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
