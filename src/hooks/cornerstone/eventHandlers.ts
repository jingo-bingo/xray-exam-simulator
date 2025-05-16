
import cornerstone from 'cornerstone-core';
import { CornerstoneToolsMouseEvent } from './types';

// Create and register event handlers for a cornerstone element
export function createEventHandlers(element: HTMLDivElement, setZoomLevel: (level: number) => void, activeTool: string | null) {
  const eventHandlers: { [key: string]: EventListener } = {};
  
  // Listen for cornerstone events to update zoom level
  const updateZoomLevel = (event: Event) => {
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
  
  // Listen for cornerstone tools mouse events to debug tool usage
  const toolsMouseDownHandler = (event: CornerstoneToolsMouseEvent) => {
    console.log("DicomTools: cornerstone tools mouse down", {
      detail: event.detail,
      currentTool: activeTool
    });
  };

  // Add wheel event handler for trackpad support - MODIFIED TO RESPECT ACTIVE TOOL
  const wheelHandler = (event: WheelEvent) => {
    // Log wheel event for debugging
    console.log("DicomTools: Wheel event detected", {
      deltaX: event.deltaX,
      deltaY: event.deltaY,
      ctrlKey: event.ctrlKey,
      currentTool: activeTool
    });

    // Only handle wheel events if we have a valid tool selected
    if (!activeTool) {
      console.log("DicomTools: No active tool, ignoring wheel event");
      return; // No active tool, don't handle the event
    }

    // Direct manipulation with wheel for trackpad users based on active tool
    if (event.ctrlKey) {
      // Ctrl+scroll should only work for Zoom tool
      if (activeTool === 'Zoom') {
        event.preventDefault();
        const viewport = cornerstone.getViewport(element);
        if (viewport) {
          // Zoom factor based on wheel delta
          const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
          viewport.scale *= zoomFactor;
          cornerstone.setViewport(element, viewport);
          console.log("DicomTools: Manual wheel zoom applied with Zoom tool", viewport.scale);
        }
      } else {
        console.log(`DicomTools: Ignoring Ctrl+wheel because active tool is ${activeTool}, not Zoom`);
      }
    } else if (Math.abs(event.deltaX) > 0 || Math.abs(event.deltaY) > 0) {
      // Regular scroll for panning (two-finger swipe on trackpad) - only for Pan tool
      if (activeTool === 'Pan') {
        event.preventDefault();
        const viewport = cornerstone.getViewport(element);
        if (viewport) {
          // Pan based on wheel deltas
          viewport.translation.x -= event.deltaX / 5;
          viewport.translation.y -= event.deltaY / 5;
          cornerstone.setViewport(element, viewport);
          console.log("DicomTools: Manual wheel pan applied with Pan tool", viewport.translation);
        }
      } else {
        console.log(`DicomTools: Ignoring wheel pan because active tool is ${activeTool}, not Pan`);
      }
    }

    // Note: We're intentionally not handling wheel events for Wwwc (Window Level) tool
    // as this tool is better used with mouse drag. Adding trackpad support for Wwwc
    // would require a more complex implementation.
  };
  
  // Store references to handlers
  eventHandlers.zoomHandler = updateZoomLevel;
  eventHandlers.mouseDownHandler = mouseDownHandler;
  eventHandlers.toolsMouseDownHandler = toolsMouseDownHandler as EventListener;
  eventHandlers.wheelHandler = wheelHandler;
  
  // Remove previous listeners to avoid duplicates
  element.removeEventListener('cornerstoneimagerendered', updateZoomLevel);
  element.removeEventListener('mousedown', mouseDownHandler);
  element.removeEventListener('cornerstonetoolsmousedown', toolsMouseDownHandler as EventListener);
  element.removeEventListener('wheel', wheelHandler);
  
  // Add event listeners to the element
  element.addEventListener('cornerstoneimagerendered', updateZoomLevel);
  element.addEventListener('mousedown', mouseDownHandler);
  element.addEventListener('cornerstonetoolsmousedown', toolsMouseDownHandler as EventListener);
  element.addEventListener('wheel', wheelHandler, { passive: false });
  
  console.log("DicomTools: Event handlers set up with tool-aware trackpad support");
  
  return eventHandlers;
}

// Remove all event handlers
export function removeEventHandlers(element: HTMLDivElement, handlers: { [key: string]: EventListener }): void {
  try {
    // Remove all event listeners using stored references
    Object.entries(handlers).forEach(([name, handler]) => {
      console.log(`DicomTools: Removing event listener ${name}`);
      if (name === 'zoomHandler') {
        element.removeEventListener('cornerstoneimagerendered', handler);
      } else if (name === 'toolsMouseDownHandler') {
        element.removeEventListener('cornerstonetoolsmousedown', handler);
      } else if (name === 'wheelHandler') {
        element.removeEventListener('wheel', handler);
      } else {
        element.removeEventListener('mousedown', handler);
      }
    });
    
    console.log("DicomTools: Event listeners cleaned up");
  } catch (error) {
    console.warn("DicomTools: Error during cleanup:", error);
  }
}
