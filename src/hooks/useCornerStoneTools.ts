
import { useState, useEffect, useRef, RefObject } from "react";
import cornerstone from "cornerstone-core";
import cornerstoneTools from "cornerstone-tools";

export function useCornerStoneTools(
  viewerRef: RefObject<HTMLDivElement>,
  isImageLoaded: boolean = false
) {
  const [isToolsInitialized, setIsToolsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>("Pan");
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const toolsRef = useRef<{ initialized: boolean }>({ initialized: false });
  
  // Initialize tools when the element and image are ready
  useEffect(() => {
    if (!viewerRef.current || !isImageLoaded || toolsRef.current.initialized) {
      console.log("useCornerStoneTools: Skipping initialization - prerequisites not met", {
        elementAvailable: !!viewerRef.current,
        isImageLoaded,
        alreadyInitialized: toolsRef.current.initialized
      });
      return;
    }
    
    console.log("useCornerStoneTools: Initializing tools for element");
    const element = viewerRef.current;
    
    try {
      // Make sure the element is enabled for cornerstone
      if (!cornerstone.getEnabledElement(element)) {
        console.log("useCornerStoneTools: Element not enabled for cornerstone, skipping");
        return;
      }
      
      // CRITICAL: First initialize the tools if not already initialized
      if (!cornerstoneTools.initialized) {
        console.log("useCornerStoneTools: Initializing cornerstone tools globally");
        cornerstoneTools.init({
          showSVGCursors: true,
          mouseEnabled: true,
        });
      }
      
      // IMPORTANT: First remove any existing tools to prevent duplicates
      console.log("useCornerStoneTools: Removing any existing tools from element");
      try {
        cornerstoneTools.removeToolsForElement(element);
      } catch (removeError) {
        console.log("useCornerStoneTools: Error removing existing tools:", removeError);
      }
      
      // Add the tools to the element - CRITICAL: Use correct method and tool objects
      console.log("useCornerStoneTools: Adding tools to element");
      cornerstoneTools.addToolForElement(element, cornerstoneTools.PanTool);
      cornerstoneTools.addToolForElement(element, cornerstoneTools.ZoomTool);
      cornerstoneTools.addToolForElement(element, cornerstoneTools.WwwcTool);
      
      try {
        // These tools might not be available in the version we're using
        cornerstoneTools.addToolForElement(element, cornerstoneTools.MagnifyTool);
        cornerstoneTools.addToolForElement(element, cornerstoneTools.RotateTool);
      } catch (optionalToolError) {
        console.log("useCornerStoneTools: Optional tools not available:", optionalToolError);
      }
      
      // Set Pan as the default active tool
      console.log("useCornerStoneTools: Setting Pan as the active tool");
      cornerstoneTools.setToolActiveForElement(element, 'Pan', { mouseButtonMask: 1 });
      setActiveTool("Pan");
      
      // Listen for zoom changes to update the UI
      const handleZoom = function(e: Event) {
        try {
          const viewport = cornerstone.getViewport(element);
          if (viewport) {
            setZoomLevel(viewport.scale);
          }
        } catch (error) {
          console.warn("useCornerStoneTools: Error handling zoom event:", error);
        }
      };
      
      // Listen for both general cornerstone events and specific tool events
      element.addEventListener('cornerstoneimagerendered', handleZoom);
      element.addEventListener('cornerstonetoolszoom', handleZoom);
      
      // IMPORTANT: Force a cornerstone update to make sure the element is ready for interaction
      cornerstone.updateImage(element);
      
      toolsRef.current.initialized = true;
      setIsToolsInitialized(true);
      console.log("useCornerStoneTools: Tools initialized successfully");
      
      // Return cleanup function
      return () => {
        console.log("useCornerStoneTools: Cleaning up tools");
        element.removeEventListener('cornerstoneimagerendered', handleZoom);
        element.removeEventListener('cornerstonetoolszoom', handleZoom);
        
        try {
          cornerstoneTools.removeToolsForElement(element);
        } catch (cleanupError) {
          console.warn("useCornerStoneTools: Error during tool cleanup:", cleanupError);
        }
      };
    } catch (error) {
      console.error("useCornerStoneTools: Error during tools initialization:", error);
      setError(`Failed to initialize tools: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [viewerRef, isImageLoaded]);
  
  // Function to activate a specific tool
  const activateTool = (toolName: string) => {
    if (!viewerRef.current || !isToolsInitialized) {
      console.warn("useCornerStoneTools: Cannot activate tool - not initialized or no element");
      return;
    }
    
    const element = viewerRef.current;
    console.log(`useCornerStoneTools: Activating tool ${toolName}`);
    
    try {
      // First disable all tools
      try {
        cornerstoneTools.setToolDisabledForElement(element, 'Pan');
        cornerstoneTools.setToolDisabledForElement(element, 'Zoom');
        cornerstoneTools.setToolDisabledForElement(element, 'Wwwc');
        
        // Optional tools that might not be available
        try {
          cornerstoneTools.setToolDisabledForElement(element, 'Magnify');
          cornerstoneTools.setToolDisabledForElement(element, 'Rotate');
        } catch (optionalToolError) {
          // Ignore errors for optional tools
        }
      } catch (disableError) {
        console.warn("useCornerStoneTools: Error disabling tools (may be expected):", disableError);
      }
      
      // Then activate the requested tool
      switch (toolName) {
        case "Pan":
          cornerstoneTools.setToolActiveForElement(element, 'Pan', { mouseButtonMask: 1 });
          break;
        case "Zoom":
          cornerstoneTools.setToolActiveForElement(element, 'Zoom', { mouseButtonMask: 1 });
          break;
        case "Wwwc":
          cornerstoneTools.setToolActiveForElement(element, 'Wwwc', { mouseButtonMask: 1 });
          break;
        default:
          cornerstoneTools.setToolActiveForElement(element, 'Pan', { mouseButtonMask: 1 });
          toolName = "Pan";
      }
      
      // IMPORTANT: Force an update to make sure the tool change takes effect
      cornerstone.updateImage(element);
      
      setActiveTool(toolName);
      console.log(`useCornerStoneTools: Tool ${toolName} activated successfully`);
    } catch (error) {
      console.error(`useCornerStoneTools: Error activating tool ${toolName}:`, error);
      setError(`Failed to activate ${toolName} tool: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Function to reset the view to original state
  const resetView = () => {
    if (!viewerRef.current) {
      console.warn("useCornerStoneTools: Cannot reset view - no element");
      return;
    }
    
    try {
      cornerstone.reset(viewerRef.current);
      console.log("useCornerStoneTools: View reset successfully");
      
      // Update zoom level
      const viewport = cornerstone.getViewport(viewerRef.current);
      if (viewport) {
        setZoomLevel(viewport.scale);
      }
    } catch (error) {
      console.error("useCornerStoneTools: Error resetting view:", error);
      setError(`Failed to reset view: ${error instanceof Error ? error.message : String(error)}`);
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
