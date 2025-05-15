
import React from 'react';

interface DicomViewerOverlayProps {
  isLoading: boolean;
  error: string | null;
  noImageUrl: boolean;
}

export const DicomViewerOverlay: React.FC<DicomViewerOverlayProps> = ({
  isLoading,
  error,
  noImageUrl
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-white bg-opacity-70 bg-black absolute inset-0">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-2"></div>
          <div>Loading DICOM image...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-400 bg-opacity-70 bg-black absolute inset-0">
        <div className="text-center p-4">
          <div className="font-bold mb-2">Error</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }
  
  if (noImageUrl) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        No image available
      </div>
    );
  }
  
  return null;
};
