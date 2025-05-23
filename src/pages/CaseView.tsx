
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCaseData } from "@/hooks/useCaseData";
import { CaseDetails } from "@/components/case/CaseDetails";
import { BasicDicomImageSection } from "@/components/case/BasicDicomImageSection";
import { CompletedCaseReview } from "@/components/case/CompletedCaseReview";
import { useCaseAttempt } from "@/hooks/useCaseAttempt";

const CaseView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Fetch case data with custom hook
  const { data: caseData, isLoading: isLoadingCase, error: caseError } = useCaseData(id, user?.id);

  // Get case attempt status for completed review
  const { status, attemptId } = useCaseAttempt(id || "", user?.id || "");

  // Handle errors
  if (caseError) {
    return (
      <div className="min-h-screen bg-medical-lighter">
        <div className="container mx-auto py-8 px-4">
          <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Error Loading Case</h2>
            <p className="text-red-700 mb-4">Failed to load case: {(caseError as Error).message}</p>
            <Button 
              variant="outline" 
              className="bg-white hover:bg-gray-50"
              onClick={() => navigate("/cases")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cases
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-medical-lighter">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-medical-border py-6 px-6 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/cases")}
              className="mr-4 bg-white hover:bg-gray-50 border-medical-border"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cases
            </Button>
            {isLoadingCase ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              <h1 className="text-2xl font-bold text-medical-dark">{caseData?.title}</h1>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {isLoadingCase ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left column - Case information */}
              <div className="lg:col-span-1 space-y-6">
                {/* Case Details */}
                <CaseDetails caseData={caseData} />
                
                {/* Completed Case Review - Only shown for completed attempts */}
                {user && id && status === 'completed' && attemptId && (
                  <CompletedCaseReview
                    caseId={id}
                    userId={user.id}
                    attemptId={attemptId}
                  />
                )}
              </div>
              
              {/* Right column - DICOM viewer */}
              <div className="lg:col-span-2">
                <BasicDicomImageSection 
                  dicomPath={caseData?.dicom_path} 
                  title={caseData?.title}
                  caseId={id}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CaseView;
