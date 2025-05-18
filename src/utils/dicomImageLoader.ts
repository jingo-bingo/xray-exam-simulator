
import cornerstone from "cornerstone-core";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";

// Cache for loaded images to prevent re-fetching
const imageCache = new Map<string, any>();
// Track active loading operations to prevent duplicate loads
const activeLoads = new Map<string, Promise<any>>();

// Clear an image from the cache
export function clearImageFromCache(imageId: string) {
  if (imageCache.has(imageId)) {
    imageCache.delete(imageId);
    console.log(`DicomViewer: Removed ${imageId} from cache`);
  }
}

// Determine image type based on URL
export function getImageId(url: string) {
  if (url.startsWith('http')) {
    return `wadouri:${url}`;
  }
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
  const isImageFormat = imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
  
  return isImageFormat ? `webImage:${url}` : `wadouri:${url}`;
}

// Function to handle loading with memory consideration and caching
export async function loadImageSafely(imageId: string, signal: AbortSignal, isDicomAttempt = true): Promise<any> {
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
      if (isDicomAttempt && imageId.startsWith('wadouri:http')) {
        console.log("DicomViewer: DICOM load failed, trying as web image");
        const webImageId = `webImage:${imageId.substring(8)}`; // Remove 'wadouri:' prefix
        
        // Remove this load from active loads to allow retry
        activeLoads.delete(imageId);
        
        return loadImageSafely(webImageId, signal, false);
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
}

// Helper function to purge image cache
export function purgeImageCache() {
  imageCache.clear();
  console.log("DicomViewer: Image cache purged");
  
  // Also tell cornerstone to purge its cache
  try {
    cornerstone.imageCache.purgeCache();
    console.log("DicomViewer: Cornerstone image cache purged");
  } catch (error) {
    console.error("DicomViewer: Error purging cornerstone cache:", error);
  }
}
