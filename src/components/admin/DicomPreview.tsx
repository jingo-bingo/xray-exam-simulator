
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, FileImage } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DicomViewer } from "./DicomViewer";

interface DicomPreviewProps {
  filePath: string;
  onRemove: () => void;
}

export const DicomPreview = ({ filePath, onRemove }: DicomPreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [viewerError, setViewerError] = useState<Error | null>(null);

  // Load preview URL when filePath changes
  useEffect(() => {
    const loadPreview = async () => {
      try {
        console.log("DicomPreview: Loading preview for file:", filePath);
        const { data, error } = await supabase.storage
          .from("dicom_images")
          .createSignedUrl(filePath, 3600);
          
        if (error) {
          console.error("DicomPreview: Error getting signed URL:", error);
          return;
        }
        
        if (data) {
          console.log("DicomPreview: Preview URL created:", data.signedUrl);
          setPreviewUrl(data.signedUrl);
          setViewerError(null);
        }
      } catch (error) {
        console.error("DicomPreview: Error in loadPreview:", error);
      }
    };

    if (filePath) {
      loadPreview();
    }
  }, [filePath]);

  const handleViewerError = (error: Error) => {
    console.error("DicomPreview: DICOM Viewer error:", error);
    setViewerError(error);
  };

  if (!previewUrl) {
    return (
      <div className="flex items-center justify-center border rounded-md h-48 bg-gray-50">
        <div className="text-center">
          <FileImage className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm">File uploaded but preview not available</p>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={onRemove}
            className="mt-2"
          >
            Remove File
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <DicomViewer 
        imageUrl={previewUrl}
        alt="DICOM preview"
        className="w-full h-48 object-contain border rounded-md"
        onError={handleViewerError}
      />
      
      {viewerError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 border rounded-md">
          <div className="text-center p-4">
            <FileImage className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Unable to preview this file
            </p>
            <p className="text-xs text-gray-400">
              {viewerError.message || "The file may not be in a supported format"}
            </p>
          </div>
        </div>
      )}
      
      <Button 
        variant="destructive" 
        size="icon" 
        className="absolute top-2 right-2"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
