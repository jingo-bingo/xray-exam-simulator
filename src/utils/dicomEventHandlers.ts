
import { CornerstoneToolsEvent } from "@/components/admin/types/CornerstoneTypes";

// Configure element for optimal trackpad interaction
export function setupTrackpadSupport(element: HTMLDivElement) {
  // Essential styles for proper event capture and preventing browser gestures
  element.style.width = '100%';
  element.style.height = '100%';
  element.style.position = 'relative';
  element.style.outline = 'none';
  element.style.webkitUserSelect = 'none'; // Fixed property name
  element.style.userSelect = 'none';
  element.style.touchAction = 'none'; // Critical for proper trackpad/touch handling
  element.tabIndex = 0; // Make element focusable
  
  // Ensure the element can receive pointer/mouse events
  element.style.pointerEvents = 'all';
  
  // Add focus handling to ensure keyboard shortcuts work
  element.addEventListener('mouseenter', () => {
    element.focus();
  });
  
  // Apply this attribute to prevent browser default actions for certain events
  element.setAttribute('data-no-default', 'true');
  
  // Set explicit cursor style - will be overridden by tool-specific styles
  element.style.cursor = 'default';
  
  console.log("DicomViewer: Trackpad and mouse support configured");
}

// Add additional event logging for better debugging
export function setupEventLogging(element: HTMLDivElement) {
  const logEvent = (event: Event, name: string) => {
    console.log(`DicomViewer: ${name} event`, {
      type: event.type,
      target: event.target,
      currentTarget: event.currentTarget,
      eventPhase: event.eventPhase,
      ...(event instanceof MouseEvent ? {
        clientX: event.clientX,
        clientY: event.clientY,
        offsetX: event.offsetX,
        offsetY: event.offsetY,
        button: event.button,
        buttons: event.buttons,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
      } : {}),
      ...(event instanceof WheelEvent ? {
        deltaX: event.deltaX,
        deltaY: event.deltaY,
        deltaMode: event.deltaMode,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
      } : {})
    });
  };

  // Log core mouse events
  element.addEventListener('mousedown', e => logEvent(e, 'mousedown'), true);
  element.addEventListener('mousemove', e => logEvent(e, 'mousemove'), true);
  element.addEventListener('mouseup', e => logEvent(e, 'mouseup'), true);
  element.addEventListener('wheel', e => logEvent(e, 'wheel'), true);

  // Additional mouse events for better tracking
  element.addEventListener('click', e => logEvent(e, 'click'), true);
  element.addEventListener('dblclick', e => logEvent(e, 'dblclick'), true);
  element.addEventListener('mouseleave', e => logEvent(e, 'mouseleave'), true);
  element.addEventListener('mouseenter', e => logEvent(e, 'mouseenter'), true);

  // Log cornerstone-specific events
  element.addEventListener('cornerstonetoolsmousedown', 
    (e: Event) => console.log('cornerstonetoolsmousedown event:', (e as CornerstoneToolsEvent).detail), true);
  element.addEventListener('cornerstonetoolsmousemove', 
    (e: Event) => {
      // Only log occasionally to reduce console spam
      if (Math.random() < 0.05) {
        console.log('cornerstonetoolsmousemove event:', (e as CornerstoneToolsEvent).detail);
      }
    }, true);
  element.addEventListener('cornerstonetoolsmouseup', 
    (e: Event) => console.log('cornerstonetoolsmouseup event:', (e as CornerstoneToolsEvent).detail), true);
  
  // Add debugging for drag operation
  let isDragging = false;
  
  element.addEventListener('mousedown', () => {
    isDragging = false;
    console.log('DicomViewer: Started potential drag operation');
  }, true);
  
  element.addEventListener('mousemove', (e: MouseEvent) => {
    // Only track if buttons are pressed (actual drag)
    if (e.buttons > 0) {
      if (!isDragging) {
        console.log('DicomViewer: Drag operation detected');
        isDragging = true;
      }
    }
  }, true);
  
  element.addEventListener('mouseup', () => {
    if (isDragging) {
      console.log('DicomViewer: Drag operation completed');
    } else {
      console.log('DicomViewer: Click operation completed (no drag)');
    }
    isDragging = false;
  }, true);
    
  console.log("DicomViewer: Enhanced event logging configured");
}

// Helper to prevent default browser actions on an element
export function preventDefaultEvents(element: HTMLDivElement) {
  const preventDefault = (e: Event) => {
    if ((e.target as HTMLElement).closest('[data-no-default="true"]')) {
      e.preventDefault();
      return false;
    }
    return true;
  };
  
  // Prevent context menu to avoid interfering with tool operations
  element.addEventListener('contextmenu', e => {
    e.preventDefault();
    return false;
  });
  
  console.log("DicomViewer: Default event prevention configured");
}
