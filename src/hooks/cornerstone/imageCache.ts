
// Cache for loaded images to prevent re-fetching
const loadedImages = new Map<string, any>();

export const imageCache = {
  has: (imageId: string): boolean => {
    return loadedImages.has(imageId);
  },

  get: (imageId: string): any => {
    return loadedImages.get(imageId);
  },

  set: (imageId: string, image: any): void => {
    loadedImages.set(imageId, image);
  },

  clear: (): void => {
    loadedImages.clear();
  },

  size: (): number => {
    return loadedImages.size;
  }
};
