
import { useAuth } from "@/hooks/useAuth";
import CasesList from "@/components/CasesList";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { AppHeader } from "@/components/AppHeader";
import { ArrowLeft } from "lucide-react";

const Cases = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Cases: Component mounted with userRole:", userRole);
  }, [userRole]);

  const navigation = (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => {
          console.log("Cases: Navigating back to dashboard");
          navigate("/dashboard");
        }}
        className="border-medical-border text-medical-primary hover:bg-medical-lighter"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      {userRole === "admin" && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            console.log("Cases: Admin returning to admin panel");
            navigate("/admin");
          }}
          className="border-medical-border text-medical-primary hover:bg-medical-lighter"
        >
          Admin Panel
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-medical-light text-medical-dark">
      <AppHeader title="Cases" navigation={navigation} />

      <main className="container mx-auto py-8 px-4">
        <CasesList />
      </main>
    </div>
  );
};

export default Cases;
