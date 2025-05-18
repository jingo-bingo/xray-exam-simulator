
import { useEffect, useRef, useState } from "react";
import cornerstone from "cornerstone-core";
import cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";
import { DicomMetadata } from "./DicomMetadataDisplay";
import { extractMetadata } from "@/utils/dicomMetadataExtractor";

interface SimpleDicomViewerProps {
  imageUrl: string;
  alt?: string;
  className?: string;
  onError?: (error: Error) => void;
  onMetadataLoaded?: (metadata: DicomMetadata) => void;
}

// Track global initialization state
let cornerstoneInitialized = false;

// Simplified initialization function for cornerstone core only (no tools)
const initializeSimpleCornerstoneViewer = () => {
  if (cornerstoneInitialized) {
    console.log("SimpleDicomViewer: Already initialized");
    return true;
  }
  
  try {
    console.log("SimpleDicomViewer: Starting simple initialization");
    
    // Check if cornerstone is available
    if (!cornerstone) {
      console.error("SimpleDicomViewer: Cornerstone library not available");
      return false;
    }
    
    // Set up image loaders
    cornerstoneWebImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    
    // Register the image loaders
    cornerstone.registerImageLoader("webImage", cornerstoneWebImageLoader.loadImage);
    cornerstone.registerImageLoader("wadouri", cornerstoneWADOImageLoader.wadouri.loadImage);
    
    // Configure WADO image loader with conservative memory settings
    cornerstoneWADOImageLoader.configure({
      useWebWorkers: false,
      decodeConfig: {
        convertFloatPixelDataToInt: false,
        use16Bits: true,
        maxWebWorkers: 1,
        preservePixelData: false
      },
      maxCacheSize: 50
    });

    cornerstoneInitialized = true;
    console.log("SimpleDicomViewer: Core libraries initialized successfully");
    return true;
  } catch (error) {
    console.error("SimpleDicomViewer: Failed to initialize:", error);
    return false;
  }
};

export const SimpleDicomViewer = ({ 
  imageUrl, 
  alt, 
  className = "", 
  onError,
  onMetadataLoaded 
}: SimpleDicomViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageDisplayed, setImageDisplayed] = useState(false);
  const isMounted = useRef(true);
  const loadingAttemptRef = useRef<AbortController | null>(null);
  const currentImageUrlRef = useRef<string | null>(null);
  
  // Initialize cornerstone on component mount
  useEffect(() => {
    console.log("SimpleDicomViewer: Component mounting");
    
    // Initialize cornerstone libraries
    const initialized = initializeSimpleCornerstoneViewer();
    if (!initialized && onError) {
      onError(new Error("Failed to initialize DICOM viewer libraries"));
    }
    
    return () => {
      console.log("SimpleDicomViewer: Component unmounting");
      isMounted.current = false;
      
      // Abort any pending load operations
      if (loadingAttemptRef.current) {
        loadingAttemptRef.current.abort();
        loadingAttemptRef.current = null;
      }
      
      // Clean up cornerstone element if it exists
      if (viewerRef.current) {
        try {
          cornerstone.disable(viewerRef.current);
        } catch (error) {
          console.warn("SimpleDicomViewer: Error during cleanup:", error);
        }
      }
    };
  }, [onError]);
  
  // Load DICOM image when URL changes
  useEffect(() => {
    const loadImage = async () => {
      if (!viewerRef.current || !imageUrl) return;
      
      // Skip if URL hasn't changed to prevent unnecessary reloads
      if (currentImageUrlRef.current === imageUrl && imageDisplayed) {
        console.log("SimpleDicomViewer: URL unchanged, skipping reload");
        return;
      }
      
      console.log("SimpleDicomViewer: Initializing viewer for image:", imageUrl);
      currentImageUrlRef.current = imageUrl;
      
      // Reset states when URL changes
      setIsLoading(true);
      setError(null);
      setImageDisplayed(false);
      
      // Create abort controller for this loading attempt
      if (loadingAttemptRef.current) {
        loadingAttemptRef.current.abort();
      }
      loadingAttemptRef.current = new AbortController();
      const { signal } = loadingAttemptRef.current;
      
      // Clean up previous instance if necessary
      try {
        if (viewerRef.current) {
          cornerstone.disable(viewerRef.current);
          console.log("SimpleDicomViewer: Disabled previous cornerstone element");
        }
      } catch (error) {
        console.warn("SimpleDicomViewer: Error during cleanup:", error);
      }
      
      // Enable the element for cornerstone
      const element = viewerRef.current;
      
      try {
        console.log("SimpleDicomViewer: Enabling cornerstone on element");
        
        // Basic element preparation - avoid touchAction and pointer events settings
        element.style.width = '100%';
        element.style.height = '100%';
        element.style.position = 'relative';
        element.style.outline = 'none';
        
        cornerstone.enable(element);
        console.log("SimpleDicomViewer: Cornerstone enabled on element");
      } catch (error) {
        console.error("SimpleDicomViewer: Error enabling cornerstone:", error);
        if (!isMounted.current) return;
        
        setError("Failed to initialize viewer");
        setIsLoading(false);
        if (onError) onError(error instanceof Error ? error : new Error("Failed to initialize DICOM viewer"));
        return;
      }
      
      // Determine the image type and create appropriate imageId
      let imageId;
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
      const isImageFormat = imageExtensions.some(ext => imageUrl.toLowerCase().endsWith(ext));
      
      if (isImageFormat) {
        imageId = `webImage:${imageUrl}`;
        console.log("SimpleDicomViewer: Loading as web image:", imageId);
      } else {
        imageId = `wadouri:${imageUrl}`;
        console.log("SimpleDicomViewer: Loading as DICOM:", imageId);
      }

      // Load the image
      try {
        console.log("SimpleDicomViewer: Loading image with imageId:", imageId);
        const image = await cornerstone.loadImage(imageId);
        
        // Check if component is still mounted
        if (!isMounted.current) return;
        
        console.log("SimpleDicomViewer: Image loaded successfully");
        
        // Extract metadata for DICOM images
        if (!isImageFormat && onMetadataLoaded) {
          const metadata = extractMetadata(image);
          console.log("SimpleDicomViewer: Metadata extracted", metadata);
          onMetadataLoaded(metadata);
        }
        
        // Display the image
        console.log("SimpleDicomViewer: Displaying image on element");
        cornerstone.displayImage(element, image);
        console.log("SimpleDicomViewer: Image displayed successfully");
        
        setIsLoading(false);
        setImageDisplayed(true);
      } catch (error) {
        // Try as web image if DICOM load fails
        if (imageId.startsWith('wadouri:') && !isImageFormat) {
          try {
            const webImageId = `webImage:${imageUrl}`;
            console.log("SimpleDicomViewer: DICOM load failed, trying as web image:", webImageId);
            const image = await cornerstone.loadImage(webImageId);
            
            if (!isMounted.current) return;
            
            cornerstone.displayImage(element, image);
            setIsLoading(false);
            setImageDisplayed(true);
            return;
          } catch (webImageError) {
            console.error("SimpleDicomViewer: Web image load also failed:", webImageError);
          }
        }
        
        if (!isMounted.current) return;
        
        console.error("SimpleDicomViewer: All image loading attempts failed:", error);
        setError(error instanceof Error ? error.message : "Failed to load image");
        if (onError) onError(error instanceof Error ? error : new Error("Failed to load image"));
        setIsLoading(false);
      }
    };
    
    loadImage();
  }, [imageUrl, onError, onMetadataLoaded]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={viewerRef} 
        className={`w-full h-full ${className}`}
        data-testid="simple-dicom-viewer"
      >
        {isLoading && (
          <div className="flex items-center justify-center h-full text-white bg-opacity-70 bg-black absolute inset-0 z-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-2"></div>
              <div>Loading image...</div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex items-center justify-center h-full text-red-400 bg-opacity-70 bg-black absolute inset-0 z-10">
            <div className="text-center p-4">
              <div className="font-bold mb-2">Error</div>
              <div>{error}</div>
            </div>
          </div>
        )}
        
        {!imageUrl && !isLoading && !error && (
          <div className="flex items-center justify-center h-full text-white">No image available</div>
        )}
      </div>
    </div>
  );
};
