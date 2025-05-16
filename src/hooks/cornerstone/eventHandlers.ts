
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';
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
  
  // Mouse event positions cache for drag operations
  let lastX = 0;
  let lastY = 0;
  let isMouseDown = false;
  
  // Helper function to create a cornerstone tools mouse event
  const createCornerstoneMouseEvent = (eventType: string, event: MouseEvent) => {
    // Save positions for drag calculations
    lastX = event.clientX;
    lastY = event.clientY;
    
    // Create a custom event that cornerstone tools will understand
    const cornerstoneEvent = new CustomEvent(eventType, {
      bubbles: true,
      cancelable: true,
      detail: {
        element: element,
        currentPoints: {
          canvas: cornerstone.pixelToCanvas(element, {
            x: event.offsetX,
            y: event.offsetY
          }),
          page: {
            x: event.pageX,
            y: event.pageY
          },
          client: {
            x: event.clientX,
            y: event.clientY
          },
          image: cornerstone.pageToPixel(element, event.pageX, event.pageY)
        },
        originalEvent: event,
        buttonMask: event.buttons, // Use buttons for better tracking during drag
        preventDefault: event.preventDefault.bind(event),
        stopPropagation: event.stopPropagation.bind(event)
      }
    });
    
    return cornerstoneEvent;
  };

  // Listen for mouse events on the element and translate to cornerstone events
  const mouseDownHandler = (event: MouseEvent) => {
    if (!activeTool) return;
    
    console.log("DicomTools: Mouse down on element", {
      button: event.button,
      buttons: event.buttons,
      clientX: event.clientX,
      clientY: event.clientY,
      currentTool: activeTool,
      offsetX: event.offsetX,
      offsetY: event.offsetY
    });
    
    // Mark the start of a drag operation
    isMouseDown = true;
    
    // Create and dispatch a cornerstone tools mouse down event
    const cornerstoneEvent = createCornerstoneMouseEvent('cornerstonetoolsmousedown', event);
    element.dispatchEvent(cornerstoneEvent);
    
    // Prevent default browser behavior
    event.preventDefault();
    event.stopPropagation();
  };
  
  // Handle mouse move events to support drag operations
  const mouseMoveHandler = (event: MouseEvent) => {
    if (!activeTool || !isMouseDown) return;
    
    // Only log occasionally to reduce console spam
    if (Math.random() < 0.05) {
      console.log("DicomTools: Mouse move on element during drag", {
        clientX: event.clientX,
        clientY: event.clientY,
        deltaX: event.clientX - lastX,
        deltaY: event.clientY - lastY,
        currentTool: activeTool
      });
    }
    
    // Create and dispatch a cornerstone tools mouse move event
    const cornerstoneEvent = createCornerstoneMouseEvent('cornerstonetoolsmousemove', event);
    element.dispatchEvent(cornerstoneEvent);
    
    // Prevent default browser behavior
    event.preventDefault();
    event.stopPropagation();
  };
  
  // Handle mouse up to complete drag operations
  const mouseUpHandler = (event: MouseEvent) => {
    if (!activeTool || !isMouseDown) return;
    
    console.log("DicomTools: Mouse up on element", {
      button: event.button,
      buttons: event.buttons,
      clientX: event.clientX,
      clientY: event.clientY,
      currentTool: activeTool
    });
    
    // End the drag operation
    isMouseDown = false;
    
    // Create and dispatch a cornerstone tools mouse up event
    const cornerstoneEvent = createCornerstoneMouseEvent('cornerstonetoolsmouseup', event);
    element.dispatchEvent(cornerstoneEvent);
    
    // Prevent default browser behavior
    event.preventDefault();
    event.stopPropagation();
  };
  
  // Add mouse leave handler to ensure we catch when mouse leaves the element
  const mouseLeaveHandler = (event: MouseEvent) => {
    if (!activeTool || !isMouseDown) return;
    
    console.log("DicomTools: Mouse left element during drag", {
      currentTool: activeTool
    });
    
    // End the drag operation
    isMouseDown = false;
    
    // Create and dispatch a cornerstone tools mouse up event
    const cornerstoneEvent = createCornerstoneMouseEvent('cornerstonetoolsmouseup', event);
    element.dispatchEvent(cornerstoneEvent);
  };
  
  // Listen for cornerstone tools mouse events to debug tool usage
  const toolsMouseDownHandler = (event: CornerstoneToolsMouseEvent) => {
    console.log("DicomTools: cornerstone tools mouse down", {
      detail: event.detail,
      currentTool: activeTool
    });
  };

  const toolsMouseMoveHandler = (event: CornerstoneToolsMouseEvent) => {
    // Log only occasionally to reduce console spam
    if (Math.random() < 0.05) {
      console.log("DicomTools: cornerstone tools mouse move", {
        detail: event.detail,
        currentTool: activeTool
      });
    }
  };

  const toolsMouseUpHandler = (event: CornerstoneToolsMouseEvent) => {
    console.log("DicomTools: cornerstone tools mouse up", {
      detail: event.detail,
      currentTool: activeTool
    });
  };

  // Add wheel event handler for trackpad support with improved tool awareness
  const wheelHandler = (event: WheelEvent) => {
    // Log wheel event for debugging
    console.log("DicomTools: Wheel event detected", {
      deltaX: event.deltaX,
      deltaY: event.deltaY,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      currentTool: activeTool
    });

    // Only handle wheel events if we have a valid tool selected
    if (!activeTool) {
      console.log("DicomTools: No active tool, ignoring wheel event");
      return; // No active tool, don't handle the event
    }

    // Direct manipulation with wheel for trackpad users based on active tool
    if (event.ctrlKey) {
      // Ctrl+scroll for Zoom tool
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
    } else if (event.shiftKey) {
      // Shift+scroll for Window Level (Wwwc) adjustment
      if (activeTool === 'Wwwc') {
        event.preventDefault();
        const viewport = cornerstone.getViewport(element);
        if (viewport) {
          // Adjust window width with horizontal scroll or when alt is pressed
          if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.altKey) {
            // Window WIDTH adjustment (contrast)
            const widthAdjustment = event.deltaX < 0 ? 5 : -5;
            viewport.voi.windowWidth += widthAdjustment;
            if (viewport.voi.windowWidth < 1) viewport.voi.windowWidth = 1; // Prevent negative width
          } else {
            // Window CENTER adjustment (brightness)
            const centerAdjustment = event.deltaY < 0 ? 5 : -5;
            viewport.voi.windowCenter += centerAdjustment;
          }
          cornerstone.setViewport(element, viewport);
          console.log("DicomTools: Manual window level adjusted with Wwwc tool", {
            windowCenter: viewport.voi.windowCenter,
            windowWidth: viewport.voi.windowWidth
          });
        }
      } else {
        console.log(`DicomTools: Ignoring Shift+wheel because active tool is ${activeTool}, not Wwwc`);
      }
    } else if (event.altKey) {
      // Alt+scroll for Rotation
      if (activeTool === 'Rotate') {
        event.preventDefault();
        const viewport = cornerstone.getViewport(element);
        if (viewport) {
          // Rotate based on wheel delta - 5 degrees per wheel tick
          const rotationDelta = event.deltaY < 0 ? 5 : -5;
          viewport.rotation += rotationDelta;
          cornerstone.setViewport(element, viewport);
          console.log("DicomTools: Manual wheel rotation applied with Rotate tool", viewport.rotation);
        }
      } else {
        console.log(`DicomTools: Ignoring Alt+wheel because active tool is ${activeTool}, not Rotate`);
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
  };
  
  // Store references to handlers
  eventHandlers.zoomHandler = updateZoomLevel;
  eventHandlers.mouseDownHandler = mouseDownHandler;
  eventHandlers.mouseMoveHandler = mouseMoveHandler;
  eventHandlers.mouseUpHandler = mouseUpHandler;
  eventHandlers.mouseLeaveHandler = mouseLeaveHandler;
  eventHandlers.toolsMouseDownHandler = toolsMouseDownHandler as EventListener;
  eventHandlers.toolsMouseMoveHandler = toolsMouseMoveHandler as EventListener;
  eventHandlers.toolsMouseUpHandler = toolsMouseUpHandler as EventListener;
  eventHandlers.wheelHandler = wheelHandler;
  
  // Remove previous listeners to avoid duplicates
  element.removeEventListener('cornerstoneimagerendered', updateZoomLevel);
  element.removeEventListener('mousedown', mouseDownHandler);
  element.removeEventListener('mousemove', mouseMoveHandler);
  element.removeEventListener('mouseup', mouseUpHandler);
  element.removeEventListener('mouseleave', mouseLeaveHandler);
  element.removeEventListener('cornerstonetoolsmousedown', toolsMouseDownHandler as EventListener);
  element.removeEventListener('cornerstonetoolsmousemove', toolsMouseMoveHandler as EventListener);
  element.removeEventListener('cornerstonetoolsmouseup', toolsMouseUpHandler as EventListener);
  element.removeEventListener('wheel', wheelHandler);
  
  // Add event listeners to the element
  element.addEventListener('cornerstoneimagerendered', updateZoomLevel);
  element.addEventListener('mousedown', mouseDownHandler);
  element.addEventListener('mousemove', mouseMoveHandler);
  element.addEventListener('mouseup', mouseUpHandler);
  element.addEventListener('mouseleave', mouseLeaveHandler);
  element.addEventListener('cornerstonetoolsmousedown', toolsMouseDownHandler as EventListener);
  element.addEventListener('cornerstonetoolsmousemove', toolsMouseMoveHandler as EventListener);
  element.addEventListener('cornerstonetoolsmouseup', toolsMouseUpHandler as EventListener);
  element.addEventListener('wheel', wheelHandler, { passive: false });
  
  console.log("DicomTools: Enhanced event handlers set up with complete mouse & trackpad support");
  
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
      } else if (name === 'mouseDownHandler') {
        element.removeEventListener('mousedown', handler);
      } else if (name === 'mouseMoveHandler') {
        element.removeEventListener('mousemove', handler);
      } else if (name === 'mouseUpHandler') {
        element.removeEventListener('mouseup', handler);
      } else if (name === 'mouseLeaveHandler') {
        element.removeEventListener('mouseleave', handler);
      } else if (name === 'toolsMouseDownHandler') {
        element.removeEventListener('cornerstonetoolsmousedown', handler);
      } else if (name === 'toolsMouseMoveHandler') {
        element.removeEventListener('cornerstonetoolsmousemove', handler);
      } else if (name === 'toolsMouseUpHandler') {
        element.removeEventListener('cornerstonetoolsmouseup', handler);
      } else if (name === 'wheelHandler') {
        element.removeEventListener('wheel', handler);
      }
    });
    
    console.log("DicomTools: Event listeners cleaned up");
  } catch (error) {
    console.warn("DicomTools: Error during cleanup:", error);
  }
}
