
import { useCallback, useEffect, useRef, useState, memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "lucide-react";
import { SimpleDicomViewer } from "@/components/admin/SimpleDicomViewer";
import { DicomMetadataDisplay, DicomMetadata } from "@/components/admin/DicomMetadataDisplay";
import { toast } from "@/components/ui/use-toast";
import { getSignedUrl } from "@/utils/dicomStorage";
import { supabase } from "@/integrations/supabase/client";
import { ScanSelector, type Scan } from "./ScanSelector";

interface SimplifiedDicomImageSectionProps {
  dicomPath: string | null | undefined;
  title: string | undefined;
  caseId: string | undefined;
  onMetadataLoaded?: (metadata: DicomMetadata) => void;
}

const SimplifiedDicomImageSectionComponent = ({ dicomPath, title, caseId, onMetadataLoaded }: SimplifiedDicomImageSectionProps) => {
  const [signedDicomUrl, setSignedDicomUrl] = useState<string | null>(null);
  const [dicomError, setDicomError] = useState<string | null>(null);
  const [dicomMetadata, setDicomMetadata] = useState<DicomMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(false);
  const [isLoadingScans, setIsLoadingScans] = useState<boolean>(true);
  const [scans, setScans] = useState<Scan[]>([]);
  const [currentScan, setCurrentScan] = useState<Scan | null>(null);
  
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

  // Fetch scans whenever caseId changes
  useEffect(() => {
    const fetchScans = async () => {
      if (!caseId) {
        setIsLoadingScans(false);
        return;
      }
      
      try {
        setIsLoadingScans(true);
        
        const { data, error } = await supabase
          .from('case_scans')
          .select('*')
          .eq('case_id', caseId)
          .order('display_order', { ascending: true });
          
        if (error) throw error;
        
        if (isMountedRef.current) {
          // If we have scans from the new table, use those
          if (data && data.length > 0) {
            setScans(data);
            // Select the first scan by default
            setCurrentScan(data[0]);
          } else if (dicomPath) {
            // Fallback to legacy single scan if no scan records but we have dicomPath
            const legacyScan = {
              id: 'legacy',
              label: 'Primary View',
              dicom_path: dicomPath,
              display_order: 1
            };
            setScans([legacyScan]);
            setCurrentScan(legacyScan);
          } else {
            setScans([]);
            setCurrentScan(null);
          }
        }
      } catch (error) {
        console.error("Error fetching case scans:", error);
        if (isMountedRef.current) {
          // Fallback to legacy single scan on error
          if (dicomPath) {
            const legacyScan = {
              id: 'legacy',
              label: 'Primary View',
              dicom_path: dicomPath,
              display_order: 1
            };
            setScans([legacyScan]);
            setCurrentScan(legacyScan);
          }
          toast({
            title: "Error",
            description: "Failed to load case scans",
            variant: "destructive",
          });
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoadingScans(false);
        }
      }
    };
    
    fetchScans();
  }, [caseId, dicomPath]);

  // Memoized function to generate signed URL - no state dependencies
  const generateSignedUrl = useCallback(async (dicomPath: string) => {
    // Prevent duplicate requests and check if component is still mounted
    if (isGeneratingUrlRef.current || !isMountedRef.current) return null;
    
    // Path hasn't changed - no need to regenerate
    if (currentDicomPathRef.current === dicomPath && signedDicomUrl) {
      console.log("SimplifiedDicomImageSection: Using existing URL for same DICOM path");
      return signedDicomUrl;
    }
    
    // Update current path ref
    currentDicomPathRef.current = dicomPath;
    
    // Set loading state using ref to prevent dependency cycle
    isGeneratingUrlRef.current = true;
    
    try {
      console.log("SimplifiedDicomImageSection: Generating signed URL for:", dicomPath);
      const url = await getSignedUrl(dicomPath, 3600);
      console.log("SimplifiedDicomImageSection: Signed URL generated:", url);
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setSignedDicomUrl(url);
        setDicomError(null);
      }
      
      return url;
    } catch (error) {
      console.error("SimplifiedDicomImageSection: Failed to generate signed URL:", error);
      
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
  }, [signedDicomUrl]);

  // Generate signed URL when currentScan changes
  useEffect(() => {
    if (!currentScan) return;
    
    const scanDicomPath = currentScan.dicom_path;
    if (!scanDicomPath) return;
    
    console.log("SimplifiedDicomImageSection: DICOM path received for scan:", scanDicomPath);
    
    // Track previous path to avoid unnecessary regeneration
    const previousPath = currentDicomPathRef.current;
    
    if (previousPath !== scanDicomPath) {
      console.log("SimplifiedDicomImageSection: DICOM path changed, generating new URL");
      
      // Reset metadata when path changes
      if (isMountedRef.current) {
        setDicomMetadata(null);
        setIsLoadingMetadata(true);
        setSignedDicomUrl(null); // Clear previous URL to force refresh
      }
      
      generateSignedUrl(scanDicomPath);
    } else {
      console.log("SimplifiedDicomImageSection: DICOM path unchanged, skipping URL generation");
    }
  }, [currentScan, generateSignedUrl]);

  // Handle metadata loading - use stable callback
  const handleMetadataLoaded = useCallback((metadata: DicomMetadata) => {
    console.log("SimplifiedDicomImageSection: Metadata received from SimpleDicomViewer:", metadata);
    
    if (isMountedRef.current) {
      setDicomMetadata(metadata);
      setIsLoadingMetadata(false);
    }
    
    if (onMetadataLoaded) {
      onMetadataLoaded(metadata);
    }
  }, [onMetadataLoaded]);

  const handleViewerError = useCallback((error: Error) => {
    console.error("SimplifiedDicomImageSection: SimpleDicomViewer error:", error);
    setDicomError("Failed to load the DICOM image");
    toast({
      title: "Image Error",
      description: "Failed to load the DICOM image",
      variant: "destructive",
    });
  }, []);

  const handleSelectScan = useCallback((scan: Scan) => {
    console.log("SimplifiedDicomImageSection: Selected scan:", scan);
    setCurrentScan(scan);
  }, []);

  return (
    <>
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center">
            <Image className="mr-2 h-5 w-5" />
            DICOM Image
          </CardTitle>
          {dicomError && (
            <CardDescription className="text-red-600">
              Error: {dicomError}
            </CardDescription>
          )}
          
          {/* Scan Selector */}
          <ScanSelector 
            scans={scans}
            currentScanId={currentScan?.id}
            onSelectScan={handleSelectScan}
          />
        </CardHeader>
        <CardContent>
          <div 
            key={`simplified-dicom-viewer-${currentScan?.dicom_path || 'none'}`} 
            className="relative bg-black max-w-full overflow-auto rounded-md"
          >
            {isLoadingScans ? (
              <div className="w-full aspect-square max-h-[600px] bg-black flex items-center justify-center text-gray-400">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400 mb-2"></div>
                  <div>Loading scans...</div>
                </div>
              </div>
            ) : signedDicomUrl && currentScan ? (
              <SimpleDicomViewer 
                imageUrl={signedDicomUrl}
                alt={`DICOM for case ${title} - ${currentScan.label}`}
                className="bg-black min-h-[400px]"
                onError={handleViewerError}
                onMetadataLoaded={handleMetadataLoaded}
                instanceId={`scan-${currentScan.id}`}
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
                    (currentScan ? "Loading DICOM image..." : "No DICOM image available for this case")
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
export const SimplifiedDicomImageSection = memo(SimplifiedDicomImageSectionComponent);
