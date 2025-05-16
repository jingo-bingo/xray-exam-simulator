
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
  
  // Enhanced mouse event handling with proper event chain and direct viewport manipulation
  let isMouseDown = false;
  let previousMouseX = 0;
  let previousMouseY = 0;
  let dragStartX = 0;
  let dragStartY = 0;
  
  // Get initial viewport state for reference during operations
  const getInitialViewport = () => {
    try {
      return cornerstone.getViewport(element);
    } catch (e) {
      console.warn("DicomTools: Error getting viewport:", e);
      return null;
    }
  };
  
  // Store initial viewport state at start of drag
  let initialViewport: any = null;
  
  // Mouse down handler - starting point for drag operations
  const mouseDownHandler = (event: MouseEvent) => {
    if (event.button !== 0) return; // Only handle left mouse button (0)
    
    // Prevent default behaviors
    event.preventDefault();
    event.stopPropagation();
    
    isMouseDown = true;
    previousMouseX = event.clientX;
    previousMouseY = event.clientY;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    
    // Store initial viewport state for reference during the drag operation
    initialViewport = getInitialViewport();
    
    console.log("DicomTools: Mouse down captured", {
      button: event.button,
      buttons: event.buttons,
      clientX: event.clientX,
      clientY: event.clientY,
      currentTool: activeTool
    });
    
    // Add temporary global event listeners for move and up
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
    
    // Mark element as active for styling
    element.classList.add('cornerstone-active-tool');
    
    // Set cursor based on active tool
    switch (activeTool) {
      case 'Zoom':
        element.style.cursor = 'zoom-in';
        break;
      case 'Pan':
        element.style.cursor = 'grab';
        break;
      case 'Wwwc':
        element.style.cursor = 'contrast';
        break;
      case 'Rotate':
        element.style.cursor = 'alias';
        break;
      default:
        element.style.cursor = 'default';
    }
  };
  
  // Mouse move handler - called during drag operations
  const mouseMoveHandler = (event: MouseEvent) => {
    if (!isMouseDown || !activeTool) return;
    
    // Prevent default behaviors
    event.preventDefault();
    event.stopPropagation();
    
    const deltaX = event.clientX - previousMouseX;
    const deltaY = event.clientY - previousMouseY;
    previousMouseX = event.clientX;
    previousMouseY = event.clientY;
    
    // Get total displacement from start of drag
    const totalDeltaX = event.clientX - dragStartX;
    const totalDeltaY = event.clientY - dragStartY;
    
    console.log("DicomTools: Mouse move during drag", {
      deltaX, 
      deltaY,
      totalDeltaX,
      totalDeltaY,
      currentTool: activeTool
    });
    
    // Get current viewport for manipulation
    try {
      const viewport = cornerstone.getViewport(element);
      
      // Implement direct viewport manipulation based on active tool
      switch (activeTool) {
        case 'Zoom':
          // Convert vertical movement to zoom factor
          // Moving up = zoom in, moving down = zoom out
          const zoomFactor = 1.0 + (deltaY * -0.01);
          viewport.scale *= zoomFactor;
          
          // Update UI with new zoom level
          setZoomLevel(viewport.scale);
          console.log("DicomTools: Manual mouse zoom applied", viewport.scale);
          break;
          
        case 'Pan':
          // Apply panning based on mouse movement
          viewport.translation.x += deltaX / 5;
          viewport.translation.y += deltaY / 5;
          console.log("DicomTools: Manual mouse pan applied", viewport.translation);
          break;
          
        case 'Rotate':
          // Convert horizontal movement to rotation
          // 100px movement = 45 degrees
          const angleDelta = deltaX * 0.45;
          viewport.rotation += angleDelta;
          console.log("DicomTools: Manual mouse rotation applied", viewport.rotation);
          break;
          
        case 'Wwwc':
          if (!initialViewport) break;
          
          // Window width/level (contrast/brightness) adjustment
          // Horizontal = window width (contrast)
          // Vertical = window level (brightness)
          const widthDelta = totalDeltaX;
          const levelDelta = totalDeltaY;
          
          // Scale factors - adjust these to control sensitivity
          const wwScale = 4;
          const wlScale = 4;
          
          // Start from the initial values to prevent compounding changes
          viewport.voi.windowWidth = initialViewport.voi.windowWidth + (widthDelta * wwScale);
          viewport.voi.windowCenter = initialViewport.voi.windowCenter - (levelDelta * wlScale);
          
          // Ensure positive window width
          if (viewport.voi.windowWidth < 1) viewport.voi.windowWidth = 1;
          
          console.log("DicomTools: Manual mouse window level applied", {
            windowWidth: viewport.voi.windowWidth,
            windowCenter: viewport.voi.windowCenter
          });
          break;
      }
      
      // Apply the modified viewport
      cornerstone.setViewport(element, viewport);
    } catch (e) {
      console.warn("DicomTools: Error updating viewport during mouse move:", e);
    }
  };
  
  // Mouse up handler - complete the interaction
  const mouseUpHandler = (event: MouseEvent) => {
    if (event.button !== 0) return; // Only handle left mouse button (0)
    
    // Prevent default behaviors
    event.preventDefault();
    event.stopPropagation();
    
    console.log("DicomTools: Mouse up, completing interaction", {
      clientX: event.clientX,
      clientY: event.clientY,
      currentTool: activeTool
    });
    
    isMouseDown = false;
    initialViewport = null; // Clear the initial viewport reference
    
    // Remove the temporary global listeners
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
    
    // Reset cursor and remove active styling
    element.style.cursor = 'default';
    element.classList.remove('cornerstone-active-tool');
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
    } else if (event.altKey) {
      // Alt+scroll can be used for rotation when Rotate tool is active
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

    // Note: We're intentionally not handling wheel events for Wwwc (Window Level) tool
    // as this tool is better used with mouse drag. Adding trackpad support for Wwwc
    // would require a more complex implementation.
  };
  
  // Store references to ALL handlers to ensure proper cleanup
  eventHandlers.zoomHandler = updateZoomLevel;
  eventHandlers.mouseDownHandler = mouseDownHandler;
  eventHandlers.mouseMoveHandler = mouseMoveHandler;
  eventHandlers.mouseUpHandler = mouseUpHandler;
  eventHandlers.toolsMouseDownHandler = toolsMouseDownHandler as EventListener;
  eventHandlers.wheelHandler = wheelHandler;
  
  // Remove previous listeners to avoid duplicates
  element.removeEventListener('cornerstoneimagerendered', updateZoomLevel);
  element.removeEventListener('mousedown', mouseDownHandler);
  document.removeEventListener('mousemove', mouseMoveHandler);
  document.removeEventListener('mouseup', mouseUpHandler);
  element.removeEventListener('cornerstonetoolsmousedown', toolsMouseDownHandler as EventListener);
  element.removeEventListener('wheel', wheelHandler);
  
  // Add event listeners to the element
  element.addEventListener('cornerstoneimagerendered', updateZoomLevel);
  element.addEventListener('mousedown', mouseDownHandler, { passive: false });
  element.addEventListener('cornerstonetoolsmousedown', toolsMouseDownHandler as EventListener);
  element.addEventListener('wheel', wheelHandler, { passive: false });
  
  // Add CSS for visual feedback when tools are active
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .cornerstone-active-tool {
      cursor: grabbing !important;
    }
  `;
  document.head.appendChild(styleEl);
  
  // Store the style element reference for cleanup
  eventHandlers.styleElement = styleEl as unknown as EventListener;
  
  console.log("DicomTools: Enhanced event handlers set up with direct viewport manipulation");
  
  return eventHandlers;
}

// Improved cleanup function to remove all event handlers
export function removeEventHandlers(element: HTMLDivElement, handlers: { [key: string]: EventListener }): void {
  try {
    // Remove all event listeners using stored references
    if (handlers.zoomHandler) {
      element.removeEventListener('cornerstoneimagerendered', handlers.zoomHandler);
      console.log("DicomTools: Removed zoom event handler");
    }
    
    if (handlers.mouseDownHandler) {
      element.removeEventListener('mousedown', handlers.mouseDownHandler);
      console.log("DicomTools: Removed mousedown handler");
    }
    
    if (handlers.mouseMoveHandler) {
      document.removeEventListener('mousemove', handlers.mouseMoveHandler);
      console.log("DicomTools: Removed document mousemove handler");
    }
    
    if (handlers.mouseUpHandler) {
      document.removeEventListener('mouseup', handlers.mouseUpHandler);
      console.log("DicomTools: Removed document mouseup handler");
    }
    
    if (handlers.toolsMouseDownHandler) {
      element.removeEventListener('cornerstonetoolsmousedown', handlers.toolsMouseDownHandler);
      console.log("DicomTools: Removed cornerstone tools mousedown handler");
    }
    
    if (handlers.wheelHandler) {
      element.removeEventListener('wheel', handlers.wheelHandler);
      console.log("DicomTools: Removed wheel handler");
    }
    
    // Remove the style element if it exists
    if (handlers.styleElement) {
      const styleElement = handlers.styleElement as unknown as HTMLStyleElement;
      if (styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
        console.log("DicomTools: Removed style element for cursor feedback");
      }
    }
    
    console.log("DicomTools: All event listeners cleaned up");
  } catch (error) {
    console.warn("DicomTools: Error during cleanup:", error);
  }
}
