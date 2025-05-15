
/// <reference types="vite/client" />

// Declare modules that don't have TypeScript definitions
declare module 'cornerstone-web-image-loader';
declare module 'cornerstone-wado-image-loader';
declare module 'cornerstone-tools';

// Define types for the cornerstone tools library
interface CornerstoneToolsStatic {
  init: (config?: any) => void;
  addTool: (tool: any) => void;
  addToolForElement: (element: HTMLElement, tool: any) => void;
  setToolActive: (toolName: string, options: { mouseButtonMask?: number }) => void;
  setToolEnabled: (toolName: string) => void;
  setToolDisabled: (toolName: string) => void;
  external: {
    cornerstone: any;
    Hammer: any;
  };
  importInternal: (module: string) => any;
  store: {
    state: {
      [key: string]: any;
    }
  };
}

