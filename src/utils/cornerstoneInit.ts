
import cornerstone from "cornerstone-core";
import cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import cornerstoneTools from "cornerstone-tools";
import dicomParser from "dicom-parser";

// Track global initialization state
let cornerstoneInitialized = false;
let initializationAttempts = 0;
const MAX_INITIALIZATION_ATTEMPTS = 3;

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

/**
 * Verifies all cornerstone dependencies are properly loaded and available
 */
const verifyDependencies = () => {
  if (!cornerstone) {
    console.error("DicomViewer: cornerstone-core not available");
    return false;
  }
  
  if (!cornerstoneTools) {
    console.error("DicomViewer: cornerstone-tools not available");
    return false;
  }
  
  if (!cornerstoneWebImageLoader) {
    console.error("DicomViewer: cornerstone-web-image-loader not available");
    return false;
  }
  
  if (!cornerstoneWADOImageLoader) {
    console.error("DicomViewer: cornerstone-wado-image-loader not available");
    return false;
  }
  
  if (!dicomParser) {
    console.error("DicomViewer: dicom-parser not available");
    return false;
  }
  
  return true;
};

/**
 * Verify if cornerstone has been properly initialized
 */
export function isCornerstoneInitialized() {
  return cornerstoneInitialized;
}

/**
 * One-time initialization function for cornerstone libraries
 * Returns true if initialization was successful or already done
 */
export function initializeCornerstone() {
  // If already initialized, return immediately
  if (cornerstoneInitialized) {
    console.log("DicomViewer: Cornerstone already initialized");
    return true;
  }
  
  // Check if we've exceeded maximum retry attempts
  if (initializationAttempts >= MAX_INITIALIZATION_ATTEMPTS) {
    console.error("DicomViewer: Exceeded maximum initialization attempts");
    return false;
  }
  
  initializationAttempts++;
  console.log(`DicomViewer: Starting cornerstone initialization sequence (attempt ${initializationAttempts})`);
  
  try {
    // Check library availability - this is crucial
    if (!verifyDependencies()) {
      console.error("DicomViewer: Required libraries not available");
      return false;
    }
    
    // Check browser compatibility
    if (!isBrowserEnvironmentCompatible()) {
      console.error("DicomViewer: Browser environment not compatible");
      return false;
    }
    
    // Set up external dependencies in the correct order
    console.log("DicomViewer: Setting up cornerstone-core first");
    
    // Initialize cornerstone-core image loaders first
    console.log("DicomViewer: Setting up image loaders");
    cornerstoneWebImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    
    // Register the image loaders with cornerstone-core
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
    
    // Initialize cornerstone-tools AFTER cornerstone-core is ready
    console.log("DicomViewer: Setting up cornerstone-tools");
    
    // Set up cornerstone-tools external dependencies
    if (!cornerstoneTools.external) {
      cornerstoneTools.external = {};
    }
    cornerstoneTools.external.cornerstone = cornerstone;
    
    // Verify the initialization was successful
    if (!cornerstoneTools.external.cornerstone) {
      console.error("DicomViewer: Failed to set cornerstone external for cornerstoneTools");
      return false;
    }
    
    // Mark as initialized
    cornerstoneInitialized = true;
    console.log("DicomViewer: Cornerstone libraries initialized successfully");
    
    return true;
  } catch (error) {
    console.error("DicomViewer: Failed to initialize cornerstone libraries:", error);
    return false;
  }
}

/**
 * Reset the initialization state - useful for testing or recovery
 */
export function resetCornerstoneInitialization() {
  cornerstoneInitialized = false;
  initializationAttempts = 0;
  console.log("DicomViewer: Cornerstone initialization state reset");
}
