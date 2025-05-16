
import { useEffect, useState, RefObject, useCallback } from 'react';
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';

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

      // Set external dependencies for cornerstone tools
      cornerstoneTools.external.cornerstone = cornerstone;
      console.log("DicomTools: External cornerstone set");

      // Initialize tools with configuration
      cornerstoneTools.init({
        globalToolSyncEnabled: true,
        showSVGCursors: true,
      });
      console.log("DicomTools: Tools initialized successfully");

      // Register all built-in tools
      const ZoomTool = cornerstoneTools.ZoomTool;
      const PanTool = cornerstoneTools.PanTool;
      const WwwcTool = cornerstoneTools.WwwcTool;

      // Add tools to the toolbox
      cornerstoneTools.addTool(ZoomTool);
      cornerstoneTools.addTool(PanTool);
      cornerstoneTools.addTool(WwwcTool);
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

      // FIXED: In cornerstone-tools v6.0.8, mouseInput.enable is not available directly
      // Instead, we use the appropriate event handlers from cornerstoneTools
      if (!mouseInputEnabled) {
        console.log("DicomTools: Setting up mouse event handlers");
        
        // First check if cornerstoneTools has event registration methods
        if (typeof cornerstoneTools.addEventListeners === 'function') {
          console.log("DicomTools: Using cornerstoneTools.addEventListeners API");
          try {
            cornerstoneTools.addEventListeners(element);
            setMouseInputEnabled(true);
            console.log("DicomTools: Event listeners added successfully with addEventListeners");
          } catch (e) {
            console.error("DicomTools: Error using addEventListeners:", e);
          }
        } 
        // Fallback to manual event binding
        else {
          console.log("DicomTools: Using manual event binding approach");
          
          // Track that we've enabled mouse input to avoid duplicating listeners
          setMouseInputEnabled(true);
          
          // Debug: log which version of cornerstone-tools we're using
          console.log("DicomTools: cornerstone-tools version info:", {
            version: cornerstoneTools.version || "unknown"
          });
          
          // Add logging to detect mouse events at the element level
          element.addEventListener('mousedown', (event) => {
            console.log("DicomTools: Raw mousedown event on element", event);
          });
          
          // Add custom event handlers to communicate with cornerstone-tools
          element.addEventListener('mousemove', (event) => {
            console.log("DicomTools: Mouse move detected on element");
            // Dispatch event that cornerstone-tools can recognize
            const eventDetail = { currentPoints: { canvas: { x: event.offsetX, y: event.offsetY } } };
            cornerstone.triggerEvent(element, 'cornerstonemousemove', eventDetail);
          });
          
          console.log("DicomTools: Manual mouse event handlers added");
        }
      } else {
        console.log("DicomTools: Mouse input already enabled, skipping setup");
      }

      // Set tool modes based on active tool or set zoom as default
      if (!activeTool) {
        // Default to zoom tool
        cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 1 });
        setActiveTool('Zoom');
        console.log("DicomTools: Set Zoom as default active tool");
      }

      // Listen for cornerstone events to update zoom level
      element.addEventListener('cornerstoneimagerendered', (event: any) => {
        const viewport = cornerstone.getViewport(element);
        if (viewport) {
          const newZoomLevel = Math.round(viewport.scale * 100);
          setZoomLevel(newZoomLevel);
        }
      });

      console.log("DicomTools: Tool setup complete");
    } catch (e) {
      console.error("DicomTools: Error setting up tools on element:", e);
      setError(`Error setting up DICOM tools: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }, [viewerRef, isToolsInitialized, activeTool, enabled, mouseInputEnabled]);

  // Function to activate a specific tool
  const activateTool = useCallback((toolName: string) => {
    if (!isToolsInitialized || !viewerRef.current) {
      console.warn("DicomTools: Cannot activate tool - tools not initialized or viewer not ready");
      return;
    }

    try {
      console.log(`DicomTools: Activating ${toolName} tool`);
      
      // Log mouse input status before activating tool
      console.log(`DicomTools: Mouse input enabled status: ${mouseInputEnabled}`);
      
      const element = viewerRef.current;
      
      // Make sure mouse input is enabled
      if (!mouseInputEnabled && element) {
        console.log("DicomTools: Mouse input not enabled before activating tool - forcing setup");
        
        // Force tools setup by checking API availability first
        try {
          if (typeof cornerstoneTools.addEventListeners === 'function') {
            console.log("DicomTools: Re-enabling mouse input with addEventListeners API");
            cornerstoneTools.addEventListeners(element);
          } else {
            console.log("DicomTools: Re-enabling mouse input with manual event binding");
            // Add debug event listener
            element.addEventListener('mousedown', (event) => {
              console.log("DicomTools: Tool activation - mousedown event detected", event);
            });
          }
          
          setMouseInputEnabled(true);
        } catch (err) {
          console.error("DicomTools: Failed to enable mouse input during tool activation:", err);
        }
      }
      
      // Verify cornerstone element is ready
      if (!cornerstone.getEnabledElement(element)) {
        console.warn("DicomTools: Element not enabled for cornerstone yet, cannot activate tool");
        return;
      }
      
      // Set tool active
      cornerstoneTools.setToolActive(toolName, { mouseButtonMask: 1 });
      setActiveTool(toolName);
      console.log(`DicomTools: ${toolName} tool activated successfully`);
      
      // Force cornerstone to redraw the image
      cornerstone.updateImage(element);
    } catch (e) {
      console.error(`DicomTools: Error activating ${toolName} tool:`, e);
      setError(`Failed to activate ${toolName} tool`);
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
