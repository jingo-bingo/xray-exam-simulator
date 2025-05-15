import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import cornerstone from "cornerstone-core";
import cornerstoneTools from "cornerstone-tools";
import cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";

// Initialize the web image loader
cornerstoneWebImageLoader.external.cornerstone = cornerstone;
cornerstone.registerImageLoader("webImage", cornerstoneWebImageLoader.loadImage);

// Initialize the WADO image loader for DICOM files
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstone.registerImageLoader("wadouri", cornerstoneWADOImageLoader.wadouri.loadImage);

// Initialize cornerstone tools
cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneTools.cornerstoneMath;
cornerstoneTools.init();

// Initialize tools we'll use
const panTool = cornerstoneTools.PanTool;
const zoomTool = cornerstoneTools.ZoomTool;
const wwwcTool = cornerstoneTools.WwwcTool;
const magnifyTool = cornerstoneTools.MagnifyTool;
const rotateTool = cornerstoneTools.RotateTool;

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
      if (!viewerRef.current) return;
      
      try {
        // Add tools to cornerstone
        cornerstoneTools.addTool(panTool);
        cornerstoneTools.addTool(zoomTool);
        cornerstoneTools.addTool(wwwcTool);
        cornerstoneTools.addTool(magnifyTool);
        cornerstoneTools.addTool(rotateTool);
        
        console.log("DicomViewer: Initialized cornerstone tools");
        if (onToolInitialized) onToolInitialized();
      } catch (error) {
        console.error("DicomViewer: Error initializing tools:", error);
      }
    }, [onToolInitialized]);
    
    // Effect for loading and displaying the image
    useEffect(() => {
      if (!viewerRef.current || !imageUrl) return;
      
      console.log("DicomViewer: Initializing viewer for image:", imageUrl);
      
      // Enable the element for cornerstone
      const element = viewerRef.current;
      
      try {
        cornerstone.enable(element);
        console.log("DicomViewer: Cornerstone enabled on element");
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
            // Deactivate all tools
            cornerstoneTools.setToolDisabled('Pan');
            cornerstoneTools.setToolDisabled('Zoom');
            cornerstoneTools.setToolDisabled('Wwwc');
            cornerstoneTools.setToolDisabled('Magnify');
            cornerstoneTools.setToolDisabled('Rotate');
            
            // Purge the cache to free memory before disabling
            cornerstone.imageCache.purgeCache();
            cornerstone.disable(element);
            console.log("DicomViewer: Cornerstone disabled on element");
          } catch (error) {
            console.error("DicomViewer: Error during cleanup:", error);
          }
        }
      };
    }, [imageUrl, onError]);
    
    // Update active tool when it changes
    useEffect(() => {
      if (!viewerRef.current) return;
      console.log("DicomViewer: Tool changed to:", activeTool);
      setActiveTool(activeTool, viewerRef.current);
    }, [activeTool]);
    
    // Helper function to set active tool
    const setActiveTool = (tool: string, element: HTMLElement) => {
      console.log("DicomViewer: Setting active tool to:", tool);
      
      try {
        // First disable all tools
        cornerstoneTools.setToolDisabled('Pan');
        cornerstoneTools.setToolDisabled('Zoom');
        cornerstoneTools.setToolDisabled('Wwwc');
        cornerstoneTools.setToolDisabled('Magnify');
        cornerstoneTools.setToolDisabled('Rotate');
        
        // Then enable the selected tool
        switch (tool) {
          case "pan":
            cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 1 });
            console.log("DicomViewer: Activated Pan tool");
            break;
          case "zoomIn":
            cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 1, preventClickEvent: true });
            cornerstoneTools.setToolConfiguration('Zoom', { invert: false });
            console.log("DicomViewer: Activated Zoom In tool");
            break;
          case "zoomOut":
            cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 1, preventClickEvent: true });
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
    
    // Function to reset the view (can be called from parent)
    const resetView = () => {
      if (!viewerRef.current || !imageRef.current) return;
      
      console.log("DicomViewer: Resetting view");
      try {
        cornerstone.reset(viewerRef.current);
        console.log("DicomViewer: View reset successful");
      } catch (error) {
        console.error("DicomViewer: Error resetting view:", error);
      }
    };
    
    // Expose reset function to the component ref
    useEffect(() => {
      if (viewerRef.current) {
        (viewerRef.current as any).resetView = resetView;
      }
    }, []);
    
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
