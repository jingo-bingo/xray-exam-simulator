
import cornerstone from 'cornerstone-core';

// Define custom event interface for cornerstone tool events
export interface CornerstoneToolsMouseEvent extends Event {
  detail?: {
    element: HTMLElement;
    currentPoints: {
      canvas: { x: number; y: number };
      image: { x: number; y: number };
    };
  };
}

// Tool types
export type CornerstoneTool = 'Zoom' | 'Pan' | 'Wwwc';

// Tool state
export interface CornerstoneToolState {
  isToolsInitialized: boolean;
  error: string | null;
  activeTool: string | null;
  zoomLevel: number;
}

// Hook return type
export interface UseCornerStoneToolsReturn {
  isToolsInitialized: boolean;
  error: string | null;
  activeTool: string | null;
  activateTool: (toolName: string) => void;
  resetView: () => void;
  zoomLevel: number;
}

// Add TypeScript declaration to extend HTMLDivElement with our custom property
declare global {
  interface HTMLDivElement {
    cornerstoneToolsRemoveHandlers?: () => void;
  }
}
