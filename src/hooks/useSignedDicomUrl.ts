
import { useState, useEffect, useRef, useCallback } from 'react';
import { getSignedUrl } from "@/utils/dicomStorage";
import { toast } from "@/components/ui/use-toast";

/**
 * Hook to generate and manage signed URLs for DICOM images
 */
export function useSignedDicomUrl(dicomPath: string | null | undefined) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to prevent dependency cycles and track loading state
  const isGeneratingUrlRef = useRef<boolean>(false);
  const currentDicomPathRef = useRef<string | null>(null);
  
  // Track mounted state to prevent state updates after component unmount
  const isMountedRef = useRef<boolean>(true);
  
  useEffect(() => {
    // Set mounted state on mount
    isMountedRef.current = true;
    
    // Clean up on unmount
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Memoized function to generate signed URL - no state dependencies
  const generateSignedUrl = useCallback(async (dicomPath: string) => {
    // Prevent duplicate requests and check if component is still mounted
    if (isGeneratingUrlRef.current || !isMountedRef.current) return null;
    
    // Path hasn't changed - no need to regenerate
    if (currentDicomPathRef.current === dicomPath && signedUrl) {
      console.log("useSignedDicomUrl: Using existing URL for same DICOM path");
      return signedUrl;
    }
    
    // Update current path ref
    currentDicomPathRef.current = dicomPath;
    
    // Set loading state using ref to prevent dependency cycle
    isGeneratingUrlRef.current = true;
    
    try {
      console.log("useSignedDicomUrl: Generating signed URL for:", dicomPath);
      const url = await getSignedUrl(dicomPath, 3600);
      console.log("useSignedDicomUrl: Signed URL generated:", url);
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setSignedUrl(url);
        setError(null);
      }
      
      return url;
    } catch (error) {
      console.error("useSignedDicomUrl: Failed to generate signed URL:", error);
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setError("Failed to load image URL");
        toast({
          title: "Error",
          description: "Failed to load DICOM image",
          variant: "destructive",
        });
      }
      
      return null;
    } finally {
      isGeneratingUrlRef.current = false;
    }
  }, [signedUrl]);

  // Generate signed URL for DICOM when dicomPath is available
  useEffect(() => {
    if (!dicomPath) return;
    
    console.log("useSignedDicomUrl: DICOM path received:", dicomPath);
    
    // Track previous path to avoid unnecessary regeneration
    const previousPath = currentDicomPathRef.current;
    
    if (previousPath !== dicomPath) {
      console.log("useSignedDicomUrl: DICOM path changed, generating new URL");
      generateSignedUrl(dicomPath);
    } else {
      console.log("useSignedDicomUrl: DICOM path unchanged, skipping URL generation");
    }
  }, [dicomPath, generateSignedUrl]);

  return {
    signedUrl,
    error,
    isGenerating: isGeneratingUrlRef.current,
  };
}
