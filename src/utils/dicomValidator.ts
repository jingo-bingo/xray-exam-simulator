
import * as dicomParser from "dicom-parser";

/**
 * Validates if a file is a valid DICOM file by examining its content
 * rather than relying on file extension
 * @param file The file to validate
 * @returns Promise<boolean> True if the file is a valid DICOM file, false otherwise
 */
export const isDicom = async (file: File): Promise<boolean> => {
  console.log("isDicom: Starting DICOM validation for file", file.name);
  
  try {
    // Read the file as an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    console.log("isDicom: File read as ArrayBuffer, size:", arrayBuffer.byteLength);
    
    // Convert to Uint8Array for dicom-parser
    const byteArray = new Uint8Array(arrayBuffer);
    
    // Check for DICM magic number at byte offset 128
    if (byteArray.length > 132) {
      const magicBytes = String.fromCharCode(
        byteArray[128], byteArray[129], byteArray[130], byteArray[131]
      );
      console.log("isDicom: Magic bytes at position 128:", magicBytes);
      
      if (magicBytes === "DICM") {
        console.log("isDicom: DICM magic number found - definitely a DICOM file");
        return true;
      }
    }
    
    // If no magic number, try parsing anyway (some DICOM files don't have the magic number)
    console.log("isDicom: No DICM magic number found, attempting to parse DICOM data");
    const dataSet = dicomParser.parseDicom(byteArray);
    
    // Check if the dataset contains some common DICOM tags - using !! to ensure boolean return
    const hasDicomTags = !!dataSet && (
      !!dataSet.elements.x00080008 || // ImageType
      !!dataSet.elements.x00080060 || // Modality
      !!dataSet.elements.x00080070 || // Manufacturer
      !!dataSet.elements.x00100010 || // PatientName
      !!dataSet.elements.x00200010    // StudyID
    );
    
    console.log("isDicom: DICOM validation result:", hasDicomTags);
    return hasDicomTags;
  } catch (error) {
    console.error("isDicom: Error validating DICOM file:", error);
    return false;
  }
};

/**
 * Extract basic DICOM metadata from file
 * @param file The DICOM file to analyze
 * @returns Promise with metadata object or null if extraction fails
 */
export const extractDicomMetadata = async (file: File): Promise<Record<string, string> | null> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const byteArray = new Uint8Array(arrayBuffer);
    const dataSet = dicomParser.parseDicom(byteArray);
    
    // Extract common metadata fields
    const metadata: Record<string, string> = {};
    
    // Helper function to safely extract string values
    const getStringValue = (tag: string): string | undefined => {
      if (!dataSet.elements[tag]) return undefined;
      return dataSet.string(tag);
    };
    
    // Common DICOM tags to extract
    const tagsToExtract = {
      "x00080060": "Modality",
      "x00080070": "Manufacturer",
      "x00080090": "ReferringPhysician",
      "x00100010": "PatientName",
      "x00100020": "PatientID",
      "x00100030": "PatientBirthDate",
      "x00100040": "PatientSex",
      "x00200010": "StudyID",
      "x00080020": "StudyDate",
      "x00080030": "StudyTime",
    };
    
    // Extract each tag if it exists
    Object.entries(tagsToExtract).forEach(([tag, label]) => {
      const value = getStringValue(tag);
      if (value !== undefined) {
        metadata[label] = value;
      }
    });
    
    return Object.keys(metadata).length > 0 ? metadata : null;
  } catch (error) {
    console.error("extractDicomMetadata: Error extracting metadata:", error);
    return null;
  }
};
