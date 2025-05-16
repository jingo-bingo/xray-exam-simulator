import { useEffect, useRef, useState } from "react";
import cornerstone from "cornerstone-core";
import cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import cornerstoneTools from "cornerstone-tools";
import dicomParser from "dicom-parser";
import { DicomMetadata } from "./DicomMetadataDisplay";
import { useCornerStoneTools } from "@/hooks/useCornerStoneTools";
import { DicomToolbar } from "./DicomToolbar";

// Define custom interface for cornerstone tool events
interface CornerstoneToolsEvent extends Event {
  detail?: any;
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
  const debugOverlayRef = useRef<HTMLDivElement | null>(null);
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
      
      // Remove debug overlay if it exists
      if (debugOverlayRef.current && debugOverlayRef.current.parentNode) {
        debugOverlayRef.current.parentNode.removeChild(debugOverlayRef.current);
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

  // Add debug overlay with manual controls
  const addDebugOverlay = (element: HTMLDivElement) => {
    // Check if we already have a debug overlay
    if (debugOverlayRef.current) return;
    
    // Create debug overlay container
    const debugContainer = document.createElement('div');
    debugContainer.style.position = 'absolute';
    debugContainer.style.bottom = '10px';
    debugContainer.style.right = '10px';
    debugContainer.style.zIndex = '1000';
    debugContainer.style.background = 'rgba(0,0,0,0.7)';
    debugContainer.style.padding = '5px';
    debugContainer.style.borderRadius = '5px';
    debugContainer.style.fontSize = '10px';

    const createButton = (name: string, action: () => void) => {
      const btn = document.createElement('button');
      btn.textContent = name;
      btn.style.margin = '2px';
      btn.style.padding = '5px 10px';
      btn.style.background = '#444';
      btn.style.color = 'white';
      btn.style.border = 'none';
      btn.style.borderRadius = '3px';
      btn.style.cursor = 'pointer';
      btn.onclick = action;
      debugContainer.appendChild(btn);
    };

    // Add manual control buttons for direct viewport manipulation
    createButton('Zoom +', () => {
      try {
        const viewport = cornerstone.getViewport(element);
        viewport.scale *= 1.2;
        cornerstone.setViewport(element, viewport);
        console.log('Manual zoom in:', viewport.scale);
      } catch (e) {
        console.error("Debug zoom in error:", e);
      }
    });

    createButton('Zoom -', () => {
      try {
        const viewport = cornerstone.getViewport(element);
        viewport.scale /= 1.2;
        cornerstone.setViewport(element, viewport);
        console.log('Manual zoom out:', viewport.scale);
      } catch (e) {
        console.error("Debug zoom out error:", e);
      }
    });

    createButton('Pan ←', () => {
      try {
        const viewport = cornerstone.getViewport(element);
        viewport.translation.x -= 10;
        cornerstone.setViewport(element, viewport);
        console.log('Manual pan left:', viewport.translation);
      } catch (e) {
        console.error("Debug pan left error:", e);
      }
    });

    createButton('Pan →', () => {
      try {
        const viewport = cornerstone.getViewport(element);
        viewport.translation.x += 10;
        cornerstone.setViewport(element, viewport);
        console.log('Manual pan right:', viewport.translation);
      } catch (e) {
        console.error("Debug pan right error:", e);
      }
    });

    createButton('Reset', () => {
      try {
        cornerstone.reset(element);
        console.log('Manual reset');
      } catch (e) {
        console.error("Debug reset error:", e);
      }
    });

    // Add debug status display
    const statusDisplay = document.createElement('div');
    statusDisplay.style.color = 'white';
    statusDisplay.style.margin = '5px 0';
    statusDisplay.style.fontSize = '9px';
    statusDisplay.textContent = `Active tool: ${activeTool || 'None'}, Zoom: ${Math.round(zoomLevel * 100)}%`;
    debugContainer.appendChild(statusDisplay);

    // Update status periodically
    const updateStatus = () => {
      if (isMounted.current && statusDisplay) {
        try {
          const viewport = cornerstone.getViewport(element);
          statusDisplay.textContent = `Active tool: ${activeTool || 'None'}, Zoom: ${Math.round((viewport?.scale || 1) * 100)}%`;
        } catch (e) {
          // Silently fail
        }
        setTimeout(updateStatus, 500);
      }
    };
    updateStatus();

    // Add to DOM
    element.parentNode?.appendChild(debugContainer);
    debugOverlayRef.current = debugContainer;
    
    console.log("DicomViewer: Added debug overlay");
  };

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
  
  // Add additional event logging for better debugging
  const setupEventLogging = (element: HTMLDivElement) => {
    const logEvent = (event: Event, name: string) => {
      console.log(`DicomViewer: ${name} event`, {
        type: event.type,
        target: event.target,
        currentTarget: event.currentTarget,
        eventPhase: event.eventPhase,
        ...(event instanceof MouseEvent ? {
          clientX: event.clientX,
          clientY: event.clientY,
          button: event.button,
          buttons: event.buttons,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
        } : {}),
        ...(event instanceof WheelEvent ? {
          deltaX: event.deltaX,
          deltaY: event.deltaY,
          deltaMode: event.deltaMode,
          ctrlKey: event.ctrlKey,
        } : {})
      });
    };

    // Log core mouse events
    element.addEventListener('mousedown', e => logEvent(e, 'mousedown'), true);
    element.addEventListener('mousemove', e => logEvent(e, 'mousemove'), true);
    element.addEventListener('mouseup', e => logEvent(e, 'mouseup'), true);
    element.addEventListener('wheel', e => logEvent(e, 'wheel'), true);

    // Log cornerstone-specific events
    element.addEventListener('cornerstonetoolsmousedown', 
      (e: Event) => console.log('cornerstonetoolsmousedown event:', (e as CornerstoneToolsEvent).detail), true);
    element.addEventListener('cornerstonetoolsmousemove', 
      (e: Event) => console.log('cornerstonetoolsmousemove event:', (e as CornerstoneToolsEvent).detail), true);
    element.addEventListener('cornerstonetoolsmouseup', 
      (e: Event) => console.log('cornerstonetoolsmouseup event:', (e as CornerstoneToolsEvent).detail), true);
      
    console.log("DicomViewer: Event logging configured");
  };
  
  // Configure element for optimal trackpad interaction
  const setupTrackpadSupport = (element: HTMLDivElement) => {
    // Essential styles for proper event capture and preventing browser gestures
    element.style.width = '100%';
    element.style.height = '100%';
    element.style.position = 'relative';
    element.style.outline = 'none';
    element.style.webkitUserSelect = 'none'; // Fixed property name
    element.style.userSelect = 'none';
    element.style.touchAction = 'none'; // Critical for proper trackpad/touch handling
    element.tabIndex = 0; // Make element focusable
    
    console.log("DicomViewer: Trackpad support configured");
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
        
        // Configure the element for better trackpad support
        setupTrackpadSupport(element);
        
        // Set up event logging
        setupEventLogging(element);
      } catch (error) {
        console.error("DicomViewer: Error enabling cornerstone:", error);
        if (!isMounted.current) return;
        
        setError("Failed to initialize viewer");
        setIsLoading(false);
        if (onError) onError(new Error("Failed to initialize DICOM viewer"));
        return;
      }
      
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
        
        // Add debug overlay with manual controls
        addDebugOverlay(element);
        
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
      </div>
    </div>
  );
};
