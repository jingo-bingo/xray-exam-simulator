
import { useEffect, useRef, useState } from 'react';
import { DicomMetadata } from '@/components/admin/DicomMetadataDisplay';
import { extractMetadata } from '@/utils/dicomMetadataExtractor';
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
  
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (viewerRef.current && elementEnabledRef.current) {
      try {
        cornerstone.disable(viewerRef.current);
        elementEnabledRef.current = false;
      } catch (e) {
        console.warn("BasicDicomViewer: Error during cleanup:", e);
      }
    }
  };

  useEffect(() => {
    if (!imageUrl || !viewerRef.current) return;

    loadImage();
  }, [imageUrl, instanceId]);

  const loadImage = async () => {
    if (!viewerRef.current || !isMountedRef.current) return;

    setIsLoading(true);
    setError(null);

    const element = viewerRef.current;

    try {
      // Enable cornerstone on the element if not already enabled
      if (!elementEnabledRef.current) {
        element.style.width = '100%';
        element.style.height = '100%';
        element.style.position = 'relative';
        
        cornerstone.enable(element);
        elementEnabledRef.current = true;
      }

      // Determine image type and create imageId
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
      const isImageFormat = imageExtensions.some(ext => imageUrl.toLowerCase().endsWith(ext));
      
      const imageId = isImageFormat ? `webImage:${imageUrl}` : `wadouri:${imageUrl}`;

      console.log(`BasicDicomViewer[${instanceId}]: Loading image with imageId:`, imageId);

      // Load and display the image
      const image = await cornerstone.loadImage(imageId);
      
      if (!isMountedRef.current) return;

      // Display the image
      cornerstone.displayImage(element, image);
      
      // Extract metadata for DICOM images
      if (!isImageFormat && onMetadataLoaded) {
        const metadata = extractMetadata(image);
        onMetadataLoaded(metadata);
      }

      setIsLoading(false);
    } catch (loadError) {
      console.error(`BasicDicomViewer[${instanceId}]: Load error:`, loadError);
      
      // Try as web image if DICOM load fails
      if (imageUrl && !imageUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp)$/)) {
        try {
          const webImageId = `webImage:${imageUrl}`;
          const image = await cornerstone.loadImage(webImageId);
          
          if (!isMountedRef.current) return;
          
          cornerstone.displayImage(element, image);
          setIsLoading(false);
          return;
        } catch (webImageError) {
          console.error(`BasicDicomViewer[${instanceId}]: Web image fallback failed:`, webImageError);
        }
      }
      
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
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="flex flex-col items-center text-medical-muted">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-medical-primary mb-2"></div>
            <div>Loading image...</div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
          <div className="text-center p-4 text-red-600">
            <div className="font-medium mb-2">Error Loading Image</div>
            <div className="text-sm">{error}</div>
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
