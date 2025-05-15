
/// <reference types="vite/client" />

// Declare modules that don't have TypeScript definitions
declare module 'cornerstone-web-image-loader';
declare module 'cornerstone-wado-image-loader';

// Add type declaration for Hammer.js which is used by cornerstone-tools
interface Window {
  Hammer: any;
}
