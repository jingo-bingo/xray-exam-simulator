
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

// Configure WADO image loader with more conservative memory settings
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
    
    // Determine the correct image loader based on file extension
    const isDicom = imageUrl.toLowerCase().endsWith('.dcm') || imageUrl.toLowerCase().includes('.dicom');
    
    console.log("DicomViewer: Detected image type:", isDicom ? "DICOM" : "Standard image");
    
    // Use the appropriate image loader with size limits
    const imageId = isDicom ? `wadouri:${imageUrl}` : `webImage:${imageUrl}`;
    const loaderType = isDicom ? "WADO URI" : "Web Image";
    
    console.log(`DicomViewer: Using ${loaderType} loader with imageId:`, imageId);
    
    // Function to handle loading with memory consideration
    const loadImageSafely = async () => {
      try {
        // First try with default settings
        return await cornerstone.loadImage(imageId);
      } catch (error: any) {
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
          if (isDicom) {
            console.log("DicomViewer: Trying with image downsampling");
            // Add image processing URL parameters for downsampling
            return await cornerstone.loadImage(`${imageId}?quality=50&downsampleFactor=2`);
          }
        }
        
        throw error; // Re-throw if it's not a memory issue or downsampling didn't help
      }
    };

    // Load the image with the appropriate loader and memory handling
    loadImageSafely()
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
        console.error("DicomViewer: Failed to load image:", error);
        
        // If we attempted to load a DICOM file but failed, try loading it as a regular image
        if (isDicom) {
          console.log("DicomViewer: Attempting fallback to standard image loader");
          return cornerstone.loadImage(`webImage:${imageUrl}`);
        }
        
        if (onError) onError(new Error(`Failed to load image: ${error.message || "Unknown error"}`));
        throw error;
      })
      .then((image) => {
        if (image) {
          console.log("DicomViewer: Fallback image loaded successfully");
          try {
            cornerstone.displayImage(element, image);
            console.log("DicomViewer: Fallback image displayed successfully");
          } catch (displayError) {
            console.error("DicomViewer: Error displaying fallback image:", displayError);
            if (onError) onError(new Error("Failed to display fallback image"));
          }
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
