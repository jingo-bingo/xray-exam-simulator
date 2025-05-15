
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
    
    // CRITICAL FIX: Make sure external objects exist before setting properties
    console.log("DicomViewer: Setting up external dependencies");
    
    // Create the external objects if they don't exist
    if (!cornerstone.external) {
      cornerstone.external = {};
      console.log("DicomViewer: Created cornerstone.external object");
    }
    
    if (!cornerstoneTools.external) {
      cornerstoneTools.external = {};
      console.log("DicomViewer: Created cornerstoneTools.external object");
    }
    
    // Now set up the dependencies
    try {
      // Register the external dependencies
      cornerstone.external.cornerstone = cornerstone;
      console.log("DicomViewer: Set cornerstone.external.cornerstone");
      
      // Then set up the tools external dependencies
      cornerstoneTools.external.cornerstone = cornerstone;
      console.log("DicomViewer: Set cornerstoneTools.external.cornerstone");
      
      cornerstoneWebImageLoader.external.cornerstone = cornerstone;
      console.log("DicomViewer: Set cornerstoneWebImageLoader.external.cornerstone");
      
      cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
      console.log("DicomViewer: Set cornerstoneWADOImageLoader.external.cornerstone");
      
      cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
      console.log("DicomViewer: Set cornerstoneWADOImageLoader.external.dicomParser");
    } catch (extError) {
      console.error("DicomViewer: Error setting up external dependencies:", extError);
      return false;
    }
    
    // Initialize the web image loader
    try {
      console.log("DicomViewer: Registering web image loader");
      cornerstone.registerImageLoader("webImage", cornerstoneWebImageLoader.loadImage);
    } catch (webLoaderError) {
      console.error("DicomViewer: Error registering web image loader:", webLoaderError);
      return false;
    }
    
    // Initialize the WADO image loader for DICOM files
    try {
      console.log("DicomViewer: Registering WADO image loader");  
      cornerstone.registerImageLoader("wadouri", cornerstoneWADOImageLoader.wadouri.loadImage);
    } catch (wadoLoaderError) {
      console.error("DicomViewer: Error registering WADO image loader:", wadoLoaderError);
      return false;
    }
    
    // Initialize cornerstone tools with conservative settings
    try {
      console.log("DicomViewer: Initializing cornerstone tools");
      cornerstoneTools.init({
        showSVGCursors: true, 
        mouseEnabled: true,
      });
    } catch (toolsInitError) {
      console.error("DicomViewer: Error initializing cornerstone tools:", toolsInitError);
      return false;
    }
    
    // Configure WADO image loader with conservative memory settings
    try {
      console.log("DicomViewer: Configuring WADO image loader");
      cornerstoneWADOImageLoader.configure({
        useWebWorkers: false,
        decodeConfig: {
          convertFloatPixelDataToInt: false,
          use16Bits: true,
          maxWebWorkers: 1,
          preservePixelData: false, // Don't keep raw pixel data in memory
          strict: false // Less strict parsing to handle more file types
        },
        // Set a smaller max cache size to prevent memory issues
        maxCacheSize: 50, // Default is 100
      });
    } catch (configError) {
      console.error("DicomViewer: Error configuring WADO image loader:", configError);
      return false;
    }
    
    // Mark as initialized to prevent duplicate initialization
    cornerstoneInitialized = true;
    console.log("DicomViewer: Cornerstone libraries initialized successfully");
    
    return true;
  } catch (error) {
    console.error("DicomViewer: Failed to initialize cornerstone libraries:", error);
    return false;
  }
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
    
    // Initialize cornerstone when component mounts
    useEffect(() => {
      console.log("DicomViewer: Component mounted, initializing cornerstone");
      setLoadingStatus("initializing cornerstone");
      
      const initialized = initializeCornerstone();
      setIsInitialized(initialized);
      
      if (!initialized) {
        setLoadingStatus("cornerstone initialization failed");
        if (onError) onError(new Error("Failed to initialize cornerstone"));
      }
      
      return () => {
        // Cleanup when component unmounts
        if (viewerRef.current) {
          try {
            console.log("DicomViewer: Component unmounting, cleaning up");
            
            // First deactivate all tools
            if (toolsInitialized) {
              try {
                // Use the correct tool names for disabling
                cornerstoneTools.setToolDisabled('PanTool', {});
                cornerstoneTools.setToolDisabled('ZoomTool', {});
                cornerstoneTools.setToolDisabled('WwwcTool', {});
                cornerstoneTools.setToolDisabled('MagnifyTool', {});
                cornerstoneTools.setToolDisabled('RotateTool', {});
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
      if (!viewerRef.current || !isInitialized) return;
      
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
        cornerstoneTools.addTool(cornerstoneTools.PanTool);
        cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
        cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
        cornerstoneTools.addTool(cornerstoneTools.MagnifyTool);
        cornerstoneTools.addTool(cornerstoneTools.RotateTool);
        
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
        if (element && enabled) {
          try {
            // Deactivate all tools first
            console.log("DicomViewer: Deactivating tools on cleanup");
            // Use correct tool names that match how they were added
            cornerstoneTools.setToolDisabled('PanTool', {});
            cornerstoneTools.setToolDisabled('ZoomTool', {});
            cornerstoneTools.setToolDisabled('WwwcTool', {});
            cornerstoneTools.setToolDisabled('MagnifyTool', {});
            cornerstoneTools.setToolDisabled('RotateTool', {});
          } catch (error) {
            console.warn("DicomViewer: Error disabling tools:", error);
          }
        }
      };
    }, [isInitialized, onToolInitialized, onError]);
    
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
      if (!viewerRef.current || !toolsInitialized || !elementEnabled || !viewportReady) {
        console.log("DicomViewer: Cannot update active tool yet - not ready", {
          element: !!viewerRef.current,
          toolsInitialized,
          elementEnabled,
          viewportReady
        });
        return;
      }
      
      console.log("DicomViewer: Active tool changed to:", activeTool);
      setActiveTool(activeTool, viewerRef.current);
    }, [activeTool, toolsInitialized, elementEnabled, viewportReady]);
    
    // Helper function to set active tool - FIXED to match correct tool names
    const setActiveTool = (tool: string, element: HTMLElement) => {
      if (!toolsInitialized || !elementEnabled) {
        console.warn("DicomViewer: Can't set tool - tools not initialized or element not enabled");
        return;
      }
      
      console.log("DicomViewer: Setting active tool to:", tool);
      
      try {
        // First disable all tools safely - using the correct tool names
        try {
          cornerstoneTools.setToolDisabled('PanTool', {});
          cornerstoneTools.setToolDisabled('ZoomTool', {});
          cornerstoneTools.setToolDisabled('WwwcTool', {});
          cornerstoneTools.setToolDisabled('MagnifyTool', {});
          cornerstoneTools.setToolDisabled('RotateTool', {});
        } catch (error) {
          console.warn("DicomViewer: Error disabling tools:", error);
        }
        
        // Then enable the selected tool - with correct tool names
        switch (tool) {
          case "pan":
            console.log("DicomViewer: Activating Pan tool");
            cornerstoneTools.setToolActive('PanTool', { mouseButtonMask: 1 });
            break;
          case "zoom":
            // Handle general zoom - use standard zoom which can do both in/out
            console.log("DicomViewer: Activating Zoom tool");
            cornerstoneTools.setToolActive('ZoomTool', { mouseButtonMask: 1 });
            cornerstoneTools.setToolConfiguration('ZoomTool', { invert: false });
            break;
          case "zoomIn":
            console.log("DicomViewer: Activating Zoom In tool");
            cornerstoneTools.setToolActive('ZoomTool', { mouseButtonMask: 1 });
            cornerstoneTools.setToolConfiguration('ZoomTool', { invert: false });
            break;
          case "zoomOut":
            console.log("DicomViewer: Activating Zoom Out tool");
            cornerstoneTools.setToolActive('ZoomTool', { mouseButtonMask: 1 });
            cornerstoneTools.setToolConfiguration('ZoomTool', { invert: true });
            break;
          case "contrast":
            console.log("DicomViewer: Activating Contrast tool");
            cornerstoneTools.setToolActive('WwwcTool', { mouseButtonMask: 1 });
            break;
          case "rotate":
            console.log("DicomViewer: Activating Rotate tool");
            cornerstoneTools.setToolActive('RotateTool', { mouseButtonMask: 1 });
            break;
          default:
            console.log("DicomViewer: No valid tool selected, defaulting to Pan");
            cornerstoneTools.setToolActive('PanTool', { mouseButtonMask: 1 });
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
