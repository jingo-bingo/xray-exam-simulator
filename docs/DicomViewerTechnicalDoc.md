
# DICOM Viewer Technical Documentation

This document provides technical details about the DICOM viewer implementation in our radiology training application.

## Overview

The DICOM viewer is a specialized component that renders medical imaging files in the Digital Imaging and Communications in Medicine (DICOM) format. It's primarily used in the CaseView component to display radiological images for educational purposes.

## Architecture

### Component Structure

The DICOM viewer implementation consists of several interconnected components:

1. **CaseView** (`src/pages/CaseView.tsx`)
   - Top-level page component that fetches case data
   - Manages signed URL generation for DICOM images
   - Renders both case information and the DICOM viewer
   - Displays DICOM metadata

2. **DicomViewer** (`src/components/admin/DicomViewer.tsx`)
   - Core component responsible for rendering DICOM images
   - Initializes and manages Cornerstone.js libraries
   - Handles image loading, rendering, and error states
   - Extracts metadata from DICOM files

3. **DicomMetadataDisplay** (`src/components/admin/DicomMetadataDisplay.tsx`)
   - Displays extracted DICOM metadata in a user-friendly format
   - Handles different states (loading, error, no data available)
   - Provides a consistent UI for metadata visualization

4. **Utility Services**
   - `dicomStorage.ts`: Manages file access and signed URL generation
   - `dicomValidator.ts`: Validates DICOM file formats
   - `dicomFileHandler.ts`: Handles file upload and removal operations

### Dependencies

The viewer relies on several key libraries:

- **cornerstone-core**: Core rendering engine
- **cornerstone-web-image-loader**: Handles standard web images
- **cornerstone-wado-image-loader**: Specialized DICOM format parser
- **dicom-parser**: Low-level DICOM parsing utilities

## Technical Implementation

### Image Loading Process

1. **URL Generation**:
   - DICOM files are stored securely in Supabase storage
   - A time-limited signed URL is generated via `getSignedUrl()`
   - Default expiration: 3600 seconds (1 hour)

2. **Loading Strategy**:
   ```
   ┌────────────────┐
   │ Request Image  │
   └────────┬───────┘
            ▼
   ┌────────────────┐
   │ Try as DICOM   │──▶ Success ──▶ Display
   └────────┬───────┘
            │ Fail
            ▼
   ┌────────────────┐
   │ Try as Web Img │──▶ Success ──▶ Display
   └────────┬───────┘
            │ Fail
            ▼
   ┌────────────────┐
   │   Try with     │
   │  Downsampling  │──▶ Success ──▶ Display
   └────────┬───────┘
            │ Fail
            ▼
   ┌────────────────┐
   │  Display Error │
   └────────────────┘
   ```

3. **Cornerstone Integration**:
   - Element is enabled for cornerstone rendering
   - Image ID format is determined based on URL and file type
   - Image is loaded with appropriate loader
   - On success, image is displayed in the viewport
   - Metadata is extracted and passed to parent component

### Metadata Extraction

The DicomViewer extracts multiple types of metadata from DICOM images:

1. **DICOM Tags**:
   - Modality (0x00080060): Indicates the type of equipment used for acquisition
   - Pixel Spacing (0x00280030): Physical distance (mm) between pixels

2. **Image Properties**:
   - Image dimensions (width x height)
   - Bit depth and color channels

3. **Extraction Process**:
   ```javascript
   const extractMetadata = (image) => {
     try {
       // Extract modality from DICOM tag 0x00080060
       metadata.modality = image.data.string('x00080060');
       
       // Get pixel dimensions
       metadata.dimensions = {
         width: image.width,
         height: image.height
       };
       
       // Extract pixel spacing from DICOM tag 0x00280030
       const pixelSpacingStr = image.data.string('x00280030');
       if (pixelSpacingStr) {
         const [rowSpacing, colSpacing] = pixelSpacingStr.split('\\').map(Number);
         metadata.pixelSpacing = {
           width: colSpacing,
           height: rowSpacing
         };
       }
     
       return metadata;
     } catch (error) {
       console.error("Error extracting metadata:", error);
       return {};
     }
   };
   ```

### Memory Management

To prevent browser crashes with large DICOM files:

1. **Cache Limitations**:
   ```javascript
   cornerstoneWADOImageLoader.configure({
     maxCacheSize: 50, // Default is 100
   });
   ```

2. **Dynamic Configuration**:
   ```javascript
   // For large files, use more aggressive settings
   cornerstoneWADOImageLoader.configure({
     decodeConfig: {
       convertFloatPixelDataToInt: true,
       use16Bits: false,
       maxWebWorkers: 0,
       preservePixelData: false
     },
     maxCacheSize: 10
   });
   ```

3. **Cleanup Strategy**:
   - Image cache is purged on component unmount
   - Cornerstone is disabled on the element
   - AbortController is used to cancel pending operations

### Error Handling

The viewer implements comprehensive error handling:

1. **File Access Errors**:
   - Missing files detection
   - Storage permission issues

2. **Format Validation**:
   - DICOM magic number verification
   - Tag structure validation

3. **Memory Errors**:
   - Detection of allocation failures
   - Automatic downsampling attempts

4. **User Feedback**:
   - Loading indicators with spinners
   - Error messages with details
   - Fallback content when images cannot be displayed

## Storage Integration

DICOM files are stored in Supabase storage buckets with the following operations:

1. **Upload**: `uploadDicomFile(file, isTemporary)`
   - Uploads files with unique identifiers
   - Optional temporary flag for draft storage

2. **Access**: `getSignedUrl(filePath, expirySeconds)`
   - Generates temporary access URLs
   - Configurable expiration time

3. **Removal**: `removeDicomFile(filePath)`
   - Removes files from storage
   - Verifies existence before attempting deletion

## Performance Considerations

### Optimization Techniques

1. **Lazy Loading**:
   - Images are only loaded when they enter the viewport
   - Signed URLs are generated on demand

2. **Memory Optimization**:
   - Aggressive cache size limitations
   - Image downsampling for large files
   - Explicit garbage collection hints

3. **Request Deduplication**:
   - Prevents duplicate URL generation requests
   - Uses React Query for efficient data fetching

### Browser Compatibility

The viewer is tested with:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Mobile browsers have limited support due to memory constraints with large DICOM files.

## Security Considerations

1. **Access Control**:
   - All DICOM access requires authentication
   - Files are accessed via temporary signed URLs
   - URLs expire after a configurable period (default: 1 hour)

2. **Data Protection**:
   - Patient identifiers are anonymized
   - No PHI is stored in frontend state

## Known Limitations

1. **Browser Memory**:
   - Very large DICOM files (>100MB) may cause performance issues
   - Mobile devices have more limited support for large files

2. **Format Support**:
   - Some specialized DICOM formats may not render correctly
   - Multi-frame support is limited

3. **Performance**:
   - Initial load time depends on file size and complexity
   - Rendering can be CPU-intensive for complex images

## Future Improvements

1. **MPR Support**: Multi-planar reconstruction for 3D datasets
2. **Progressive Loading**: For faster initial rendering of large images
3. **WebWorkers**: Offload more processing to background threads
4. **WebAssembly**: Use WASM for faster DICOM parsing
5. **Series Support**: Better handling of DICOM series (multiple images)

## Code Examples

### Initializing the Viewer

```typescript
useEffect(() => {
  if (!viewerRef.current || !imageUrl) return;
  
  const element = viewerRef.current;
  cornerstone.enable(element);
  
  const imageId = getImageId(imageUrl);
  cornerstone.loadImage(imageId)
    .then(image => {
      cornerstone.displayImage(element, image);
    })
    .catch(error => {
      console.error("Error loading image:", error);
    });
  
  return () => {
    cornerstone.imageCache.purgeCache();
    cornerstone.disable(element);
  };
}, [imageUrl]);
```

### Metadata Extraction

```typescript
const extractMetadata = (image) => {
  const metadata = {};
  
  // Get modality
  if (image.data && image.data.string) {
    metadata.modality = image.data.string('x00080060');
  }
  
  // Get dimensions
  metadata.dimensions = {
    width: image.width,
    height: image.height
  };
  
  // Get pixel spacing
  if (image.data && image.data.string) {
    const pixelSpacingStr = image.data.string('x00280030');
    if (pixelSpacingStr) {
      const [rowSpacing, colSpacing] = pixelSpacingStr.split('\\').map(Number);
      metadata.pixelSpacing = {
        width: colSpacing,
        height: rowSpacing
      };
    }
  }
  
  return metadata;
};
```

### Error Handling

```typescript
try {
  cornerstone.displayImage(element, image);
} catch (displayError) {
  console.error("Error displaying image:", displayError);
  setError("Failed to display image");
  if (onError) onError(new Error("Failed to display image"));
}
```

## Troubleshooting

Common issues and solutions:

1. **Image fails to load**:
   - Check if the DICOM file exists in storage
   - Verify the signed URL is valid and not expired
   - Examine browser console for specific error messages

2. **Browser crashes**:
   - File may be too large for browser memory
   - Try using Chrome with more available memory
   - Consider downsampling the image before upload

3. **Blank viewer**:
   - Ensure cornerstone is properly initialized
   - Check if the element has proper dimensions
   - Verify that the DICOM file has valid pixel data

4. **Missing metadata**:
   - Confirm the file is a valid DICOM file
   - Check if the specific tags exist in the file
   - Use a DICOM validator to inspect the file structure
