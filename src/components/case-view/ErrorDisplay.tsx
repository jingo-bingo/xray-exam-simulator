
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay = ({ message }: ErrorDisplayProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-md">
        <h2 className="text-lg font-semibold">Error</h2>
        <p>Failed to load case: {message}</p>
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
};
