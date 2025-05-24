
import cornerstone from "cornerstone-core";
import cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import cornerstoneTools from "cornerstone-tools";
import dicomParser from "dicom-parser";

export const dependencyValidator = {
  /**
   * Check if running in a browser environment with required capabilities
   */
  isBrowserEnvironmentCompatible: (): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      return true;
    } catch (e) {
      console.error("dependencyValidator: Browser environment incompatibility:", e);
      return false;
    }
  },

  /**
   * Verify all cornerstone dependencies are properly loaded and available
   */
  verifyDependencies: (): boolean => {
    const dependencies = [
      { name: 'cornerstone-core', lib: cornerstone },
      { name: 'cornerstone-tools', lib: cornerstoneTools },
      { name: 'cornerstone-web-image-loader', lib: cornerstoneWebImageLoader },
      { name: 'cornerstone-wado-image-loader', lib: cornerstoneWADOImageLoader },
      { name: 'dicom-parser', lib: dicomParser }
    ];

    for (const dep of dependencies) {
      if (!dep.lib) {
        console.error(`dependencyValidator: ${dep.name} not available`);
        return false;
      }
    }

    return true;
  }
};
