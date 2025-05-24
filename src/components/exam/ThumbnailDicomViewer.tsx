
import React, { useRef, useState, useEffect } from 'react';
import { useSimpleCornerstoneInit } from '@/hooks/useSimpleCornerstoneInit';
import { useSimpleCornerstoneImage } from '@/hooks/useSimpleCornerstoneImage';

interface ThumbnailDicomViewerProps {
  imageUrl: string;
  alt: string;
  className?: string;
  onError?: (error: Error) => void;
  instanceId: string;
}

export const ThumbnailDicomViewer: React.FC<ThumbnailDicomViewerProps> = ({
  imageUrl,
  alt,
  className = "",
  onError,
  instanceId
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  
  // Initialize cornerstone
  const { isInitialized, error: initError } = useSimpleCornerstoneInit(instanceId);
  
  // Handle image loading
  const { 
    isLoading, 
    error: imageError, 
    imageDisplayed,
    loadImage
  } = useSimpleCornerstoneImage(viewerRef, isInitialized, undefined, instanceId);
  
  // Load image when URL changes or when cornerstone is initialized
  useEffect(() => {
    if (isInitialized && imageUrl) {
      loadImage(imageUrl).catch((error) => {
        console.error(`ThumbnailDicomViewer[${instanceId}]: Error during image loading:`, error);
        if (onError) {
          onError(error instanceof Error ? error : new Error("Failed to load image"));
        }
      });
    }
  }, [imageUrl, isInitialized, instanceId, loadImage, onError]);
  
  // Handle errors from initialization or image loading
  useEffect(() => {
    const error = initError || imageError;
    
    if (error && onError) {
      onError(new Error(error));
    }
  }, [initError, imageError, onError]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div 
        ref={viewerRef} 
        className="w-full h-full rounded overflow-hidden"
        data-instance-id={instanceId}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Loading overlay */}
        {(isLoading || (!isInitialized && !initError)) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-400"></div>
          </div>
        )}
        
        {/* Error overlay */}
        {(initError || imageError) && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
            <div className="text-center">
              <div className="text-red-400 text-lg mb-1">⚠️</div>
              <div className="text-gray-600 text-xs">Error loading</div>
            </div>
          </div>
        )}
        
        {/* No image overlay */}
        {!imageUrl && !isLoading && !initError && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-1">📄</div>
              <div className="text-gray-400 text-xs">No image</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
