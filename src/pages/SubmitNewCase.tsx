
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ContributorCaseForm } from "@/components/contributor/ContributorCaseForm";

const SubmitNewCase = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-medical-light text-medical-dark">
      <header className="bg-white shadow-sm border-b border-medical-border py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-medical-primary">Submit New Case</h1>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                console.log("SubmitNewCase: Returning to submit cases page");
                navigate("/cases/submit");
              }}
              className="border-medical-border text-medical-primary hover:bg-medical-lighter"
            >
              Back to My Cases
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-medical-dark">{user?.email} ({userRole})</span>
            <Button 
              variant="outline"
              onClick={signOut}
              className="border-medical-border hover:bg-medical-lighter"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <ContributorCaseForm onSuccess={() => navigate("/cases/submit")} />
      </main>
    </div>
  );
};

export default SubmitNewCase;
