
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Case } from "@/components/admin/CaseForm";

export interface UseCaseInitializerOptions {
  id?: string;
  onCaseLoaded?: (caseData: Case) => void;
  onQuestionsLoad?: (caseId: string) => void;
}

/**
 * Hook for initializing case data
 */
export const useCaseInitializer = ({
  id,
  onCaseLoaded,
  onQuestionsLoad
}: UseCaseInitializerOptions) => {
  const isNewCase = !id || id === "new";
  const [originalDicomPath, setOriginalDicomPath] = useState<string | null>(null);
  
  const [initialCase] = useState<Case>({
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
  
  const { data: loadedCase, isLoading: isLoadingCase } = useQuery({
    queryKey: ["admin-case-detail", id],
    queryFn: async () => {
      if (isNewCase) {
        console.log("useCaseInitializer: New case, skipping fetch");
        return null;
      }
      
      console.log("useCaseInitializer: Fetching case details", { id });
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) {
        console.error("useCaseInitializer: Error fetching case details", error);
        toast({
          title: "Failed to load case",
          description: error.message,
          variant: "destructive"
        });
        return null;
      }
      
      console.log("useCaseInitializer: Case fetched successfully", data);
      
      // Store the original DICOM path for comparison later
      setOriginalDicomPath(data.dicom_path);
      
      // Notify parent about loaded case data
      if (onCaseLoaded) {
        onCaseLoaded(data);
      }
      
      // Now fetch questions for this case if callback provided
      if (onQuestionsLoad) {
        onQuestionsLoad(id);
      }
      
      return data;
    },
    enabled: !isNewCase
  });
  
  return {
    initialCase,
    loadedCase,
    isNewCase,
    isLoadingCase,
    originalDicomPath
  };
};
