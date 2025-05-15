
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCaseData } from "@/hooks/useCaseData";
import { CaseHeader } from "@/components/case/CaseHeader";
import { CaseDetails } from "@/components/case/CaseDetails";
import { DicomImageSection } from "@/components/case/DicomImageSection";

const CaseView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Fetch case data with custom hook
  const { data: caseData, isLoading: isLoadingCase, error: caseError } = useCaseData(id, user?.id);

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

  return (
    <div className="min-h-screen bg-radiology-dark text-radiology-light">
      <CaseHeader 
        title={caseData?.title} 
        isLoading={isLoadingCase} 
      />

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
              <CaseDetails caseData={caseData} />
            </div>
            
            {/* Right column - DICOM viewer and metadata */}
            <div className="lg:col-span-2">
              <DicomImageSection 
                dicomPath={caseData?.dicom_path} 
                title={caseData?.title}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CaseView;
