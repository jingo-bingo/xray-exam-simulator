
import { useEffect, useState, RefObject, useCallback, useRef } from 'react';
import { UseCornerStoneToolsReturn, CornerstoneTool } from './cornerstone/types';
import { initializeCornerStoneTools, setupElementTools } from './cornerstone/initializeTools';
import { createEventHandlers, removeEventHandlers } from './cornerstone/eventHandlers';
import { activateToolForElement, resetViewToNatural } from './cornerstone/toolOperations';
import { isCornerstoneInitialized } from '@/utils/cornerstoneInit';

export function useCornerStoneTools(
  viewerRef: RefObject<HTMLDivElement>,
  enabled: boolean = true
): UseCornerStoneToolsReturn {
  // State for tracking tool initialization status
  const [isToolsInitialized, setIsToolsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<CornerstoneTool | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0); // Default zoom level is 1.0 (100%)
  const eventHandlersRef = useRef<{ [key: string]: EventListener }>({});
  const toolsRegisteredRef = useRef(false);
  const initAttemptRef = useRef(0);
  const MAX_INIT_ATTEMPTS = 3;
  
  // Function to attempt tool initialization with retries
  const attemptToolInitialization = useCallback(() => {
    // Don't try to initialize if disabled or already done
    if (!enabled || isToolsInitialized) return;
    
    // Check if cornerstone core is initialized first
    if (!isCornerstoneInitialized()) {
      console.log("DicomTools: Cornerstone core not initialized yet, deferring tools initialization");
      setError("Waiting for DICOM viewer initialization");
      return;
    }
    
    // Safety check for maximum attempts
    if (initAttemptRef.current >= MAX_INIT_ATTEMPTS) {
      console.error("DicomTools: Exceeded maximum tool initialization attempts");
      setError("Failed to initialize DICOM tools after multiple attempts");
      return;
    }
    
    initAttemptRef.current += 1;
    console.log(`DicomTools: Attempting tools initialization (attempt ${initAttemptRef.current})`);
    
    // Initialize tools
    const { success, error } = initializeCornerStoneTools();
    
    if (success) {
      toolsRegisteredRef.current = true;
      setIsToolsInitialized(true);
      setError(null);
      console.log("DicomTools: Tools initialized successfully");
    } else {
      setError(error);
      setIsToolsInitialized(false);
      toolsRegisteredRef.current = false;
      console.error("DicomTools: Tool initialization failed:", error);
    }
  }, [enabled, isToolsInitialized]);

  // Initialize cornerstone tools once when the component mounts
  // or retry if cornerstone core becomes initialized
  useEffect(() => {
    if (!enabled) return;
    
    // First attempt
    attemptToolInitialization();
    
    // Set up retry if first attempt failed
    if (!isToolsInitialized) {
      const checkInterval = setInterval(() => {
        if (isCornerstoneInitialized() && !isToolsInitialized) {
          console.log("DicomTools: Cornerstone core now initialized, retrying tools initialization");
          attemptToolInitialization();
        }
        
        // Clear interval if initialized or max attempts reached
        if (isToolsInitialized || initAttemptRef.current >= MAX_INIT_ATTEMPTS) {
          clearInterval(checkInterval);
        }
      }, 500);
      
      // Clean up interval
      return () => clearInterval(checkInterval);
    }
  }, [enabled, isToolsInitialized, attemptToolInitialization]);

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
  const activateTool = useCallback((toolName: CornerstoneTool) => {
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
