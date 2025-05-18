
import { useState, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { X, FileImage, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SimpleDicomViewer } from "./SimpleDicomViewer";

interface DicomPreviewProps {
  filePath: string;
  onRemove: () => void;
}

// Cache for signed URLs to avoid unnecessary regeneration
const signedUrlCache = new Map<string, { url: string; expires: number }>();

const DicomPreviewComponent = ({ filePath, onRemove }: DicomPreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [viewerError, setViewerError] = useState<Error | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [fileNotFound, setFileNotFound] = useState(false);

  // Load preview URL when filePath changes
  useEffect(() => {
    const loadPreview = async () => {
      try {
        console.log("DicomPreview: Loading preview for file:", filePath);
        
        // Check for cached URL that isn't expired
        const now = Date.now();
        const cached = signedUrlCache.get(filePath);
        if (cached && cached.expires > now) {
          console.log("DicomPreview: Using cached URL");
          setPreviewUrl(cached.url);
          setViewerError(null);
          setFileNotFound(false);
          
          // Set a timer to check if URL is close to expiration
          const timeToExpiry = cached.expires - now;
          const checkExpiration = setTimeout(() => {
            console.log("DicomPreview: Cached URL is about to expire, will regenerate");
            setIsExpired(true);
          }, Math.max(10000, timeToExpiry - 300000)); // Refresh 5 minutes before expiry or after 10 seconds minimum
          
          return () => clearTimeout(checkExpiration);
        }
        
        // Generate new signed URL
        const { data, error } = await supabase.storage
          .from("dicom_images")
          .createSignedUrl(filePath, 3600);
          
        if (error) {
          console.error("DicomPreview: Error getting signed URL:", error);
          // Check if this is a "not found" error
          if (error.message && error.message.includes("Object not found")) {
            console.log("DicomPreview: File not found in storage");
            setFileNotFound(true);
          }
          return;
        }
        
        if (data) {
          console.log("DicomPreview: Preview URL created:", data.signedUrl);
          
          // Store in cache with expiry time (slightly less than the actual expiry)
          signedUrlCache.set(filePath, {
            url: data.signedUrl,
            expires: now + 3550 * 1000 // 5 minutes less than the hour
          });
          
          setPreviewUrl(data.signedUrl);
          setViewerError(null);
          setFileNotFound(false);
          
          // Set a timer to check if URL is close to expiration
          const checkExpiration = setTimeout(() => {
            console.log("DicomPreview: Signed URL is about to expire, will regenerate");
            setIsExpired(true);
          }, 3000 * 1000); // Check after 50 minutes (URLs valid for 60 minutes)
          
          return () => clearTimeout(checkExpiration);
        }
      } catch (error) {
        console.error("DicomPreview: Error in loadPreview:", error);
      }
    };

    if (filePath) {
      loadPreview();
    }
    
    // Reset expired state when filePath changes
    setIsExpired(false);
  }, [filePath, isExpired]);

  const handleViewerError = (error: Error) => {
    console.error("DicomPreview: DICOM Viewer error:", error);
    setViewerError(error);
  };

  if (fileNotFound) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The DICOM file could not be found in storage. The file may have been deleted or moved.
          </AlertDescription>
        </Alert>
        
        <div className="flex items-center justify-center border rounded-md h-48 bg-gray-50">
          <div className="text-center">
            <FileImage className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm">File reference exists but file is missing</p>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={onRemove}
              className="mt-2"
            >
              Remove Reference
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!previewUrl) {
    return (
      <div className="flex items-center justify-center border rounded-md h-48 bg-gray-50">
        <div className="text-center">
          <FileImage className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm">Loading preview...</p>
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
      <div className="w-full h-48">
        <SimpleDicomViewer 
          imageUrl={previewUrl}
          alt="DICOM preview"
          className="w-full h-full object-contain border rounded-md"
          onError={handleViewerError}
        />
      </div>
      
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

// Memoize the component to prevent unnecessary re-renders
export const DicomPreview = memo(DicomPreviewComponent);
