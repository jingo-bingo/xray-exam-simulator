import { useEffect, useRef, useState } from "react";
import cornerstone from "cornerstone-core";
import cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import cornerstoneTools from "cornerstone-tools";
import dicomParser from "dicom-parser";
import { DicomMetadata } from "./DicomMetadataDisplay";
import { useCornerStoneTools } from "@/hooks/useCornerStoneTools";
import { DicomToolbar } from "./DicomToolbar";

// Define types for cornerstone custom events
interface CornerstoneToolsMouseEvent extends Event {
  detail: {
    element: HTMLElement;
    currentPoints: {
      canvas: { x: number; y: number };
      image: { x: number; y: number };
    };
    lastPoints: {
      canvas: { x: number; y: number };
      image: { x: number; y: number };
    };
    deltaPoints?: {
      canvas: { x: number; y: number };
      image: { x: number; y: number };
    };
    buttons?: number;
    which?: number;
  };
}

// Track global initialization state
let cornerstoneInitialized = false;

// One-time initialization function for cornerstone libraries
function initializeCornerstone() {
  if (cornerstoneInitialized) {
    console.log("DicomViewer: Cornerstone already initialized, skipping initialization");
    return true;
  }
  
  try {
    console.log("DicomViewer: Starting cornerstone initialization sequence");
    
    // Check library availability
    if (!cornerstone || !cornerstoneTools) {
      console.error("DicomViewer: Required libraries not available");
      return false;
    }
    
    // Set up external dependencies in the correct order
    console.log("DicomViewer: Setting up external dependencies");
    
    // Set up cornerstone-tools external dependencies
    if (!cornerstoneTools.external) {
      cornerstoneTools.external = {};
    }
    cornerstoneTools.external.cornerstone = cornerstone;
    
    // Set up loaders external dependencies
    cornerstoneWebImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    
    // Initialize image loaders
    cornerstone.registerImageLoader("webImage", cornerstoneWebImageLoader.loadImage);
    cornerstone.registerImageLoader("wadouri", cornerstoneWADOImageLoader.wadouri.loadImage);
    
    // CRITICAL: Initialize cornerstone tools
    console.log("DicomViewer: Initializing cornerstone tools");
    cornerstoneTools.init({
      mouseEnabled: true,
      touchEnabled: true,
      globalToolSyncEnabled: false, 
      showSVGCursors: true
    });
    
    // Register the tools we need
    cornerstoneTools.addTool(cornerstoneTools.PanTool);
    cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
    cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
    
    // Configure WADO image loader with conservative memory settings
    cornerstoneWADOImageLoader.configure({
      useWebWorkers: false,
      decodeConfig: {
        convertFloatPixelDataToInt: false,
        use16Bits: true,
        maxWebWorkers: 1,
        preservePixelData: false // Don't keep raw pixel data in memory
      },
      // Set a smaller max cache size to prevent memory issues
      maxCacheSize: 50 // Default is 100
    });

    // Mark as initialized
    cornerstoneInitialized = true;
    console.log("DicomViewer: Cornerstone libraries initialized successfully");
    
    return true;
  } catch (error) {
    console.error("DicomViewer: Failed to initialize cornerstone libraries:", error);
    return false;
  }
}

// Cache for loaded images to prevent re-fetching
const imageCache = new Map<string, any>();
// Track active loading operations to prevent duplicate loads
const activeLoads = new Map<string, Promise<any>>();

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

  // Extract DICOM metadata from the image
  const extractMetadata = (image: any): DicomMetadata => {
    console.log("DicomViewer: Extracting metadata from image");
    
    try {
      const metadata: DicomMetadata = {};
      
      // Try to get modality
      try {
        // Check if we have DICOM metadata
        if (image.data && image.data.string) {
          metadata.modality = image.data.string('x00080060');
          console.log("DicomViewer: Extracted modality:", metadata.modality);
        }
      } catch (err) {
        console.warn("DicomViewer: Failed to extract modality:", err);
      }
      
      // Get image dimensions
      try {
        metadata.dimensions = {
          width: image.width,
          height: image.height
        };
        console.log("DicomViewer: Extracted dimensions:", metadata.dimensions);
      } catch (err) {
        console.warn("DicomViewer: Failed to extract dimensions:", err);
      }
      
      // Try to get pixel spacing (mm per pixel)
      try {
        if (image.data && image.data.string) {
          const pixelSpacingStr = image.data.string('x00280030');
          if (pixelSpacingStr) {
            const [rowSpacing, colSpacing] = pixelSpacingStr.split('\\').map(Number);
            metadata.pixelSpacing = {
              width: colSpacing,
              height: rowSpacing
            };
            console.log("DicomViewer: Extracted pixel spacing:", metadata.pixelSpacing);
          }
        }
      } catch (err) {
        console.warn("DicomViewer: Failed to extract pixel spacing:", err);
      }
      
      return metadata;
    } catch (error) {
      console.error("DicomViewer: Error extracting metadata:", error);
      return {};
    }
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
      } catch (error) {
        console.error("DicomViewer: Error enabling cornerstone:", error);
        if (!isMounted.current) return;
        
        setError("Failed to initialize viewer");
        setIsLoading(false);
        if (onError) onError(new Error("Failed to initialize DICOM viewer"));
        return;
      }
      
      // Ensure element is properly configured for interactions
      element.style.touchAction = 'none';
      element.style.pointerEvents = 'all';
      element.tabIndex = 0;
      element.dataset.cornerstoneEnabled = 'true';
      
      // Prevent context menu on right-click if using right mouse button for tools
      element.addEventListener('contextmenu', function(e) {
        e.preventDefault();
      });
      
      // Determine image type based on URL
      const getImageId = (url: string) => {
        if (url.startsWith('http')) {
          return `wadouri:${url}`;
        }
        
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
        const isImageFormat = imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
        
        return isImageFormat ? `webImage:${url}` : `wadouri:${url}`;
      };
      
      // Try to load as DICOM first, regardless of file extension
      console.log("DicomViewer: Attempting to load as DICOM first");
      const imageId = getImageId(imageUrl);
      console.log("DicomViewer: Using imageId:", imageId);
      
      // Function to handle loading with memory consideration and caching
      const loadImageSafely = async (imageId: string, isDicomAttempt = true) => {
        // Check if loading operation was aborted
        if (signal.aborted) {
          throw new Error("Loading aborted");
        }
        
        // Check if we already have this image in our cache
        if (imageCache.has(imageId)) {
          console.log(`DicomViewer: Using cached image for ${imageId}`);
          return imageCache.get(imageId);
        }
        
        // Check if this image is already being loaded
        if (activeLoads.has(imageId)) {
          console.log(`DicomViewer: Reusing existing load promise for ${imageId}`);
          return activeLoads.get(imageId);
        }
        
        // Create a new load promise
        const loadPromise = (async () => {
          try {
            console.log(`DicomViewer: Loading with imageId: ${imageId}`);
            const image = await cornerstone.loadImage(imageId);
            
            // Cache the image for future use
            imageCache.set(imageId, image);
            return image;
          } catch (error: any) {
            console.error(`DicomViewer: Error loading image with ${imageId}:`, error);
            
            if (signal.aborted) {
              throw new Error("Loading aborted during attempt");
            }
            
            // If we get a memory allocation error, try downsampling
            if (error instanceof RangeError || (error.message && error.message.includes("buffer allocation failed"))) {
              console.log("DicomViewer: Memory error detected, trying with downsampling");
              
              // Try with more aggressive settings for large files
              cornerstoneWADOImageLoader.configure({
                decodeConfig: {
                  convertFloatPixelDataToInt: true, // Convert to int to save memory
                  use16Bits: false, // Use 8-bit instead of 16-bit
                  maxWebWorkers: 0,
                  preservePixelData: false
                },
                maxCacheSize: 10 // Reduce cache size significantly
              });
              
              // Try loading with different options to reduce memory usage
              if (isDicomAttempt) {
                console.log("DicomViewer: Trying with image downsampling");
                // Add image processing URL parameters for downsampling
                const image = await cornerstone.loadImage(`${imageId}?quality=50&downsampleFactor=2`);
                imageCache.set(imageId, image);
                return image;
              }
            }
            
            // If this was a DICOM attempt and it failed, try as a web image
            if (isDicomAttempt && imageUrl.startsWith('http')) {
              console.log("DicomViewer: DICOM load failed, trying as web image");
              const webImageId = `webImage:${imageUrl}`;
              
              // Remove this load from active loads to allow retry
              activeLoads.delete(imageId);
              
              return loadImageSafely(webImageId, false);
            }
            
            // Both attempts failed
            throw error;
          } finally {
            // Remove from active loads when done
            activeLoads.delete(imageId);
          }
        })();
        
        // Store the promise in activeLoads
        activeLoads.set(imageId, loadPromise);
        
        return loadPromise;
      };

      // Load the image
      try {
        const image = await loadImageSafely(imageId);
        
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

        // Set up the tools directly on the element
        try {
          console.log("DicomViewer: Setting up tools on element after image display");
          
          // Set Pan as the default active tool with left mouse button
          cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 1 });
          
          // Middle mouse button (button 1) for Zoom
          cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 2 });
          
          // Right mouse button (button 2) for Window Level
          cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 4 });
          
          console.log("DicomViewer: Direct tool setup complete");
          
          // Force cornerstone to update the image
          cornerstone.updateImage(element);
        } catch (toolError) {
          console.error("DicomViewer: Error setting up tools:", toolError);
        }
        
        // Notify parent about metadata
        if (onMetadataLoaded) {
          console.log("DicomViewer: Notifying parent about metadata");
          onMetadataLoaded(metadata);
        }
        
        setIsLoading(false);
        setIsImageLoaded(true);
        console.log("DicomViewer: Image loading process complete, isImageLoaded set to true");
        
        // Add diagnostic logging for mouse events
        element.addEventListener('mousedown', (e) => {
          console.log("DicomViewer: Native mousedown event:", {
            button: e.button,
            buttons: e.buttons,
            clientX: e.clientX,
            clientY: e.clientY
          });
        });
        
        element.addEventListener('cornerstonetoolsmousedown', (e: Event) => {
          // Cast the event to our custom event interface
          const csEvent = e as CornerstoneToolsMouseEvent;
          console.log("DicomViewer: Cornerstone tool mousedown event:", csEvent.detail);
        });
        
        // Focus the element to make sure it gets keyboard events
        element.focus();
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
      
      <div style={containerStyle} className="dicom-container">
        <div 
          ref={viewerRef} 
          className={`w-full h-full ${className || ""}`}
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
      </div>
    </div>
  );
};
