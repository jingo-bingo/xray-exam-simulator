
import { useEffect, useRef, useState, memo } from "react";
import cornerstone from "cornerstone-core";
import { DicomMetadata } from "./DicomMetadataDisplay";
import { extractDicomMetadata } from "@/lib/cornerstone/metadataExtractor";
import { getImageId, loadImageSafely } from "@/lib/cornerstone/imageLoader";
import "@/lib/cornerstone/cornerstoneInit";

interface DicomViewerProps {
  imageUrl: string;
  alt: string;
  className?: string;
  onError?: (error: Error) => void;
  onMetadataLoaded?: (metadata: DicomMetadata) => void;
}

// Using memo to prevent unnecessary re-renders
export const DicomViewer = memo(({ 
  imageUrl, 
  alt, 
  className, 
  onError,
  onMetadataLoaded 
}: DicomViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingAttemptRef = useRef<AbortController | null>(null);
  const currentImageUrlRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Set up cleanup function
    return () => {
      console.log("DicomViewer: Component unmounting");
      isMounted.current = false;
      
      // Abort any pending load operations
      if (loadingAttemptRef.current) {
        loadingAttemptRef.current.abort();
        loadingAttemptRef.current = null;
      }
      
      // Clean up cornerstone element if it exists
      if (viewerRef.current) {
        try {
          cornerstone.disable(viewerRef.current);
        } catch (error) {
          console.warn("DicomViewer: Error during cleanup:", error);
        }
      }
    };
  }, []);

  useEffect(() => {
    const loadImage = async () => {
      if (!viewerRef.current || !imageUrl) return;
      
      // Skip if URL hasn't changed to prevent unnecessary reloads
      if (currentImageUrlRef.current === imageUrl) {
        console.log("DicomViewer: URL unchanged, skipping reload");
        return;
      }
      
      console.log("DicomViewer: Initializing viewer for image:", imageUrl);
      currentImageUrlRef.current = imageUrl;
      
      // Reset states when URL changes
      setIsLoading(true);
      setError(null);
      
      // Create abort controller for this loading attempt
      if (loadingAttemptRef.current) {
        loadingAttemptRef.current.abort();
      }
      loadingAttemptRef.current = new AbortController();
      const { signal } = loadingAttemptRef.current;
      
      // Clean up previous instance if necessary
      try {
        if (viewerRef.current) {
          cornerstone.disable(viewerRef.current);
        }
      } catch (error) {
        console.warn("DicomViewer: Error during cleanup:", error);
      }
      
      // Enable the element for cornerstone
      const element = viewerRef.current;
      
      try {
        cornerstone.enable(element);
        console.log("DicomViewer: Cornerstone enabled on element");
      } catch (error) {
        console.error("DicomViewer: Error enabling cornerstone:", error);
        if (!isMounted.current) return;
        
        setError("Failed to initialize viewer");
        setIsLoading(false);
        if (onError) onError(new Error("Failed to initialize DICOM viewer"));
        return;
      }
      
      // Try to load as DICOM first, regardless of file extension
      console.log("DicomViewer: Attempting to load as DICOM first");
      const imageId = getImageId(imageUrl);
      console.log("DicomViewer: Using imageId:", imageId);

      // Load the image
      try {
        const image = await loadImageSafely(imageId, true, signal);
        
        // Check if component is still mounted
        if (!isMounted.current) return;
        
        console.log("DicomViewer: Image loaded successfully, metadata:", image.imageId);
        
        // Extract metadata before displaying the image
        const metadata = extractDicomMetadata(image);
        
        // Display the image
        cornerstone.displayImage(element, image);
        console.log("DicomViewer: Image displayed successfully");
        
        // Notify parent about metadata
        if (onMetadataLoaded) {
          console.log("DicomViewer: Notifying parent about metadata");
          onMetadataLoaded(metadata);
        }
        
        setIsLoading(false);
      } catch (error) {
        // Check if component is still mounted
        if (!isMounted.current) return;
        
        console.error("DicomViewer: All image loading attempts failed:", error);
        setError(error instanceof Error ? error.message : "Failed to load image");
        if (onError) onError(error instanceof Error ? error : new Error("Failed to load image"));
        setIsLoading(false);
      }
    };
    
    loadImage();
    
  }, [imageUrl, onError, onMetadataLoaded]);

  return (
    <div 
      ref={viewerRef} 
      className={className || "w-full h-48 border rounded-md bg-black"}
      data-testid="dicom-viewer"
    >
      {isLoading && (
        <div className="flex items-center justify-center h-full text-white bg-opacity-70 bg-black absolute inset-0">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-2"></div>
            <div>Loading DICOM image...</div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="flex items-center justify-center h-full text-red-400 bg-opacity-70 bg-black absolute inset-0">
          <div className="text-center p-4">
            <div className="font-bold mb-2">Error</div>
            <div>{error}</div>
          </div>
        </div>
      )}
      
      {!imageUrl && !isLoading && !error && (
        <div className="flex items-center justify-center h-full text-white">No image available</div>
      )}
    </div>
  );
});

// Set display name for better debugging
DicomViewer.displayName = 'DicomViewer';
