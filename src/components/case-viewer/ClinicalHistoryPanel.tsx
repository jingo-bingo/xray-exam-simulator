
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ClinicalHistoryPanelProps {
  clinicalHistory: string | null;
  title?: string;
}

export const ClinicalHistoryPanel = ({ 
  clinicalHistory, 
  title = "Clinical History" 
}: ClinicalHistoryPanelProps) => {
  console.log("ClinicalHistoryPanel: Rendering with history:", 
    clinicalHistory ? `${clinicalHistory.substring(0, 20)}...` : "No history available");

  return (
    <Card className="bg-gray-800 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {clinicalHistory ? (
          <p className="whitespace-pre-wrap">{clinicalHistory}</p>
        ) : (
          <p className="text-gray-400 italic">No clinical history available for this case.</p>
        )}
      </CardContent>
    </Card>
  );
};
