
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
  if (!caseData) return null;

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900">{caseData.title}</CardTitle>
        <CardDescription className="text-gray-600">
          {caseData.region && (
            <span className="capitalize">{caseData.region}</span>
          )}
          {caseData.region && caseData.age_group && " • "}
          {caseData.age_group && (
            <span className="capitalize">{caseData.age_group}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Clinical History</h3>
            <p className="text-gray-900 text-sm leading-relaxed">
              {caseData.clinical_history || "No clinical history provided."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
