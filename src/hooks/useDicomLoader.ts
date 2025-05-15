
import { useState, useEffect, useRef } from "react";
import cornerstone from "cornerstone-core";
import { DicomMetadata } from "@/components/admin/DicomMetadataDisplay";
import { initializeCornerstoneLoaders, getImageId } from "@/utils/cornerstoneInit";
import { extractMetadata } from "@/utils/dicomMetadataExtractor";
import { loadImageSafely } from "@/utils/imageSafeLoader";

// Initialize cornerstone when this module is loaded
initializeCornerstoneLoaders();

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
      
      // Try to load as DICOM first, regardless of file extension
      console.log("DicomViewer: Attempting to load as DICOM first");
      const imageId = getImageId(imageUrl);
      console.log("DicomViewer: Using imageId:", imageId);

      try {
        const image = await loadImageSafely(imageId, imageUrl, true, signal);
        
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
