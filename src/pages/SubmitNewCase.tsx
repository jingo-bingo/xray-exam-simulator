
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ContributorCaseForm } from "@/components/contributor/ContributorCaseForm";
import { AppHeader } from "@/components/AppHeader";
import { ArrowLeft } from "lucide-react";

const SubmitNewCase = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const navigation = (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => {
        console.log("SubmitNewCase: Returning to submit cases page");
        navigate("/cases/submit");
      }}
      className="border-medical-border text-medical-primary hover:bg-medical-lighter"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back to My Cases
    </Button>
  );

  return (
    <div className="min-h-screen bg-medical-light text-medical-dark">
      <AppHeader title="Submit New Case" navigation={navigation} />

      <main className="container mx-auto py-8 px-4">
        <ContributorCaseForm onSuccess={() => navigate("/cases/submit")} />
      </main>
    </div>
  );
};

export default SubmitNewCase;
