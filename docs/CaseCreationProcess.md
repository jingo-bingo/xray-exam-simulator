
# Case Creation Process Documentation

This document explains how the DICOM image upload and case creation process works in the application.

## DICOM File Handling Overview

The application handles DICOM files using a multi-stage process to ensure proper validation, storage, and retrieval.

### File Validation 

1. **DICOM Validation Logic** (`src/utils/dicomValidator.ts`):
   - Files are validated as actual DICOM files by examining their content, not just file extension
   - Checks for the "DICM" magic number at byte offset 128
   - Falls back to checking for common DICOM tags if the magic number isn't present
   - Can extract metadata from DICOM files when needed
   - This ensures only valid medical images are uploaded to the system

### File Storage

1. **Storage Utilities** (`src/utils/dicomStorage.ts`):
   - Handles all interactions with Supabase Storage
   - Functions for checking file existence, uploading, making temporary files permanent, and deleting files
   - Creates unique file paths to avoid collisions

2. **File Handling Utilities** (`src/utils/dicomFileHandler.ts`):
   - Coordinates the validation and storage processes
   - Provides unified interfaces for upload and removal operations
   - Handles error conditions and provides structured responses
   - Manages notifications to the user

3. **Temporary vs. Permanent Files**:
   - During case creation, files are initially uploaded as temporary (prefixed with `temp_`)
   - When a case is saved, temporary files are made permanent by:
     - Downloading the temporary file
     - Uploading it with a permanent name (without the `temp_` prefix)
     - Deleting the temporary file
   - This prevents orphaned files if a case creation is abandoned

### React Hook Integration

1. **The `useDicomUpload` Hook** (`src/hooks/useDicomUpload.ts`):
   - Provides a clean interface for components to upload, preview, and manage DICOM files
   - Handles state management and error handling
   - Communicates with parent components through callbacks
   - Checks if initial files exist when component mounts
   - Uses the utility layer for actual file operations

## UI Components

1. **DICOM Uploader Component** (`src/components/admin/DicomUploader.tsx`):
   - Manages the UI for file uploads
   - Uses the `useDicomUpload` hook for file handling logic
   - Shows appropriate UI based on file status (uploading, validation errors, preview)
   - Handles temporary upload mode for case creation

2. **DICOM Preview Component** (`src/components/admin/DicomPreview.tsx`):
   - Displays the uploaded DICOM file using the DICOM viewer
   - Handles missing files with appropriate UI feedback
   - Provides option to remove files

3. **DICOM Viewer Component** (`src/components/admin/DicomViewer.tsx`):
   - Uses Cornerstone.js to render DICOM images
   - Handles loading and display errors gracefully
   - Implements memory management for large DICOM files

## Case Creation Flow

1. Admin navigates to "Create New Case" screen
2. Admin fills in case details and uploads a DICOM image:
   - The image is uploaded as a temporary file (with `temp_` prefix)
   - A preview is shown to confirm successful upload
3. Admin adds questions for the case
4. When admin clicks "Create Case":
   - Case data is saved to the database
   - Any temporary DICOM file is made permanent (by removing the `temp_` prefix)
   - The permanent file path is stored in the case record

## Case Editing Flow

1. Admin navigates to "Edit Case" screen
2. Existing case data is loaded, including the DICOM file path
3. System checks if the referenced DICOM file exists
   - If missing, appropriate UI is shown with options to re-upload
4. Admin makes changes to the case and/or uploads a new DICOM image
5. When admin clicks "Update Case":
   - Case data is updated in the database
   - If a new DICOM file was uploaded, the old file is deleted and the new one is made permanent
   - If no new file was uploaded, the existing file reference is maintained

## Error Handling

The system handles various error scenarios:
- Invalid file formats (non-DICOM files)
- Missing files (file exists in database but not in storage)
- Storage API errors (upload/download/delete failures)
- Display errors (files that can't be rendered)

Each error is handled with appropriate user feedback via toast notifications and UI updates.

## File Cleanup Considerations

To prevent storage bloat:
- Temporary files not associated with cases should eventually be cleaned up
- When a case is deleted, its associated DICOM file should be removed
- Regular maintenance may be needed to identify and remove orphaned files

## Code Organization

The DICOM handling code is organized into several specialized layers:

1. **Validation Layer** (`dicomValidator.ts`):
   - Focuses on determining if files are valid DICOM files
   - Extracts metadata from DICOM files

2. **Storage Layer** (`dicomStorage.ts`):
   - Handles direct interactions with the storage backend
   - Manages file paths, uploads, downloads, and deletions

3. **File Handling Layer** (`dicomFileHandler.ts`):
   - Coordinates validation and storage operations
   - Provides higher-level operations for UI components
   - Handles error conditions and provides structured responses

4. **State Management Layer** (`useDicomUpload.ts`):
   - Manages React state for file upload operations
   - Coordinates UI feedback and parent component communication

This layered approach improves maintainability by creating clear separation of concerns.
