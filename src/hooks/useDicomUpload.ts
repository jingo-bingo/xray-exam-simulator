
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import * as dicomParser from "dicom-parser";

/**
 * Validates if a file is a valid DICOM file by examining its content
 * rather than relying on file extension
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
    
    // Check for DICM magic number at byte offset 128
    if (byteArray.length > 132) {
      const magicBytes = String.fromCharCode(
        byteArray[128], byteArray[129], byteArray[130], byteArray[131]
      );
      console.log("isDicom: Magic bytes at position 128:", magicBytes);
      
      if (magicBytes === "DICM") {
        console.log("isDicom: DICM magic number found - definitely a DICOM file");
        return true;
      }
    }
    
    // If no magic number, try parsing anyway (some DICOM files don't have the magic number)
    console.log("isDicom: No DICM magic number found, attempting to parse DICOM data");
    const dataSet = dicomParser.parseDicom(byteArray);
    
    // Check if the dataset contains some common DICOM tags
    const hasDicomTags = !!dataSet && (
      dataSet.elements.x00080008 || // ImageType
      dataSet.elements.x00080060 || // Modality
      dataSet.elements.x00080070 || // Manufacturer
      dataSet.elements.x00100010 || // PatientName
      dataSet.elements.x00200010    // StudyID
    );
    
    console.log("isDicom: DICOM validation result:", hasDicomTags);
    return hasDicomTags;
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
      
      // Create a unique file path - preserve original filename when possible
      // but ensure it has a unique identifier
      const uniqueId = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
      const fileName = file.name.includes('.') 
        ? `${uniqueId}_${file.name}` 
        : `${uniqueId}_${file.name}`;
      
      console.log("useDicomUpload: Uploading file to path:", fileName);
      
      const { error: uploadError } = await supabase.storage
        .from("dicom_images")
        .upload(fileName, file, {
          contentType: "application/dicom" // Try to set the proper MIME type
        });
        
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
      setFilePath(fileName);
      onUploadComplete(fileName);
      
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
