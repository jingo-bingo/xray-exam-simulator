
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';
import { CornerstoneTool } from './types';

export const elementTools = {
  /**
   * Prepare element for proper interaction
   */
  prepareElementForInteraction: (element: HTMLDivElement): void => {
    // Essential styles for proper event capture and preventing browser gestures
    element.tabIndex = 0; // Make element focusable
    element.style.outline = 'none';
    element.style.webkitUserSelect = 'none';
    element.style.userSelect = 'none';
    
    // Critical for proper touch/trackpad handling
    // Do this safely to handle potential issues with older browsers
    try {
      element.style.touchAction = 'none'; 
    } catch (e) {
      console.warn("elementTools: Could not set touchAction style on element:", e);
    }
    
    // Ensure the element can receive pointer events
    element.style.pointerEvents = 'all';
  },

  /**
   * Clean up existing tool state on an element
   */
  cleanupElementToolState: (element: HTMLDivElement): void => {
    try {
      console.log("elementTools: Cleaning up existing tools on element");
      cornerstoneTools.clearToolState(element, 'Zoom');
      cornerstoneTools.clearToolState(element, 'Pan');
      cornerstoneTools.clearToolState(element, 'Wwwc');
      cornerstoneTools.clearToolState(element, 'Rotate');
    } catch (cleanupError) {
      console.warn("elementTools: Error cleaning up existing tool state:", cleanupError);
    }
  },

  /**
   * Add tools to a specific element
   */
  addToolsToElement: (element: HTMLDivElement): { success: boolean; error: string | null } => {
    try {
      console.log("elementTools: Adding tools to element");
      cornerstoneTools.addToolForElement(element, cornerstoneTools.ZoomTool);
      cornerstoneTools.addToolForElement(element, cornerstoneTools.PanTool);
      cornerstoneTools.addToolForElement(element, cornerstoneTools.WwwcTool);
      cornerstoneTools.addToolForElement(element, cornerstoneTools.RotateTool);
      console.log("elementTools: Added tools to specific element");
      return { success: true, error: null };
    } catch (addToolError) {
      console.warn("elementTools: Error adding tools to element (may be expected if already added):", addToolError);
      // Continue as this might be expected
      return { success: true, error: null };
    }
  },

  /**
   * Set the initial active tool for an element
   */
  setInitialActiveTool: (element: HTMLDivElement, activeTool: CornerstoneTool | null): { success: boolean; error: string | null } => {
    // Set default tool to Zoom with left mouse button if no active tool
    if (!activeTool) {
      try {
        console.log("elementTools: Setting initial tool (Zoom) for element");
        cornerstoneTools.setToolActiveForElement(element, 'Zoom', { mouseButtonMask: 1 });
        console.log("elementTools: Set Zoom as default active tool with left mouse button");
        return { success: true, error: null };
      } catch (toolError) {
        console.error("elementTools: Failed to set initial tool active:", toolError);
        return { 
          success: false, 
          error: `Failed to set initial tool: ${toolError instanceof Error ? toolError.message : 'Unknown error'}`
        };
      }
    }
    return { success: true, error: null };
  }
};
