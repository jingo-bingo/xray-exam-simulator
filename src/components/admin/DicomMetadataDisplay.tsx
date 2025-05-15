
import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

export interface DicomMetadata {
  modality?: string;
  dimensions?: {
    width?: number;
    height?: number;
  };
  pixelSpacing?: {
    width?: number;
    height?: number;
  };
  // Add more metadata fields as needed in the future
}

interface DicomMetadataDisplayProps {
  metadata: DicomMetadata | null;
  isLoading: boolean;
}

// Use memo to prevent unnecessary re-renders
export const DicomMetadataDisplay = memo<DicomMetadataDisplayProps>(({ 
  metadata, 
  isLoading 
}) => {
  console.log("DicomMetadataDisplay: Rendering with metadata:", metadata);
  
  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700 mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-radiology-light text-base flex items-center">
            <Info className="mr-2 h-4 w-4" />
            Image Metadata
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-400 mr-2"></div>
            <span className="text-gray-400">Loading metadata...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metadata) {
    return (
      <Card className="bg-gray-800 border-gray-700 mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-radiology-light text-base flex items-center">
            <Info className="mr-2 h-4 w-4" />
            Image Metadata
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">No metadata available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700 mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-radiology-light text-base flex items-center">
          <Info className="mr-2 h-4 w-4" />
          Image Metadata
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-300 mb-1">Modality</p>
            {metadata.modality ? (
              <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-800">
                {metadata.modality}
              </Badge>
            ) : (
              <span className="text-gray-400">Not available</span>
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-300 mb-1">Dimensions</p>
            {metadata.dimensions?.width && metadata.dimensions?.height ? (
              <span className="text-white">
                {metadata.dimensions.width} × {metadata.dimensions.height}
              </span>
            ) : (
              <span className="text-gray-400">Not available</span>
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-300 mb-1">Pixel Spacing</p>
            {metadata.pixelSpacing?.width && metadata.pixelSpacing?.height ? (
              <span className="text-white">
                {metadata.pixelSpacing.width.toFixed(2)} × {metadata.pixelSpacing.height.toFixed(2)} mm
              </span>
            ) : (
              <span className="text-gray-400">Not available</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Set display name for better debugging
DicomMetadataDisplay.displayName = 'DicomMetadataDisplay';
