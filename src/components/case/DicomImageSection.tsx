
import { useCallback, useEffect, useRef, useState, memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "lucide-react";
import { DicomViewer } from "@/components/admin/DicomViewer";
import { DicomMetadataDisplay, DicomMetadata } from "@/components/admin/DicomMetadataDisplay";
import { toast } from "@/components/ui/use-toast";
import { getSignedUrl } from "@/utils/dicomStorage";

interface DicomImageSectionProps {
  dicomPath: string | null | undefined;
  title: string | undefined;
  onMetadataLoaded?: (metadata: DicomMetadata) => void;
}

const DicomImageSectionComponent = ({ dicomPath, title, onMetadataLoaded }: DicomImageSectionProps) => {
  const [signedDicomUrl, setSignedDicomUrl] = useState<string | null>(null);
  const [dicomError, setDicomError] = useState<string | null>(null);
  const [dicomMetadata, setDicomMetadata] = useState<DicomMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(false);
  
  // Use refs to prevent dependency cycles and track loading state
  const isGeneratingUrlRef = useRef<boolean>(false);
  const currentDicomPathRef = useRef<string | null>(null);
  
  // Track mounted state to prevent state updates after component unmount
  const isMountedRef = useRef<boolean>(true);
  
  useEffect(() => {
    // Set mounted state on mount
    isMountedRef.current = true;
    
    // Clean up on unmount
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Memoized function to generate signed URL - no state dependencies
  const generateSignedUrl = useCallback(async (dicomPath: string) => {
    // Prevent duplicate requests and check if component is still mounted
    if (isGeneratingUrlRef.current || !isMountedRef.current) return null;
    
    // Path hasn't changed - no need to regenerate
    if (currentDicomPathRef.current === dicomPath && signedDicomUrl) {
      console.log("DicomImageSection: Using existing URL for same DICOM path");
      return signedDicomUrl;
    }
    
    // Update current path ref
    currentDicomPathRef.current = dicomPath;
    
    // Set loading state using ref to prevent dependency cycle
    isGeneratingUrlRef.current = true;
    
    try {
      console.log("DicomImageSection: Generating signed URL for:", dicomPath);
      const url = await getSignedUrl(dicomPath, 3600);
      console.log("DicomImageSection: Signed URL generated:", url);
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setSignedDicomUrl(url);
        setDicomError(null);
      }
      
      return url;
    } catch (error) {
      console.error("DicomImageSection: Failed to generate signed URL:", error);
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setDicomError("Failed to load image URL");
        toast({
          title: "Error",
          description: "Failed to load DICOM image",
          variant: "destructive",
        });
      }
      
      return null;
    } finally {
      isGeneratingUrlRef.current = false;
    }
  }, []);

  // Generate signed URL for DICOM when dicomPath is available
  useEffect(() => {
    if (!dicomPath) return;
    
    console.log("DicomImageSection: DICOM path received:", dicomPath);
    
    // Track previous path to avoid unnecessary regeneration
    const previousPath = currentDicomPathRef.current;
    
    if (previousPath !== dicomPath) {
      console.log("DicomImageSection: DICOM path changed, generating new URL");
      
      // Reset metadata when path changes
      if (isMountedRef.current) {
        setDicomMetadata(null);
        setIsLoadingMetadata(true);
      }
      
      generateSignedUrl(dicomPath);
    } else {
      console.log("DicomImageSection: DICOM path unchanged, skipping URL generation");
    }
  }, [dicomPath, generateSignedUrl]);

  // Handle metadata loading - use stable callback
  const handleMetadataLoaded = useCallback((metadata: DicomMetadata) => {
    console.log("DicomImageSection: Metadata received from DicomViewer:", metadata);
    
    if (isMountedRef.current) {
      setDicomMetadata(metadata);
      setIsLoadingMetadata(false);
    }
    
    if (onMetadataLoaded) {
      onMetadataLoaded(metadata);
    }
  }, [onMetadataLoaded]);

  const handleViewerError = useCallback((error: Error) => {
    console.error("DicomImageSection: DICOM viewer error:", error);
    setDicomError("Failed to load the DICOM image");
    toast({
      title: "Image Error",
      description: "Failed to load the DICOM image",
      variant: "destructive",
    });
  }, []);

  return (
    <>
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-radiology-light flex items-center">
            <Image className="mr-2 h-5 w-5" />
            DICOM Image
          </CardTitle>
          {dicomError && (
            <CardDescription className="text-red-400">
              Error: {dicomError}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div key={`dicom-viewer-${dicomPath}`} className="relative bg-black max-w-full overflow-auto">
            {signedDicomUrl ? (
              <DicomViewer 
                imageUrl={signedDicomUrl}
                alt={`DICOM for case ${title}`}
                className="bg-black"
                onError={handleViewerError}
                onMetadataLoaded={handleMetadataLoaded}
              />
            ) : (
              <div className="w-full aspect-square max-h-[600px] bg-black flex items-center justify-center text-gray-400">
                {isGeneratingUrlRef.current ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400 mb-2"></div>
                    <div>Preparing DICOM image...</div>
                  </div>
                ) : (
                  dicomError ? 
                    "Error loading DICOM image" : 
                    (dicomPath ? "Loading DICOM image..." : "No DICOM image available for this case")
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* DICOM Metadata Display */}
      <DicomMetadataDisplay 
        metadata={dicomMetadata} 
        isLoading={isLoadingMetadata && !!signedDicomUrl}
      />
    </>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const DicomImageSection = memo(DicomImageSectionComponent);
