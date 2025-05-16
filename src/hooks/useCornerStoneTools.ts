
import { useEffect, useState, RefObject, useCallback, useRef } from 'react';
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
  const [zoomLevel, setZoomLevel] = useState<number>(1.0); // Default zoom level is 1.0 (100%)
  const eventHandlersRef = useRef<{ [key: string]: EventListener }>({});
  const toolsRegisteredRef = useRef(false);

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
        mouseEnabled: true,
      });
      console.log("DicomTools: Tools initialized successfully");
      
      // Add base tools to the registry
      console.log("DicomTools: Adding tools to registry");
      cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
      cornerstoneTools.addTool(cornerstoneTools.PanTool);
      cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
      console.log("DicomTools: Tools added to registry successfully");
      
      // Mark tools as initialized
      toolsRegisteredRef.current = true;
      setIsToolsInitialized(true);
      setError(null);

    } catch (e) {
      console.error("DicomTools: Error initializing cornerstone tools:", e);
      setError(`Failed to initialize DICOM tools: ${e instanceof Error ? e.message : 'Unknown error'}`);
      setIsToolsInitialized(false);
      toolsRegisteredRef.current = false;
    }
  }, [enabled, isToolsInitialized]);

  // Set up tools on the element when both element and tools are ready
  useEffect(() => {
    if (!viewerRef.current || !isToolsInitialized || !toolsRegisteredRef.current || !enabled) {
      console.log("DicomTools: Skipping tool setup - prerequisites not met", {
        elementAvailable: !!viewerRef.current,
        toolsInitialized: isToolsInitialized,
        toolsRegistered: toolsRegisteredRef.current,
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

      // Set default tool to Zoom with left mouse button
      if (!activeTool) {
        try {
          console.log("DicomTools: Setting initial tool (Zoom) for element");
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
      
      // Listen for mouse events on the element for debugging
      const mouseDownHandler = (event: MouseEvent) => {
        console.log("DicomTools: Mouse down on element", {
          button: event.button,
          buttons: event.buttons,
          clientX: event.clientX,
          clientY: event.clientY,
          currentTool: activeTool
        });
      };
      
      // Store reference to handler
      eventHandlersRef.current.mouseDownHandler = mouseDownHandler;
      
      // Add mouse event listeners directly to the element
      element.removeEventListener('mousedown', mouseDownHandler);
      element.addEventListener('mousedown', mouseDownHandler);
      
      console.log("DicomTools: Tool setup complete");
    } catch (e) {
      console.error("DicomTools: Error setting up tools on element:", e);
      setError(`Error setting up DICOM tools: ${e instanceof Error ? e.message : 'Unknown error'}`);
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
  }, [viewerRef, isToolsInitialized, activeTool, enabled]);

  // Function to activate a specific tool with proper mouse button configuration
  const activateTool = useCallback((toolName: string) => {
    if (!isToolsInitialized || !viewerRef.current || !toolsRegisteredRef.current) {
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
        setActiveTool(toolName);
        console.log(`DicomTools: ${toolName} tool activated successfully with mouseButtonMask: ${mouseButtonMask}`);
        
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
  }, [isToolsInitialized, viewerRef]);

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
          setZoomLevel(1.0); // Update zoom level state
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
