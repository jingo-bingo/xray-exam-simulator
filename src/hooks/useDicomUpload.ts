
import { useState, useEffect } from "react";
import { isDicom } from "@/utils/dicomValidator";
import { fileExists, uploadDicomFile, removeDicomFile } from "@/utils/dicomStorage";
import { toast } from "@/components/ui/use-toast";

export interface UseDicomUploadOptions {
  /**
   * If true, the uploaded file will be considered temporary 
   * and may be cleaned up if not permanently attached to a case
   */
  isTemporaryUpload?: boolean;
}

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

  const handleFileUpload = async (file: File) => {
    try {
      console.log("useDicomUpload: File selected for upload:", file.name);
      setValidationError(null);
      
      // Start validation
      console.log("useDicomUpload: Beginning DICOM validation");
      setUploading(true);
      
      // Check if file is a valid DICOM file by content, not extension
      const isValidDicom = await isDicom(file);
      
      if (!isValidDicom) {
        console.warn("useDicomUpload: File is not a valid DICOM file:", file.name);
        setUploading(false);
        setValidationError("The selected file is not a valid DICOM file");
        toast({
          title: "Invalid File Format",
          description: "The selected file is not a valid DICOM file. Please upload a proper DICOM file.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("useDicomUpload: File validation successful, proceeding with upload");
      
      const uploadPath = await uploadDicomFile(file, isTemporaryUpload);
      if (!uploadPath) {
        toast({
          title: "Upload Failed",
          description: "Error uploading file. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("useDicomUpload: File uploaded successfully");
      
      // Set the file path and notify parent
      setFilePath(uploadPath);
      setFileIsMissing(false);
      onUploadComplete(uploadPath);
      
      toast({
        title: "Upload Successful",
        description: "DICOM file uploaded successfully",
      });
    } catch (error) {
      console.error("useDicomUpload: Error in handleFileUpload:", error);
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = async () => {
    if (!filePath) return;
    
    console.log("useDicomUpload: Removing file:", filePath);
    
    try {
      const removed = await removeDicomFile(filePath);
      
      // Always update the UI state, even if removal failed
      setFilePath(null);
      setValidationError(null);
      setFileIsMissing(false);
      onUploadComplete("");
      
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
        variant: "destructive",
      });
    }
  };

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
