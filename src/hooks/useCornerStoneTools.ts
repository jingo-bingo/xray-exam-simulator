
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

  // Enhanced cornerstone event binding
  const setupMouseTools = useCallback((element: HTMLDivElement) => {
    if (!element) return false;

    try {
      console.log("DicomTools: Setting up enhanced mouse event handlers");
      
      // Try the official API first
      if (typeof cornerstoneTools.addEventListeners === 'function') {
        console.log("DicomTools: Using cornerstoneTools.addEventListeners API");
        cornerstoneTools.addEventListeners(element);
        console.log("DicomTools: Official event listeners added successfully");
        return true;
      }
      
      console.log("DicomTools: Falling back to manual event binding");
      
      // These are the essential mouse events needed for cornerstone tools
      const eventTypes = ['mousedown', 'mouseup', 'mousemove', 'mousedrag', 'mousewheel', 'DOMMouseScroll', 'touchstart', 'touchend'];
      
      // Maps DOM event types to cornerstone event types
      const cornerstoneEventMap: Record<string, string> = {
        'mousedown': 'cornerstonetoolsmousedown',
        'mousemove': 'cornerstonetoolsmousemove',
        'mouseup': 'cornerstonetoolsmouseup',
        'mousewheel': 'cornerstonetoolsmousewheel',
        'DOMMouseScroll': 'cornerstonetoolsmousewheel',
        'touchstart': 'cornerstonetoolstouchstart',
        'touchend': 'cornerstonetoolstouchend'
      };
      
      // Create and keep track of event handlers for cleanup
      const handlers: { [key: string]: (event: Event) => void } = {};
      
      // Convert DOM events to cornerstone events
      eventTypes.forEach(eventType => {
        const cornerstoneEventType = cornerstoneEventMap[eventType] || `cornerstonetools${eventType}`;
        
        handlers[eventType] = (event: Event) => {
          // Prevent default behavior for events like mousewheel that might cause page scrolling
          event.preventDefault();
          event.stopPropagation();
          
          console.log(`DicomTools: DOM ${eventType} event captured, converting to ${cornerstoneEventType}`);
          
          // Create event detail with position information
          let eventDetail: any = {};
          
          if (event instanceof MouseEvent) {
            // Get coordinates relative to the cornerstone element
            const rect = element.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            eventDetail = {
              event,
              element,
              currentPoints: {
                canvas: { x, y },
                image: cornerstone.pixelToCanvas(element, { x, y })
              },
              lastPoints: {
                canvas: { x, y },
                image: cornerstone.pixelToCanvas(element, { x, y })
              },
              deltaPoints: { x: 0, y: 0 },
              buttonsDown: event.buttons
            };
            
            console.log(`DicomTools: Mouse position converted - canvas: (${x}, ${y})`);
          }
          
          // Dispatch the cornerstone event
          cornerstone.triggerEvent(element, cornerstoneEventType, eventDetail);
        };
        
        // Add the event listener to the element
        console.log(`DicomTools: Adding ${eventType} event listener`);
        element.addEventListener(eventType, handlers[eventType]);
      });
      
      // Special handling for drag events which cornerstone-tools relies on
      let isMouseDown = false;
      
      element.addEventListener('mousedown', () => {
        console.log("DicomTools: Mouse down detected, enabling drag tracking");
        isMouseDown = true;
      });
      
      element.addEventListener('mouseup', () => {
        console.log("DicomTools: Mouse up detected, disabling drag tracking");
        isMouseDown = false;
      });
      
      element.addEventListener('mousemove', (event) => {
        if (isMouseDown) {
          console.log("DicomTools: Mouse drag detected while button is down");
          // Trigger a mousedrag event which some tools use
          const dragEvent = new MouseEvent('mousedrag', {
            bubbles: true,
            cancelable: true,
            clientX: event.clientX,
            clientY: event.clientY,
            buttons: event.buttons
          });
          element.dispatchEvent(dragEvent);
        }
      });
      
      // Store cleanup function for future use
      element.cornerstoneToolsRemoveHandlers = () => {
        console.log("DicomTools: Cleaning up manual event handlers");
        
        Object.entries(handlers).forEach(([eventType, handler]) => {
          element.removeEventListener(eventType, handler);
        });
        
        element.removeEventListener('mousedown', () => { isMouseDown = true; });
        element.removeEventListener('mouseup', () => { isMouseDown = false; });
        // Remove the mousemove+drag handler
      };
      
      console.log("DicomTools: Manual event handlers successfully added");
      return true;
    } catch (error) {
      console.error("DicomTools: Error setting up mouse tools:", error);
      return false;
    }
  }, []);

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

      // Enhanced mouse input setup
      if (!mouseInputEnabled) {
        const setupSuccessful = setupMouseTools(element);
        
        if (setupSuccessful) {
          setMouseInputEnabled(true);
          console.log("DicomTools: Mouse input successfully enabled");
          
          // Force a redraw to ensure the element recognizes the new tools
          cornerstone.updateImage(element);
        } else {
          console.error("DicomTools: Failed to set up mouse input for tools");
          setError("Failed to initialize tool controls");
        }
      }

      // Set tool modes based on active tool or set zoom as default
      if (!activeTool) {
        // Default to zoom tool
        cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 1 });
        setActiveTool('Zoom');
        console.log("DicomTools: Set Zoom as default active tool");
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
          // Remove the zoom level update listener
          viewerRef.current.removeEventListener('cornerstoneimagerendered', () => {});
          
          // Clean up manual event handlers if they exist
          if (viewerRef.current.cornerstoneToolsRemoveHandlers) {
            viewerRef.current.cornerstoneToolsRemoveHandlers();
          }
          
          console.log("DicomTools: Event listeners cleaned up");
        } catch (error) {
          console.warn("DicomTools: Error during cleanup:", error);
        }
      }
    };
  }, [viewerRef, isToolsInitialized, activeTool, enabled, mouseInputEnabled, setupMouseTools]);

  // Function to activate a specific tool
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
        cornerstoneTools.setToolDisabled(tool);
      });
      
      // Set new tool active with left mouse button
      cornerstoneTools.setToolActive(toolName, { mouseButtonMask: 1 });
      setActiveTool(toolName);
      console.log(`DicomTools: ${toolName} tool activated successfully`);
      
      // Log the current state of the tool using a safe approach for v6.0.8
      // In v6.0.8, we need to check tool state in a different way since isToolActive might not exist directly
      try {
        // Try to check tool state via toolState if available
        const toolData = cornerstoneTools.getElementToolStateManager(element);
        const toolState = toolData ? "available" : "unavailable";
        
        console.log(`DicomTools: Current tool state:`, {
          toolName,
          toolStateManager: toolState,
          mouseEnabled: mouseInputEnabled
        });
      } catch (toolError) {
        // Fallback if tool state checking fails
        console.log(`DicomTools: Unable to check detailed tool state, but activation was attempted:`, {
          toolName,
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
