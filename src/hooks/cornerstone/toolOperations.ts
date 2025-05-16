
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
      cornerstoneTools.setToolDisabledForElement(element, 'Rotate');
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
      
      // Update cursor style based on active tool
      updateCursorForTool(element, toolName);
      
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

// Function to update cursor style based on active tool
function updateCursorForTool(element: HTMLDivElement, toolName: string): void {
  // Set appropriate cursor style for the element based on the active tool
  switch (toolName) {
    case 'Zoom':
      element.style.cursor = 'zoom-in';
      break;
    case 'Pan':
      element.style.cursor = 'grab';
      break;
    case 'Wwwc':
      element.style.cursor = 'context-menu';
      break;
    case 'Rotate':
      element.style.cursor = 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXJvdGF0ZS1jdyI+PHBhdGggZD0iTTIxLjUgMmE0LjYgNC42IDAgMCAxIDAgOS4yIi8+PHBhdGggZD0iTTIxLjUgMnYlIi8+PHBhdGggZD0iTTE1LjUgMmE0LjYgNC42IDAgMCAwIDAgOS4yIi8+PHBhdGggZD0iTTggMjJhOCA4IDAgMSAxIDAtMTYgOCA4IDAgMCAxIDAgMTYiLz48PHRoIGQ9Im0xOSA5LTkgMSAzIDctNyAxIDEtMiIvPjwvc3ZnPg==) 16 16, auto';
      break;
    default:
      element.style.cursor = 'default';
  }
  
  console.log(`DicomTools: Updated cursor style for ${toolName} tool`);
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
