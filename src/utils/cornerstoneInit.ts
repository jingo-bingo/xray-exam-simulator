
import cornerstone from "cornerstone-core";
import cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import cornerstoneTools from "cornerstone-tools";
import dicomParser from "dicom-parser";

// Global initialization tracking
let cornerstoneInitialized = false;
let cornerstoneToolsInitialized = false;
let initializationAttempts = 0;
const MAX_INITIALIZATION_ATTEMPTS = 5;
const RETRY_DELAY_MS = 300;

// Global event to notify when cornerstone is initialized
const CORNERSTONE_INITIALIZED_EVENT = 'cornerstoneInitialized';
const CORNERSTONE_INIT_FAILED_EVENT = 'cornerstoneInitFailed';

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
 * Check if cornerstone-tools has been initialized
 */
export function isCornerstoneToolsInitialized() {
  return cornerstoneToolsInitialized;
}

/**
 * Wait for cornerstone initialization with timeout
 */
export function waitForCornerstoneInitialization(timeoutMs = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    // Already initialized, resolve immediately
    if (cornerstoneInitialized) {
      resolve(true);
      return;
    }
    
    // Set timeout for initialization
    const timeout = setTimeout(() => {
      document.removeEventListener(CORNERSTONE_INITIALIZED_EVENT, onInitialized);
      document.removeEventListener(CORNERSTONE_INIT_FAILED_EVENT, onFailed);
      resolve(false);
    }, timeoutMs);
    
    // Event handlers
    const onInitialized = () => {
      clearTimeout(timeout);
      document.removeEventListener(CORNERSTONE_INITIALIZED_EVENT, onInitialized);
      document.removeEventListener(CORNERSTONE_INIT_FAILED_EVENT, onFailed);
      resolve(true);
    };
    
    const onFailed = () => {
      clearTimeout(timeout);
      document.removeEventListener(CORNERSTONE_INITIALIZED_EVENT, onInitialized);
      document.removeEventListener(CORNERSTONE_INIT_FAILED_EVENT, onFailed);
      resolve(false);
    };
    
    // Add event listeners
    document.addEventListener(CORNERSTONE_INITIALIZED_EVENT, onInitialized);
    document.addEventListener(CORNERSTONE_INIT_FAILED_EVENT, onFailed);
    
    // Try to initialize in case it wasn't already attempted
    initializeCornerstone();
  });
}

/**
 * Initialize cornerstone core first, then setup tools
 * Returns true if initialization was successful or already done
 */
export function initializeCornerstone(): boolean {
  // If already initialized, return immediately
  if (cornerstoneInitialized) {
    console.log("DicomViewer: Cornerstone already initialized");
    return true;
  }
  
  // Check if we've exceeded maximum retry attempts
  if (initializationAttempts >= MAX_INITIALIZATION_ATTEMPTS) {
    console.error("DicomViewer: Exceeded maximum initialization attempts");
    document.dispatchEvent(new CustomEvent(CORNERSTONE_INIT_FAILED_EVENT));
    return false;
  }
  
  initializationAttempts++;
  console.log(`DicomViewer: Starting cornerstone initialization sequence (attempt ${initializationAttempts})`);
  
  try {
    // Check library availability - this is crucial
    if (!verifyDependencies()) {
      console.error("DicomViewer: Required libraries not available");
      
      // Schedule a retry with increasing delay
      setTimeout(() => {
        initializeCornerstone();
      }, RETRY_DELAY_MS * initializationAttempts);
      
      return false;
    }
    
    // Check browser compatibility
    if (!isBrowserEnvironmentCompatible()) {
      console.error("DicomViewer: Browser environment not compatible");
      document.dispatchEvent(new CustomEvent(CORNERSTONE_INIT_FAILED_EVENT));
      return false;
    }
    
    // Explicitly initialize each library in the correct sequence
    
    // 1. Initialize cornerstone-core first
    console.log("DicomViewer: Setting up cornerstone-core");
    
    // 2. Initialize image loaders with cornerstone-core
    console.log("DicomViewer: Setting up image loaders");
    cornerstoneWebImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    
    // 3. Register the image loaders with cornerstone-core
    cornerstone.registerImageLoader("webImage", cornerstoneWebImageLoader.loadImage);
    cornerstone.registerImageLoader("wadouri", cornerstoneWADOImageLoader.wadouri.loadImage);
    
    // 4. Configure WADO image loader with conservative memory settings
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
    
    // 5. Set up cornerstone-tools AFTER cornerstone-core is ready
    console.log("DicomViewer: Setting up cornerstone-tools");
    
    // Create the external object if it doesn't exist
    if (!cornerstoneTools.external) {
      cornerstoneTools.external = {};
    }
    
    // Set cornerstone reference for tools
    cornerstoneTools.external.cornerstone = cornerstone;
    
    // Verify that this reference is now correctly set
    if (!cornerstoneTools.external.cornerstone) {
      console.error("DicomViewer: Failed to set cornerstone external for cornerstoneTools");
      
      // Schedule a retry with increasing delay
      setTimeout(() => {
        initializeCornerstone();
      }, RETRY_DELAY_MS * initializationAttempts);
      
      return false;
    }
    
    // Mark cornerstone as initialized
    cornerstoneInitialized = true;
    console.log("DicomViewer: Cornerstone libraries initialized successfully");
    
    // Notify listeners that initialization is complete
    document.dispatchEvent(new CustomEvent(CORNERSTONE_INITIALIZED_EVENT));
    return true;
  } catch (error) {
    console.error("DicomViewer: Failed to initialize cornerstone libraries:", error);
    
    // Schedule a retry with increasing delay
    if (initializationAttempts < MAX_INITIALIZATION_ATTEMPTS) {
      console.log(`DicomViewer: Will retry initialization in ${RETRY_DELAY_MS * initializationAttempts}ms`);
      setTimeout(() => {
        initializeCornerstone();
      }, RETRY_DELAY_MS * initializationAttempts);
    } else {
      document.dispatchEvent(new CustomEvent(CORNERSTONE_INIT_FAILED_EVENT));
    }
    
    return false;
  }
}

/**
 * Reset the initialization state - useful for testing or recovery
 */
export function resetCornerstoneInitialization() {
  cornerstoneInitialized = false;
  cornerstoneToolsInitialized = false;
  initializationAttempts = 0;
  console.log("DicomViewer: Cornerstone initialization state reset");
}
