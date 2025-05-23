
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
      <Card className="bg-white border-gray-200 mt-4 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-gray-900 text-base flex items-center">
            <Info className="mr-2 h-4 w-4" />
            Image Metadata
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-gray-600">Loading metadata...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No metadata available state - shows a message when extraction failed or no data exists
  if (!metadata) {
    return (
      <Card className="bg-white border-gray-200 mt-4 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-gray-900 text-base flex items-center">
            <Info className="mr-2 h-4 w-4" />
            Image Metadata
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">No metadata available</p>
        </CardContent>
      </Card>
    );
  }

  // Success state - renders structured metadata information in a card layout
  return (
    <Card className="bg-white border-gray-200 mt-4 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-gray-900 text-base flex items-center">
          <Info className="mr-2 h-4 w-4" />
          Image Metadata
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {/* Modality section */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Modality</p>
            {metadata.modality ? (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {metadata.modality}
              </Badge>
            ) : (
              <span className="text-gray-500">Not available</span>
            )}
          </div>
          
          {/* Image dimensions section */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Dimensions</p>
            {metadata.dimensions?.width && metadata.dimensions?.height ? (
              <span className="text-gray-900">
                {metadata.dimensions.width} × {metadata.dimensions.height}
              </span>
            ) : (
              <span className="text-gray-500">Not available</span>
            )}
          </div>
          
          {/* Pixel spacing section */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Pixel Spacing</p>
            {metadata.pixelSpacing?.width && metadata.pixelSpacing?.height ? (
              <span className="text-gray-900">
                {metadata.pixelSpacing.width.toFixed(2)} × {metadata.pixelSpacing.height.toFixed(2)} mm
              </span>
            ) : (
              <span className="text-gray-500">Not available</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
