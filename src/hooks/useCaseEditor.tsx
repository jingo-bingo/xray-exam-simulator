
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { Question } from "@/components/admin/QuestionForm";
import { Case } from "@/components/admin/CaseForm";
import { fileExists, makeDicomFilePermanent } from "@/utils/dicomStorage";
import { useQuestionsManager } from "@/hooks/useQuestionsManager";

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

  const [originalDicomPath, setOriginalDicomPath] = useState<string | null>(null);
  
  // Use our question manager hook
  const {
    questions,
    setQuestions,
    fetchQuestionsForCase,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    saveQuestions
  } = useQuestionsManager();
  
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
        
        // Save questions using our extracted function
        await saveQuestions(caseId);
        
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
