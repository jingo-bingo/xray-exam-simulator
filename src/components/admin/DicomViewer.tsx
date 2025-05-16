
import { useEffect, useRef, useState } from "react";
import cornerstone from "cornerstone-core";
import { DicomMetadata } from "./DicomMetadataDisplay";
import { useCornerStoneTools } from "@/hooks/useCornerStoneTools";
import { DicomToolbar } from "./DicomToolbar";
import { initializeCornerstone } from "@/utils/cornerstoneInit";
import { extractMetadata } from "@/utils/dicomMetadataExtractor";
import { DicomDebugOverlay } from "./DicomDebugOverlay";
import { getImageId, loadImageSafely } from "@/utils/dicomImageLoader";
import { setupTrackpadSupport, setupEventLogging } from "@/utils/dicomEventHandlers";
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
      
      // Clean up cornerstone element if it exists
      if (viewerRef.current) {
        try {
          cornerstone.disable(viewerRef.current);
        } catch (error) {
          console.warn("DicomViewer: Error during cleanup:", error);
        }
      }
    };
  }, [onError]);
  
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
      
      // Clean up previous instance if necessary
      try {
        if (viewerRef.current) {
          cornerstone.disable(viewerRef.current);
          console.log("DicomViewer: Disabled previous cornerstone element");
        }
      } catch (error) {
        console.warn("DicomViewer: Error during cleanup:", error);
      }
      
      // Enable the element for cornerstone
      const element = viewerRef.current;
      
      try {
        console.log("DicomViewer: Enabling cornerstone on element");
        cornerstone.enable(element);
        console.log("DicomViewer: Cornerstone enabled on element");
        
        // Configure the element for better trackpad support
        setupTrackpadSupport(element);
        
        // Set up event logging
        setupEventLogging(element);
      } catch (error) {
        console.error("DicomViewer: Error enabling cornerstone:", error);
        if (!isMounted.current) return;
        
        setError("Failed to initialize viewer");
        setIsLoading(false);
        if (onError) onError(error instanceof Error ? error : new Error("Failed to initialize DICOM viewer"));
        return;
      }
      
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
        cornerstone.displayImage(element, image);
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
        element.style.pointerEvents = 'all';
        element.style.touchAction = 'none'; // Prevent default touch actions
        
        // Force Cornerstone to be ready for mouse events
        cornerstone.resize(element);
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
        <div 
          ref={viewerRef} 
          className={`w-full h-full ${className || ""} focus:outline-none`}
          data-testid="dicom-viewer"
          tabIndex={0}
        >
          {isLoading && (
            <div className="flex items-center justify-center h-full text-white bg-opacity-70 bg-black absolute inset-0">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-2"></div>
                <div>Loading DICOM image...</div>
              </div>
            </div>
          )}
          
          {displayedError && (
            <div className="flex items-center justify-center h-full text-red-400 bg-opacity-70 bg-black absolute inset-0">
              <div className="text-center p-4">
                <div className="font-bold mb-2">Error</div>
                <div>{displayedError}</div>
              </div>
            </div>
          )}
          
          {!imageUrl && !isLoading && !displayedError && (
            <div className="flex items-center justify-center h-full text-white">No image available</div>
          )}
        </div>
        
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
