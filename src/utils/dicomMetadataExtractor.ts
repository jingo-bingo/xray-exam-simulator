
import { DicomMetadata } from "@/components/admin/DicomMetadataDisplay";

// Extract DICOM metadata from the image
export function extractMetadata(image: any): DicomMetadata {
  console.log("DicomMetadataExtractor: Extracting metadata from image");
  
  try {
    const metadata: DicomMetadata = {};
    
    // Try to get modality
    try {
      // Check if we have DICOM metadata
      if (image.data && image.data.string) {
        metadata.modality = image.data.string('x00080060');
        console.log("DicomMetadataExtractor: Extracted modality:", metadata.modality);
      }
    } catch (err) {
      console.warn("DicomMetadataExtractor: Failed to extract modality:", err);
    }
    
    // Get image dimensions
    try {
      metadata.dimensions = {
        width: image.width,
        height: image.height
      };
      console.log("DicomMetadataExtractor: Extracted dimensions:", metadata.dimensions);
    } catch (err) {
      console.warn("DicomMetadataExtractor: Failed to extract dimensions:", err);
    }
    
    // Try to get pixel spacing (mm per pixel)
    try {
      if (image.data && image.data.string) {
        const pixelSpacingStr = image.data.string('x00280030');
        if (pixelSpacingStr) {
          const [rowSpacing, colSpacing] = pixelSpacingStr.split('\\').map(Number);
          metadata.pixelSpacing = {
            width: colSpacing,
            height: rowSpacing
          };
          console.log("DicomMetadataExtractor: Extracted pixel spacing:", metadata.pixelSpacing);
        }
      }
    } catch (err) {
      console.warn("DicomMetadataExtractor: Failed to extract pixel spacing:", err);
    }
    
    return metadata;
  } catch (error) {
    console.error("DicomMetadataExtractor: Error extracting metadata:", error);
    return {};
  }
}
