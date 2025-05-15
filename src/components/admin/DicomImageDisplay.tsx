
import React, { useCallback } from 'react';
import { DicomViewer } from './DicomViewer';
import { DicomLoadingPlaceholder } from './DicomLoadingPlaceholder';
import { toast } from "@/components/ui/use-toast";
import { useSignedDicomUrl } from '@/hooks/useSignedDicomUrl';
import { DicomMetadata } from './DicomMetadataDisplay';

interface DicomImageDisplayProps {
  dicomPath: string | null | undefined;
  title: string | undefined;
  onMetadataLoaded?: (metadata: DicomMetadata) => void;
  setIsLoadingMetadata: (loading: boolean) => void;
}

export const DicomImageDisplay: React.FC<DicomImageDisplayProps> = ({
  dicomPath,
  title,
  onMetadataLoaded,
  setIsLoadingMetadata
}) => {
  const { signedUrl, error, isGenerating } = useSignedDicomUrl(dicomPath);
  
  // Handle metadata loading
  const handleMetadataLoaded = useCallback((metadata: DicomMetadata) => {
    console.log("DicomImageDisplay: Metadata received from DicomViewer:", metadata);
    setIsLoadingMetadata(false);
    
    if (onMetadataLoaded) {
      onMetadataLoaded(metadata);
    }
  }, [onMetadataLoaded, setIsLoadingMetadata]);

  const handleViewerError = useCallback((error: Error) => {
    console.error("DicomImageDisplay: DICOM viewer error:", error);
    toast({
      title: "Image Error",
      description: "Failed to load the DICOM image",
      variant: "destructive",
    });
  }, []);

  // Set loading state for metadata when URL is available
  React.useEffect(() => {
    if (signedUrl) {
      setIsLoadingMetadata(true);
    }
  }, [signedUrl, setIsLoadingMetadata]);

  if (!signedUrl) {
    return (
      <DicomLoadingPlaceholder 
        isGenerating={isGenerating} 
        error={error} 
        dicomPath={dicomPath} 
      />
    );
  }

  return (
    <DicomViewer 
      imageUrl={signedUrl}
      alt={`DICOM for case ${title}`}
      className="bg-black"
      onError={handleViewerError}
      onMetadataLoaded={handleMetadataLoaded}
    />
  );
};
