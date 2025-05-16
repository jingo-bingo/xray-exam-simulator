
import { useRef, useEffect } from "react";
import cornerstone from "cornerstone-core";

interface DicomDebugOverlayProps {
  element: HTMLDivElement;
  activeTool: string | null;
  zoomLevel: number;
}

export const DicomDebugOverlay = ({ element, activeTool, zoomLevel }: DicomDebugOverlayProps) => {
  const debugOverlayRef = useRef<HTMLDivElement | null>(null);
  
  // Create and add debug overlay
  useEffect(() => {
    if (!element || debugOverlayRef.current) return;
    
    // Create debug overlay container
    const debugContainer = document.createElement('div');
    debugContainer.style.position = 'absolute';
    debugContainer.style.bottom = '10px';
    debugContainer.style.right = '10px';
    debugContainer.style.zIndex = '1000';
    debugContainer.style.background = 'rgba(0,0,0,0.7)';
    debugContainer.style.padding = '5px';
    debugContainer.style.borderRadius = '5px';
    debugContainer.style.fontSize = '10px';

    const createButton = (name: string, action: () => void) => {
      const btn = document.createElement('button');
      btn.textContent = name;
      btn.style.margin = '2px';
      btn.style.padding = '5px 10px';
      btn.style.background = '#444';
      btn.style.color = 'white';
      btn.style.border = 'none';
      btn.style.borderRadius = '3px';
      btn.style.cursor = 'pointer';
      btn.onclick = action;
      debugContainer.appendChild(btn);
    };

    // Add manual control buttons for direct viewport manipulation
    createButton('Zoom +', () => {
      try {
        const viewport = cornerstone.getViewport(element);
        viewport.scale *= 1.2;
        cornerstone.setViewport(element, viewport);
        console.log('Manual zoom in:', viewport.scale);
      } catch (e) {
        console.error("Debug zoom in error:", e);
      }
    });

    createButton('Zoom -', () => {
      try {
        const viewport = cornerstone.getViewport(element);
        viewport.scale /= 1.2;
        cornerstone.setViewport(element, viewport);
        console.log('Manual zoom out:', viewport.scale);
      } catch (e) {
        console.error("Debug zoom out error:", e);
      }
    });

    createButton('Pan ←', () => {
      try {
        const viewport = cornerstone.getViewport(element);
        viewport.translation.x -= 10;
        cornerstone.setViewport(element, viewport);
        console.log('Manual pan left:', viewport.translation);
      } catch (e) {
        console.error("Debug pan left error:", e);
      }
    });

    createButton('Pan →', () => {
      try {
        const viewport = cornerstone.getViewport(element);
        viewport.translation.x += 10;
        cornerstone.setViewport(element, viewport);
        console.log('Manual pan right:', viewport.translation);
      } catch (e) {
        console.error("Debug pan right error:", e);
      }
    });

    createButton('Reset', () => {
      try {
        cornerstone.reset(element);
        console.log('Manual reset');
      } catch (e) {
        console.error("Debug reset error:", e);
      }
    });

    // Add debug status display
    const statusDisplay = document.createElement('div');
    statusDisplay.style.color = 'white';
    statusDisplay.style.margin = '5px 0';
    statusDisplay.style.fontSize = '9px';
    statusDisplay.textContent = `Active tool: ${activeTool || 'None'}, Zoom: ${Math.round(zoomLevel * 100)}%`;
    debugContainer.appendChild(statusDisplay);

    // Update status periodically
    const updateStatus = () => {
      if (statusDisplay) {
        try {
          const viewport = cornerstone.getViewport(element);
          statusDisplay.textContent = `Active tool: ${activeTool || 'None'}, Zoom: ${Math.round((viewport?.scale || 1) * 100)}%`;
        } catch (e) {
          // Silently fail
        }
        setTimeout(updateStatus, 500);
      }
    };
    updateStatus();

    // Add to DOM
    element.parentNode?.appendChild(debugContainer);
    debugOverlayRef.current = debugContainer;
    
    console.log("DicomViewer: Added debug overlay");

    // Cleanup function
    return () => {
      if (debugOverlayRef.current && debugOverlayRef.current.parentNode) {
        debugOverlayRef.current.parentNode.removeChild(debugOverlayRef.current);
        debugOverlayRef.current = null;
      }
    };
  }, [element, activeTool, zoomLevel]);
  
  // The overlay is created imperatively, so no need to return JSX
  return null;
};
