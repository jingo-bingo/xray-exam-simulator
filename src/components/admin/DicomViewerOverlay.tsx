
import React from 'react';

interface DicomViewerOverlayProps {
  isLoading: boolean;
  error: string | null;
  noImageMessage?: string;
  hasImage: boolean;
}

export const DicomViewerOverlay: React.FC<DicomViewerOverlayProps> = ({
  isLoading,
  error,
  noImageMessage = "No image available",
  hasImage
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-white bg-opacity-70 bg-black absolute inset-0 z-10">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-2"></div>
          <div>Loading image...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-400 bg-opacity-70 bg-black absolute inset-0 z-10">
        <div className="text-center p-4">
          <div className="font-bold mb-2">Error</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }
  
  if (!hasImage) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        {noImageMessage}
      </div>
    );
  }
  
  return null;
};
