
import { useState, useEffect, useCallback, useRef } from "react";
import { fileExists } from "@/utils/dicomStorage";
import { toast } from "@/components/ui/use-toast";
import { handleDicomFileUpload, handleDicomFileRemoval, processUploadResult } from "@/utils/dicomFileHandler";

export interface UseDicomUploadOptions {
  /**
   * If true, the uploaded file will be considered temporary 
   * and may be cleaned up if not permanently attached to a case
   */
  isTemporaryUpload?: boolean;
}

/**
 * Hook for managing DICOM file uploads, providing state and handlers
 */
export const useDicomUpload = (
  onUploadComplete: (filePath: string) => void,
  initialFilePath: string | null = null,
  options: UseDicomUploadOptions = {}
) => {
  const { isTemporaryUpload = false } = options;
  
  const [uploading, setUploading] = useState(false);
  const [filePath, setFilePath] = useState<string | null>(initialFilePath);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fileCheckComplete, setFileCheckComplete] = useState(false);
  const [fileIsMissing, setFileIsMissing] = useState(false);
  
  // Use refs for stable callback references
  const onUploadCompleteRef = useRef(onUploadComplete);
  const initialFileRef = useRef(initialFilePath);
  
  // Update refs when props change
  useEffect(() => {
    onUploadCompleteRef.current = onUploadComplete;
    initialFileRef.current = initialFilePath;
  }, [onUploadComplete, initialFilePath]);

  // Check if the initial file exists when component mounts
  useEffect(() => {
    const checkInitialFile = async () => {
      if (!initialFilePath) {
        setFileCheckComplete(true);
        return;
      }
      
      console.log("useDicomUpload: Checking if initial file exists:", initialFilePath);
      
      const exists = await fileExists(initialFilePath);
      if (!exists) {
        console.log("useDicomUpload: Initial file is missing");
        setFileIsMissing(true);
      }
      
      setFileCheckComplete(true);
    };
    
    checkInitialFile();
  }, [initialFilePath]);

  // Use useCallback for handler functions to maintain stability
  const handleFileUpload = useCallback(async (file: File) => {
    try {
      console.log("useDicomUpload: File selected for upload:", file.name);
      setValidationError(null);
      setUploading(true);
      
      const result = await handleDicomFileUpload(file, isTemporaryUpload);
      
      if (!result.success) {
        setValidationError(result.error || "Unknown validation error");
        processUploadResult(result);
        return;
      }
      
      // Set the file path and notify parent
      setFilePath(result.filePath);
      setFileIsMissing(false);
      
      if (result.filePath) {
        onUploadCompleteRef.current(result.filePath);
      }
      
      processUploadResult(result);
    } catch (error) {
      console.error("useDicomUpload: Error in handleFileUpload:", error);
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred during upload",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  }, [isTemporaryUpload]);

  const handleRemoveFile = useCallback(async () => {
    if (!filePath) return;
    
    console.log("useDicomUpload: Removing file:", filePath);
    
    try {
      const removed = await handleDicomFileRemoval(filePath);
      
      // Always update the UI state, even if removal failed
      setFilePath(null);
      setValidationError(null);
      setFileIsMissing(false);
      onUploadCompleteRef.current("");
      
      if (removed) {
        toast({
          title: "File Removed",
          description: "File reference removed successfully",
        });
      } else {
        toast({
          title: "Removal Note",
          description: "File reference removed, but there may have been an issue deleting the actual file.",
        });
      }
    } catch (error) {
      console.error("useDicomUpload: Error in handleRemoveFile:", error);
      toast({
        title: "Removal Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  }, [filePath]);

  return {
    filePath,
    uploading,
    validationError,
    fileIsMissing,
    fileCheckComplete,
    setFilePath,
    handleFileUpload,
    handleRemoveFile
  };
};
