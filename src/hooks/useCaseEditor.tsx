
import { useEffect, useRef } from "react";
import { useCaseInitializer } from "./case/useCaseInitializer";
import { useCaseForm } from "./case/useCaseForm";
import { useCaseSave } from "./case/useCaseSave";
import { useQuestionsManager } from "./useQuestionsManager";
import { useCaseScans } from "./case/useCaseScans";
import { CaseScan } from "@/components/admin/ScanManager";

/**
 * Main hook for case editor functionality - now much leaner by delegating to specialized hooks
 */
export const useCaseEditor = (id: string | undefined, navigateCallback: (path: string) => void) => {
  // Use questions manager hook
  const {
    questions,
    fetchQuestionsForCase,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    saveQuestions
  } = useQuestionsManager();
  
  // Use case scans hook
  const { saveScans, isProcessingScans } = useCaseScans();
  
  // Reference to store scans for submission
  const scansRef = useRef<CaseScan[]>([]);
  
  // Track if the component is mounted
  const isMounted = useRef(true);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Use case initializer hook
  const {
    initialCase,
    loadedCase,
    isNewCase,
    isLoadingCase,
    originalDicomPath
  } = useCaseInitializer({
    id,
    onQuestionsLoad: fetchQuestionsForCase
  });
  
  // Use case form hook
  const {
    caseData,
    handleInputChange,
    handleDicomUpload,
    updateCaseData
  } = useCaseForm(initialCase);
  
  // Use case save hook with extended callback for saving scans
  const {
    submitCase: saveCaseMutation,
    isPendingSave
  } = useCaseSave(isNewCase, originalDicomPath, navigateCallback, async (caseId) => {
    // First save questions
    await saveQuestions(caseId);
    
    // Then save scans if we have any
    if (scansRef.current && scansRef.current.length > 0) {
      return saveScans(caseId, scansRef.current);
    }
    
    return true;
  });
  
  // Update form data when loaded case changes
  useEffect(() => {
    if (loadedCase) {
      console.log("useCaseEditor: Updating form with loaded case data");
      updateCaseData(loadedCase);
    }
  }, [loadedCase, updateCaseData]);
  
  // Function to set scans for submission
  const setScansForSubmission = (scans: CaseScan[]) => {
    console.log("useCaseEditor: Setting scans for submission", scans);
    scansRef.current = scans;
  };
  
  const submitCase = () => {
    console.log("useCaseEditor: Submitting case", caseData);
    console.log("useCaseEditor: With questions", questions);
    // For existing cases, ensure we pass the id from loadedCase
    if (!isNewCase && loadedCase) {
      saveCaseMutation({
        ...caseData,
        id: loadedCase.id
      });
    } else {
      saveCaseMutation(caseData);
    }
  };
  
  return {
    caseData,
    questions,
    isLoadingCase,
    isNewCase,
    isPendingSave: isPendingSave || isProcessingScans,
    handleInputChange,
    handleDicomUpload,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    setScansForSubmission,
    submitCase
  };
};
