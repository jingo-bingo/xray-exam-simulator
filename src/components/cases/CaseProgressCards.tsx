
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
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-medium">Attempted Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">{attemptedCount}</span>
            <span className="text-sm text-gray-400">of {totalCases} total</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-medium">Remaining Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">{remainingCount}</span>
            <span className="text-sm text-gray-400">still to complete</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-medium">Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{attemptedPercentage}% complete</span>
              <span>{completedCount}/{totalCases}</span>
            </div>
            <Progress value={attemptedPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
