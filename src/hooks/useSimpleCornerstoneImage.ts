
import { useState, useEffect, useRef, RefObject } from 'react';
import cornerstone from 'cornerstone-core';
import { DicomMetadata } from '@/components/admin/DicomMetadataDisplay';
import { imageLoader } from './cornerstone/imageLoader';
import { canvasUtils } from './cornerstone/canvasUtils';

interface UseSimpleCornerstoneImageResult {
  isLoading: boolean;
  error: string | null;
  imageDisplayed: boolean;
  loadImage: (url: string) => Promise<void>;
}

export function useSimpleCornerstoneImage(
  viewerRef: RefObject<HTMLDivElement>,
  isInitialized: boolean,
  onMetadataLoaded?: (metadata: DicomMetadata) => void,
  instanceId: string = "default"
): UseSimpleCornerstoneImageResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageDisplayed, setImageDisplayed] = useState(false);
  
  const isMounted = useRef(true);
  const loadingAttemptRef = useRef<AbortController | null>(null);
  const currentImageUrlRef = useRef<string | null>(null);
  const elementEnabled = useRef(false);
  
  // Clean up function to safely disable cornerstone on the element
  const cleanupElement = () => {
    if (!viewerRef.current) return;
    
    try {
      if (elementEnabled.current) {
        try {
          cornerstone.getElementData(viewerRef.current);
          console.log(`useSimpleCornerstoneImage[${instanceId}]: Disabling cornerstone element`);
          cornerstone.disable(viewerRef.current);
          elementEnabled.current = false;
        } catch {
          // Element not enabled, nothing to clean up
        }
      }
    } catch (error) {
      console.warn(`useSimpleCornerstoneImage[${instanceId}]: Error during cleanup:`, error);
    }
  };
  
  // Set up cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      console.log(`useSimpleCornerstoneImage[${instanceId}]: Cleaning up`);
      isMounted.current = false;
      
      if (loadingAttemptRef.current) {
        loadingAttemptRef.current.abort();
        loadingAttemptRef.current = null;
      }
      
      cleanupElement();
    };
  }, [instanceId]);
  
  // Enable cornerstone on element
  const enableElement = (element: HTMLDivElement): boolean => {
    try {
      console.log(`useSimpleCornerstoneImage[${instanceId}]: Enabling cornerstone on element`);
      
      const { width, height } = canvasUtils.getContainerDimensions(element);
      canvasUtils.prepareElementStyles(element, width, height);
      
      // Try WebGL first, fallback to canvas
      try {
        cornerstone.enable(element, { renderer: 'webgl' });
      } catch (enableError) {
        console.warn(`useSimpleCornerstoneImage[${instanceId}]: WebGL failed, using canvas:`, enableError);
        cornerstone.enable(element);
      }
      
      elementEnabled.current = true;
      console.log(`useSimpleCornerstoneImage[${instanceId}]: Cornerstone enabled`);
      return true;
    } catch (error) {
      console.error(`useSimpleCornerstoneImage[${instanceId}]: Error enabling cornerstone:`, error);
      return false;
    }
  };
  
  // Function to load and display an image
  const loadImage = async (imageUrl: string): Promise<void> => {
    if (!viewerRef.current || !imageUrl || !isInitialized) {
      console.log(`useSimpleCornerstoneImage[${instanceId}]: Cannot load image - prerequisites not met`);
      return;
    }
    
    // Skip if URL hasn't changed
    if (currentImageUrlRef.current === imageUrl && imageDisplayed) {
      console.log(`useSimpleCornerstoneImage[${instanceId}]: URL unchanged, skipping reload`);
      return;
    }
    
    console.log(`useSimpleCornerstoneImage[${instanceId}]: Loading image:`, imageUrl);
    currentImageUrlRef.current = imageUrl;
    
    setIsLoading(true);
    setError(null);
    
    // Abort any pending operations
    if (loadingAttemptRef.current) {
      loadingAttemptRef.current.abort();
    }
    loadingAttemptRef.current = new AbortController();
    
    const element = viewerRef.current;
    
    // Enable element if needed
    if (!elementEnabled.current) {
      if (!enableElement(element)) {
        if (!isMounted.current) return;
        setError("Failed to initialize viewer");
        setIsLoading(false);
        return;
      }
    }

    // Load and display image
    try {
      await imageLoader.loadAndDisplayImage({
        imageUrl,
        element,
        instanceId,
        onMetadataLoaded,
        isMounted
      });
      
      if (!isMounted.current) return;
      
      setIsLoading(false);
      setImageDisplayed(true);
    } catch (error) {
      if (!isMounted.current) return;
      
      console.error(`useSimpleCornerstoneImage[${instanceId}]: Image loading failed:`, error);
      setError(error instanceof Error ? error.message : "Failed to load image");
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    imageDisplayed,
    loadImage
  };
}
