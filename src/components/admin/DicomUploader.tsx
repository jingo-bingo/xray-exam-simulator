
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Upload, X, FileImage } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DicomUploaderProps {
  currentPath: string | null;
  onUploadComplete: (filePath: string) => void;
}

export const DicomUploader = ({ currentPath, onUploadComplete }: DicomUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [filePath, setFilePath] = useState<string | null>(currentPath);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // When component mounts or when currentPath changes, fetch the file URL
  const loadPreview = async () => {
    if (filePath) {
      try {
        console.log("DicomUploader: Loading preview for file:", filePath);
        const { data, error } = await supabase.storage
          .from("dicom_images")
          .createSignedUrl(filePath, 3600);
          
        if (error) {
          console.error("DicomUploader: Error getting signed URL:", error);
          return;
        }
        
        if (data) {
          console.log("DicomUploader: Preview URL created:", data.signedUrl);
          setPreviewUrl(data.signedUrl);
        }
      } catch (error) {
        console.error("DicomUploader: Error in loadPreview:", error);
      }
    }
  };
  
  useState(() => {
    loadPreview();
  });
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      
      console.log("DicomUploader: File selected for upload:", file.name);
      
      // Start upload
      setUploading(true);
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      console.log("DicomUploader: Uploading file to path:", filePath);
      
      const { error: uploadError } = await supabase.storage
        .from("dicom_images")
        .upload(filePath, file);
        
      if (uploadError) {
        console.error("DicomUploader: Error uploading file:", uploadError);
        toast.error("Error uploading file: " + uploadError.message);
        setUploading(false);
        return;
      }
      
      console.log("DicomUploader: File uploaded successfully");
      
      // Set the file path and notify parent
      setFilePath(filePath);
      onUploadComplete(filePath);
      
      // Create preview URL
      const { data } = await supabase.storage
        .from("dicom_images")
        .createSignedUrl(filePath, 3600);
        
      if (data) {
        setPreviewUrl(data.signedUrl);
        console.log("DicomUploader: Preview URL created:", data.signedUrl);
      }
      
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("DicomUploader: Error in handleFileChange:", error);
      toast.error("An unexpected error occurred during upload");
    } finally {
      setUploading(false);
    }
  };
  
  const handleRemoveFile = async () => {
    if (!filePath) return;
    
    console.log("DicomUploader: Removing file:", filePath);
    
    try {
      const { error } = await supabase.storage
        .from("dicom_images")
        .remove([filePath]);
        
      if (error) {
        console.error("DicomUploader: Error removing file:", error);
        toast.error("Error removing file: " + error.message);
        return;
      }
      
      console.log("DicomUploader: File removed successfully");
      setFilePath(null);
      setPreviewUrl(null);
      onUploadComplete("");
      toast.success("File removed successfully");
    } catch (error) {
      console.error("DicomUploader: Error in handleRemoveFile:", error);
      toast.error("An unexpected error occurred");
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="space-y-4 border p-4 rounded-md">
      <Label>DICOM Image</Label>
      
      <Input 
        ref={fileInputRef}
        type="file" 
        accept=".dcm,.dicom,image/*" 
        onChange={handleFileChange}
        className="hidden"
      />
      
      {!filePath ? (
        <div 
          className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50"
          onClick={triggerFileInput}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Click to upload a DICOM image
          </p>
          <p className="text-xs text-gray-400">
            (or any image file for preview purposes)
          </p>
        </div>
      ) : (
        <div className="relative">
          {previewUrl ? (
            <div className="relative">
              <img 
                src={previewUrl} 
                alt="DICOM preview" 
                className="w-full h-48 object-contain border rounded-md" 
              />
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute top-2 right-2"
                onClick={handleRemoveFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center border rounded-md h-48 bg-gray-50">
              <div className="text-center">
                <FileImage className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm">File uploaded but preview not available</p>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleRemoveFile}
                  className="mt-2"
                >
                  Remove File
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {uploading && (
        <div className="text-sm text-center text-primary">
          Uploading...
        </div>
      )}
    </div>
  );
};
