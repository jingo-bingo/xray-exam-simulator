
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CaseProgressCardsProps {
  attemptedCount: number;
  remainingCount: number;
  completedCount: number;
  attemptedPercentage: number;
  totalCases: number;
}

export const CaseProgressCards = ({ 
  attemptedCount, 
  remainingCount, 
  completedCount, 
  attemptedPercentage,
  totalCases 
}: CaseProgressCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-white border-medical-border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-medium text-medical-dark">Attempted Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-medical-dark">{attemptedCount}</span>
            <span className="text-sm text-medical-muted">of {totalCases} total</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border-medical-border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-medium text-medical-dark">Remaining Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-medical-dark">{remainingCount}</span>
            <span className="text-sm text-medical-muted">still to complete</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border-medical-border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-medium text-medical-dark">Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-medical-dark">{attemptedPercentage}% complete</span>
              <span className="text-medical-dark">{completedCount}/{totalCases}</span>
            </div>
            <Progress value={attemptedPercentage} className="h-2 bg-medical-lighter" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
