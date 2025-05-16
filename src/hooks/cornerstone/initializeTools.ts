
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';

// Initialize cornerstone tools once when the component mounts
export function initializeCornerStoneTools(): {
  success: boolean;
  error: string | null;
} {
  try {
    console.log("DicomTools: Starting cornerstone-tools initialization");
    
    // Check if cornerstone is already initialized
    if (!cornerstone) {
      console.error("DicomTools: Cornerstone core not available");
      return { success: false, error: "Cornerstone core not available" };
    }

    // Set external dependencies for cornerstone tools - CRUCIAL for proper functioning
    cornerstoneTools.external.cornerstone = cornerstone;
    console.log("DicomTools: External cornerstone set");

    // Initialize tools with configuration for improved trackpad support
    cornerstoneTools.init({
      globalToolSyncEnabled: true,
      showSVGCursors: true,
      mouseEnabled: true,
      touchEnabled: true, // Enable touch to support trackpad better
    });
    console.log("DicomTools: Tools initialized successfully with trackpad support");
    
    // Add base tools to the registry
    console.log("DicomTools: Adding tools to registry");
    cornerstoneTools.addTool(cornerstoneTools.ZoomTool, {
      configuration: {
        invert: false,
        preventZoomOutsideImage: false,
        minScale: 0.1,
        maxScale: 20.0
      }
    });
    cornerstoneTools.addTool(cornerstoneTools.PanTool);
    cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
    console.log("DicomTools: Tools added to registry successfully");
    
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
export function setupElementTools(element: HTMLDivElement, activeTool: string | null): {
  success: boolean;
  error: string | null;
} {
  try {
    // Make sure the element is enabled for cornerstone
    if (!cornerstone.getEnabledElement(element)) {
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
    } catch (cleanupError) {
      console.warn("DicomTools: Error cleaning up existing tool state:", cleanupError);
    }

    // Add the tools to this element. This will throw warnings if already added, but that's OK
    cornerstoneTools.addToolForElement(element, cornerstoneTools.ZoomTool);
    cornerstoneTools.addToolForElement(element, cornerstoneTools.PanTool);
    cornerstoneTools.addToolForElement(element, cornerstoneTools.WwwcTool);
    console.log("DicomTools: Added tools to specific element");

    // Ensure element can capture all events
    prepareElementForInteraction(element);

    // Set default tool to Zoom with left mouse button if no active tool
    if (!activeTool) {
      try {
        console.log("DicomTools: Setting initial tool (Zoom) for element");
        cornerstoneTools.setToolActiveForElement(element, 'Zoom', { mouseButtonMask: 1 });
        console.log("DicomTools: Set Zoom as default active tool with left mouse button");
        return { success: true, error: null };
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
  element.style.webkitUserSelect = 'none'; // Fixed: lowercase 'w' in webkitUserSelect
  element.style.userSelect = 'none';
  element.style.touchAction = 'none'; // Critical for proper trackpad/touch handling
}
