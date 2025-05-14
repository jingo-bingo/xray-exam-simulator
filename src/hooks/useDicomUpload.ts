
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import * as dicomParser from "dicom-parser";

/**
 * Validates if a file is a valid DICOM file
 * @param file The file to validate
 * @returns Promise<boolean> True if the file is a valid DICOM file, false otherwise
 */
const isDicom = async (file: File): Promise<boolean> => {
  console.log("isDicom: Starting DICOM validation for file", file.name);
  
  try {
    // Read the file as an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    console.log("isDicom: File read as ArrayBuffer, size:", arrayBuffer.byteLength);
    
    // Convert to Uint8Array for dicom-parser
    const byteArray = new Uint8Array(arrayBuffer);
    
    // Try to parse the DICOM data
    console.log("isDicom: Attempting to parse DICOM data");
    const dataSet = dicomParser.parseDicom(byteArray);
    
    const isValid = !!dataSet;
    console.log("isDicom: DICOM validation result:", isValid);
    return isValid;
  } catch (error) {
    console.error("isDicom: Error validating DICOM file:", error);
    return false;
  }
};

export const useDicomUpload = (
  onUploadComplete: (filePath: string) => void,
  initialFilePath: string | null = null
) => {
  const [uploading, setUploading] = useState(false);
  const [filePath, setFilePath] = useState<string | null>(initialFilePath);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    try {
      console.log("useDicomUpload: File selected for upload:", file.name);
      setValidationError(null);
      
      // Start validation
      console.log("useDicomUpload: Beginning DICOM validation");
      setUploading(true);
      
      // Check if file is a valid DICOM file
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
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const newFilePath = `${fileName}`;
      
      console.log("useDicomUpload: Uploading file to path:", newFilePath);
      
      const { error: uploadError } = await supabase.storage
        .from("dicom_images")
        .upload(newFilePath, file);
        
      if (uploadError) {
        console.error("useDicomUpload: Error uploading file:", uploadError);
        toast({
          title: "Upload Failed",
          description: "Error uploading file: " + uploadError.message,
          variant: "destructive",
        });
        return;
      }
      
      console.log("useDicomUpload: File uploaded successfully");
      
      // Set the file path and notify parent
      setFilePath(newFilePath);
      onUploadComplete(newFilePath);
      
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
      const { error } = await supabase.storage
        .from("dicom_images")
        .remove([filePath]);
        
      if (error) {
        console.error("useDicomUpload: Error removing file:", error);
        toast({
          title: "Removal Failed",
          description: "Error removing file: " + error.message,
          variant: "destructive",
        });
        return;
      }
      
      console.log("useDicomUpload: File removed successfully");
      setFilePath(null);
      setValidationError(null);
      onUploadComplete("");
      toast({
        title: "File Removed",
        description: "File removed successfully",
      });
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
    setFilePath,
    handleFileUpload,
    handleRemoveFile
  };
};
