
import { useState, useEffect, useRef, useCallback } from "react";
import cornerstone from "cornerstone-core";
import cornerstoneTools from "cornerstone-tools";

// Feature detection flags
const isBrowserSupported = {
  pointerEvents: 'PointerEvent' in window,
  hammer: typeof window.Hammer !== 'undefined',
  canvasSupport: (() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext && canvas.getContext('2d'));
    } catch (e) {
      return false;
    }
  })()
};

// Initialize cornerstone only if browser features are supported
const canInitializeTools = isBrowserSupported.canvasSupport;
let toolsInitialized = false;

// Safe initialization function
if (canInitializeTools && !toolsInitialized) {
  try {
    // Initialize cornerstone core first
    if (!cornerstoneTools.external.cornerstone) {
      cornerstoneTools.external.cornerstone = cornerstone;
    }
    
    // Add Hammer if available
    if (isBrowserSupported.hammer) {
      cornerstoneTools.external.Hammer = window.Hammer;
    }
    
    // Initialize with or without pointer event support
    cornerstoneTools.init({
      showSVGCursors: isBrowserSupported.pointerEvents,
    });
    
    toolsInitialized = true;
    console.log("Cornerstone Tools initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Cornerstone Tools:", error);
  }
}

// Available tool modes
export type ToolMode = 'zoom' | 'pan' | 'windowLevel' | null;

// Hook for managing cornerstone tools in the DICOM viewer
export const useCornerStoneTools = () => {
  const [activeTool, setActiveTool] = useState<ToolMode>(null);
  const [toolsSupported, setToolsSupported] = useState<boolean>(canInitializeTools);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const isInitialized = useRef<boolean>(false);

  // Initialize tools on the element with proper error handling
  const initializeTools = useCallback((element: HTMLDivElement) => {
    if (!element || isInitialized.current || !canInitializeTools) {
      return;
    }

    try {
      console.log("Initializing Cornerstone Tools on element");
      elementRef.current = element;
      
      // Add the tools we want to use
      cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
      cornerstoneTools.addTool(cornerstoneTools.PanTool);
      cornerstoneTools.addTool(cornerstoneTools.WwwcTool); // Window level tool
      
      // Initialize with all tools disabled
      cornerstoneTools.setToolDisabled("Zoom", {});
      cornerstoneTools.setToolDisabled("Pan", {});
      cornerstoneTools.setToolDisabled("Wwwc", {});
      
      isInitialized.current = true;
      console.log("Cornerstone Tools successfully initialized on element");
    } catch (error) {
      console.error("Failed to initialize tools on element:", error);
      setToolsSupported(false);
    }
  }, []);

  // Activate a specific tool with error handling
  const setToolActive = useCallback((toolName: ToolMode) => {
    if (!elementRef.current || !isInitialized.current || !toolsSupported) {
      return;
    }
    
    try {
      console.log(`Activating tool: ${toolName}`);
      
      // Disable all tools first
      cornerstoneTools.setToolDisabled("Zoom", {});
      cornerstoneTools.setToolDisabled("Pan", {});
      cornerstoneTools.setToolDisabled("Wwwc", {});
      
      // Enable the selected tool
      if (toolName === 'zoom') {
        cornerstoneTools.setToolActive("Zoom", { mouseButtonMask: 1 });
      } else if (toolName === 'pan') {
        cornerstoneTools.setToolActive("Pan", { mouseButtonMask: 1 });
      } else if (toolName === 'windowLevel') {
        cornerstoneTools.setToolActive("Wwwc", { mouseButtonMask: 1 });
      }
      
      setActiveTool(toolName);
    } catch (error) {
      console.error(`Failed to activate tool ${toolName}:`, error);
      setToolsSupported(false);
    }
  }, [toolsSupported]);

  // Reset the image view to default
  const resetView = useCallback(() => {
    if (!elementRef.current || !toolsSupported) {
      return;
    }
    
    try {
      console.log("Resetting DICOM image view");
      cornerstone.reset(elementRef.current);
    } catch (error) {
      console.error("Failed to reset view:", error);
    }
  }, [toolsSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (elementRef.current && isInitialized.current) {
        try {
          console.log("Cleaning up Cornerstone Tools");
          // Disable all tools
          cornerstoneTools.setToolDisabled("Zoom", {});
          cornerstoneTools.setToolDisabled("Pan", {});
          cornerstoneTools.setToolDisabled("Wwwc", {});
          
          isInitialized.current = false;
        } catch (error) {
          console.error("Error during cleanup:", error);
        }
      }
    };
  }, []);

  return {
    initializeTools,
    setToolActive,
    resetView,
    activeTool,
    toolsSupported,
  };
};
