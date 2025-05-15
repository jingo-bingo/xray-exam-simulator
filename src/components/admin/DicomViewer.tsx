
import { useEffect, useRef, useState } from "react";
import cornerstone from "cornerstone-core";
import cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";
import { DicomMetadata } from "./DicomMetadataDisplay";
import { useCornerStoneTools, ToolMode } from "@/hooks/useCornerStoneTools";
import { DicomToolbar } from "./DicomToolbar";

// Safe initialization of the image loaders
try {
  // Initialize the web image loader
  cornerstoneWebImageLoader.external.cornerstone = cornerstone;
  cornerstone.registerImageLoader("webImage", cornerstoneWebImageLoader.loadImage);

  // Initialize the WADO image loader for DICOM files
  cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
  cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
  cornerstone.registerImageLoader("wadouri", cornerstoneWADOImageLoader.wadouri.loadImage);

  // Configure WADO image loader with conservative memory settings
  cornerstoneWADOImageLoader.configure({
    useWebWorkers: false,
    decodeConfig: {
      convertFloatPixelDataToInt: false,
      use16Bits: true,
      maxWebWorkers: 1,
      preservePixelData: false, // Don't keep raw pixel data in memory
      strict: false // Less strict parsing to handle more file types
    },
    // Set a smaller max cache size to prevent memory issues
    maxCacheSize: 50, // Default is 100
  });
} catch (error) {
  console.error("Failed to initialize cornerstone loaders:", error);
}

// Cache for loaded images to prevent re-fetching
const imageCache = new Map<string, any>();
// Track active loading operations to prevent duplicate loads
const activeLoads = new Map<string, Promise<any>>();

interface DicomViewerProps {
  imageUrl: string;
  alt: string;
  className?: string;
  onError?: (error: Error) => void;
  onMetadataLoaded?: (metadata: DicomMetadata) => void;
}

export const DicomViewer = ({ 
  imageUrl, 
  alt, 
  className, 
  onError,
  onMetadataLoaded 
}: DicomViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingAttemptRef = useRef<AbortController | null>(null);
  const currentImageUrlRef = useRef<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Initialize cornerstone tools with feature detection
  const { 
    initializeTools, 
    setToolActive, 
    resetView, 
    activeTool,
    toolsSupported
  } = useCornerStoneTools();
  
  useEffect(() => {
    // Set up cleanup function
    return () => {
      console.log("DicomViewer: Component unmounting");
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
          console.warn("DicomViewer: Error during cleanup:", error);
        }
      }
    };
  }, []);

  // Extract DICOM metadata from the image
  const extractMetadata = (image: any): DicomMetadata => {
    console.log("DicomViewer: Extracting metadata from image");
    
    try {
      const metadata: DicomMetadata = {};
      
      // Try to get modality
      try {
        // Check if we have DICOM metadata
        if (image.data && image.data.string) {
          metadata.modality = image.data.string('x00080060');
          console.log("DicomViewer: Extracted modality:", metadata.modality);
        }
      } catch (err) {
        console.warn("DicomViewer: Failed to extract modality:", err);
      }
      
      // Get image dimensions
      try {
        metadata.dimensions = {
          width: image.width,
          height: image.height
        };
        console.log("DicomViewer: Extracted dimensions:", metadata.dimensions);
      } catch (err) {
        console.warn("DicomViewer: Failed to extract dimensions:", err);
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
            console.log("DicomViewer: Extracted pixel spacing:", metadata.pixelSpacing);
          }
        }
      } catch (err) {
        console.warn("DicomViewer: Failed to extract pixel spacing:", err);
      }
      
      return metadata;
    } catch (error) {
      console.error("DicomViewer: Error extracting metadata:", error);
      return {};
    }
  };
  
  useEffect(() => {
    const loadImage = async () => {
      if (!viewerRef.current || !imageUrl) return;
      
      // Skip if URL hasn't changed to prevent unnecessary reloads
      if (currentImageUrlRef.current === imageUrl) {
        console.log("DicomViewer: URL unchanged, skipping reload");
        return;
      }
      
      console.log("DicomViewer: Initializing viewer for image:", imageUrl);
      currentImageUrlRef.current = imageUrl;
      
      // Reset states when URL changes
      setIsLoading(true);
      setError(null);
      setImageLoaded(false);
      
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
        }
      } catch (error) {
        console.warn("DicomViewer: Error during cleanup:", error);
      }
      
      // Enable the element for cornerstone
      const element = viewerRef.current;
      
      try {
        cornerstone.enable(element);
        console.log("DicomViewer: Cornerstone enabled on element");
        
        // Initialize cornerstone tools after enabling the element
        // Only try to initialize tools if the browser supports them
        initializeTools(element);
      } catch (error) {
        console.error("DicomViewer: Error enabling cornerstone:", error);
        if (!isMounted.current) return;
        
        setError("Failed to initialize viewer (browser compatibility issue)");
        setIsLoading(false);
        if (onError) onError(new Error("Failed to initialize DICOM viewer"));
        return;
      }
      
      // Determine image type based on URL
      const getImageId = (url: string) => {
        if (url.startsWith('http')) {
          return `wadouri:${url}`;
        }
        
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
        const isImageFormat = imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
        
        return isImageFormat ? `webImage:${url}` : `wadouri:${url}`;
      };
      
      // Try to load as DICOM first, regardless of file extension
      console.log("DicomViewer: Attempting to load as DICOM first");
      const imageId = getImageId(imageUrl);
      console.log("DicomViewer: Using imageId:", imageId);
      
      // Function to handle loading with memory consideration and caching
      const loadImageSafely = async (imageId: string, isDicomAttempt = true) => {
        // Check if loading operation was aborted
        if (signal.aborted) {
          throw new Error("Loading aborted");
        }
        
        // Check if we already have this image in our cache
        if (imageCache.has(imageId)) {
          console.log(`DicomViewer: Using cached image for ${imageId}`);
          return imageCache.get(imageId);
        }
        
        // Check if this image is already being loaded
        if (activeLoads.has(imageId)) {
          console.log(`DicomViewer: Reusing existing load promise for ${imageId}`);
          return activeLoads.get(imageId);
        }
        
        // Create a new load promise
        const loadPromise = (async () => {
          try {
            console.log(`DicomViewer: Loading with imageId: ${imageId}`);
            const image = await cornerstone.loadImage(imageId);
            
            // Cache the image for future use
            imageCache.set(imageId, image);
            return image;
          } catch (error: any) {
            console.error(`DicomViewer: Error loading image with ${imageId}:`, error);
            
            if (signal.aborted) {
              throw new Error("Loading aborted during attempt");
            }
            
            // If we get a memory allocation error, try downsampling
            if (error instanceof RangeError || (error.message && error.message.includes("buffer allocation failed"))) {
              console.log("DicomViewer: Memory error detected, trying with downsampling");
              
              // Try with more aggressive settings for large files
              cornerstoneWADOImageLoader.configure({
                decodeConfig: {
                  convertFloatPixelDataToInt: true, // Convert to int to save memory
                  use16Bits: false, // Use 8-bit instead of 16-bit
                  maxWebWorkers: 0,
                  preservePixelData: false
                },
                maxCacheSize: 10 // Reduce cache size significantly
              });
              
              // Try loading with different options to reduce memory usage
              if (isDicomAttempt) {
                console.log("DicomViewer: Trying with image downsampling");
                // Add image processing URL parameters for downsampling
                const image = await cornerstone.loadImage(`${imageId}?quality=50&downsampleFactor=2`);
                imageCache.set(imageId, image);
                return image;
              }
            }
            
            // If this was a DICOM attempt and it failed, try as a web image
            if (isDicomAttempt && imageUrl.startsWith('http')) {
              console.log("DicomViewer: DICOM load failed, trying as web image");
              const webImageId = `webImage:${imageUrl}`;
              
              // Remove this load from active loads to allow retry
              activeLoads.delete(imageId);
              
              return loadImageSafely(webImageId, false);
            }
            
            // Both attempts failed
            throw error;
          } finally {
            // Remove from active loads when done
            activeLoads.delete(imageId);
          }
        })();
        
        // Store the promise in activeLoads
        activeLoads.set(imageId, loadPromise);
        
        return loadPromise;
      };

      // Load the image
      try {
        const image = await loadImageSafely(imageId);
        
        // Check if component is still mounted
        if (!isMounted.current) return;
        
        console.log("DicomViewer: Image loaded successfully, metadata:", image.imageId);
        
        // Extract metadata before displaying the image
        const metadata = extractMetadata(image);
        
        // Display the image
        cornerstone.displayImage(element, image);
        console.log("DicomViewer: Image displayed successfully");
        
        // Mark image as loaded for toolbar display
        setImageLoaded(true);
        
        // Notify parent about metadata
        if (onMetadataLoaded) {
          console.log("DicomViewer: Notifying parent about metadata");
          onMetadataLoaded(metadata);
        }
        
        setIsLoading(false);
      } catch (error) {
        // Check if component is still mounted
        if (!isMounted.current) return;
        
        console.error("DicomViewer: All image loading attempts failed:", error);
        setError(error instanceof Error ? error.message : "Failed to load image");
        if (onError) onError(error instanceof Error ? error : new Error("Failed to load image"));
        setIsLoading(false);
      }
    };
    
    loadImage();
    
  }, [imageUrl, onError, onMetadataLoaded, initializeTools]);

  // Handle tool selection
  const handleToolSelect = (tool: ToolMode) => {
    if (imageLoaded) {
      setToolActive(tool);
    }
  };

  // Handle reset view
  const handleResetView = () => {
    if (imageLoaded) {
      resetView();
    }
  };

  return (
    <div className="relative">
      <div 
        ref={viewerRef} 
        className={className || "w-full h-48 border rounded-md bg-black"}
        data-testid="dicom-viewer"
      >
        {isLoading && (
          <div className="flex items-center justify-center h-full text-white bg-opacity-70 bg-black absolute inset-0">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-2"></div>
              <div>Loading DICOM image...</div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex items-center justify-center h-full text-red-400 bg-opacity-70 bg-black absolute inset-0">
            <div className="text-center p-4">
              <div className="font-bold mb-2">Error</div>
              <div>{error}</div>
              {!toolsSupported && (
                <div className="mt-2 text-sm">
                  Your browser may not support advanced DICOM features.
                </div>
              )}
            </div>
          </div>
        )}
        
        {!imageUrl && !isLoading && !error && (
          <div className="flex items-center justify-center h-full text-white">No image available</div>
        )}
      </div>

      {/* Only show toolbar if image loaded AND tools are supported */}
      {imageLoaded && toolsSupported && (
        <div className="absolute top-2 left-2 z-10">
          <DicomToolbar 
            activeTool={activeTool}
            onToolSelect={handleToolSelect}
            onReset={handleResetView}
            className="bg-gray-800/75 p-1 rounded-md"
          />
        </div>
      )}

      {/* Show simple message when tools aren't supported but image loads */}
      {imageLoaded && !toolsSupported && !error && (
        <div className="absolute top-2 left-2 z-10 bg-gray-800/75 p-2 rounded-md text-white text-xs">
          Basic view only (advanced tools not supported by your browser)
        </div>
      )}
    </div>
  );
};
