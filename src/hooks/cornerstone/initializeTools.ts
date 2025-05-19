
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';
import { CornerstoneTool } from './types';
import { isCornerstoneInitialized } from '@/utils/cornerstoneInit';

// Track if tools have been registered
let toolsRegistered = false;

// Initialize cornerstone tools once when the component mounts
export function initializeCornerStoneTools(): {
  success: boolean;
  error: string | null;
} {
  try {
    console.log("DicomTools: Starting cornerstone-tools initialization");
    
    // If tools already registered, return success immediately
    if (toolsRegistered) {
      console.log("DicomTools: Tools already registered, skipping initialization");
      return { success: true, error: null };
    }
    
    // Check if cornerstone core is initialized first
    if (!isCornerstoneInitialized()) {
      console.error("DicomTools: Cornerstone core not initialized yet, cannot initialize tools");
      return { success: false, error: "Cornerstone core not initialized yet" };
    }
    
    // Check if cornerstone is already initialized
    if (!cornerstone) {
      console.error("DicomTools: Cornerstone core not available");
      return { success: false, error: "Cornerstone core not available" };
    }

    // Make sure cornerstone tools is available
    if (!cornerstoneTools) {
      console.error("DicomTools: Cornerstone tools library not available");
      return { success: false, error: "Cornerstone tools library not available" };
    }

    // Create the external object if it doesn't exist
    if (!cornerstoneTools.external) {
      cornerstoneTools.external = {};
    }

    // Verify the external dependencies are properly set, set them if needed
    if (!cornerstoneTools.external.cornerstone) {
      console.log("DicomTools: Setting external cornerstone reference");
      cornerstoneTools.external.cornerstone = cornerstone;
    } else if (cornerstoneTools.external.cornerstone !== cornerstone) {
      console.warn("DicomTools: External cornerstone reference mismatch, correcting");
      // Correct the reference
      cornerstoneTools.external.cornerstone = cornerstone;
    }

    // Verify the reference was properly set
    if (!cornerstoneTools.external.cornerstone || cornerstoneTools.external.cornerstone !== cornerstone) {
      console.error("DicomTools: External cornerstone reference still invalid after setup");
      return { success: false, error: "Failed to set external cornerstone reference" };
    }

    // Initialize tools with configuration for improved trackpad support
    try {
      cornerstoneTools.init({
        globalToolSyncEnabled: true,
        showSVGCursors: true,
        mouseEnabled: true,
        touchEnabled: true, // Enable touch to support trackpad better
      });
      console.log("DicomTools: Tools initialized successfully with trackpad support");
    } catch (initError) {
      console.error("DicomTools: Failed to initialize cornerstone tools:", initError);
      return { 
        success: false, 
        error: `Failed to initialize tools: ${initError instanceof Error ? initError.message : 'Unknown error'}`
      };
    }
    
    // Now add the tools to the registry
    try {
      console.log("DicomTools: Adding tools to registry");
      
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
      
      console.log("DicomTools: Tools added to registry successfully");
    } catch (addToolError) {
      console.error("DicomTools: Failed to add tools to registry:", addToolError);
      return { 
        success: false, 
        error: `Failed to register tools: ${addToolError instanceof Error ? addToolError.message : 'Unknown error'}`
      };
    }
    
    // Mark tools as registered
    toolsRegistered = true;
    
    return { success: true, error: null };
  } catch (e) {
    console.error("DicomTools: Error initializing cornerstone tools:", e);
    return { 
      success: false, 
      error: `Failed to initialize DICOM tools: ${e instanceof Error ? e.message : 'Unknown error'}`
    };
  }
}

// Set up tools on a specific element
export function setupElementTools(element: HTMLDivElement, activeTool: CornerstoneTool | null): {
  success: boolean;
  error: string | null;
} {
  try {
    // Verify cornerstone and cornerstone tools are initialized
    if (!cornerstone || !cornerstoneTools) {
      console.error("DicomTools: Cornerstone libraries not available");
      return { success: false, error: "Cornerstone libraries not available" };
    }
    
    // Make sure the element is enabled for cornerstone
    try {
      cornerstone.getEnabledElement(element);
    } catch (e) {
      console.log("DicomTools: Element not enabled for cornerstone yet, skipping tool setup");
      return { success: false, error: "Element not enabled for cornerstone" };
    }

    console.log("DicomTools: Setting up tools on element");

    // First clean up any existing tool state on this element
    try {
      console.log("DicomTools: Cleaning up existing tools on element");
      cornerstoneTools.clearToolState(element, 'Zoom');
      cornerstoneTools.clearToolState(element, 'Pan');
      cornerstoneTools.clearToolState(element, 'Wwwc');
      cornerstoneTools.clearToolState(element, 'Rotate');
    } catch (cleanupError) {
      console.warn("DicomTools: Error cleaning up existing tool state:", cleanupError);
    }

    // Add the tools to this element. This will throw warnings if already added, but that's OK
    try {
      console.log("DicomTools: Adding tools to element");
      cornerstoneTools.addToolForElement(element, cornerstoneTools.ZoomTool);
      cornerstoneTools.addToolForElement(element, cornerstoneTools.PanTool);
      cornerstoneTools.addToolForElement(element, cornerstoneTools.WwwcTool);
      cornerstoneTools.addToolForElement(element, cornerstoneTools.RotateTool);
      console.log("DicomTools: Added tools to specific element");
    } catch (addToolError) {
      console.warn("DicomTools: Error adding tools to element (may be expected if already added):", addToolError);
      // Continue as this might be expected
    }

    // Ensure element can capture all events
    prepareElementForInteraction(element);

    // Set default tool to Zoom with left mouse button if no active tool
    if (!activeTool) {
      try {
        console.log("DicomTools: Setting initial tool (Zoom) for element");
        cornerstoneTools.setToolActiveForElement(element, 'Zoom', { mouseButtonMask: 1 });
        console.log("DicomTools: Set Zoom as default active tool with left mouse button");
      } catch (toolError) {
        console.error("DicomTools: Failed to set initial tool active:", toolError);
        return { 
          success: false, 
          error: `Failed to set initial tool: ${toolError instanceof Error ? toolError.message : 'Unknown error'}`
        };
      }
    }
    
    return { success: true, error: null };
  } catch (e) {
    console.error("DicomTools: Error setting up tools on element:", e);
    return { 
      success: false, 
      error: `Error setting up DICOM tools: ${e instanceof Error ? e.message : 'Unknown error'}`
    };
  }
}

// Prepare element for proper interaction
export function prepareElementForInteraction(element: HTMLDivElement): void {
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
    console.warn("DicomTools: Could not set touchAction style on element:", e);
  }
  
  // Ensure the element can receive pointer events
  element.style.pointerEvents = 'all';
}
