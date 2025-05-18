
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Case } from "@/components/admin/CaseForm";
import { fileExists, makeDicomFilePermanent } from "@/utils/dicomStorage";
import { Question } from "@/components/admin/QuestionForm";
import { useAuth } from "@/hooks/useAuth";

/**
 * Hook for saving case data and related questions
 */
export const useCaseSave = (
  isNewCase: boolean,
  originalDicomPath: string | null,
  navigateCallback: (path: string) => void,
  saveQuestions: (caseId: string) => Promise<void>
) => {
  const { user } = useAuth();

  const saveCaseMutation = useMutation({
    mutationFn: async (data: Case) => {
      console.log("useCaseSave: Starting case save mutation");
      
      try {
        let caseId: string;
        let updatedDicomPath = data.dicom_path;
        
        // If this is a new case or the DICOM path has changed and starts with 'temp_',
        // we need to make the file permanent
        if (data.dicom_path && 
            (isNewCase || data.dicom_path !== originalDicomPath) && 
            data.dicom_path.startsWith('temp_')) {
          console.log("useCaseSave: Making temporary DICOM file permanent");
          
          // Make the file permanent by copying it to a permanent location
          updatedDicomPath = await makeDicomFilePermanent(data.dicom_path);
          
          if (!updatedDicomPath) {
            console.error("useCaseSave: Failed to make DICOM file permanent");
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
          console.log("useCaseSave: Cleaning up old DICOM file:", originalDicomPath);
          
          // Check if the file exists before trying to delete it
          const exists = await fileExists(originalDicomPath);
          
          if (exists) {
            // Delete the old file
            const { error: removeError } = await supabase.storage
              .from('dicom_images')
              .remove([originalDicomPath]);
              
            if (removeError) {
              console.warn("useCaseSave: Error removing old DICOM file:", removeError);
              // Continue with the save process even if file deletion fails
            }
          }
        }
        
        // First save the case
        if (isNewCase) {
          console.log("useCaseSave: Creating new case", data);
          const { data: createdCase, error } = await supabase
            .from("cases")
            .insert({
              ...data,
              created_by: user?.id
            })
            .select()
            .single();
          
          if (error) {
            console.error("useCaseSave: Error creating case", error);
            throw error;
          }
          
          caseId = createdCase.id;
          console.log("useCaseSave: Case created successfully with ID:", caseId);
        } else {
          console.log("useCaseSave: Updating case", data);
          const { data: updatedCase, error } = await supabase
            .from("cases")
            .update(data)
            .eq("id", data.id as string)
            .select()
            .single();
          
          if (error) {
            console.error("useCaseSave: Error updating case", error);
            throw error;
          }
          
          caseId = data.id as string;
          console.log("useCaseSave: Case updated successfully");
        }
        
        // Save questions using our extracted function
        await saveQuestions(caseId);
        
        return { id: caseId };
      } catch (error) {
        console.error("useCaseSave: Error in saveCaseMutation:", error);
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
      console.error("useCaseSave: Mutation error", error);
      toast({
        title: `Failed to save case: ${(error as Error).message}`,
        variant: "destructive"
      });
    }
  });

  return {
    saveCaseMutation,
    isPendingSave: saveCaseMutation.isPending,
    submitCase: (caseData: Case) => {
      console.log("useCaseSave: Submitting case", caseData);
      saveCaseMutation.mutate(caseData);
    }
  };
};
