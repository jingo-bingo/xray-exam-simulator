
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
      const toolsToDisable = ['Zoom', 'Pan', 'Wwwc', 'Rotate'];
      
      toolsToDisable.forEach(tool => {
        try {
          cornerstoneTools.setToolDisabledForElement(element, tool);
        } catch (e) {
          console.warn(`DicomTools: Error disabling ${tool} (may be expected if not active):`, e);
        }
      });
      
      console.log("DicomTools: All tools disabled for this element");
    } catch (e) {
      console.warn("DicomTools: Error disabling tools (may be expected if not active):", e);
    }
    
    // Set the mouse button mask for primary button (1)
    // This is critical for mouse drag operations to work
    const mouseButtonMask = 1;
    
    // Special configuration for multitouch support
    let configuration = {};
    if (toolName === 'Pan' || toolName === 'Zoom') {
      configuration = {
        // These settings make the tools respond to both mouse and trackpad events
        multiTouchPanConfig: {
          enabled: true
        },
        mouseButtonMask: mouseButtonMask
      };
    }
    
    // Set new tool active with left mouse button
    try {
      console.log(`DicomTools: Setting tool ${toolName} active with mouseButtonMask ${mouseButtonMask}`);
      cornerstoneTools.setToolActiveForElement(element, toolName, { 
        mouseButtonMask, 
        ...configuration 
      });
      console.log(`DicomTools: ${toolName} tool activated successfully with mouseButtonMask: ${mouseButtonMask}`);
      
      // Get the current viewport for status logging
      const viewport = cornerstone.getViewport(element);
      console.log(`DicomTools: Current viewport after activation:`, viewport);
      
      // Force cornerstone to redraw the image to show updated tool status
      cornerstone.updateImage(element);
      
      // Update cursor style based on active tool
      updateCursorForTool(element, toolName);
      
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

// Helper function to update cursor style based on active tool
function updateCursorForTool(element: HTMLDivElement, toolName: string) {
  // Remove any existing cursor classes
  element.classList.remove('cursor-zoom', 'cursor-pan', 'cursor-window', 'cursor-rotate');
  
  // Add appropriate cursor class
  switch (toolName) {
    case 'Zoom':
      element.style.cursor = 'zoom-in';
      break;
    case 'Pan':
      element.style.cursor = 'grab';
      break;
    case 'Wwwc':
      element.style.cursor = 'pointer';
      break;
    case 'Rotate':
      element.style.cursor = 'e-resize';
      break;
    default:
      element.style.cursor = 'default';
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

// Function to explicitly create and set touch/gesture events
export function enableTouchInteractions(element: HTMLDivElement): { success: boolean; error: string | null } {
  try {
    console.log("DicomTools: Enabling touch interactions");
    
    // Ensure PanMultiTouch is available and configured
    if (cornerstoneTools.PanMultiTouchTool) {
      cornerstoneTools.addToolForElement(element, cornerstoneTools.PanMultiTouchTool);
      cornerstoneTools.setToolActiveForElement(element, 'PanMultiTouch', { 
        pointers: 2 
      });
      console.log("DicomTools: PanMultiTouch tool added");
    }
    
    // Ensure ZoomTouchPinch is available and configured
    if (cornerstoneTools.ZoomTouchPinchTool) {
      cornerstoneTools.addToolForElement(element, cornerstoneTools.ZoomTouchPinchTool);
      cornerstoneTools.setToolActiveForElement(element, 'ZoomTouchPinch', {});
      console.log("DicomTools: ZoomTouchPinch tool added");
    }
    
    return { success: true, error: null };
  } catch (e) {
    console.error("DicomTools: Error enabling touch interactions:", e);
    return { 
      success: false, 
      error: `Failed to enable touch interactions: ${e instanceof Error ? e.message : 'Unknown error'}`
    };
  }
}
