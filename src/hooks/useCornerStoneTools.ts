
import { useState, useEffect, useRef, useCallback } from "react";
import cornerstone from "cornerstone-core";
import cornerstoneTools from "cornerstone-tools";

// Initialize the tools if not already done
if (!cornerstoneTools.external.cornerstone) {
  cornerstoneTools.external.cornerstone = cornerstone;
  cornerstoneTools.external.Hammer = window.Hammer;
  cornerstoneTools.init({
    showSVGCursors: true,
  });
}

// Available tool modes
export type ToolMode = 'zoom' | 'pan' | 'windowLevel' | null;

// Hook for managing cornerstone tools in the DICOM viewer
export const useCornerStoneTools = () => {
  const [activeTool, setActiveTool] = useState<ToolMode>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const isInitialized = useRef(false);

  // Initialize tools on the element
  const initializeTools = useCallback((element: HTMLDivElement) => {
    if (!element || isInitialized.current) return;

    console.log("Initializing Cornerstone Tools");
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
    console.log("Cornerstone Tools initialized");
  }, []);

  // Activate a specific tool
  const setToolActive = useCallback((toolName: ToolMode) => {
    if (!elementRef.current || !isInitialized.current) return;
    
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
  }, []);

  // Reset the image view to default
  const resetView = useCallback(() => {
    if (!elementRef.current) return;
    
    console.log("Resetting DICOM image view");
    cornerstone.reset(elementRef.current);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (elementRef.current && isInitialized.current) {
        console.log("Cleaning up Cornerstone Tools");
        // Disable all tools
        cornerstoneTools.setToolDisabled("Zoom", {});
        cornerstoneTools.setToolDisabled("Pan", {});
        cornerstoneTools.setToolDisabled("Wwwc", {});
        
        isInitialized.current = false;
      }
    };
  }, []);

  return {
    initializeTools,
    setToolActive,
    resetView,
    activeTool,
  };
};
