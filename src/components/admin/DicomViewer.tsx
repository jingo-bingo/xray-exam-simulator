
import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react";
import cornerstone from "cornerstone-core";
import cornerstoneTools from "cornerstone-tools";
import cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";

// Initialize the library dependencies correctly
// This is important to do before any usage of cornerstone tools
function initializeCornerstone() {
  try {
    console.log("DicomViewer: Initializing cornerstone and related libraries");
    
    // First check if cornerstone is available
    if (!cornerstone) {
      console.error("DicomViewer: Cornerstone library not available");
      return false;
    }
    
    // Register the cornerstone external dependencies first
    cornerstoneTools.external.cornerstone = cornerstone;
    cornerstoneWebImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    
    // Initialize cornerstone tools (but don't initialize mouse events yet)
    cornerstoneTools.init({
      showSVGCursors: true, 
      mouseEnabled: true,
    });
    
    // Initialize the WADO image loader for DICOM files
    cornerstone.registerImageLoader("wadouri", cornerstoneWADOImageLoader.wadouri.loadImage);
    
    // Initialize the web image loader
    cornerstone.registerImageLoader("webImage", cornerstoneWebImageLoader.loadImage);
    
    // Configure WADO image loader with conservative memory settings
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
    const [cornerstoneInitialized, setCornerstoneInitialized] = useState<boolean>(false);
    const [toolsInitialized, setToolsInitialized] = useState<boolean>(false);
    const [elementEnabled, setElementEnabled] = useState<boolean>(false);
    
    // Initialize cornerstone when component mounts
    useEffect(() => {
      const initialized = initializeCornerstone();
      setCornerstoneInitialized(initialized);
      
      return () => {
        // Cleanup when component unmounts
        if (viewerRef.current) {
          try {
            // Safely disable cornerstone on the element
            try {
              cornerstone.imageCache.purgeCache();
              cornerstone.disable(viewerRef.current);
            } catch (error) {
              console.warn("DicomViewer: Error during cleanup:", error);
            }
          } catch (error) {
            console.error("DicomViewer: Final cleanup error:", error);
          }
        }
      };
    }, []);
    
    // Expose methods to the parent component via the ref
    useImperativeHandle(ref, () => ({
      resetView: () => {
        if (!viewerRef.current || !imageRef.current || !elementEnabled) return;
        
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
        if (elementEnabled) {
          setActiveTool(tool, element);
        } else {
          console.warn("DicomViewer: Element not enabled yet, can't set tool");
        }
      }
    }), [elementEnabled]);
    
    // Initialize tools once the element is available and cornerstone is initialized
    useEffect(() => {
      if (!viewerRef.current || !cornerstoneInitialized) return;
      
      console.log("DicomViewer: Element available, enabling cornerstone");
      
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
        
        if (onToolInitialized) onToolInitialized();
      } catch (error) {
        console.error("DicomViewer: Error initializing cornerstone element or tools:", error);
        if (onError) onError(new Error("Failed to initialize DICOM viewer"));
      }
      
      // Cleanup function for this effect
      return () => {
        if (element && enabled) {
          try {
            // Deactivate all tools first
            cornerstoneTools.setToolDisabled('Pan', {});
            cornerstoneTools.setToolDisabled('Zoom', {});
            cornerstoneTools.setToolDisabled('Wwwc', {});
            cornerstoneTools.setToolDisabled('Magnify', {});
            cornerstoneTools.setToolDisabled('Rotate', {});
          } catch (error) {
            console.warn("DicomViewer: Error disabling tools:", error);
          }
        }
      };
    }, [cornerstoneInitialized, onToolInitialized, onError]);
    
    // Effect for loading and displaying the image
    useEffect(() => {
      if (!viewerRef.current || !imageUrl || !cornerstoneInitialized) return;
      
      console.log("DicomViewer: Loading image:", imageUrl);
      const element = viewerRef.current;
      
      // Try to load as DICOM first, regardless of file extension
      const dicomImageId = `wadouri:${imageUrl}`;
      
      // Function to handle loading with memory consideration
      const loadImageSafely = async (imageId: string, isDicomAttempt = true) => {
        try {
          console.log(`DicomViewer: Loading with imageId: ${imageId}`);
          return await cornerstone.loadImage(imageId);
        } catch (error: any) {
          console.error(`DicomViewer: Error loading image with ${imageId}:`, error);
          
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
              return await cornerstone.loadImage(`${imageId}?quality=50&downsampleFactor=2`);
            }
          }
          
          // If this was a DICOM attempt and it failed, try as a web image
          if (isDicomAttempt) {
            console.log("DicomViewer: DICOM load failed, trying as web image");
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
            
            // Setup default tool mode only after image is displayed
            if (toolsInitialized) {
              setActiveTool(activeTool, element);
            } else {
              console.log("DicomViewer: Tools not initialized yet, can't set default tool");
            }
          } catch (displayError) {
            console.error("DicomViewer: Error displaying image:", displayError);
            if (onError) onError(new Error("Failed to display image"));
          }
        })
        .catch((error) => {
          console.error("DicomViewer: All image loading attempts failed:", error);
          if (onError) onError(error instanceof Error ? error : new Error("Failed to load image"));
        });
      
    }, [imageUrl, elementEnabled, toolsInitialized, cornerstoneInitialized, activeTool, onError]);
    
    // Update active tool when it changes
    useEffect(() => {
      if (!viewerRef.current || !toolsInitialized || !elementEnabled) return;
      
      console.log("DicomViewer: Active tool changed to:", activeTool);
      setActiveTool(activeTool, viewerRef.current);
    }, [activeTool, toolsInitialized, elementEnabled]);
    
    // Helper function to set active tool
    const setActiveTool = (tool: string, element: HTMLElement) => {
      if (!toolsInitialized || !elementEnabled) {
        console.warn("DicomViewer: Can't set tool - tools not initialized or element not enabled");
        return;
      }
      
      console.log("DicomViewer: Setting active tool to:", tool);
      
      try {
        // First disable all tools safely
        try {
          // Use the modern API style
          cornerstoneTools.setToolDisabled('Pan', {});
          cornerstoneTools.setToolDisabled('Zoom', {});
          cornerstoneTools.setToolDisabled('Wwwc', {});
          cornerstoneTools.setToolDisabled('Magnify', {});
          cornerstoneTools.setToolDisabled('Rotate', {});
        } catch (error) {
          console.warn("DicomViewer: Error disabling tools:", error);
        }
        
        // Then enable the selected tool
        switch (tool) {
          case "pan":
            console.log("DicomViewer: Activating Pan tool");
            cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 1 });
            break;
          case "zoom":
            console.log("DicomViewer: Activating Zoom In tool");
            cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 1 });
            cornerstoneTools.setToolConfiguration('Zoom', { invert: false });
            break;
          case "zoomIn":
            console.log("DicomViewer: Activating Zoom In tool");
            cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 1 });
            cornerstoneTools.setToolConfiguration('Zoom', { invert: false });
            break;
          case "zoomOut":
            console.log("DicomViewer: Activating Zoom Out tool");
            cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 1 });
            cornerstoneTools.setToolConfiguration('Zoom', { invert: true });
            break;
          case "contrast":
            console.log("DicomViewer: Activating Contrast tool");
            cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 1 });
            break;
          case "rotate":
            console.log("DicomViewer: Activating Rotate tool");
            cornerstoneTools.setToolActive('Rotate', { mouseButtonMask: 1 });
            break;
          default:
            console.log("DicomViewer: No valid tool selected, defaulting to Pan");
            cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 1 });
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
        {!cornerstoneInitialized && <div className="flex items-center justify-center h-full text-white">Initializing viewer...</div>}
      </div>
    );
  }
);

// Add displayName for better debugging
DicomViewer.displayName = "DicomViewer";
