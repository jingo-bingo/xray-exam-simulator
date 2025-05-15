
import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "@/components/ui/sonner";
import { getSignedUrl } from "@/utils/dicomStorage";

export const useDicomUrl = (dicomPath: string | undefined) => {
  const [signedDicomUrl, setSignedDicomUrl] = useState<string | null>(null);
  const [dicomError, setDicomError] = useState<string | null>(null);
  const [isGeneratingUrl, setIsGeneratingUrl] = useState<boolean>(false);
  
  // Use refs to track the current dicomPath and prevent unnecessary regeneration
  const currentPathRef = useRef<string | undefined>(dicomPath);
  const requestInProgressRef = useRef<boolean>(false);

  // Memoized function to generate signed URL with proper dependency array
  const generateSignedUrl = useCallback(async (path: string) => {
    // Prevent duplicate requests using ref instead of state
    if (requestInProgressRef.current) {
      console.log("CaseView: URL generation already in progress, skipping request");
      return null;
    }

    requestInProgressRef.current = true;
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
      requestInProgressRef.current = false;
      setIsGeneratingUrl(false);
    }
  }, []); // No dependencies to prevent recreation

  // Generate signed URL for DICOM when dicomPath changes
  useEffect(() => {
    // Skip if path hasn't changed
    if (dicomPath === currentPathRef.current && signedDicomUrl) {
      console.log("CaseView: Skipping URL generation for same path:", dicomPath);
      return;
    }

    // Store current path in ref to track changes
    currentPathRef.current = dicomPath;
    
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
