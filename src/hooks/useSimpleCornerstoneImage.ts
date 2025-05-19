
import { useState, useEffect, useRef, RefObject } from 'react';
import cornerstone from 'cornerstone-core';
import { DicomMetadata } from '@/components/admin/DicomMetadataDisplay';
import { extractMetadata } from '@/utils/dicomMetadataExtractor';

interface UseSimpleCornerstoneImageResult {
  isLoading: boolean;
  error: string | null;
  imageDisplayed: boolean;
  loadImage: (url: string) => Promise<void>;
}

// Cache for loaded images to prevent re-fetching
const loadedImages = new Map<string, any>();

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
  const imageInstanceRef = useRef<any>(null);
  const elementEnabled = useRef(false);
  
  // Clean up function to safely disable cornerstone on the element
  const cleanupElement = () => {
    if (!viewerRef.current) return;
    
    try {
      // Only disable if cornerstone knows about this element
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
      
      // Abort any pending load operations
      if (loadingAttemptRef.current) {
        loadingAttemptRef.current.abort();
        loadingAttemptRef.current = null;
      }
      
      cleanupElement();
    };
  }, [instanceId]);
  
  // Function to load and display an image
  const loadImage = async (imageUrl: string): Promise<void> => {
    if (!viewerRef.current || !imageUrl || !isInitialized) {
      console.log(`useSimpleCornerstoneImage[${instanceId}]: Cannot load image - prerequisites not met`, {
        element: !!viewerRef.current,
        url: !!imageUrl,
        initialized: isInitialized
      });
      return;
    }
    
    // Skip if URL hasn't changed to prevent unnecessary reloads
    if (currentImageUrlRef.current === imageUrl && imageDisplayed) {
      console.log(`useSimpleCornerstoneImage[${instanceId}]: URL unchanged, skipping reload`);
      return;
    }
    
    console.log(`useSimpleCornerstoneImage[${instanceId}]: Loading image:`, imageUrl);
    currentImageUrlRef.current = imageUrl;
    
    // Reset states when URL changes
    setIsLoading(true);
    setError(null);
    
    // Create abort controller for this loading attempt
    if (loadingAttemptRef.current) {
      loadingAttemptRef.current.abort();
    }
    loadingAttemptRef.current = new AbortController();
    
    const element = viewerRef.current;
    
    // Enable the element for cornerstone if needed
    if (!elementEnabled.current) {
      try {
        console.log(`useSimpleCornerstoneImage[${instanceId}]: Enabling cornerstone on element`);
        
        // Basic element preparation
        element.style.width = '100%';
        element.style.height = '100%';
        element.style.position = 'relative';
        element.style.outline = 'none';
        
        // Try to safely enable the element
        try {
          cornerstone.enable(element, { renderer: 'webgl' });
        } catch (enableError) {
          console.warn(`useSimpleCornerstoneImage[${instanceId}]: Error with WebGL renderer, falling back to canvas:`, enableError);
          
          // Retry with canvas renderer
          try {
            cornerstone.enable(element);
          } catch (canvasError) {
            throw new Error(`Failed to enable cornerstone with either renderer: ${canvasError instanceof Error ? canvasError.message : 'Unknown error'}`);
          }
        }
        
        elementEnabled.current = true;
        console.log(`useSimpleCornerstoneImage[${instanceId}]: Cornerstone enabled on element`);
      } catch (error) {
        console.error(`useSimpleCornerstoneImage[${instanceId}]: Error enabling cornerstone:`, error);
        if (!isMounted.current) return;
        
        setError("Failed to initialize viewer");
        setIsLoading(false);
        return;
      }
    }
    
    // Determine the image type and create appropriate imageId
    let imageId;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
    const isImageFormat = imageExtensions.some(ext => imageUrl.toLowerCase().endsWith(ext));
    
    if (isImageFormat) {
      imageId = `webImage:${imageUrl}`;
      console.log(`useSimpleCornerstoneImage[${instanceId}]: Loading as web image:`, imageId);
    } else {
      imageId = `wadouri:${imageUrl}`;
      console.log(`useSimpleCornerstoneImage[${instanceId}]: Loading as DICOM:`, imageId);
    }

    // Check if we've already loaded this image
    if (loadedImages.has(imageId)) {
      console.log(`useSimpleCornerstoneImage[${instanceId}]: Using cached image`);
      const image = loadedImages.get(imageId);
      
      if (!isMounted.current) return;
      
      // Display the cached image
      cornerstone.displayImage(element, image);
      imageInstanceRef.current = image;
      setIsLoading(false);
      setImageDisplayed(true);
      return;
    }

    // Load the image
    try {
      console.log(`useSimpleCornerstoneImage[${instanceId}]: Loading image with imageId:`, imageId);
      const image = await cornerstone.loadImage(imageId);
      
      // Check if component is still mounted
      if (!isMounted.current) return;
      
      console.log(`useSimpleCornerstoneImage[${instanceId}]: Image loaded successfully`);
      
      // Cache the image
      loadedImages.set(imageId, image);
      imageInstanceRef.current = image;
      
      // Extract metadata for DICOM images
      if (!isImageFormat && onMetadataLoaded) {
        const metadata = extractMetadata(image);
        console.log(`useSimpleCornerstoneImage[${instanceId}]: Metadata extracted`, metadata);
        onMetadataLoaded(metadata);
      }
      
      // Display the image
      console.log(`useSimpleCornerstoneImage[${instanceId}]: Displaying image on element`);
      cornerstone.displayImage(element, image);
      console.log(`useSimpleCornerstoneImage[${instanceId}]: Image displayed successfully`);
      
      setIsLoading(false);
      setImageDisplayed(true);
    } catch (error) {
      // Try as web image if DICOM load fails
      if (imageId.startsWith('wadouri:') && !isImageFormat) {
        try {
          const webImageId = `webImage:${imageUrl}`;
          console.log(`useSimpleCornerstoneImage[${instanceId}]: DICOM load failed, trying as web image:`, webImageId);
          const image = await cornerstone.loadImage(webImageId);
          
          if (!isMounted.current) return;
          
          loadedImages.set(webImageId, image);
          imageInstanceRef.current = image;
          cornerstone.displayImage(element, image);
          setIsLoading(false);
          setImageDisplayed(true);
          return;
        } catch (webImageError) {
          console.error(`useSimpleCornerstoneImage[${instanceId}]: Web image load also failed:`, webImageError);
        }
      }
      
      if (!isMounted.current) return;
      
      console.error(`useSimpleCornerstoneImage[${instanceId}]: All image loading attempts failed:`, error);
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
