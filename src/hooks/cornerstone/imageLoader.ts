
import cornerstone from 'cornerstone-core';
import { extractMetadata } from '@/utils/dicomMetadataExtractor';
import { DicomMetadata } from '@/components/admin/DicomMetadataDisplay';
import { imageCache } from './imageCache';
import { canvasUtils } from './canvasUtils';

interface LoadImageOptions {
  imageUrl: string;
  element: HTMLElement;
  instanceId: string;
  onMetadataLoaded?: (metadata: DicomMetadata) => void;
  isMounted: { current: boolean };
}

export const imageLoader = {
  /**
   * Determine image ID based on URL
   */
  getImageId: (imageUrl: string): string => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
    const isImageFormat = imageExtensions.some(ext => imageUrl.toLowerCase().endsWith(ext));
    
    return isImageFormat ? `webImage:${imageUrl}` : `wadouri:${imageUrl}`;
  },

  /**
   * Load and display image with caching
   */
  loadAndDisplayImage: async (options: LoadImageOptions): Promise<void> => {
    const { imageUrl, element, instanceId, onMetadataLoaded, isMounted } = options;
    
    const imageId = imageLoader.getImageId(imageUrl);
    console.log(`imageLoader[${instanceId}]: Loading image with imageId:`, imageId);

    // Check cache first
    if (imageCache.has(imageId)) {
      console.log(`imageLoader[${instanceId}]: Using cached image`);
      const image = imageCache.get(imageId);
      
      if (!isMounted.current) return;
      
      cornerstone.displayImage(element, image);
      setTimeout(() => {
        canvasUtils.resizeCanvasToContainer(element, instanceId);
      }, 100);
      
      return;
    }

    // Load new image
    await imageLoader.loadNewImage(imageId, options);
  },

  /**
   * Load a new image from URL
   */
  loadNewImage: async (imageId: string, options: LoadImageOptions): Promise<void> => {
    const { imageUrl, element, instanceId, onMetadataLoaded, isMounted } = options;
    const isWebImage = imageId.startsWith('webImage:');

    try {
      console.log(`imageLoader[${instanceId}]: Loading new image:`, imageId);
      const image = await cornerstone.loadImage(imageId);
      
      if (!isMounted.current) return;
      
      imageCache.set(imageId, image);
      
      // Extract metadata for DICOM images
      if (!isWebImage && onMetadataLoaded) {
        const metadata = extractMetadata(image);
        console.log(`imageLoader[${instanceId}]: Metadata extracted`, metadata);
        onMetadataLoaded(metadata);
      }
      
      cornerstone.displayImage(element, image);
      setTimeout(() => {
        canvasUtils.resizeCanvasToContainer(element, instanceId);
      }, 100);
      
    } catch (error) {
      // Fallback to web image if DICOM fails
      if (!isWebImage) {
        await imageLoader.tryWebImageFallback(imageUrl, options);
      } else {
        throw error;
      }
    }
  },

  /**
   * Try loading as web image when DICOM fails
   */
  tryWebImageFallback: async (imageUrl: string, options: LoadImageOptions): Promise<void> => {
    const { element, instanceId, isMounted } = options;
    
    try {
      const webImageId = `webImage:${imageUrl}`;
      console.log(`imageLoader[${instanceId}]: DICOM load failed, trying as web image:`, webImageId);
      
      const image = await cornerstone.loadImage(webImageId);
      
      if (!isMounted.current) return;
      
      imageCache.set(webImageId, image);
      cornerstone.displayImage(element, image);
      
      setTimeout(() => {
        canvasUtils.resizeCanvasToContainer(element, instanceId);
      }, 100);
      
    } catch (webImageError) {
      console.error(`imageLoader[${instanceId}]: Web image load also failed:`, webImageError);
      throw webImageError;
    }
  }
};
