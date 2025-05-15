
import { useEffect, useRef, useState } from "react";
import cornerstone from "cornerstone-core";
import { DicomMetadata } from "./DicomMetadataDisplay";
import { useCornerStoneTools } from "@/hooks/useCornerStoneTools";
import { DicomToolbar } from "./DicomToolbar";
import { useDicomLoader } from "@/hooks/useDicomLoader";
import { DicomViewerOverlay } from "./DicomViewerOverlay";

interface DicomViewerProps {
  imageUrl: string;
  alt: string;
  className?: string;
  onError?: (error: Error) => void;
  onMetadataLoaded?: (metadata: DicomMetadata) => void;
}

export const DicomViewer = ({ 
  imageUrl, 
  alt, 
  className, 
  onError,
  onMetadataLoaded 
}: DicomViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [containerStyle, setContainerStyle] = useState<React.CSSProperties>({
    width: '100%',
    height: '100%',
    position: 'relative'
  });
  
  // Load the DICOM image
  const { isLoading, isImageLoaded, error: loadError, image } = useDicomLoader({
    imageUrl,
    element: viewerRef.current,
    onMetadataLoaded,
    onError
  });
  
  // Initialize cornerstone tools
  const {
    isToolsInitialized,
    error: toolsError,
    activeTool,
    activateTool,
    resetView,
    zoomLevel
  } = useCornerStoneTools(viewerRef, isImageLoaded);

  // Update container dimensions based on image size
  useEffect(() => {
    if (!viewerRef.current || !image) return;
    
    // Get the natural dimensions of the image
    const { width, height } = image;
    
    // Set container size based on image dimensions while maintaining aspect ratio
    setContainerStyle({
      width: `${width}px`,
      height: `${height}px`,
      position: 'relative'
    });
    
    // Force cornerstone to update the viewport
    setTimeout(() => {
      if (viewerRef.current) {
        cornerstone.resize(viewerRef.current);
      }
    }, 10);
  }, [image]);

  const displayedError = loadError || toolsError;

  return (
    <div className="flex flex-col">
      {isImageLoaded && (
        <DicomToolbar
          isToolsEnabled={isToolsInitialized && isImageLoaded}
          activeTool={activeTool}
          zoomLevel={zoomLevel}
          onActivateTool={activateTool}
          onResetView={resetView}
          error={toolsError}
        />
      )}
      
      <div style={containerStyle} className="dicom-container">
        <div 
          ref={viewerRef} 
          className={`w-full h-full ${className || ""}`}
          data-testid="dicom-viewer"
        >
          <DicomViewerOverlay
            isLoading={isLoading}
            error={displayedError}
            noImageUrl={!imageUrl && !isLoading && !displayedError}
          />
        </div>
      </div>
    </div>
  );
};
