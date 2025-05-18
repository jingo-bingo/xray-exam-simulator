
import cornerstone from "cornerstone-core";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";

// Cache for loaded images to prevent re-fetching - with longer TTL
const imageCache = new Map<string, { image: any; timestamp: number }>();
const IMAGE_CACHE_TTL = 1000 * 60 * 30; // 30 minutes

// Track active loading operations to prevent duplicate loads
const activeLoads = new Map<string, Promise<any>>();

// Periodically clean up old cache entries
const cleanupCache = () => {
  const now = Date.now();
  let removed = 0;
  
  imageCache.forEach((entry, key) => {
    if (now - entry.timestamp > IMAGE_CACHE_TTL) {
      imageCache.delete(key);
      removed++;
    }
  });
  
  if (removed > 0) {
    console.log(`DicomViewer: Cleaned up ${removed} stale cache entries`);
  }
};

// Set up periodic cache cleanup
setInterval(cleanupCache, 60000); // Clean every minute

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
  
  // Check if we already have this image in our cache and it's not expired
  const cachedEntry = imageCache.get(imageId);
  if (cachedEntry) {
    const now = Date.now();
    if (now - cachedEntry.timestamp < IMAGE_CACHE_TTL) {
      console.log(`DicomViewer: Using cached image for ${imageId}`);
      return cachedEntry.image;
    } else {
      console.log(`DicomViewer: Cached image for ${imageId} is expired, reloading`);
    }
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
      
      // Cache the image with timestamp
      imageCache.set(imageId, { 
        image: image,
        timestamp: Date.now()
      });
      
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
          
          // Cache with timestamp
          imageCache.set(imageId, {
            image: image,
            timestamp: Date.now()
          });
          
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
