
import { supabase } from "@/integrations/supabase/client";

// URL cache to prevent unnecessary regeneration
interface CachedUrl {
  url: string;
  expiry: number; // Timestamp when the URL expires
}

// Global cache with improved buffer time management
const urlCache: Record<string, CachedUrl> = {};
// Track ongoing URL generation requests to prevent duplicates
const pendingUrlRequests: Record<string, Promise<string | null>> = {};

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

/**
 * Uploads a DICOM file to storage with a temporary or permanent path
 */
export const uploadDicomFile = async (
  file: File, 
  isTemporary: boolean = false
): Promise<string | null> => {
  try {
    console.log("uploadDicomFile: Uploading file:", file.name, "temporary:", isTemporary);
    
    // Create a unique file path - preserve original filename when possible
    // but ensure it has a unique identifier
    const uniqueId = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    const fileName = file.name.includes('.') 
      ? `${uniqueId}_${file.name}` 
      : `${uniqueId}_${file.name}`;
    
    // For temporary uploads, prepend a special prefix to make them easier to identify later
    const uploadPath = isTemporary ? `temp_${fileName}` : fileName;
    
    console.log("uploadDicomFile: Upload path:", uploadPath);
    
    const { error: uploadError } = await supabase.storage
      .from("dicom_images")
      .upload(uploadPath, file, {
        contentType: "application/dicom"
      });
      
    if (uploadError) {
      console.error("uploadDicomFile: Error uploading file:", uploadError);
      return null;
    }
    
    console.log("uploadDicomFile: File uploaded successfully");
    return uploadPath;
  } catch (error) {
    console.error("uploadDicomFile: Error:", error);
    return null;
  }
};

/**
 * Removes a file from storage
 */
export const removeDicomFile = async (filePath: string): Promise<boolean> => {
  if (!filePath) return true;
  
  try {
    console.log("removeDicomFile: Removing file:", filePath);
    
    // First, check if the file exists to avoid unnecessary errors
    const exists = await fileExists(filePath);
    
    // Only try to delete if the file exists
    if (exists) {
      const { error } = await supabase.storage
        .from("dicom_images")
        .remove([filePath]);
        
      if (error) {
        console.error("removeDicomFile: Error removing file:", error);
        return false;
      }
      
      console.log("removeDicomFile: File removed successfully");
      return true;
    } else {
      console.log("removeDicomFile: File doesn't exist, skipping storage deletion");
      return true;
    }
  } catch (error) {
    console.error("removeDicomFile: Error:", error);
    return false;
  }
};

/**
 * Creates a signed URL for a file with improved caching and request deduplication
 * @param filePath Path to the file in storage
 * @param expirySeconds How long the URL should be valid (in seconds)
 * @param forceRefresh Force regeneration even if a cached URL exists
 */
export const getSignedUrl = async (
  filePath: string, 
  expirySeconds: number = 3600,
  forceRefresh: boolean = false
): Promise<string | null> => {
  if (!filePath) return null;
  
  // Early exit if there's an ongoing request for this URL - prevent duplicates
  if (pendingUrlRequests[filePath] && !forceRefresh) {
    console.log("getSignedUrl: Reusing pending request for:", filePath);
    return pendingUrlRequests[filePath];
  }
  
  const generateUrl = async (): Promise<string | null> => {
    try {
      // Check if we have a cached URL that's still valid
      const cachedItem = urlCache[filePath];
      const now = Date.now();
      
      // Use buffer time (2 minutes) to prevent expiry during use
      const bufferTime = 120000; // 2 minutes in milliseconds
      
      // If we have a cached URL that hasn't nearly expired, use it
      if (!forceRefresh && cachedItem && cachedItem.expiry > (now + bufferTime)) {
        console.log("getSignedUrl: Using cached URL for:", filePath);
        return cachedItem.url;
      }
      
      console.log("getSignedUrl: Creating signed URL for:", filePath);
      
      const { data, error } = await supabase.storage
        .from("dicom_images")
        .createSignedUrl(filePath, expirySeconds);
        
      if (error) {
        console.error("getSignedUrl: Error creating signed URL:", error);
        return null;
      }
      
      // Cache the URL with its expiry time (subtract buffer time as a safety margin)
      urlCache[filePath] = {
        url: data.signedUrl,
        expiry: now + (expirySeconds * 1000) - bufferTime
      };
      
      console.log("getSignedUrl: URL created successfully and cached with buffer time");
      return data.signedUrl;
    } catch (error) {
      console.error("getSignedUrl: Error:", error);
      return null;
    } finally {
      // Remove from pending requests
      delete pendingUrlRequests[filePath];
    }
  };
  
  // Store the promise in pending requests to deduplicate simultaneous calls
  pendingUrlRequests[filePath] = generateUrl();
  return pendingUrlRequests[filePath];
};
