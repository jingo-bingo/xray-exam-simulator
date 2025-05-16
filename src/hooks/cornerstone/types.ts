
import cornerstone from 'cornerstone-core';

// Enhanced interface for cornerstone tool events with more specific properties
export interface CornerstoneToolsMouseEvent extends Event {
  detail?: {
    element: HTMLElement;
    currentPoints: {
      canvas: { x: number; y: number };
      image: { x: number; y: number };
    };
    startPoints?: {
      canvas: { x: number; y: number };
      image: { x: number; y: number };
    };
    deltaPoints?: {
      canvas: { x: number; y: number };
      image: { x: number; y: number };
    };
    lastPoints?: {
      canvas: { x: number; y: number };
      image: { x: number; y: number };
    };
    eventData?: any;
  };
}

// Tool types - explicit type for cornerstone tool names
export type CornerstoneTool = 'Zoom' | 'Pan' | 'Wwwc' | 'Rotate';

// Tool state
export interface CornerstoneToolState {
  isToolsInitialized: boolean;
  error: string | null;
  activeTool: CornerstoneTool | null;
  zoomLevel: number;
}

// Hook return type
export interface UseCornerStoneToolsReturn {
  isToolsInitialized: boolean;
  error: string | null;
  activeTool: CornerstoneTool | null;
  activateTool: (toolName: CornerstoneTool) => void;
  resetView: () => void;
  zoomLevel: number;
}

// Add TypeScript declaration to extend HTMLDivElement with our custom property
declare global {
  interface HTMLDivElement {
    cornerstoneToolsRemoveHandlers?: () => void;
  }
}
