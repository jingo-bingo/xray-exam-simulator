
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
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
    
    // Initialize the web image loader
    cornerstoneWebImageLoader.external.cornerstone = cornerstone;
    cornerstone.registerImageLoader("webImage", cornerstoneWebImageLoader.loadImage);
    
    // Initialize the WADO image loader for DICOM files
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    cornerstone.registerImageLoader("wadouri", cornerstoneWADOImageLoader.wadouri.loadImage);
    
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
    
    // Initialize cornerstone tools correctly
    cornerstoneTools.external.cornerstone = cornerstone;
    // Don't try to access cornerstoneTools.cornerstoneMath, it might not exist
    if (cornerstoneTools.cornerstoneMath) {
      cornerstoneTools.external.cornerstoneMath = cornerstoneTools.cornerstoneMath;
    }
    
    // Initialize the tools library
    console.log("DicomViewer: Calling cornerstoneTools.init()");
    cornerstoneTools.init();
    console.log("DicomViewer: Successfully initialized cornerstone libraries");
    
    return true;
  } catch (error) {
    console.error("DicomViewer: Failed to initialize cornerstone libraries:", error);
    return false;
  }
}

// Initialize once at module level, but safely
const cornerstoneInitialized = initializeCornerstone();

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
    const toolsInitializedRef = useRef<boolean>(false);
    
    // Expose methods to the parent component via the ref
    useImperativeHandle(ref, () => ({
      resetView: () => {
        if (!viewerRef.current || !imageRef.current) return;
        
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
        setActiveTool(tool, element);
      }
    }), []);
    
    // Initialize tools once
    useEffect(() => {
      if (!viewerRef.current || !cornerstoneInitialized) return;
      
      try {
        // Only initialize tools once
        if (toolsInitializedRef.current) {
          console.log("DicomViewer: Tools already initialized, skipping");
          if (onToolInitialized) onToolInitialized();
          return;
        }
        
        console.log("DicomViewer: Adding tools to cornerstone");
        
        // Add tools to cornerstone
        try {
          cornerstoneTools.addTool(cornerstoneTools.PanTool);
          cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
          cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
          cornerstoneTools.addTool(cornerstoneTools.MagnifyTool);
          cornerstoneTools.addTool(cornerstoneTools.RotateTool);
          
          toolsInitializedRef.current = true;
          console.log("DicomViewer: Initialized cornerstone tools successfully");
          
          if (onToolInitialized) onToolInitialized();
        } catch (error) {
          console.error("DicomViewer: Error adding tools:", error);
          throw error;
        }
      } catch (error) {
        console.error("DicomViewer: Error initializing tools:", error);
        if (onError) onError(new Error("Failed to initialize DICOM viewer tools"));
      }
    }, [onToolInitialized, onError]);
    
    // Effect for loading and displaying the image
    useEffect(() => {
      if (!viewerRef.current || !imageUrl || !cornerstoneInitialized) return;
      
      console.log("DicomViewer: Initializing viewer for image:", imageUrl);
      
      // Enable the element for cornerstone
      const element = viewerRef.current;
      let enabledElement = false;
      
      try {
        // Check if already enabled to avoid errors
        try {
          enabledElement = cornerstone.getEnabledElement(element) !== undefined;
        } catch (e) {
          enabledElement = false;
        }
        
        if (!enabledElement) {
          cornerstone.enable(element);
          console.log("DicomViewer: Cornerstone enabled on element");
        } else {
          console.log("DicomViewer: Element already enabled");
        }
      } catch (error) {
        console.error("DicomViewer: Error enabling cornerstone:", error);
        if (onError) onError(new Error("Failed to initialize DICOM viewer"));
        return;
      }
      
      // Try to load as DICOM first, regardless of file extension
      console.log("DicomViewer: Attempting to load as DICOM first");
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
            
            // Setup default tool mode
            setActiveTool(activeTool, element);
          } catch (displayError) {
            console.error("DicomViewer: Error displaying image:", displayError);
            if (onError) onError(new Error("Failed to display image"));
          }
        })
        .catch((error) => {
          console.error("DicomViewer: All image loading attempts failed:", error);
          if (onError) onError(error instanceof Error ? error : new Error("Failed to load image"));
        });
      
      // Clean up
      return () => {
        console.log("DicomViewer: Cleanup");
        if (element) {
          try {
            // Deactivate all tools safely
            try {
              cornerstoneTools.setToolDisabled('Pan', {});
              cornerstoneTools.setToolDisabled('Zoom', {});
              cornerstoneTools.setToolDisabled('Wwwc', {});
              cornerstoneTools.setToolDisabled('Magnify', {});
              cornerstoneTools.setToolDisabled('Rotate', {});
            } catch (toolError) {
              console.warn("DicomViewer: Error disabling tools during cleanup:", toolError);
            }
            
            // Purge the cache to free memory before disabling
            try {
              cornerstone.imageCache.purgeCache();
            } catch (cacheError) {
              console.warn("DicomViewer: Error purging cache during cleanup:", cacheError);
            }
            
            // Try to disable the element
            try {
              // Check if already enabled to avoid errors
              let isEnabled = false;
              try {
                isEnabled = cornerstone.getEnabledElement(element) !== undefined;
              } catch (e) {
                isEnabled = false;
              }
              
              if (isEnabled) {
                cornerstone.disable(element);
                console.log("DicomViewer: Cornerstone disabled on element");
              }
            } catch (disableError) {
              console.warn("DicomViewer: Error disabling cornerstone during cleanup:", disableError);
            }
          } catch (error) {
            console.error("DicomViewer: Error during cleanup:", error);
          }
        }
      };
    }, [imageUrl, onError, activeTool]);
    
    // Update active tool when it changes
    useEffect(() => {
      if (!viewerRef.current || !cornerstoneInitialized) return;
      console.log("DicomViewer: Tool changed to:", activeTool);
      setActiveTool(activeTool, viewerRef.current);
    }, [activeTool]);
    
    // Helper function to set active tool
    const setActiveTool = (tool: string, element: HTMLElement) => {
      if (!cornerstoneInitialized) {
        console.error("DicomViewer: Cannot set tool, cornerstone not initialized");
        return;
      }
      
      console.log("DicomViewer: Setting active tool to:", tool);
      
      try {
        // First disable all tools safely
        try {
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
            cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 1 });
            console.log("DicomViewer: Activated Pan tool");
            break;
          case "zoomIn":
            cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 1 });
            cornerstoneTools.setToolConfiguration('Zoom', { invert: false });
            console.log("DicomViewer: Activated Zoom In tool");
            break;
          case "zoomOut":
            cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 1 });
            cornerstoneTools.setToolConfiguration('Zoom', { invert: true });
            console.log("DicomViewer: Activated Zoom Out tool");
            break;
          case "contrast":
            cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 1 });
            console.log("DicomViewer: Activated Contrast tool");
            break;
          case "rotate":
            cornerstoneTools.setToolActive('Rotate', { mouseButtonMask: 1 });
            console.log("DicomViewer: Activated Rotate tool");
            break;
          default:
            console.log("DicomViewer: No valid tool selected, defaulting to Pan");
            cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 1 });
        }
      } catch (error) {
        console.error("DicomViewer: Error setting active tool:", error, tool);
      }
    };
    
    return (
      <div 
        ref={viewerRef} 
        className={className || "w-full h-48 border rounded-md bg-black"}
        data-testid="dicom-viewer"
      >
        {!imageUrl && <div className="flex items-center justify-center h-full text-white">No image available</div>}
      </div>
    );
  }
);

// Add displayName for better debugging
DicomViewer.displayName = "DicomViewer";
