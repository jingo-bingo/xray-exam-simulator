
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';

// Function to activate a specific tool with proper mouse button configuration
export function activateToolForElement(
  element: HTMLDivElement, 
  toolName: string
): { success: boolean; error: string | null } {
  try {
    console.log(`DicomTools: Activating ${toolName} tool`);
    
    // Verify cornerstone element is ready
    if (!cornerstone.getEnabledElement(element)) {
      console.warn("DicomTools: Element not enabled for cornerstone yet, cannot activate tool");
      return { success: false, error: "Element not enabled for cornerstone" };
    }
    
    // Disable all tools for this element first to ensure clean state
    try {
      console.log("DicomTools: Disabling all tools for element");
      cornerstoneTools.setToolDisabledForElement(element, 'Zoom');
      cornerstoneTools.setToolDisabledForElement(element, 'Pan');
      cornerstoneTools.setToolDisabledForElement(element, 'Wwwc');
      console.log("DicomTools: All tools disabled for this element");
    } catch (e) {
      console.warn("DicomTools: Error disabling tools (may be expected if not active):", e);
    }
    
    // Set the mouse button mask for left mouse button (1)
    const mouseButtonMask = 1;
    
    // Set new tool active with left mouse button
    try {
      console.log(`DicomTools: Setting tool ${toolName} active with mouseButtonMask ${mouseButtonMask}`);
      cornerstoneTools.setToolActiveForElement(element, toolName, { mouseButtonMask });
      console.log(`DicomTools: ${toolName} tool activated successfully with mouseButtonMask: ${mouseButtonMask}`);
      
      // Force cornerstone to redraw the image to show updated tool status
      cornerstone.updateImage(element);
      return { success: true, error: null };
    } catch (e) {
      console.error(`DicomTools: Failed to activate ${toolName} tool:`, e);
      return { 
        success: false, 
        error: `Failed to activate ${toolName} tool: ${e instanceof Error ? e.message : 'Unknown error'}`
      };
    }
  } catch (e) {
    console.error(`DicomTools: Error activating ${toolName} tool:`, e);
    return { 
      success: false, 
      error: `Failed to activate ${toolName} tool: ${e instanceof Error ? e.message : 'Unknown error'}`
    };
  }
}

// Function to reset the view to natural size
export function resetViewToNatural(element: HTMLDivElement): { success: boolean; error: string | null } {
  try {
    console.log("DicomTools: Resetting view");
    cornerstone.reset(element);
    
    // After resetting, get the image and apply natural size viewport
    const enabledElement = cornerstone.getEnabledElement(element);
    if (enabledElement && enabledElement.image) {
      // Set viewport to display image at natural size (scale 1.0)
      const viewport = cornerstone.getDefaultViewport(
        element, 
        enabledElement.image
      );
      
      if (viewport) {
        viewport.scale = 1.0; // Natural size (1:1 pixel)
        cornerstone.setViewport(element, viewport);
        console.log("DicomTools: Reset to natural size (1:1)");
        return { success: true, error: null };
      }
    }
    return { success: true, error: null };
  } catch (e) {
    console.error("DicomTools: Error resetting view:", e);
    return { success: false, error: "Failed to reset view" };
  }
}
