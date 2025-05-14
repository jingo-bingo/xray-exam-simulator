
import { useEffect, useRef } from "react";
import cornerstone from "cornerstone-core";
import cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import dicomParser from "dicom-parser";

// Initialize the cornerstone web image loader
cornerstoneWebImageLoader.external.cornerstone = cornerstone;
cornerstone.registerImageLoader("webImage", cornerstoneWebImageLoader.loadImage);

interface DicomViewerProps {
  imageUrl: string;
  alt: string;
  className?: string;
  onError?: (error: Error) => void;
}

export const DicomViewer = ({ imageUrl, alt, className, onError }: DicomViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!viewerRef.current || !imageUrl) return;
    
    console.log("DicomViewer: Initializing viewer for image:", imageUrl);
    
    // Enable the element for cornerstone
    const element = viewerRef.current;
    cornerstone.enable(element);
    
    // Load the image
    const isDicom = imageUrl.toLowerCase().endsWith('.dcm') || imageUrl.toLowerCase().endsWith('.dicom');
    
    console.log("DicomViewer: Detected image type:", isDicom ? "DICOM" : "Standard image");
    
    const imageLoader = isDicom ? 'dicom' : 'webImage';
    
    cornerstone.loadImage(imageUrl, { loader: imageLoader })
      .then((image) => {
        console.log("DicomViewer: Image loaded successfully");
        cornerstone.displayImage(element, image);
      })
      .catch((error) => {
        console.error("DicomViewer: Failed to load image:", error);
        
        // If we attempted to load a DICOM file but failed, try loading it as a regular image
        if (isDicom) {
          console.log("DicomViewer: Attempting fallback to standard image loader");
          return cornerstone.loadImage(imageUrl, { loader: 'webImage' });
        }
        
        // If it's not a DICOM file or our fallback failed, throw the error
        if (onError) onError(error);
        throw error;
      })
      .then((image) => {
        if (image) {
          console.log("DicomViewer: Fallback image loaded successfully");
          cornerstone.displayImage(element, image);
        }
      })
      .catch((error) => {
        console.error("DicomViewer: All image loading attempts failed:", error);
        if (onError) onError(error);
      });
    
    // Clean up
    return () => {
      console.log("DicomViewer: Cleanup");
      if (element) {
        try {
          cornerstone.disable(element);
        } catch (error) {
          console.error("DicomViewer: Error during cleanup:", error);
        }
      }
    };
  }, [imageUrl, onError]);

  return (
    <div 
      ref={viewerRef} 
      className={className || "w-full h-48 border rounded-md bg-black"}
      data-testid="dicom-viewer"
    >
      {!imageUrl && <div className="flex items-center justify-center h-full text-white">No image available</div>}
    </div>
  );
};
