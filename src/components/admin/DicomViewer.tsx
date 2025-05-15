
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
        try {
          cornerstone.displayImage(element, image);
          console.log("DicomViewer: Image displayed successfully");
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
