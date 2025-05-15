
import cornerstone from "cornerstone-core";
import cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";

// Initialize cornerstone loaders if not already done
export function initializeCornerstoneLoaders() {
  // Initialize the web image loader if not already initialized
  if (!cornerstoneWebImageLoader.external.cornerstone) {
    cornerstoneWebImageLoader.external.cornerstone = cornerstone;
    cornerstone.registerImageLoader("webImage", cornerstoneWebImageLoader.loadImage);
  }

  // Initialize the WADO image loader for DICOM files if not already initialized
  if (!cornerstoneWADOImageLoader.external.cornerstone) {
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
  }
}

// Cache for loaded images to prevent re-fetching
export const imageCache = new Map<string, any>();
// Track active loading operations to prevent duplicate loads
export const activeLoads = new Map<string, Promise<any>>();

// Function to determine image type based on URL
export function getImageId(url: string) {
  if (url.startsWith('http')) {
    return `wadouri:${url}`;
  }
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
  const isImageFormat = imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
  
  return isImageFormat ? `webImage:${url}` : `wadouri:${url}`;
}
