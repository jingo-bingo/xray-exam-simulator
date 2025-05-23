
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMemo, useEffect } from "react";

interface CaseHeaderProps {
  title: string | undefined;
  isLoading: boolean;
}

export const CaseHeader = ({ title, isLoading }: CaseHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Store navigation context when coming from submitted cases
  useEffect(() => {
    if (location.state?.from === 'submitted') {
      localStorage.setItem('caseViewSource', 'submitted');
    }
  }, [location.state]);
  
  // Determine if we should navigate back to the contributed cases page
  const backLink = useMemo(() => {
    // Check multiple indicators for submitted case context
    const isFromSubmitted = location.state?.from === 'submitted';
    const pathIncludesSubmit = location.pathname.includes('submit');
    const storedSource = localStorage.getItem('caseViewSource');
    const referrerIncludesSubmit = document.referrer.includes('/cases/submit');
    
    // Clear stored source to avoid conflicts on next navigation
    if (storedSource === 'submitted') {
      localStorage.removeItem('caseViewSource');
    }
    
    // If any indicator suggests this came from submitted cases, navigate there
    if (isFromSubmitted || pathIncludesSubmit || storedSource === 'submitted' || referrerIncludesSubmit) {
      return "/cases/submit";
    }
    
    // Default to the general cases page
    return "/cases";
  }, [location]);
  
  return (
    <header className="bg-white shadow-sm border-b border-medical-border py-4 px-6 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(backLink)}
            className="mr-4 border-medical-border hover:bg-medical-lighter"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> 
            {backLink === "/cases/submit" ? "Back to My Submitted Cases" : "Back to Cases"}
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
