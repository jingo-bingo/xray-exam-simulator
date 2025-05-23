
import { useEffect, useRef, useState } from 'react';
import { DicomMetadata } from '@/components/admin/DicomMetadataDisplay';
import { extractMetadata } from '@/utils/dicomMetadataExtractor';
import { useSimpleCornerstoneInit } from '@/hooks/useSimpleCornerstoneInit';
import { loadImageSafely, getImageId } from '@/utils/dicomImageLoader';
import cornerstone from 'cornerstone-core';

interface BasicDicomViewerProps {
  imageUrl: string;
  alt: string;
  className?: string;
  onError?: (error: Error) => void;
  onMetadataLoaded?: (metadata: DicomMetadata) => void;
  instanceId: string;
}

export const BasicDicomViewer = ({
  imageUrl,
  alt,
  className = "",
  onError,
  onMetadataLoaded,
  instanceId
}: BasicDicomViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const elementEnabledRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Use the existing cornerstone initialization hook
  const { isInitialized, error: initError } = useSimpleCornerstoneInit(instanceId);
  
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []);

  const cleanup = () => {
    // Cancel any ongoing image loading
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Disable cornerstone element
    if (viewerRef.current && elementEnabledRef.current) {
      try {
        cornerstone.disable(viewerRef.current);
        elementEnabledRef.current = false;
      } catch (e) {
        console.warn(`BasicDicomViewer[${instanceId}]: Error during cleanup:`, e);
      }
    }
  };

  useEffect(() => {
    if (!imageUrl || !viewerRef.current || !isInitialized) return;

    loadImage();
  }, [imageUrl, instanceId, isInitialized]);

  // Handle initialization errors
  useEffect(() => {
    if (initError && onError) {
      onError(new Error(initError));
    }
  }, [initError, onError]);

  const loadImage = async () => {
    if (!viewerRef.current || !isMountedRef.current || !isInitialized) return;

    setIsLoading(true);
    setError(null);

    const element = viewerRef.current;

    try {
      // Cancel any previous loading
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller for this load
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      // Enable cornerstone on the element if not already enabled
      if (!elementEnabledRef.current) {
        element.style.width = '100%';
        element.style.height = '100%';
        element.style.position = 'relative';
        
        cornerstone.enable(element);
        elementEnabledRef.current = true;
      }

      // Get the proper imageId using the utility function
      const imageId = getImageId(imageUrl);

      console.log(`BasicDicomViewer[${instanceId}]: Loading image with imageId:`, imageId);

      // Use the safe image loading utility
      const image = await loadImageSafely(imageId, signal);
      
      if (!isMountedRef.current || signal.aborted) return;

      // Display the image
      cornerstone.displayImage(element, image);
      
      // Extract metadata for DICOM images (not for web images)
      if (!imageId.startsWith('webImage:') && onMetadataLoaded) {
        try {
          const metadata = extractMetadata(image);
          onMetadataLoaded(metadata);
        } catch (metadataError) {
          console.warn(`BasicDicomViewer[${instanceId}]: Could not extract metadata:`, metadataError);
        }
      }

      setIsLoading(false);
    } catch (loadError) {
      console.error(`BasicDicomViewer[${instanceId}]: Load error:`, loadError);
      
      if (!isMountedRef.current) return;
      
      const errorMessage = loadError instanceof Error ? loadError.message : "Failed to load image";
      setError(errorMessage);
      setIsLoading(false);
      
      if (onError) {
        onError(loadError instanceof Error ? loadError : new Error(errorMessage));
      }
    }
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {(isLoading || !isInitialized) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="flex flex-col items-center text-gray-600">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <div>{!isInitialized ? "Initializing viewer..." : "Loading image..."}</div>
          </div>
        </div>
      )}
      
      {(error || initError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
          <div className="text-center p-4 text-red-600">
            <div className="font-medium mb-2">Error Loading Image</div>
            <div className="text-sm">{error || initError}</div>
          </div>
        </div>
      )}
      
      <div
        ref={viewerRef}
        className="w-full h-full min-h-[400px]"
        style={{ outline: 'none' }}
        aria-label={alt}
      />
    </div>
  );
};
