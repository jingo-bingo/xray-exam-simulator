
import { useState, useEffect, useRef } from 'react';
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
  const [activeTool, setActiveTool] = useState<string | null>('Pan');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0); // Default zoom level is 1.0 (100%)
  const eventHandlersRef = useRef<{ [key: string]: EventListener }>({});
  const isSetupCompleteRef = useRef(false);

  // Set up tools on the element when the image is loaded and element is ready
  useEffect(() => {
    if (!viewerRef.current || !enabled) {
      console.log("DicomTools: Skipping tool setup - prerequisites not met", {
        elementAvailable: !!viewerRef.current,
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

      // Prevent duplicate setup
      if (isSetupCompleteRef.current) {
        console.log("DicomTools: Tool setup already completed");
        return;
      }

      console.log("DicomTools: Setting up tools on element");

      // Listen for cornerstone events to update zoom level
      const updateZoomLevel = (event: any) => {
        try {
          const viewport = cornerstone.getViewport(element);
          if (viewport) {
            setZoomLevel(viewport.scale);
            console.log("DicomTools: Updated zoom level:", viewport.scale);
          }
        } catch (e) {
          console.warn("DicomTools: Error updating zoom level:", e);
        }
      };
      
      // Store reference to handler so we can remove it later
      eventHandlersRef.current.zoomHandler = updateZoomLevel;
      
      // Remove previous listener to avoid duplicates
      element.removeEventListener('cornerstoneimagerendered', updateZoomLevel);
      element.addEventListener('cornerstoneimagerendered', updateZoomLevel);
      
      // Set default tool state - use Pan as initial active tool
      try {
        console.log("DicomTools: Setting default active tool (Pan)");
        
        // Set Pan tool as active with left mouse button
        cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 1 });
        setActiveTool('Pan');
        
        // Update the image to make sure the tool is active
        cornerstone.updateImage(element);
        
        console.log("DicomTools: Default tool setup complete");
      } catch (toolError) {
        console.error("DicomTools: Error setting default tool:", toolError);
      }
      
      isSetupCompleteRef.current = true;
      setIsToolsInitialized(true);
      setError(null);
      console.log("DicomTools: Tool setup complete and initialized");
    } catch (e) {
      console.error("DicomTools: Error setting up tools on element:", e);
      setError(`Error setting up DICOM tools: ${e instanceof Error ? e.message : 'Unknown error'}`);
      isSetupCompleteRef.current = false;
    }
    
    // Cleanup function to remove event listeners
    return () => {
      if (viewerRef.current) {
        try {
          const element = viewerRef.current;
          
          // Remove all event listeners using our stored references
          Object.entries(eventHandlersRef.current).forEach(([name, handler]) => {
            console.log(`DicomTools: Removing event listener ${name}`);
            element.removeEventListener(name === 'zoomHandler' ? 'cornerstoneimagerendered' : 'mousedown', handler);
          });
          
          // Clear handlers
          eventHandlersRef.current = {};
          
          console.log("DicomTools: Event listeners cleaned up");
        } catch (error) {
          console.warn("DicomTools: Error during cleanup:", error);
        }
      }
    };
  }, [viewerRef, enabled]);

  // Function to activate a specific tool with proper mouse button configuration
  const activateTool = (toolName: string) => {
    if (!viewerRef.current || !enabled) {
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
      
      // Set the mouse button mask for left mouse button (1)
      const mouseButtonMask = 1;
      
      // Map tool name to cornerstone tool name
      let cornerstoneToolName = toolName;
      if (toolName === 'Wwwc') cornerstoneToolName = 'Wwwc';
      else if (toolName === 'Pan') cornerstoneToolName = 'Pan';
      else if (toolName === 'Zoom') cornerstoneToolName = 'Zoom';
      
      // Set new tool active with left mouse button
      try {
        console.log(`DicomTools: Setting tool ${cornerstoneToolName} active with mouseButtonMask ${mouseButtonMask}`);
        cornerstoneTools.setToolActive(cornerstoneToolName, { mouseButtonMask });
        setActiveTool(toolName);
        console.log(`DicomTools: ${toolName} tool activated successfully`);
        
        // Force cornerstone to redraw the image to show updated tool status
        cornerstone.updateImage(element);
      } catch (e) {
        console.error(`DicomTools: Failed to activate ${toolName} tool:`, e);
        setError(`Failed to activate ${toolName} tool: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    } catch (e) {
      console.error(`DicomTools: Error activating ${toolName} tool:`, e);
      setError(`Failed to activate ${toolName} tool: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  };

  // Function to reset the view to natural size
  const resetView = () => {
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
          setZoomLevel(1.0); // Update zoom level state
          console.log("DicomTools: Reset to natural size (1:1)");
        }
      }
    } catch (e) {
      console.error("DicomTools: Error resetting view:", e);
      setError("Failed to reset view");
    }
  };

  return {
    isToolsInitialized,
    error,
    activeTool,
    activateTool,
    resetView,
    zoomLevel,
  };
}
