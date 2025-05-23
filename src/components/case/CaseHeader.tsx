
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CaseHeaderProps {
  title: string | undefined;
  isLoading: boolean;
}

export const CaseHeader = ({ title, isLoading }: CaseHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <header className="bg-white shadow-sm border-b border-medical-border py-4 px-6 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/cases")}
            className="mr-4 border-medical-border hover:bg-medical-lighter"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cases
          </Button>
          {isLoading ? (
            <Skeleton className="h-8 w-48" />
          ) : (
            <h1 className="text-xl font-bold text-medical-dark">{title}</h1>
          )}
        </div>
      </div>
    </header>
  );
};
