
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "lucide-react";
import { DicomMetadataDisplay, DicomMetadata } from "@/components/admin/DicomMetadataDisplay";
import { DicomImageDisplay } from "@/components/admin/DicomImageDisplay";

interface DicomImageSectionProps {
  dicomPath: string | null | undefined;
  title: string | undefined;
  onMetadataLoaded?: (metadata: DicomMetadata) => void;
}

export const DicomImageSection = ({ dicomPath, title, onMetadataLoaded }: DicomImageSectionProps) => {
  const [dicomMetadata, setDicomMetadata] = useState<DicomMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(false);
  const [dicomError, setDicomError] = useState<string | null>(null);

  // Handle metadata when received from DicomImageDisplay
  const handleMetadataLoaded = (metadata: DicomMetadata) => {
    setDicomMetadata(metadata);
    
    if (onMetadataLoaded) {
      onMetadataLoaded(metadata);
    }
  };

  return (
    <>
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-radiology-light flex items-center">
            <Image className="mr-2 h-5 w-5" />
            DICOM Image
          </CardTitle>
          {dicomError && (
            <CardDescription className="text-red-400">
              Error: {dicomError}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="relative bg-black max-w-full overflow-auto">
            <DicomImageDisplay 
              dicomPath={dicomPath}
              title={title}
              onMetadataLoaded={handleMetadataLoaded}
              setIsLoadingMetadata={setIsLoadingMetadata}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* DICOM Metadata Display */}
      <DicomMetadataDisplay 
        metadata={dicomMetadata} 
        isLoading={isLoadingMetadata}
      />
    </>
  );
};
