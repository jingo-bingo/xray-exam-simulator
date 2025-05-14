
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export const useDicomUpload = (
  onUploadComplete: (filePath: string) => void,
  initialFilePath: string | null = null
) => {
  const [uploading, setUploading] = useState(false);
  const [filePath, setFilePath] = useState<string | null>(initialFilePath);

  const handleFileUpload = async (file: File) => {
    try {
      console.log("useDicomUpload: File selected for upload:", file.name);
      
      // Start upload
      setUploading(true);
      
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
        toast.error("Error uploading file: " + uploadError.message);
        return;
      }
      
      console.log("useDicomUpload: File uploaded successfully");
      
      // Set the file path and notify parent
      setFilePath(newFilePath);
      onUploadComplete(newFilePath);
      
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("useDicomUpload: Error in handleFileUpload:", error);
      toast.error("An unexpected error occurred during upload");
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
        toast.error("Error removing file: " + error.message);
        return;
      }
      
      console.log("useDicomUpload: File removed successfully");
      setFilePath(null);
      onUploadComplete("");
      toast.success("File removed successfully");
    } catch (error) {
      console.error("useDicomUpload: Error in handleRemoveFile:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return {
    filePath,
    uploading,
    setFilePath,
    handleFileUpload,
    handleRemoveFile
  };
};
