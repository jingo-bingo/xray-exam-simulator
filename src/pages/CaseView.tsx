
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DicomViewer } from "@/components/admin/DicomViewer";
import { DicomMetadataDisplay, DicomMetadata } from "@/components/admin/DicomMetadataDisplay";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Image } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { getSignedUrl } from "@/utils/dicomStorage";

const CaseView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use refs to track state without triggering re-renders
  const signedUrlRef = useRef<string | null>(null);
  const currentDicomPathRef = useRef<string | null>(null);
  const isUrlGeneratingRef = useRef<boolean>(false);
  
  // State that should trigger re-renders
  const [dicomError, setDicomError] = useState<string | null>(null);
  const [dicomMetadata, setDicomMetadata] = useState<DicomMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(false);
  
  // Component lifecycle ref
  const isMountedRef = useRef<boolean>(true);
  
  useEffect(() => {
    // Set mounted state on mount
    isMountedRef.current = true;
    
    // Clean up on unmount
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Fetch case data with proper caching
  const { data: caseData, isLoading: isLoadingCase, error: caseError } = useQuery({
    queryKey: ["case", id],
    queryFn: async () => {
      const { data: caseData, error: caseError } = await supabase
        .from("cases")
        .select("*")
        .eq("id", id)
        .single();

      if (caseError) {
        throw new Error(caseError.message);
      }

      return caseData;
    },
    enabled: !!id && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once to avoid excessive retries on 404s
  });

  // Memoize the URL generation to prevent dependency cycles
  const generateSignedUrl = useCallback(async (dicomPath: string): Promise<string | null> => {
    // Skip if already generating a URL for this path
    if (isUrlGeneratingRef.current) {
      return signedUrlRef.current;
    }

    try {
      // Set the generating flag
      isUrlGeneratingRef.current = true;
      
      // Generate the URL
      const url = await getSignedUrl(dicomPath, 3600);
      
      // Only update if still mounted
      if (isMountedRef.current) {
        signedUrlRef.current = url;
        setDicomError(null);
      }
      
      return url;
    } catch (error) {
      // Only update if still mounted
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
      // Clear the generating flag
      isUrlGeneratingRef.current = false;
    }
  }, []);

  // Evaluate if we need to refresh the URL
  const signedDicomUrl = useMemo(() => {
    return signedUrlRef.current;
  }, [signedUrlRef.current]);

  // Generate signed URL for DICOM when caseData is available
  useEffect(() => {
    if (!caseData?.dicom_path) {
      // Reset states if no DICOM path
      currentDicomPathRef.current = null;
      signedUrlRef.current = null;
      if (isMountedRef.current) {
        setDicomMetadata(null);
      }
      return;
    }
    
    const dicomPath = caseData.dicom_path;
    
    // Check if the path has changed
    if (currentDicomPathRef.current !== dicomPath) {
      // Update the current path
      currentDicomPathRef.current = dicomPath;
      
      // Reset metadata and start loading
      if (isMountedRef.current) {
        setDicomMetadata(null);
        setIsLoadingMetadata(true);
      }
      
      // Generate the URL (async)
      generateSignedUrl(dicomPath);
    }
  }, [caseData, generateSignedUrl]);

  // Handle errors
  if (caseError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-md">
          <h2 className="text-lg font-semibold">Error</h2>
          <p>Failed to load case: {(caseError as Error).message}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate("/cases")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cases
          </Button>
        </div>
      </div>
    );
  }

  // Memoized metadata handler to prevent recreating on every render
  const handleMetadataLoaded = useCallback((metadata: DicomMetadata) => {
    if (isMountedRef.current) {
      setDicomMetadata(metadata);
      setIsLoadingMetadata(false);
    }
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "hard":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-radiology-dark text-radiology-light">
      <header className="bg-gray-800 shadow-md py-4 px-6 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/cases")}
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cases
            </Button>
            {isLoadingCase ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              <h1 className="text-xl font-bold">{caseData?.title}</h1>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {isLoadingCase ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Case information */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-radiology-light">{caseData?.title}</CardTitle>
                    {caseData?.is_free_trial && (
                      <Badge variant="outline" className="bg-blue-600 text-white border-blue-600">
                        Free Trial
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-gray-400">
                    Case #{caseData?.case_number} - 
                    {caseData?.region.charAt(0).toUpperCase() + caseData?.region.slice(1)} - 
                    {caseData?.age_group.charAt(0).toUpperCase() + caseData?.age_group.slice(1)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Badge className={`${getDifficultyColor(caseData?.difficulty)} text-white`}>
                      {caseData?.difficulty.charAt(0).toUpperCase() + caseData?.difficulty.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-300 mb-1">Clinical History</h3>
                      <p className="text-white">{caseData?.clinical_history || "No clinical history provided."}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-300 mb-1">Description</h3>
                      <p className="text-white">{caseData?.description || "No description available."}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right column - DICOM viewer and metadata */}
            <div className="lg:col-span-2">
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
                  <div className="relative w-full aspect-square max-h-[600px] bg-black">
                    {signedDicomUrl ? (
                      <DicomViewer 
                        imageUrl={signedDicomUrl}
                        alt={`DICOM for case ${caseData?.title}`}
                        className="w-full aspect-square max-h-[600px] bg-black"
                        onError={(error) => {
                          if (isMountedRef.current) {
                            setDicomError("Failed to load the DICOM image");
                            toast({
                              title: "Image Error",
                              description: "Failed to load the DICOM image",
                              variant: "destructive",
                            });
                          }
                        }}
                        onMetadataLoaded={handleMetadataLoaded}
                      />
                    ) : (
                      <div className="w-full aspect-square max-h-[600px] bg-black flex items-center justify-center text-gray-400">
                        {isUrlGeneratingRef.current ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400 mb-2"></div>
                            <div>Preparing DICOM image...</div>
                          </div>
                        ) : (
                          dicomError ? 
                            "Error loading DICOM image" : 
                            (caseData?.dicom_path ? "Loading DICOM image..." : "No DICOM image available for this case")
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
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CaseView;
