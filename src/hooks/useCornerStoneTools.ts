
import { useEffect, useState, RefObject, useCallback, useRef } from 'react';
import { UseCornerStoneToolsReturn } from './cornerstone/types';
import { initializeCornerStoneTools, setupElementTools } from './cornerstone/initializeTools';
import { createEventHandlers, removeEventHandlers } from './cornerstone/eventHandlers';
import { activateToolForElement, resetViewToNatural } from './cornerstone/toolOperations';

export function useCornerStoneTools(
  viewerRef: RefObject<HTMLDivElement>,
  enabled: boolean = true
): UseCornerStoneToolsReturn {
  // State for tracking tool initialization status
  const [isToolsInitialized, setIsToolsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0); // Default zoom level is 1.0 (100%)
  const eventHandlersRef = useRef<{ [key: string]: EventListener }>({});
  const toolsRegisteredRef = useRef(false);

  // Initialize cornerstone tools once when the component mounts
  useEffect(() => {
    if (!enabled) return;

    // Safety check - don't try to initialize if already done
    if (isToolsInitialized) {
      console.log("DicomTools: Tools already initialized, skipping initialization");
      return;
    }

    // Initialize tools
    const { success, error } = initializeCornerStoneTools();
    
    if (success) {
      toolsRegisteredRef.current = true;
      setIsToolsInitialized(true);
      setError(null);
    } else {
      setError(error);
      setIsToolsInitialized(false);
      toolsRegisteredRef.current = false;
    }
  }, [enabled, isToolsInitialized]);

  // Set up tools on the element when both element and tools are ready
  useEffect(() => {
    if (!viewerRef.current || !isToolsInitialized || !toolsRegisteredRef.current || !enabled) {
      console.log("DicomTools: Skipping tool setup - prerequisites not met", {
        elementAvailable: !!viewerRef.current,
        toolsInitialized: isToolsInitialized,
        toolsRegistered: toolsRegisteredRef.current,
        enabled: enabled
      });
      return;
    }

    const element = viewerRef.current;
    
    // Setup tools for this element
    const { error: setupError } = setupElementTools(element, activeTool);
    if (setupError) {
      setError(setupError);
    }
    
    // Set up event handlers
    eventHandlersRef.current = createEventHandlers(element, setZoomLevel, activeTool);
    
    // Cleanup function to remove event listeners
    return () => {
      if (viewerRef.current) {
        removeEventHandlers(viewerRef.current, eventHandlersRef.current);
        eventHandlersRef.current = {};
      }
    };
  }, [viewerRef, isToolsInitialized, activeTool, enabled]);

  // Function to activate a specific tool with proper mouse button configuration
  const activateTool = useCallback((toolName: string) => {
    if (!isToolsInitialized || !viewerRef.current || !toolsRegisteredRef.current) {
      console.warn("DicomTools: Cannot activate tool - tools not initialized or viewer not ready");
      return;
    }

    const { success, error: activationError } = activateToolForElement(viewerRef.current, toolName);
    
    if (success) {
      setActiveTool(toolName);
    } else {
      setError(activationError);
    }
  }, [isToolsInitialized, viewerRef]);

  // Function to reset the view to natural size
  const resetView = useCallback(() => {
    if (!viewerRef.current) return;

    const { success, error: resetError } = resetViewToNatural(viewerRef.current);
    
    if (success) {
      setZoomLevel(1.0); // Update zoom level state
    } else {
      setError(resetError);
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
