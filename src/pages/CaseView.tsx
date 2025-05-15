
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { CaseHeader } from "@/components/case-view/CaseHeader";
import { CaseDetails } from "@/components/case-view/CaseDetails";
import { DicomSection } from "@/components/case-view/DicomSection";
import { ErrorDisplay } from "@/components/case-view/ErrorDisplay";
import { LoadingSkeleton } from "@/components/case-view/LoadingSkeleton";
import { useCase } from "@/hooks/useCase";
import { useDicomUrl } from "@/hooks/useDicomUrl";

const CaseView = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  // Fetch case data with proper caching
  const { 
    data: caseData, 
    isLoading: isLoadingCase, 
    error: caseError 
  } = useCase(id, user?.id);

  // Handle DICOM URL generation
  const {
    signedDicomUrl,
    dicomError,
    setDicomError,
    isGeneratingUrl
  } = useDicomUrl(caseData?.dicom_path);

  // Handle errors
  if (caseError) {
    return <ErrorDisplay message={(caseError as Error).message} />;
  }

  return (
    <div className="min-h-screen bg-radiology-dark text-radiology-light">
      <CaseHeader 
        title={caseData?.title} 
        isLoading={isLoadingCase} 
      />

      <main className="container mx-auto py-8 px-4">
        {isLoadingCase ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Case information */}
            <div className="lg:col-span-1 space-y-4">
              <CaseDetails caseData={caseData} />
            </div>
            
            {/* Right column - DICOM viewer */}
            <div className="lg:col-span-2">
              <DicomSection 
                signedDicomUrl={signedDicomUrl}
                dicomError={dicomError}
                isGeneratingUrl={isGeneratingUrl}
                caseTitle={caseData?.title}
                dicomPath={caseData?.dicom_path}
                setDicomError={setDicomError}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CaseView;
