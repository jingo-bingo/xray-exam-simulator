
import { useEffect, useRef, useState } from "react";
import cornerstone from "cornerstone-core";
import { useCornerStoneTools } from "@/hooks/useCornerStoneTools";
import { DicomToolbar } from "./DicomToolbar";
import { initializeCornerstone } from "@/utils/cornerstoneInit";
import { extractMetadata } from "@/utils/dicomMetadataExtractor";
import { DicomDebugOverlay } from "./DicomDebugOverlay";
import { getImageId, loadImageSafely } from "@/utils/dicomImageLoader";
import { DicomViewport } from "./DicomViewport";
import { DicomViewerProps } from "./types/CornerstoneTypes";

export const DicomViewer = ({ 
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
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const loadingAttemptRef = useRef<AbortController | null>(null);
  const currentImageUrlRef = useRef<string | null>(null);
  const [containerStyle, setContainerStyle] = useState<React.CSSProperties>({
    width: '100%',
    height: '100%',
    position: 'relative'
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
  const updateContainerSize = (image: any) => {
    if (!viewerRef.current || !image) return;
    
    // Get the natural dimensions of the image
    const { width, height } = image;
    
    console.log("DicomViewer: Updating container size to match image dimensions:", { width, height });
    
    // Set container size based on image dimensions while maintaining aspect ratio
    setContainerStyle({
      width: `${width}px`,
      height: `${height}px`,
      position: 'relative'
    });
    
    // Force cornerstone to update the viewport
    setTimeout(() => {
      if (viewerRef.current) {
        console.log("DicomViewer: Resizing cornerstone element after size update");
        cornerstone.resize(viewerRef.current);
      }
    }, 10);
  };

  // Initialize cornerstone on component mount
  useEffect(() => {
    console.log("DicomViewer: Component mounting");
    
    // Initialize cornerstone libraries
    const initialized = initializeCornerstone();
    if (!initialized && onError) {
      onError(new Error("Failed to initialize DICOM viewer libraries"));
    }
    
    // Set up cleanup function
    return () => {
      console.log("DicomViewer: Component unmounting");
      isMounted.current = false;
      
      // Abort any pending load operations
      if (loadingAttemptRef.current) {
        loadingAttemptRef.current.abort();
        loadingAttemptRef.current = null;
      }
    };
  }, [onError]);
  
  // Handle viewport element enabling
  const handleViewportEnabled = (element: HTMLDivElement) => {
    console.log("DicomViewer: Viewport element enabled");
  };
  
  // Load DICOM image when URL changes
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
      setIsImageLoaded(false);
      
      // Create abort controller for this loading attempt
      if (loadingAttemptRef.current) {
        loadingAttemptRef.current.abort();
      }
      loadingAttemptRef.current = new AbortController();
      const { signal } = loadingAttemptRef.current;
      
      // Try to load as DICOM first
      console.log("DicomViewer: Attempting to load as DICOM first");
      const imageId = getImageId(imageUrl);
      console.log("DicomViewer: Using imageId:", imageId);

      // Load the image
      try {
        const image = await loadImageSafely(imageId, signal);
        
        // Check if component is still mounted
        if (!isMounted.current) return;
        
        console.log("DicomViewer: Image loaded successfully, imageId:", image.imageId);
        
        // Extract metadata before displaying the image
        const metadata = extractMetadata(image);
        
        // Update container size based on image dimensions
        updateContainerSize(image);
        
        // Display the image in its natural size
        console.log("DicomViewer: Displaying image on element");
        cornerstone.displayImage(viewerRef.current, image);
        console.log("DicomViewer: Image displayed successfully");
        
        // Notify parent about metadata
        if (onMetadataLoaded) {
          console.log("DicomViewer: Notifying parent about metadata");
          onMetadataLoaded(metadata);
        }
        
        setIsLoading(false);
        setIsImageLoaded(true);
        console.log("DicomViewer: Image loading process complete, isImageLoaded set to true");
        
        // Add event capture to ensure Cornerstone gets mouse events
        viewerRef.current.style.pointerEvents = 'all';
        viewerRef.current.style.touchAction = 'none'; // Prevent default touch actions
        
        // Force Cornerstone to be ready for mouse events
        cornerstone.resize(viewerRef.current);
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

  const displayedError = error || toolsError;

  return (
    <div className="flex flex-col">
      {isImageLoaded && (
        <DicomToolbar
          isToolsEnabled={isToolsInitialized && isImageLoaded}
          activeTool={activeTool}
          zoomLevel={zoomLevel}
          onActivateTool={(toolName) => {
            console.log(`DicomViewer: Toolbar requested to activate tool: ${toolName}`);
            activateTool(toolName);
          }}
          onResetView={() => {
            console.log("DicomViewer: Toolbar requested to reset view");
            resetView();
          }}
          error={toolsError}
        />
      )}
      
      <div style={containerStyle} className="dicom-container relative">
        <DicomViewport
          ref={viewerRef}
          isLoading={isLoading}
          error={displayedError}
          imageUrl={imageUrl}
          onElementEnabled={handleViewportEnabled}
          className={className || ""}
        />
        
        {viewerRef.current && isImageLoaded && (
          <DicomDebugOverlay 
            element={viewerRef.current} 
            activeTool={activeTool} 
            zoomLevel={zoomLevel} 
          />
        )}
      </div>
    </div>
  );
};
