
import cornerstone from "cornerstone-core";
import cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import cornerstoneTools from "cornerstone-tools";
import dicomParser from "dicom-parser";

// Track global initialization state
let cornerstoneInitialized = false;

// Check if running in a browser environment with required capabilities
const isBrowserEnvironmentCompatible = () => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return false;
    
    // Basic checks for crucial browser capabilities
    return true;
  } catch (e) {
    console.error("DicomViewer: Browser environment incompatibility:", e);
    return false;
  }
};

// One-time initialization function for cornerstone libraries
export function initializeCornerstone() {
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
    
    // Check browser compatibility
    if (!isBrowserEnvironmentCompatible()) {
      console.error("DicomViewer: Browser environment not compatible");
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
