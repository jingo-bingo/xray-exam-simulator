
import { useEffect } from "react";
import { useCaseInitializer } from "./case/useCaseInitializer";
import { useCaseForm } from "./case/useCaseForm";
import { useCaseSave } from "./case/useCaseSave";
import { useQuestionsManager } from "./useQuestionsManager";
import { Question } from "@/components/admin/QuestionForm";
import { Case } from "@/components/admin/CaseForm";

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
  
  // Use case save hook
  const {
    submitCase: saveCaseMutation,
    isPendingSave
  } = useCaseSave(isNewCase, originalDicomPath, navigateCallback, saveQuestions);
  
  // Update form data when loaded case changes
  useEffect(() => {
    if (loadedCase) {
      console.log("useCaseEditor: Updating form with loaded case data");
      updateCaseData(loadedCase);
    }
  }, [loadedCase, updateCaseData]);
  
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
    isPendingSave,
    handleInputChange,
    handleDicomUpload,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    submitCase
  };
};
