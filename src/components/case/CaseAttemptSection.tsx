
import { useCaseAttempt } from "@/hooks/useCaseAttempt";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Play } from "lucide-react";
import CaseQuestions from "@/components/CaseQuestions";
import { CompletedCaseReview } from "./CompletedCaseReview";

interface CaseAttemptSectionProps {
  caseId: string;
  userId: string;
}

export const CaseAttemptSection = ({ caseId, userId }: CaseAttemptSectionProps) => {
  const { 
    attemptId,
    status,
    isLoading,
    isCreating,
    startCase,
    handleComplete
  } = useCaseAttempt(caseId, userId);

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-radiology-light">Case Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4 bg-gray-700" />
            <Skeleton className="h-32 w-full bg-gray-700" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Case not yet started
  if (status === 'not_started' || !attemptId) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-radiology-light">Start Case</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-radiology-light mb-6">
            Ready to begin this case? Once you start, you'll see questions to answer based on the case details and DICOM images.
          </p>
          <Button 
            onClick={startCase} 
            disabled={isCreating}
            size="lg"
          >
            <Play className="mr-2 h-4 w-4" /> 
            Start Case
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Case completed - directly render CompletedCaseReview component
  if (status === 'completed') {
    return (
      <div className="space-y-4">
        {attemptId && (
          <CompletedCaseReview
            caseId={caseId}
            userId={userId}
            attemptId={attemptId}
          />
        )}
      </div>
    );
  }

  // Case in progress
  return (
    <CaseQuestions
      caseId={caseId}
      attemptId={attemptId}
      userId={userId}
      onComplete={handleComplete}
    />
  );
};
