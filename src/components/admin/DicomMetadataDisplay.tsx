
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

/**
 * DicomMetadata interface defines the structure of metadata extracted from DICOM images
 * This is the core data structure used for passing metadata between components
 */
export interface DicomMetadata {
  // Type of imaging equipment used (CT, MRI, X-Ray, etc.)
  modality?: string;
  
  // Image dimensions in pixels
  dimensions?: {
    width?: number;
    height?: number;
  };
  
  // Physical distance between pixels in millimeters
  pixelSpacing?: {
    width?: number;
    height?: number;
  };
  // The interface is designed to be extensible for future metadata needs
  // Additional fields can be added as requirements evolve
}

interface DicomMetadataDisplayProps {
  // The extracted metadata object to display
  metadata: DicomMetadata | null;
  
  // Indicates if metadata is currently being loaded/extracted
  isLoading: boolean;
}

/**
 * Component for displaying DICOM image metadata in a structured format
 * Handles different states: loading, no data, and successful metadata display
 */
export const DicomMetadataDisplay: React.FC<DicomMetadataDisplayProps> = ({ 
  metadata, 
  isLoading 
}) => {
  console.log("DicomMetadataDisplay: Rendering with metadata:", metadata);
  
  // Loading state - shows a spinner while metadata is being extracted
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

  // No metadata available state - shows a message when extraction failed or no data exists
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

  // Success state - renders structured metadata information in a card layout
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
          {/* Modality section */}
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
          
          {/* Image dimensions section */}
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
          
          {/* Pixel spacing section */}
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
};
