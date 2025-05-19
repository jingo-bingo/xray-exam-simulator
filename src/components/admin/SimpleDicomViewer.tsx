
import { useRef, memo } from "react";
import { DicomMetadata } from "./DicomMetadataDisplay";
import { useSimpleCornerstoneInit } from "@/hooks/useSimpleCornerstoneInit";
import { useSimpleCornerstoneImage } from "@/hooks/useSimpleCornerstoneImage";
import { DicomViewerOverlay } from "./DicomViewerOverlay";

interface SimpleDicomViewerProps {
  imageUrl: string;
  alt?: string;
  className?: string;
  onError?: (error: Error) => void;
  onMetadataLoaded?: (metadata: DicomMetadata) => void;
  instanceId?: string;
}

// Define the component with memo to prevent unnecessary re-renders
const SimpleDicomViewerComponent = ({ 
  imageUrl, 
  alt, 
  className = "", 
  onError,
  onMetadataLoaded,
  instanceId = "default"
}: SimpleDicomViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  
  // Initialize cornerstone
  const { isInitialized, error: initError } = useSimpleCornerstoneInit(instanceId);
  
  // Handle image loading
  const { 
    isLoading, 
    error: imageError, 
    imageDisplayed,
    loadImage
  } = useSimpleCornerstoneImage(viewerRef, isInitialized, onMetadataLoaded, instanceId);
  
  // Load image when URL changes or when cornerstone is initialized
  React.useEffect(() => {
    if (isInitialized && imageUrl) {
      loadImage(imageUrl).catch((error) => {
        console.error(`SimpleDicomViewer[${instanceId}]: Error during image loading:`, error);
        if (onError) {
          onError(error instanceof Error ? error : new Error("Failed to load image"));
        }
      });
    }
  }, [imageUrl, isInitialized, instanceId]);
  
  // Handle errors from initialization or image loading
  React.useEffect(() => {
    const error = initError || imageError;
    
    if (error && onError) {
      onError(new Error(error));
    }
  }, [initError, imageError, onError]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={viewerRef} 
        className={`w-full h-full ${className}`}
        data-instance-id={instanceId}
        data-testid="simple-dicom-viewer"
      >
        <DicomViewerOverlay 
          isLoading={isLoading || (!isInitialized && !initError)} 
          error={initError || imageError}
          hasImage={imageDisplayed && !!imageUrl}
          noImageMessage={!imageUrl ? "No image available" : "Loading image..."}
        />
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const SimpleDicomViewer = memo(SimpleDicomViewerComponent);
