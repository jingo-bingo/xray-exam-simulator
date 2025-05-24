
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';

export const toolsRegistry = {
  /**
   * Set up external dependencies for cornerstone tools
   */
  setupExternalDependencies: (): { success: boolean; error: string | null } => {
    try {
      // Create the external object if it doesn't exist
      if (!cornerstoneTools.external) {
        cornerstoneTools.external = {};
      }

      // Verify the external dependencies are properly set, set them if needed
      if (!cornerstoneTools.external.cornerstone) {
        console.log("toolsRegistry: Setting external cornerstone reference");
        cornerstoneTools.external.cornerstone = cornerstone;
      } else if (cornerstoneTools.external.cornerstone !== cornerstone) {
        console.warn("toolsRegistry: External cornerstone reference mismatch, correcting");
        cornerstoneTools.external.cornerstone = cornerstone;
      }

      // Verify the reference was properly set
      if (!cornerstoneTools.external.cornerstone || cornerstoneTools.external.cornerstone !== cornerstone) {
        console.error("toolsRegistry: External cornerstone reference still invalid after setup");
        return { success: false, error: "Failed to set external cornerstone reference" };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("toolsRegistry: Error setting up external dependencies:", error);
      return { 
        success: false, 
        error: `Failed to setup external dependencies: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  },

  /**
   * Initialize cornerstone tools with configuration
   */
  initializeTools: (): { success: boolean; error: string | null } => {
    try {
      console.log("toolsRegistry: Initializing cornerstone tools");
      
      cornerstoneTools.init({
        globalToolSyncEnabled: true,
        showSVGCursors: true,
        mouseEnabled: true,
        touchEnabled: true, // Enable touch to support trackpad better
      });
      
      console.log("toolsRegistry: Tools initialized successfully with trackpad support");
      return { success: true, error: null };
    } catch (error) {
      console.error("toolsRegistry: Failed to initialize cornerstone tools:", error);
      return { 
        success: false, 
        error: `Failed to initialize tools: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  },

  /**
   * Register all available tools
   */
  registerTools: (): { success: boolean; error: string | null } => {
    try {
      console.log("toolsRegistry: Adding tools to registry");
      
      // Add the Zoom tool first
      cornerstoneTools.addTool(cornerstoneTools.ZoomTool, {
        configuration: {
          invert: false,
          preventZoomOutsideImage: false,
          minScale: 0.1,
          maxScale: 20.0
        }
      });
      
      // Add the Pan tool
      cornerstoneTools.addTool(cornerstoneTools.PanTool);
      
      // Add the Window/Level tool
      cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
      
      // Add the Rotate tool
      cornerstoneTools.addTool(cornerstoneTools.RotateTool);
      
      console.log("toolsRegistry: Tools added to registry successfully");
      return { success: true, error: null };
    } catch (error) {
      console.error("toolsRegistry: Failed to add tools to registry:", error);
      return { 
        success: false, 
        error: `Failed to register tools: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
};
