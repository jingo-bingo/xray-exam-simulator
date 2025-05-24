
import cornerstone from "cornerstone-core";
import cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import cornerstoneTools from "cornerstone-tools";
import dicomParser from "dicom-parser";

export const cornerstoneSetup = {
  /**
   * Set up image loaders with cornerstone-core
   */
  setupImageLoaders: (): void => {
    console.log("cornerstoneSetup: Setting up image loaders");
    
    // Connect external dependencies
    cornerstoneWebImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    
    // Register image loaders
    cornerstone.registerImageLoader("webImage", cornerstoneWebImageLoader.loadImage);
    cornerstone.registerImageLoader("wadouri", cornerstoneWADOImageLoader.wadouri.loadImage);
  },

  /**
   * Configure WADO image loader with conservative memory settings
   */
  configureWADOLoader: (): void => {
    cornerstoneWADOImageLoader.configure({
      useWebWorkers: false,
      decodeConfig: {
        convertFloatPixelDataToInt: false,
        use16Bits: true,
        maxWebWorkers: 1,
        preservePixelData: false
      },
      maxCacheSize: 50
    });
  },

  /**
   * Set up cornerstone-tools with cornerstone-core reference
   */
  setupCornerstoneTools: (): boolean => {
    console.log("cornerstoneSetup: Setting up cornerstone-tools");
    
    // Create external object if needed
    if (!cornerstoneTools.external) {
      cornerstoneTools.external = {};
    }
    
    // Set cornerstone reference
    cornerstoneTools.external.cornerstone = cornerstone;
    
    // Verify reference was set correctly
    if (!cornerstoneTools.external.cornerstone) {
      console.error("cornerstoneSetup: Failed to set cornerstone external for cornerstoneTools");
      return false;
    }
    
    return true;
  }
};
