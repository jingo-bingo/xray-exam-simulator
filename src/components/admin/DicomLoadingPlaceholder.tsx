
import React from 'react';

interface DicomLoadingPlaceholderProps {
  isGenerating: boolean;
  error: string | null;
  dicomPath: string | null | undefined;
}

export const DicomLoadingPlaceholder: React.FC<DicomLoadingPlaceholderProps> = ({
  isGenerating,
  error,
  dicomPath
}) => {
  return (
    <div className="w-full aspect-square max-h-[600px] bg-black flex items-center justify-center text-gray-400">
      {isGenerating ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400 mb-2"></div>
          <div>Preparing DICOM image...</div>
        </div>
      ) : (
        error ? 
          "Error loading DICOM image" : 
          (dicomPath ? "Loading DICOM image..." : "No DICOM image available for this case")
      )}
    </div>
  );
};
