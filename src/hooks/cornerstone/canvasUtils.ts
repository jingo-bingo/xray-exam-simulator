
import cornerstone from 'cornerstone-core';

export const canvasUtils = {
  /**
   * Resize the canvas to fit the container
   */
  resizeCanvasToContainer: (element: HTMLElement, instanceId: string): void => {
    try {
      const rect = element.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      if (width > 0 && height > 0) {
        console.log(`canvasUtils[${instanceId}]: Resizing canvas to ${width}x${height}`);
        cornerstone.resize(element, true);
        cornerstone.updateImage(element);
      }
    } catch (error) {
      console.warn(`canvasUtils[${instanceId}]: Error resizing canvas:`, error);
    }
  },

  /**
   * Prepare element with proper styles for cornerstone
   */
  prepareElementStyles: (element: HTMLElement, containerWidth: number, containerHeight: number): void => {
    element.style.width = '100%';
    element.style.height = '100%';
    element.style.position = 'relative';
    element.style.outline = 'none';
    element.style.minWidth = `${containerWidth}px`;
    element.style.minHeight = `${containerHeight}px`;
  },

  /**
   * Get container dimensions from element
   */
  getContainerDimensions: (element: HTMLElement): { width: number; height: number } => {
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width || element.offsetWidth || 160,
      height: rect.height || element.offsetHeight || 160
    };
  }
};
