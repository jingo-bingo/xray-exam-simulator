
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';
import { CornerstoneTool } from './types';
import { isCornerstoneInitialized } from '@/utils/cornerstoneInit';
import { toolsState } from './toolsState';
import { toolsRegistry } from './toolsRegistry';
import { elementTools } from './elementTools';

// Initialize cornerstone tools once when the component mounts
export function initializeCornerStoneTools(): {
  success: boolean;
  error: string | null;
} {
  try {
    console.log("DicomTools: Starting cornerstone-tools initialization");
    
    // If tools already registered, return success immediately
    if (toolsState.areToolsRegistered()) {
      console.log("DicomTools: Tools already registered, skipping initialization");
      return { success: true, error: null };
    }
    
    // Check if cornerstone core is initialized first
    if (!isCornerstoneInitialized()) {
      console.error("DicomTools: Cornerstone core not initialized yet, cannot initialize tools");
      return { success: false, error: "Cornerstone core not initialized yet" };
    }
    
    // Check if cornerstone is already initialized
    if (!cornerstone) {
      console.error("DicomTools: Cornerstone core not available");
      return { success: false, error: "Cornerstone core not available" };
    }

    // Make sure cornerstone tools is available
    if (!cornerstoneTools) {
      console.error("DicomTools: Cornerstone tools library not available");
      return { success: false, error: "Cornerstone tools library not available" };
    }

    // Set up external dependencies
    const setupResult = toolsRegistry.setupExternalDependencies();
    if (!setupResult.success) {
      return setupResult;
    }

    // Initialize tools with configuration
    const initResult = toolsRegistry.initializeTools();
    if (!initResult.success) {
      return initResult;
    }
    
    // Register all tools
    const registerResult = toolsRegistry.registerTools();
    if (!registerResult.success) {
      return registerResult;
    }
    
    // Mark tools as registered
    toolsState.setToolsRegistered(true);
    
    return { success: true, error: null };
  } catch (e) {
    console.error("DicomTools: Error initializing cornerstone tools:", e);
    return { 
      success: false, 
      error: `Failed to initialize DICOM tools: ${e instanceof Error ? e.message : 'Unknown error'}`
    };
  }
}

// Set up tools on a specific element
export function setupElementTools(element: HTMLDivElement, activeTool: CornerstoneTool | null): {
  success: boolean;
  error: string | null;
} {
  try {
    // Verify cornerstone and cornerstone tools are initialized
    if (!cornerstone || !cornerstoneTools) {
      console.error("DicomTools: Cornerstone libraries not available");
      return { success: false, error: "Cornerstone libraries not available" };
    }
    
    // Make sure the element is enabled for cornerstone
    try {
      cornerstone.getEnabledElement(element);
    } catch (e) {
      console.log("DicomTools: Element not enabled for cornerstone yet, skipping tool setup");
      return { success: false, error: "Element not enabled for cornerstone" };
    }

    console.log("DicomTools: Setting up tools on element");

    // Clean up any existing tool state on this element
    elementTools.cleanupElementToolState(element);

    // Add the tools to this element
    const addResult = elementTools.addToolsToElement(element);
    if (!addResult.success) {
      return addResult;
    }

    // Ensure element can capture all events
    elementTools.prepareElementForInteraction(element);

    // Set initial active tool
    const toolResult = elementTools.setInitialActiveTool(element, activeTool);
    if (!toolResult.success) {
      return toolResult;
    }
    
    return { success: true, error: null };
  } catch (e) {
    console.error("DicomTools: Error setting up tools on element:", e);
    return { 
      success: false, 
      error: `Error setting up DICOM tools: ${e instanceof Error ? e.message : 'Unknown error'}`
    };
  }
}

// Export the prepare function for compatibility
export const prepareElementForInteraction = elementTools.prepareElementForInteraction;
