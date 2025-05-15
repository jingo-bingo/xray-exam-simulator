
import { useState, useCallback, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { getSignedUrl } from "@/utils/dicomStorage";

export const useDicomUrl = (dicomPath: string | undefined) => {
  const [signedDicomUrl, setSignedDicomUrl] = useState<string | null>(null);
  const [dicomError, setDicomError] = useState<string | null>(null);
  const [isGeneratingUrl, setIsGeneratingUrl] = useState<boolean>(false);

  // Memoized function to generate signed URL
  const generateSignedUrl = useCallback(async (path: string) => {
    // Prevent duplicate requests
    if (isGeneratingUrl) return;
    setIsGeneratingUrl(true);
    
    try {
      console.log("CaseView: Generating signed URL for:", path);
      const url = await getSignedUrl(path, 3600);
      console.log("CaseView: Signed URL generated:", url);
      setSignedDicomUrl(url);
      setDicomError(null);
      return url;
    } catch (error) {
      console.error("CaseView: Failed to generate signed URL:", error);
      setDicomError("Failed to load image URL");
      toast.error("Failed to load DICOM image");
      return null;
    } finally {
      setIsGeneratingUrl(false);
    }
  }, [isGeneratingUrl]);

  // Generate signed URL for DICOM when dicomPath is available
  useEffect(() => {
    if (dicomPath) {
      generateSignedUrl(dicomPath);
    } else {
      // Reset states if no DICOM path
      setSignedDicomUrl(null);
      setDicomError(null);
    }
  }, [dicomPath, generateSignedUrl]);

  return {
    signedDicomUrl,
    dicomError,
    setDicomError,
    isGeneratingUrl
  };
};
