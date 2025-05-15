
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if a file exists in storage
 */
export const fileExists = async (filePath: string): Promise<boolean> => {
  if (!filePath) return false;
  
  try {
    const { data, error } = await supabase.storage
      .from("dicom_images")
      .createSignedUrl(filePath, 10); // Short expiry just to check existence
      
    return !error && !!data;
  } catch (error) {
    console.error("Error checking if file exists:", error);
    return false;
  }
};

/**
 * Makes a temporary file permanent by copying it with a non-temporary name
 */
export const makeDicomFilePermanent = async (tempFilePath: string): Promise<string | null> => {
  if (!tempFilePath) return null;
  
  // Only process files with the temp_ prefix
  if (!tempFilePath.startsWith('temp_')) {
    console.log("File is already permanent:", tempFilePath);
    return tempFilePath;
  }
  
  try {
    console.log("Making file permanent:", tempFilePath);
    
    // Create a new permanent file path by removing the temp_ prefix
    const permanentFilePath = tempFilePath.replace('temp_', '');
    
    // First download the temp file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('dicom_images')
      .download(tempFilePath);
      
    if (downloadError || !fileData) {
      console.error("Error downloading temporary file:", downloadError);
      return null;
    }
    
    // Upload to the new permanent location
    const { error: uploadError } = await supabase.storage
      .from('dicom_images')
      .upload(permanentFilePath, fileData, {
        contentType: 'application/dicom',
        upsert: true
      });
      
    if (uploadError) {
      console.error("Error uploading permanent file:", uploadError);
      return null;
    }
    
    // Delete the temporary file
    await supabase.storage
      .from('dicom_images')
      .remove([tempFilePath]);
      
    console.log("File made permanent:", permanentFilePath);
    return permanentFilePath;
  } catch (error) {
    console.error("Error making file permanent:", error);
    return null;
  }
};
