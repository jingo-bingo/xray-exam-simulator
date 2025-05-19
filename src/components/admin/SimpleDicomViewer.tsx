
import { useEffect, useRef, useState, memo } from "react";
import cornerstone from "cornerstone-core";
import cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";
import { DicomMetadata } from "./DicomMetadataDisplay";
import { extractMetadata } from "@/utils/dicomMetadataExtractor";
import { initializeCornerstone, isCornerstoneInitialized } from "@/utils/cornerstoneInit";

interface SimpleDicomViewerProps {
  imageUrl: string;
  alt?: string;
  className?: string;
  onError?: (error: Error) => void;
  onMetadataLoaded?: (metadata: DicomMetadata) => void;
  instanceId?: string; // Added instance ID prop for stability
}

// This global cache tracks loaded images across all instances
const loadedImages = new Map();

// Global registry of active elements to prevent multiple initializations
const initializedElements = new Set<string>();

// Simplified initialization function for cornerstone core only (no tools)
const ensureCornerstoneInitialized = (): boolean => {
  // Check if already initialized
  if (isCornerstoneInitialized()) {
    return true;
  }
  
  // Initialize cornerstone if not already initialized
  return initializeCornerstone();
};

// Define the component with memo to prevent unnecessary re-renders
const SimpleDicomViewerComponent = ({ 
  imageUrl, 
  alt, 
  className = "", 
  onError,
  onMetadataLoaded,
  instanceId = "default"
}: SimpleDicomViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageDisplayed, setImageDisplayed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Use refs to track component state and avoid dependency cycles
  const isMounted = useRef(true);
  const loadingAttemptRef = useRef<AbortController | null>(null);
  const currentImageUrlRef = useRef<string | null>(null);
  const imageInstanceRef = useRef<any>(null);
  const initializedRef = useRef<boolean>(false);
  const initAttemptRef = useRef(0);
  const MAX_INIT_ATTEMPTS = 3;
  
  // Composite key combining instanceId and URL to track initialization
  const elementKey = `${instanceId}-${imageUrl}`;
  
  // Initialize cornerstone on component mount
  useEffect(() => {
    console.log(`SimpleDicomViewer[${instanceId}]: Component mounting`);
    isMounted.current = true;
    
    const attemptInitialization = () => {
      // Check if we've exceeded maximum attempts
      if (initAttemptRef.current >= MAX_INIT_ATTEMPTS) {
        if (onError) {
          onError(new Error("Failed to initialize DICOM viewer after multiple attempts"));
        }
        setError("Failed to initialize DICOM viewer after multiple attempts");
        return false;
      }
      
      initAttemptRef.current++;
      console.log(`SimpleDicomViewer[${instanceId}]: Attempting cornerstone initialization (attempt ${initAttemptRef.current})`);
      
      // Initialize cornerstone libraries
      const initialized = ensureCornerstoneInitialized();
      if (!initialized) {
        if (onError) {
          onError(new Error("Failed to initialize DICOM viewer libraries"));
        }
        setError("Failed to initialize DICOM viewer libraries");
        return false;
      }
      
      setIsInitialized(true);
      return true;
    };
    
    // Attempt initialization immediately
    const initialized = attemptInitialization();
    
    // If initialization failed, retry a few times
    if (!initialized) {
      const initInterval = setInterval(() => {
        if (attemptInitialization() || initAttemptRef.current >= MAX_INIT_ATTEMPTS) {
          clearInterval(initInterval);
        }
      }, 500);
      
      return () => {
        clearInterval(initInterval);
      };
    }
    
    return () => {
      console.log(`SimpleDicomViewer[${instanceId}]: Component unmounting`);
      isMounted.current = false;
      
      // Abort any pending load operations
      if (loadingAttemptRef.current) {
        loadingAttemptRef.current.abort();
        loadingAttemptRef.current = null;
      }
      
      // Clean up cornerstone element if it exists
      if (viewerRef.current) {
        try {
          // Only disable if cornerstone knows about this element
          if (cornerstone.getElementData(viewerRef.current)) {
            console.log(`SimpleDicomViewer[${instanceId}]: Disabling cornerstone element`);
            cornerstone.disable(viewerRef.current);
            
            // Remove from initialized elements
            initializedElements.delete(elementKey);
          }
        } catch (error) {
          console.warn(`SimpleDicomViewer[${instanceId}]: Error during cleanup:`, error);
        }
      }
    };
  }, [instanceId, onError, elementKey]);
  
  // Load DICOM image when URL changes and cornerstone is initialized
  useEffect(() => {
    if (!isInitialized) {
      console.log(`SimpleDicomViewer[${instanceId}]: Waiting for cornerstone to initialize`);
      return;
    }
    
    const loadImage = async () => {
      if (!viewerRef.current || !imageUrl) return;
      
      // Skip if URL hasn't changed to prevent unnecessary reloads
      if (currentImageUrlRef.current === imageUrl && imageDisplayed) {
        console.log(`SimpleDicomViewer[${instanceId}]: URL unchanged, skipping reload`);
        return;
      }
      
      console.log(`SimpleDicomViewer[${instanceId}]: Initializing viewer for image:`, imageUrl);
      currentImageUrlRef.current = imageUrl;
      
      // Reset states when URL changes
      setIsLoading(true);
      setError(null);
      
      // Create abort controller for this loading attempt
      if (loadingAttemptRef.current) {
        loadingAttemptRef.current.abort();
      }
      loadingAttemptRef.current = new AbortController();
      
      // Check if element is already enabled for this specific instance
      let needToEnableElement = !initializedRef.current;
      
      // Clean up previous instance if necessary
      try {
        if (viewerRef.current) {
          // Check if the element is already enabled
          try {
            // This will throw if the element is not enabled
            cornerstone.getElementData(viewerRef.current);
            needToEnableElement = false;
          } catch (e) {
            needToEnableElement = true;
          }
        }
      } catch (error) {
        console.warn(`SimpleDicomViewer[${instanceId}]: Error checking element state:`, error);
      }
      
      // Enable the element for cornerstone if needed
      const element = viewerRef.current;
      
      try {
        if (needToEnableElement) {
          console.log(`SimpleDicomViewer[${instanceId}]: Enabling cornerstone on element`);
          
          // Basic element preparation - avoid touchAction and pointer events settings
          element.style.width = '100%';
          element.style.height = '100%';
          element.style.position = 'relative';
          element.style.outline = 'none';
          
          cornerstone.enable(element);
          initializedRef.current = true;
          initializedElements.add(elementKey);
          console.log(`SimpleDicomViewer[${instanceId}]: Cornerstone enabled on element`);
        } else {
          console.log(`SimpleDicomViewer[${instanceId}]: Element already enabled`);
        }
      } catch (error) {
        console.error(`SimpleDicomViewer[${instanceId}]: Error enabling cornerstone:`, error);
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
        console.log(`SimpleDicomViewer[${instanceId}]: Loading as web image:`, imageId);
      } else {
        imageId = `wadouri:${imageUrl}`;
        console.log(`SimpleDicomViewer[${instanceId}]: Loading as DICOM:`, imageId);
      }

      // Check if we've already loaded this image
      if (loadedImages.has(imageId)) {
        console.log(`SimpleDicomViewer[${instanceId}]: Using cached image`);
        const image = loadedImages.get(imageId);
        
        if (!isMounted.current) return;
        
        // Display the cached image
        cornerstone.displayImage(element, image);
        imageInstanceRef.current = image;
        setIsLoading(false);
        setImageDisplayed(true);
        return;
      }

      // Load the image
      try {
        console.log(`SimpleDicomViewer[${instanceId}]: Loading image with imageId:`, imageId);
        const image = await cornerstone.loadImage(imageId);
        
        // Check if component is still mounted
        if (!isMounted.current) return;
        
        console.log(`SimpleDicomViewer[${instanceId}]: Image loaded successfully`);
        
        // Cache the image
        loadedImages.set(imageId, image);
        imageInstanceRef.current = image;
        
        // Extract metadata for DICOM images
        if (!isImageFormat && onMetadataLoaded) {
          const metadata = extractMetadata(image);
          console.log(`SimpleDicomViewer[${instanceId}]: Metadata extracted`, metadata);
          onMetadataLoaded(metadata);
        }
        
        // Display the image
        console.log(`SimpleDicomViewer[${instanceId}]: Displaying image on element`);
        cornerstone.displayImage(element, image);
        console.log(`SimpleDicomViewer[${instanceId}]: Image displayed successfully`);
        
        setIsLoading(false);
        setImageDisplayed(true);
      } catch (error) {
        // Try as web image if DICOM load fails
        if (imageId.startsWith('wadouri:') && !isImageFormat) {
          try {
            const webImageId = `webImage:${imageUrl}`;
            console.log(`SimpleDicomViewer[${instanceId}]: DICOM load failed, trying as web image:`, webImageId);
            const image = await cornerstone.loadImage(webImageId);
            
            if (!isMounted.current) return;
            
            loadedImages.set(webImageId, image);
            imageInstanceRef.current = image;
            cornerstone.displayImage(element, image);
            setIsLoading(false);
            setImageDisplayed(true);
            return;
          } catch (webImageError) {
            console.error(`SimpleDicomViewer[${instanceId}]: Web image load also failed:`, webImageError);
          }
        }
        
        if (!isMounted.current) return;
        
        console.error(`SimpleDicomViewer[${instanceId}]: All image loading attempts failed:`, error);
        setError(error instanceof Error ? error.message : "Failed to load image");
        if (onError) onError(error instanceof Error ? error : new Error("Failed to load image"));
        setIsLoading(false);
      }
    };
    
    loadImage();
  }, [imageUrl, onError, onMetadataLoaded, instanceId, imageDisplayed, isInitialized, elementKey]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={viewerRef} 
        className={`w-full h-full ${className}`}
        data-instance-id={instanceId}
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

// Memoize the component to prevent unnecessary re-renders
export const SimpleDicomViewer = memo(SimpleDicomViewerComponent);
