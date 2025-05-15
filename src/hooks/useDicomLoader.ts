
import { useState, useEffect, useRef } from "react";
import cornerstone from "cornerstone-core";
import cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";
import { DicomMetadata } from "@/components/admin/DicomMetadataDisplay";

// Initialize the web image loader if not already initialized
if (!cornerstoneWebImageLoader.external.cornerstone) {
  cornerstoneWebImageLoader.external.cornerstone = cornerstone;
  cornerstone.registerImageLoader("webImage", cornerstoneWebImageLoader.loadImage);
}

// Initialize the WADO image loader for DICOM files if not already initialized
if (!cornerstoneWADOImageLoader.external.cornerstone) {
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
}

// Cache for loaded images to prevent re-fetching
const imageCache = new Map<string, any>();
// Track active loading operations to prevent duplicate loads
const activeLoads = new Map<string, Promise<any>>();

interface UseDicomLoaderProps {
  imageUrl: string | null;
  element: HTMLDivElement | null;
  onMetadataLoaded?: (metadata: DicomMetadata) => void;
  onError?: (error: Error) => void;
}

interface LoaderState {
  isLoading: boolean;
  isImageLoaded: boolean;
  error: string | null;
  image: any | null;
}

export const useDicomLoader = ({
  imageUrl,
  element,
  onMetadataLoaded,
  onError
}: UseDicomLoaderProps) => {
  const [state, setState] = useState<LoaderState>({
    isLoading: false,
    isImageLoaded: false,
    error: null,
    image: null
  });
  
  const isMounted = useRef(true);
  const loadingAttemptRef = useRef<AbortController | null>(null);
  const currentImageUrlRef = useRef<string | null>(null);

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

  // Function to handle loading with memory consideration and caching
  const loadImageSafely = async (imageId: string, isDicomAttempt = true, signal: AbortSignal) => {
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
        if (isDicomAttempt && imageUrl && imageUrl.startsWith('http')) {
          console.log("DicomViewer: DICOM load failed, trying as web image");
          const webImageId = `webImage:${imageUrl}`;
          
          // Remove this load from active loads to allow retry
          activeLoads.delete(imageId);
          
          return loadImageSafely(webImageId, false, signal);
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

  useEffect(() => {
    // Set up cleanup function
    return () => {
      isMounted.current = false;
      
      // Abort any pending load operations
      if (loadingAttemptRef.current) {
        loadingAttemptRef.current.abort();
        loadingAttemptRef.current = null;
      }
    };
  }, []);

  // Load DICOM image when URL changes
  useEffect(() => {
    const loadImage = async () => {
      if (!element || !imageUrl) return;
      
      // Skip if URL hasn't changed to prevent unnecessary reloads
      if (currentImageUrlRef.current === imageUrl) {
        console.log("DicomViewer: URL unchanged, skipping reload");
        return;
      }
      
      console.log("DicomViewer: Initializing viewer for image:", imageUrl);
      currentImageUrlRef.current = imageUrl;
      
      // Reset states when URL changes
      setState({
        isLoading: true,
        isImageLoaded: false,
        error: null,
        image: null
      });
      
      // Create abort controller for this loading attempt
      if (loadingAttemptRef.current) {
        loadingAttemptRef.current.abort();
      }
      loadingAttemptRef.current = new AbortController();
      const { signal } = loadingAttemptRef.current;
      
      // Enable the element for cornerstone
      try {
        cornerstone.enable(element);
        console.log("DicomViewer: Cornerstone enabled on element");
      } catch (error) {
        console.error("DicomViewer: Error enabling cornerstone:", error);
        if (!isMounted.current) return;
        
        setState(prev => ({
          ...prev,
          isLoading: false, 
          error: "Failed to initialize viewer"
        }));

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

      try {
        const image = await loadImageSafely(imageId, true, signal);
        
        // Check if component is still mounted
        if (!isMounted.current) return;
        
        console.log("DicomViewer: Image loaded successfully, metadata:", image.imageId);
        
        // Extract metadata before displaying the image
        const metadata = extractMetadata(image);
        
        // Display the image in its natural size
        cornerstone.displayImage(element, image);
        console.log("DicomViewer: Image displayed successfully");
        
        // Notify parent about metadata
        if (onMetadataLoaded) {
          console.log("DicomViewer: Notifying parent about metadata");
          onMetadataLoaded(metadata);
        }
        
        setState({
          isLoading: false,
          isImageLoaded: true,
          error: null,
          image
        });
      } catch (error) {
        // Check if component is still mounted
        if (!isMounted.current) return;
        
        console.error("DicomViewer: All image loading attempts failed:", error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "Failed to load image"
        }));
        
        if (onError) onError(error instanceof Error ? error : new Error("Failed to load image"));
      }
    };
    
    loadImage();
  }, [element, imageUrl, onError, onMetadataLoaded]);

  return state;
};
