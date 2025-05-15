
import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react";
import cornerstone from "cornerstone-core";
import cornerstoneTools from "cornerstone-tools";
import cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";

// Store initialization state globally to prevent multiple initialization attempts
let cornerstoneInitialized = false;

// Initialize the library dependencies correctly
function initializeCornerstone() {
  if (cornerstoneInitialized) {
    console.log("DicomViewer: Cornerstone already initialized, skipping initialization");
    return true;
  }
  
  try {
    // Enable debugging for cornerstoneTools
    console.log("DicomViewer: Enabling debug mode for cornerstone tools");
    localStorage.setItem("debug", "cornerstoneTools");
    
    console.log("DicomViewer: Starting cornerstone initialization sequence");
    
    // First check if cornerstone is available
    if (!cornerstone) {
      console.error("DicomViewer: Cornerstone library not available");
      return false;
    }
    
    if (!cornerstoneTools) {
      console.error("DicomViewer: CornerstoneTools library not available");
      return false;
    }
    
    // Check if detectPointerEvents module exists already in window
    if (!window.detectPointerEvents) {
      console.log("DicomViewer: Creating pointer events detection polyfill");
      window.detectPointerEvents = {
        hasPointerEvents: 'PointerEvent' in window,
        SUPPORT_POINTER_EVENTS: 'PointerEvent' in window
      };
      console.log("DicomViewer: Set up pointer events detection:", window.detectPointerEvents);
    }
    
    // Set up external modules correctly before anything else
    console.log("DicomViewer: Setting up external dependencies");
    
    // Make sure all external objects exist
    if (!cornerstone.external) {
      cornerstone.external = {};
      console.log("DicomViewer: Created cornerstone.external object");
    }
    
    if (!cornerstoneTools.external) {
      cornerstoneTools.external = {};
      console.log("DicomViewer: Created cornerstoneTools.external object");
    }
    
    // Assign detectPointerEvents to cornerstone.external
    cornerstone.external.detectPointerEvents = window.detectPointerEvents;
    console.log("DicomViewer: Set cornerstone.external.detectPointerEvents");
    
    // Set up other external dependencies in the correct order
    cornerstone.external.cornerstone = cornerstone;
    console.log("DicomViewer: Set cornerstone.external.cornerstone");
    
    cornerstoneTools.external.cornerstone = cornerstone;
    console.log("DicomViewer: Set cornerstoneTools.external.cornerstone");
    
    cornerstoneWebImageLoader.external.cornerstone = cornerstone;
    console.log("DicomViewer: Set cornerstoneWebImageLoader.external.cornerstone");
    
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    console.log("DicomViewer: Set cornerstoneWADOImageLoader.external.cornerstone");
    
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    console.log("DicomViewer: Set cornerstoneWADOImageLoader.external.dicomParser");
    
    // Register image loaders
    console.log("DicomViewer: Registering image loaders");
    cornerstone.registerImageLoader("webImage", cornerstoneWebImageLoader.loadImage);
    cornerstone.registerImageLoader("wadouri", cornerstoneWADOImageLoader.wadouri.loadImage);
    
    // Initialize cornerstone tools - match the setup from the competitor
    console.log("DicomViewer: Initializing cornerstone tools");
    cornerstoneTools.init({
      showSVGCursors: true,
      mouseEnabled: true
    });
    
    // Configure the WADO image loader with conservative settings
    console.log("DicomViewer: Configuring WADO image loader");
    cornerstoneWADOImageLoader.configure({
      useWebWorkers: false,  // Disable web workers for better compatibility
      decodeConfig: {
        convertFloatPixelDataToInt: false,
        use16Bits: true,
        maxWebWorkers: 1,
        preservePixelData: false,
        strict: false
      },
      maxCacheSize: 50
    });
    
    // Mark as initialized to prevent duplicate initialization
    cornerstoneInitialized = true;
    console.log("DicomViewer: Cornerstone libraries initialized successfully");
    
    return true;
  } catch (error) {
    console.error("DicomViewer: Failed to initialize cornerstone libraries:", error);
    return false;
  }
}

// Determine the correct tool names to use based on the available tools
function getToolNames() {
  // Check if the tools have "Tool" suffix or not
  const useSuffix = typeof cornerstoneTools.PanTool !== 'undefined';
  
  return {
    pan: useSuffix ? 'PanTool' : 'Pan',
    zoom: useSuffix ? 'ZoomTool' : 'Zoom',
    wwwc: useSuffix ? 'WwwcTool' : 'Wwwc',
    magnify: useSuffix ? 'MagnifyTool' : 'Magnify',
    rotate: useSuffix ? 'RotateTool' : 'Rotate'
  };
}

interface DicomViewerProps {
  imageUrl: string;
  alt: string;
  className?: string;
  onError?: (error: Error) => void;
  activeTool?: string;
  onToolInitialized?: () => void;
}

// Create a handle type for the ref
export interface DicomViewerHandle {
  resetView: () => void;
  setActiveTool: (tool: string, element: HTMLElement) => void;
}

export const DicomViewer = forwardRef<DicomViewerHandle, DicomViewerProps>(
  ({ imageUrl, alt, className, onError, activeTool = "pan", onToolInitialized }, ref) => {
    const viewerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<any>(null);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const [toolsInitialized, setToolsInitialized] = useState<boolean>(false);
    const [elementEnabled, setElementEnabled] = useState<boolean>(false);
    const [loadingStatus, setLoadingStatus] = useState<string>("initializing");
    const [viewportReady, setViewportReady] = useState<boolean>(false);
    const [toolNames, setToolNames] = useState<any>(null);
    
    // Initialize cornerstone when component mounts
    useEffect(() => {
      console.log("DicomViewer: Component mounted, initializing cornerstone");
      setLoadingStatus("initializing cornerstone");
      
      try {
        const initialized = initializeCornerstone();
        
        if (initialized) {
          // Determine the correct tool names to use
          const names = getToolNames();
          setToolNames(names);
          console.log("DicomViewer: Detected tool names:", names);
        }
        
        setIsInitialized(initialized);
        
        if (!initialized) {
          setLoadingStatus("cornerstone initialization failed");
          if (onError) onError(new Error("Failed to initialize cornerstone"));
        }
      } catch (err) {
        console.error("DicomViewer: Exception during initialization:", err);
        setLoadingStatus("cornerstone initialization error");
        if (onError) onError(new Error(`Initialization error: ${err}`));
      }
      
      return () => {
        // Cleanup when component unmounts
        if (viewerRef.current) {
          try {
            console.log("DicomViewer: Component unmounting, cleaning up");
            
            // First deactivate all tools
            if (toolsInitialized && toolNames) {
              try {
                // Disable tools using the detected names
                Object.values(toolNames).forEach(toolName => {
                  try {
                    cornerstoneTools.setToolDisabled(toolName as string, {});
                  } catch (e) {
                    // Silently ignore errors for tool disabling
                  }
                });
              } catch (toolError) {
                console.warn("DicomViewer: Error during tool cleanup:", toolError);
              }
            }
            
            // Then disable cornerstone
            if (elementEnabled) {
              try {
                cornerstone.imageCache.purgeCache();
                cornerstone.disable(viewerRef.current);
              } catch (disableError) {
                console.warn("DicomViewer: Error during element disable:", disableError);
              }
            }
          } catch (error) {
            console.error("DicomViewer: Final cleanup error:", error);
          }
        }
      };
    }, [onError]);
    
    // Expose methods to the parent component via the ref
    useImperativeHandle(ref, () => ({
      resetView: () => {
        if (!viewerRef.current || !imageRef.current || !elementEnabled || !viewportReady) {
          console.warn("DicomViewer: Cannot reset view - viewer not ready");
          return;
        }
        
        console.log("DicomViewer: resetView method called via ref");
        try {
          cornerstone.reset(viewerRef.current);
          console.log("DicomViewer: View reset successful");
        } catch (error) {
          console.error("DicomViewer: Error resetting view:", error);
        }
      },
      setActiveTool: (tool: string, element: HTMLElement) => {
        console.log("DicomViewer: setActiveTool method called via ref:", tool);
        if (elementEnabled && toolsInitialized) {
          setActiveTool(tool, element);
        } else {
          console.warn("DicomViewer: Element not enabled yet, can't set tool");
        }
      }
    }), [elementEnabled, toolsInitialized, viewportReady]);
    
    // Initialize tools once the element is available and cornerstone is initialized
    useEffect(() => {
      if (!viewerRef.current || !isInitialized || !toolNames) return;
      
      console.log("DicomViewer: Element available and cornerstone initialized, enabling element");
      setLoadingStatus("enabling element");
      
      let element = viewerRef.current;
      let enabled = false;
      
      try {
        // Enable the cornerstone element first
        cornerstone.enable(element);
        enabled = true;
        setElementEnabled(true);
        console.log("DicomViewer: Element enabled successfully");
        
        // Add mouse tools AFTER element is enabled
        console.log("DicomViewer: Adding tools");
        
        // Helper function to add a tool safely
        const addToolSafely = (toolType: string) => {
          try {
            const ToolClass = cornerstoneTools[toolType];
            if (ToolClass) {
              cornerstoneTools.addTool(ToolClass);
              console.log(`DicomViewer: Added tool ${toolType}`);
              return true;
            }
          } catch (error) {
            console.warn(`DicomViewer: Error adding tool ${toolType}:`, error);
          }
          return false;
        };
        
        // Add each tool using the detected names
        const allToolsAdded = 
          addToolSafely(toolNames.pan) &&
          addToolSafely(toolNames.zoom) &&
          addToolSafely(toolNames.wwwc) &&
          addToolSafely(toolNames.magnify) &&
          addToolSafely(toolNames.rotate);
        
        if (!allToolsAdded) {
          console.warn("DicomViewer: Some tools could not be added");
        }
        
        // Mark tools as initialized
        setToolsInitialized(true);
        console.log("DicomViewer: Tools initialized successfully");
        setLoadingStatus("tools ready");
        
        if (onToolInitialized) onToolInitialized();
      } catch (error) {
        console.error("DicomViewer: Error initializing cornerstone element or tools:", error);
        setLoadingStatus("initialization failed");
        if (onError) onError(new Error(`Failed to initialize DICOM viewer: ${error}`));
      }
      
      // Cleanup function for this effect
      return () => {
        if (element && enabled && toolNames) {
          try {
            // Deactivate all tools first
            console.log("DicomViewer: Deactivating tools on cleanup");
            
            // Disable tools using the detected names
            Object.values(toolNames).forEach(toolName => {
              try {
                cornerstoneTools.setToolDisabled(toolName as string, {});
              } catch (e) {
                // Silently ignore errors for tool disabling
              }
            });
          } catch (error) {
            console.warn("DicomViewer: Error disabling tools:", error);
          }
        }
      };
    }, [isInitialized, onToolInitialized, onError, toolNames]);
    
    // Effect for loading and displaying the image
    useEffect(() => {
      if (!viewerRef.current || !imageUrl || !isInitialized || !elementEnabled) {
        console.log("DicomViewer: Not ready to load image yet", {
          element: !!viewerRef.current,
          url: !!imageUrl,
          initialized: isInitialized,
          elementEnabled: elementEnabled
        });
        return;
      }
      
      console.log("DicomViewer: Loading image:", imageUrl);
      setLoadingStatus("loading image");
      setViewportReady(false);
      const element = viewerRef.current;
      
      // Try to load as DICOM first, regardless of file extension
      const dicomImageId = `wadouri:${imageUrl}`;
      
      // Function to handle loading with memory consideration
      const loadImageSafely = async (imageId: string, isDicomAttempt = true) => {
        try {
          console.log(`DicomViewer: Loading with imageId: ${imageId}`);
          setLoadingStatus(`loading ${isDicomAttempt ? 'DICOM' : 'web'} image`);
          return await cornerstone.loadImage(imageId);
        } catch (error: any) {
          console.error(`DicomViewer: Error loading image with ${imageId}:`, error);
          
          // If we get a memory allocation error, try downsampling
          if (error instanceof RangeError || (error.message && error.message.includes("buffer allocation failed"))) {
            console.log("DicomViewer: Memory error detected, trying with downsampling");
            setLoadingStatus("trying with downsampling");
            
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
              setLoadingStatus("trying with downsampling");
              // Add image processing URL parameters for downsampling
              return await cornerstone.loadImage(`${imageId}?quality=50&downsampleFactor=2`);
            }
          }
          
          // If this was a DICOM attempt and it failed, try as a web image
          if (isDicomAttempt) {
            console.log("DicomViewer: DICOM load failed, trying as web image");
            setLoadingStatus("trying as web image");
            return loadImageSafely(`webImage:${imageUrl}`, false);
          }
          
          // Both attempts failed
          throw error;
        }
      };
      
      // Load the image as DICOM first, then fall back to web image if needed
      loadImageSafely(dicomImageId)
        .then((image) => {
          console.log("DicomViewer: Image loaded successfully, metadata:", image.imageId);
          imageRef.current = image;
          
          try {
            cornerstone.displayImage(element, image);
            console.log("DicomViewer: Image displayed successfully");
            setLoadingStatus("image displayed");
            setViewportReady(true);
            
            // Setup default tool mode only after image is displayed
            if (toolsInitialized) {
              setActiveTool(activeTool, element);
            } else {
              console.log("DicomViewer: Tools not initialized yet, can't set default tool");
            }
          } catch (displayError) {
            console.error("DicomViewer: Error displaying image:", displayError);
            setLoadingStatus("display error");
            if (onError) onError(new Error(`Failed to display image: ${displayError}`));
          }
        })
        .catch((error) => {
          console.error("DicomViewer: All image loading attempts failed:", error);
          setLoadingStatus("load failed");
          if (onError) onError(error instanceof Error ? error : new Error("Failed to load image"));
        });
      
    }, [imageUrl, elementEnabled, toolsInitialized, isInitialized, activeTool, onError]);
    
    // Update active tool when it changes
    useEffect(() => {
      if (!viewerRef.current || !toolsInitialized || !elementEnabled || !viewportReady || !toolNames) {
        console.log("DicomViewer: Cannot update active tool yet - not ready", {
          element: !!viewerRef.current,
          toolsInitialized,
          elementEnabled,
          viewportReady,
          toolNames: !!toolNames
        });
        return;
      }
      
      console.log("DicomViewer: Active tool changed to:", activeTool);
      setActiveTool(activeTool, viewerRef.current);
    }, [activeTool, toolsInitialized, elementEnabled, viewportReady, toolNames]);
    
    // Helper function to set active tool with dynamic tool names
    const setActiveTool = (tool: string, element: HTMLElement) => {
      if (!toolsInitialized || !elementEnabled || !toolNames) {
        console.warn("DicomViewer: Can't set tool - tools not initialized or element not enabled");
        return;
      }
      
      console.log("DicomViewer: Setting active tool to:", tool);
      
      try {
        // First disable all tools safely
        try {
          // Disable tools using the detected names
          Object.values(toolNames).forEach(toolName => {
            try {
              cornerstoneTools.setToolDisabled(toolName as string, {});
            } catch (e) {
              // Silently ignore errors for tool disabling
            }
          });
        } catch (error) {
          console.warn("DicomViewer: Error disabling tools:", error);
        }
        
        // Then enable the selected tool using the appropriate name
        switch (tool) {
          case "pan":
            console.log("DicomViewer: Activating Pan tool");
            cornerstoneTools.setToolActive(toolNames.pan, { mouseButtonMask: 1 });
            break;
          case "zoom":
            // Handle general zoom - use standard zoom which can do both in/out
            console.log("DicomViewer: Activating Zoom tool");
            cornerstoneTools.setToolActive(toolNames.zoom, { mouseButtonMask: 1 });
            try {
              cornerstoneTools.setToolConfiguration(toolNames.zoom, { invert: false });
            } catch (e) {
              console.warn("DicomViewer: Could not set zoom configuration", e);
            }
            break;
          case "zoomIn":
            console.log("DicomViewer: Activating Zoom In tool");
            cornerstoneTools.setToolActive(toolNames.zoom, { mouseButtonMask: 1 });
            try {
              cornerstoneTools.setToolConfiguration(toolNames.zoom, { invert: false });
            } catch (e) {
              console.warn("DicomViewer: Could not set zoom configuration", e);
            }
            break;
          case "zoomOut":
            console.log("DicomViewer: Activating Zoom Out tool");
            cornerstoneTools.setToolActive(toolNames.zoom, { mouseButtonMask: 1 });
            try {
              cornerstoneTools.setToolConfiguration(toolNames.zoom, { invert: true });
            } catch (e) {
              console.warn("DicomViewer: Could not set zoom configuration", e);
            }
            break;
          case "contrast":
            console.log("DicomViewer: Activating Contrast tool");
            cornerstoneTools.setToolActive(toolNames.wwwc, { mouseButtonMask: 1 });
            break;
          case "rotate":
            console.log("DicomViewer: Activating Rotate tool");
            cornerstoneTools.setToolActive(toolNames.rotate, { mouseButtonMask: 1 });
            break;
          default:
            console.log("DicomViewer: No valid tool selected, defaulting to Pan");
            cornerstoneTools.setToolActive(toolNames.pan, { mouseButtonMask: 1 });
        }
      } catch (error) {
        console.error("DicomViewer: Error setting active tool:", error);
      }
    };
    
    return (
      <div 
        ref={viewerRef} 
        className={className || "w-full h-48 border rounded-md bg-black"}
        data-testid="dicom-viewer"
      >
        {!imageUrl && <div className="flex items-center justify-center h-full text-white">No image available</div>}
        {imageUrl && !viewportReady && (
          <div className="flex items-center justify-center h-full flex-col text-white">
            <p>Loading image... ({loadingStatus})</p>
            {loadingStatus.includes("failed") && (
              <p className="text-red-500 text-sm mt-2">Error loading image. Please try again.</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

// Add displayName for better debugging
DicomViewer.displayName = "DicomViewer";
