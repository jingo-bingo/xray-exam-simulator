
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CaseDetailsProps {
  caseData: {
    title: string;
    is_free_trial?: boolean;
    case_number?: string;
    region?: string;
    age_group?: string;
    difficulty?: string;
    clinical_history?: string;
    description?: string;
  } | undefined;
}

export const CaseDetails = ({ caseData }: CaseDetailsProps) => {
  const getDifficultyColor = (difficulty: string | undefined) => {
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
          {caseData?.case_number && `Case #${caseData.case_number} - `}
          {caseData?.region && `${caseData.region.charAt(0).toUpperCase() + caseData.region.slice(1)} - `}
          {caseData?.age_group && `${caseData.age_group.charAt(0).toUpperCase() + caseData.age_group.slice(1)}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {caseData?.difficulty && (
          <div className="mb-4">
            <Badge className={`${getDifficultyColor(caseData.difficulty)} text-white`}>
              {caseData.difficulty.charAt(0).toUpperCase() + caseData.difficulty.slice(1)}
            </Badge>
          </div>
        )}
        
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
  );
};
