
import { toast } from "@/components/ui/use-toast";
import { isDicom } from "./dicomValidator";
import { uploadDicomFile, removeDicomFile } from "./dicomStorage";

/**
 * Interface for file upload result
 */
export interface DicomFileUploadResult {
  success: boolean;
  filePath: string | null;
  error?: string;
}

/**
 * Handles the DICOM file upload process including validation
 * 
 * @param file The file to upload
 * @param isTemporary Whether the upload is temporary
 * @returns Promise with the upload result
 */
export const handleDicomFileUpload = async (
  file: File,
  isTemporary: boolean = false
): Promise<DicomFileUploadResult> => {
  try {
    console.log("handleDicomFileUpload: Processing file:", file.name);
    
    // Validate if the file is a valid DICOM
    const isValidDicom = await isDicom(file);
    
    if (!isValidDicom) {
      console.warn("handleDicomFileUpload: File is not a valid DICOM file:", file.name);
      return {
        success: false,
        filePath: null,
        error: "The selected file is not a valid DICOM file"
      };
    }
    
    console.log("handleDicomFileUpload: File validation successful, proceeding with upload");
    
    // Upload the validated file
    const uploadPath = await uploadDicomFile(file, isTemporary);
    
    if (!uploadPath) {
      return {
        success: false,
        filePath: null,
        error: "Error uploading file. Please try again."
      };
    }
    
    console.log("handleDicomFileUpload: File uploaded successfully");
    
    return {
      success: true,
      filePath: uploadPath
    };
  } catch (error) {
    console.error("handleDicomFileUpload: Error:", error);
    return {
      success: false,
      filePath: null,
      error: "An unexpected error occurred during upload"
    };
  }
};

/**
 * Handles the removal of a DICOM file
 * 
 * @param filePath The path of the file to remove
 * @returns Promise with the removal success status
 */
export const handleDicomFileRemoval = async (filePath: string): Promise<boolean> => {
  if (!filePath) return true;
  
  console.log("handleDicomFileRemoval: Removing file:", filePath);
  
  try {
    const removed = await removeDicomFile(filePath);
    return removed;
  } catch (error) {
    console.error("handleDicomFileRemoval: Error:", error);
    return false;
  }
};

/**
 * Shows appropriate notifications based on file upload result
 * 
 * @param result The upload result to process
 */
export const processUploadResult = (result: DicomFileUploadResult): void => {
  if (result.success) {
    toast({
      title: "Upload Successful",
      description: "DICOM file uploaded successfully"
    });
  } else {
    toast({
      title: "Upload Error",
      description: result.error || "An error occurred during upload",
      variant: "destructive"
    });
  }
};
