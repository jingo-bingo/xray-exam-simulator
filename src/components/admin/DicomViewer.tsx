
import { useEffect, useRef } from "react";
import cornerstone from "cornerstone-core";
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
}

export const DicomViewer = ({ imageUrl, alt, className, onError }: DicomViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef<boolean>(true);
  const loadOperationRef = useRef<{ abort?: () => void }>({});
  
  // Reset mounted ref on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      
      // Abort any pending operations
      if (loadOperationRef.current.abort) {
        loadOperationRef.current.abort();
      }
    };
  }, []);
  
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
      if (isMountedRef.current && onError) {
        onError(new Error("Failed to initialize DICOM viewer"));
      }
      return;
    }
    
    // Determine image type based on URL
    // If the URL looks like a signed URL with a query parameter, use wadouri
    // Otherwise, try to detect from file extension or fallback
    const getImageId = (url: string) => {
      // If this is a signed URL with https://, use wadouri directly
      if (url.startsWith('http')) {
        return `wadouri:${url}`;
      }
      
      // Otherwise, use webImage for image formats, and wadouri for DICOM files
      // Check for common image file extensions
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
      const isImageFormat = imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
      
      return isImageFormat ? `webImage:${url}` : `wadouri:${url}`;
    };
    
    // Try to load as DICOM first, regardless of file extension
    console.log("DicomViewer: Attempting to load as DICOM first");
    const imageId = getImageId(imageUrl);
    console.log("DicomViewer: Using imageId:", imageId);
    
    // Function to handle loading with memory consideration
    const loadImageSafely = async (imageId: string, isDicomAttempt = true) => {
      // If component is unmounted, don't proceed
      if (!isMountedRef.current) {
        throw new Error("Component unmounted");
      }
      
      try {
        console.log(`DicomViewer: Loading with imageId: ${imageId}`);
        return await cornerstone.loadImage(imageId);
      } catch (error: any) {
        // If component unmounted during loading, don't process the error
        if (!isMountedRef.current) {
          throw new Error("Component unmounted");
        }
        
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
        if (isDicomAttempt && imageUrl.startsWith('http')) {
          console.log("DicomViewer: DICOM load failed, trying as web image");
          return loadImageSafely(`webImage:${imageUrl}`, false);
        }
        
        // Both attempts failed
        throw error;
      }
    };

    // Create an object to hold the abort controller
    const loadOperation = {};
    loadOperationRef.current = loadOperation;

    // Load the image
    loadImageSafely(imageId)
      .then((image) => {
        // If the component unmounted or this isn't the current operation, don't proceed
        if (!isMountedRef.current || loadOperationRef.current !== loadOperation) {
          return;
        }
        
        console.log("DicomViewer: Image loaded successfully, metadata:", image.imageId);
        try {
          if (element && cornerstone.getElementEnabled(element)) {
            cornerstone.displayImage(element, image);
            console.log("DicomViewer: Image displayed successfully");
          } else {
            console.warn("DicomViewer: Element not enabled or no longer valid");
          }
        } catch (displayError) {
          if (!isMountedRef.current) return;
          
          console.error("DicomViewer: Error displaying image:", displayError);
          if (onError) onError(new Error("Failed to display image"));
        }
      })
      .catch((error) => {
        // If the component unmounted or this isn't the current operation, don't proceed
        if (!isMountedRef.current || loadOperationRef.current !== loadOperation) {
          return;
        }
        
        console.error("DicomViewer: All image loading attempts failed:", error);
        if (onError) onError(error instanceof Error ? error : new Error("Failed to load image"));
      });
    
    // Clean up
    return () => {
      console.log("DicomViewer: Cleanup");
      if (element) {
        try {
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

  return (
    <div 
      ref={viewerRef} 
      className={className || "w-full h-48 border rounded-md bg-black"}
      data-testid="dicom-viewer"
    >
      {!imageUrl && <div className="flex items-center justify-center h-full text-white">No image available</div>}
    </div>
  );
};
