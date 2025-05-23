
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
  
  console.log("DicomViewer: Trackpad support configured");
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
      } : {})
    });
  };

  // Log core mouse events
  element.addEventListener('mousedown', e => logEvent(e, 'mousedown'), true);
  element.addEventListener('mousemove', e => logEvent(e, 'mousemove'), true);
  element.addEventListener('mouseup', e => logEvent(e, 'mouseup'), true);
  element.addEventListener('wheel', e => logEvent(e, 'wheel'), true);

  // Log cornerstone-specific events
  element.addEventListener('cornerstonetoolsmousedown', 
    (e: Event) => console.log('cornerstonetoolsmousedown event:', (e as CornerstoneToolsEvent).detail), true);
  element.addEventListener('cornerstonetoolsmousemove', 
    (e: Event) => console.log('cornerstonetoolsmousemove event:', (e as CornerstoneToolsEvent).detail), true);
  element.addEventListener('cornerstonetoolsmouseup', 
    (e: Event) => console.log('cornerstonetoolsmouseup event:', (e as CornerstoneToolsEvent).detail), true);
    
  console.log("DicomViewer: Event logging configured");
}
