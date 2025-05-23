
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
    <Card className="bg-white border-medical-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-medical-dark">{caseData.title}</CardTitle>
        <CardDescription className="text-medical-muted">
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
            <h3 className="text-sm font-medium text-medical-dark mb-2">Clinical History</h3>
            <p className="text-medical-dark text-sm leading-relaxed">
              {caseData.clinical_history || "No clinical history provided."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
