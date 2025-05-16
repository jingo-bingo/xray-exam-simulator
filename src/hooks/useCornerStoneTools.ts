
import { useEffect, useState, RefObject, useCallback } from 'react';
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';

// Add TypeScript declaration to extend HTMLDivElement with our custom property
declare global {
  interface HTMLDivElement {
    cornerstoneToolsRemoveHandlers?: () => void;
  }
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
  const [toolsRegistered, setToolsRegistered] = useState(false);

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
      
      // Mark tools as initialized
      setIsToolsInitialized(true);
      setError(null);

    } catch (e) {
      console.error("DicomTools: Error initializing cornerstone tools:", e);
      setError(`Failed to initialize DICOM tools: ${e instanceof Error ? e.message : 'Unknown error'}`);
      setIsToolsInitialized(false);
    }
  }, [enabled, isToolsInitialized]);

  // Register tools globally after initialization
  useEffect(() => {
    if (!isToolsInitialized || toolsRegistered || !enabled) return;
    
    try {
      console.log("DicomTools: Registering tools globally");
      
      // Register all tools we need
      cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
      cornerstoneTools.addTool(cornerstoneTools.PanTool);
      cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
      console.log("DicomTools: Tools added to toolbox");
      
      setToolsRegistered(true);
    } catch (e) {
      console.error("DicomTools: Error registering tools:", e);
      setError(`Failed to register tools: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }, [isToolsInitialized, toolsRegistered, enabled]);

  // Set up tools on the element when both element and tools are ready
  useEffect(() => {
    if (!viewerRef.current || !isToolsInitialized || !toolsRegistered || !enabled) {
      console.log("DicomTools: Skipping tool setup - prerequisites not met", {
        elementAvailable: !!viewerRef.current,
        toolsInitialized: isToolsInitialized,
        toolsRegistered: toolsRegistered,
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

      // Set up tool state for the specific element
      // IMPORTANT: We don't use addEnabledElement as it's not available in v6.0.8
      // Instead, we add tools directly to the element

      // Add specific tools to this element
      try {
        // Need to add the tool to the specific element first
        cornerstoneTools.addToolForElement(element, cornerstoneTools.ZoomTool);
        cornerstoneTools.addToolForElement(element, cornerstoneTools.PanTool);
        cornerstoneTools.addToolForElement(element, cornerstoneTools.WwwcTool);
        console.log("DicomTools: Added tools to specific element");
      } catch (toolError) {
        console.warn("DicomTools: Error adding tools to element, might already be added:", toolError);
        // Continue, as tools might already be added
      }

      // Set tool modes based on active tool or set zoom as default
      if (!activeTool) {
        // Default to zoom tool with left mouse button (button 1)
        try {
          cornerstoneTools.setToolActiveForElement(element, 'Zoom', { mouseButtonMask: 1 });
          setActiveTool('Zoom');
          console.log("DicomTools: Set Zoom as default active tool with left mouse button");
        } catch (toolError) {
          console.error("DicomTools: Failed to set initial tool active:", toolError);
        }
      }

      // Listen for cornerstone events to update zoom level
      const updateZoomLevel = (event: any) => {
        try {
          const viewport = cornerstone.getViewport(element);
          if (viewport) {
            const newZoomLevel = Math.round(viewport.scale * 100);
            setZoomLevel(newZoomLevel);
          }
        } catch (e) {
          console.warn("DicomTools: Error updating zoom level:", e);
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
          // Remove the zoom level update listener
          viewerRef.current.removeEventListener('cornerstoneimagerendered', () => {});
          
          console.log("DicomTools: Event listeners cleaned up");
        } catch (error) {
          console.warn("DicomTools: Error during cleanup:", error);
        }
      }
    };
  }, [viewerRef, isToolsInitialized, activeTool, enabled, toolsRegistered]);

  // Function to activate a specific tool with proper mouse button configuration
  const activateTool = useCallback((toolName: string) => {
    if (!isToolsInitialized || !viewerRef.current || !toolsRegistered) {
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
      
      // Disable all tools for this element first
      try {
        cornerstoneTools.setToolDisabledForElement(element, 'Zoom');
        cornerstoneTools.setToolDisabledForElement(element, 'Pan');
        cornerstoneTools.setToolDisabledForElement(element, 'Wwwc');
        console.log("DicomTools: All tools disabled for this element");
      } catch (e) {
        console.warn("DicomTools: Error disabling tools (may be expected if not active):", e);
      }
      
      // Set the mouse button mask based on tool type
      let mouseButtonMask = 1; // Default to left mouse button (1)
      
      // Set new tool active with appropriate mouse button
      try {
        cornerstoneTools.setToolActiveForElement(element, toolName, { mouseButtonMask });
        setActiveTool(toolName);
        console.log(`DicomTools: ${toolName} tool activated successfully with mouseButtonMask: ${mouseButtonMask}`);
      } catch (e) {
        console.error(`DicomTools: Failed to activate ${toolName} tool:`, e);
        setError(`Failed to activate ${toolName} tool: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
      
      // Force cornerstone to redraw the image
      cornerstone.updateImage(element);
    } catch (e) {
      console.error(`DicomTools: Error activating ${toolName} tool:`, e);
      setError(`Failed to activate ${toolName} tool: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }, [isToolsInitialized, viewerRef, toolsRegistered]);

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
