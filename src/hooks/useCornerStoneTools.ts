
import { useEffect, useState, RefObject, useCallback } from 'react';
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';

// Add TypeScript declaration to extend HTMLDivElement with our custom property
declare global {
  interface HTMLDivElement {
    cornerstoneToolsRemoveHandlers?: () => void;
  }
}

// Define the tools we'll be using
interface ToolState {
  zoom: boolean;
  pan: boolean;
  windowLevel: boolean;
}

export function useCornerStoneTools(
  viewerRef: RefObject<HTMLDivElement>,
  enabled: boolean = true
) {
  // State for tracking tool initialization status
  const [isToolsInitialized, setIsToolsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [mouseInputEnabled, setMouseInputEnabled] = useState(false);

  // Initialize cornerstone tools once when the component mounts
  useEffect(() => {
    if (!enabled) return;

    // Safety check - don't try to initialize if already done
    if (isToolsInitialized) {
      console.log("DicomTools: Tools already initialized, skipping initialization");
      return;
    }

    try {
      console.log("DicomTools: Starting cornerstone-tools initialization");
      
      // Check if cornerstone is already initialized
      if (!cornerstone) {
        console.error("DicomTools: Cornerstone core not available");
        setError("Cornerstone core not available");
        return;
      }

      // Set external dependencies for cornerstone tools - CRUCIAL for proper functioning
      cornerstoneTools.external.cornerstone = cornerstone;
      console.log("DicomTools: External cornerstone set");

      // Initialize tools with configuration
      cornerstoneTools.init({
        globalToolSyncEnabled: true,
        showSVGCursors: true,
      });
      console.log("DicomTools: Tools initialized successfully");

      // Register all tools we need with proper configuration
      cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
      cornerstoneTools.addTool(cornerstoneTools.PanTool);
      cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
      console.log("DicomTools: Tools added to toolbox");
      
      // Mark tools as initialized
      setIsToolsInitialized(true);
      setError(null);

    } catch (e) {
      console.error("DicomTools: Error initializing cornerstone tools:", e);
      setError(`Failed to initialize DICOM tools: ${e instanceof Error ? e.message : 'Unknown error'}`);
      setIsToolsInitialized(false);
    }
  }, [enabled, isToolsInitialized]);

  // Set up tools on the element when both element and tools are ready
  useEffect(() => {
    if (!viewerRef.current || !isToolsInitialized || !enabled) {
      console.log("DicomTools: Skipping tool setup - prerequisites not met", {
        elementAvailable: !!viewerRef.current,
        toolsInitialized: isToolsInitialized,
        enabled: enabled
      });
      return;
    }

    try {
      const element = viewerRef.current;

      // Make sure the element is enabled for cornerstone
      if (!cornerstone.getEnabledElement(element)) {
        console.log("DicomTools: Element not enabled for cornerstone yet, skipping tool setup");
        return;
      }

      console.log("DicomTools: Setting up tools on element");

      // Use cornerstone's built-in event handling system instead of manual events
      if (!mouseInputEnabled) {
        try {
          // Add standard mouse tools to element
          cornerstoneTools.addEnabledElement(element);
          setMouseInputEnabled(true);
          console.log("DicomTools: Mouse input successfully enabled using cornerstone's events system");
          
          // Force a redraw to ensure the element recognizes the new tools
          cornerstone.updateImage(element);
        } catch (error) {
          console.error("DicomTools: Failed to set up mouse input for tools:", error);
          setError(`Failed to initialize tool controls: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Set tool modes based on active tool or set zoom as default
      if (!activeTool) {
        // Default to zoom tool with left mouse button (button 1)
        cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 1 });
        setActiveTool('Zoom');
        console.log("DicomTools: Set Zoom as default active tool with left mouse button");
      }

      // Listen for cornerstone events to update zoom level
      const updateZoomLevel = (event: any) => {
        const viewport = cornerstone.getViewport(element);
        if (viewport) {
          const newZoomLevel = Math.round(viewport.scale * 100);
          console.log(`DicomTools: Zoom level updated to ${newZoomLevel}%`);
          setZoomLevel(newZoomLevel);
        }
      };
      
      // Clean up previous listener to avoid duplicates
      element.removeEventListener('cornerstoneimagerendered', updateZoomLevel);
      element.addEventListener('cornerstoneimagerendered', updateZoomLevel);

      console.log("DicomTools: Tool setup complete");
    } catch (e) {
      console.error("DicomTools: Error setting up tools on element:", e);
      setError(`Error setting up DICOM tools: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
    
    // Cleanup function to remove event listeners
    return () => {
      if (viewerRef.current) {
        try {
          // Proper cleanup of cornerstone tools for this element
          cornerstoneTools.removeEnabledElement(viewerRef.current);
          
          // Remove the zoom level update listener
          viewerRef.current.removeEventListener('cornerstoneimagerendered', () => {});
          
          console.log("DicomTools: Event listeners cleaned up");
        } catch (error) {
          console.warn("DicomTools: Error during cleanup:", error);
        }
      }
    };
  }, [viewerRef, isToolsInitialized, activeTool, enabled, mouseInputEnabled]);

  // Function to activate a specific tool with proper mouse button configuration
  const activateTool = useCallback((toolName: string) => {
    if (!isToolsInitialized || !viewerRef.current) {
      console.warn("DicomTools: Cannot activate tool - tools not initialized or viewer not ready");
      return;
    }

    try {
      console.log(`DicomTools: Activating ${toolName} tool`);
      
      const element = viewerRef.current;
      
      // Verify cornerstone element is ready
      if (!cornerstone.getEnabledElement(element)) {
        console.warn("DicomTools: Element not enabled for cornerstone yet, cannot activate tool");
        return;
      }
      
      // First deactivate all tools to avoid conflicts
      console.log("DicomTools: Deactivating all tools before activating new tool");
      ['Zoom', 'Pan', 'Wwwc'].forEach(tool => {
        try {
          cornerstoneTools.setToolDisabled(tool);
        } catch (e) {
          console.warn(`DicomTools: Error disabling ${tool} tool:`, e);
        }
      });
      
      // Set up mouse button masks based on tool type
      let mouseButtonMask = 1; // Default to left mouse button (1)
      
      if (toolName === 'Pan') {
        mouseButtonMask = 4; // Right mouse button (4)
      } else if (toolName === 'Wwwc') {
        mouseButtonMask = 2; // Middle mouse button (2)
      }
      
      // Set new tool active with appropriate mouse button
      cornerstoneTools.setToolActive(toolName, { mouseButtonMask });
      setActiveTool(toolName);
      console.log(`DicomTools: ${toolName} tool activated successfully with mouseButtonMask: ${mouseButtonMask}`);
      
      // Log the current state of the tool without relying on isToolActive
      try {
        // Use a more compatible approach to check tool state
        const toolState = cornerstoneTools.getToolState(element, toolName);
        console.log(`DicomTools: Current tool state for ${toolName}:`, {
          hasToolState: !!toolState,
          mouseEnabled: mouseInputEnabled
        });
      } catch (toolError) {
        console.log(`DicomTools: Unable to check detailed tool state, but activation was attempted:`, {
          toolName,
          mouseButtonMask,
          mouseEnabled: mouseInputEnabled
        });
      }
      
      // Force cornerstone to redraw the image
      cornerstone.updateImage(element);
    } catch (e) {
      console.error(`DicomTools: Error activating ${toolName} tool:`, e);
      setError(`Failed to activate ${toolName} tool: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }, [isToolsInitialized, viewerRef, mouseInputEnabled]);

  // Function to reset the view to natural size
  const resetView = useCallback(() => {
    if (!viewerRef.current) return;

    try {
      console.log("DicomTools: Resetting view");
      cornerstone.reset(viewerRef.current);
      
      // After resetting, get the image and apply natural size viewport
      const enabledElement = cornerstone.getEnabledElement(viewerRef.current);
      if (enabledElement && enabledElement.image) {
        // Set viewport to display image at natural size (scale 1.0)
        const viewport = cornerstone.getDefaultViewport(
          viewerRef.current, 
          enabledElement.image
        );
        
        if (viewport) {
          viewport.scale = 1.0; // Natural size (1:1 pixel)
          cornerstone.setViewport(viewerRef.current, viewport);
          console.log("DicomTools: Reset to natural size (1:1)");
        }
      }
    } catch (e) {
      console.error("DicomTools: Error resetting view:", e);
      setError("Failed to reset view");
    }
  }, [viewerRef]);

  return {
    isToolsInitialized,
    error,
    activeTool,
    activateTool,
    resetView,
    zoomLevel,
  };
}
