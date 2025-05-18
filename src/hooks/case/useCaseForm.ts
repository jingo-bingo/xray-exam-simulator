
import { useState, useCallback } from "react";
import { Case } from "@/components/admin/CaseForm";

/**
 * Hook for managing case form state and input changes
 */
export const useCaseForm = (initialCaseData: Case) => {
  const [caseData, setCaseData] = useState<Case>(initialCaseData);
  
  const handleInputChange = useCallback((field: keyof Case, value: any) => {
    console.log("useCaseForm: Input changed", { field, value });
    setCaseData(prev => ({ ...prev, [field]: value }));
  }, []);
  
  const handleDicomUpload = useCallback((filePath: string) => {
    console.log("useCaseForm: DICOM upload complete, path:", filePath);
    handleInputChange("dicom_path", filePath || null);
  }, [handleInputChange]);

  const updateCaseData = useCallback((newData: Case) => {
    setCaseData(newData);
  }, []);
  
  return {
    caseData,
    handleInputChange,
    handleDicomUpload,
    updateCaseData
  };
};
