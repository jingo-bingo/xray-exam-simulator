
import { useAuth } from "@/hooks/useAuth";
import CasesList from "@/components/CasesList";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const Cases = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Cases: Component mounted with userRole:", userRole);
  }, [userRole]);

  return (
    <div className="min-h-screen bg-medical-light text-medical-dark">
      <header className="bg-white shadow-sm border-b border-medical-border py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-medical-primary">Rad2B Cases</h1>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                console.log("Cases: Navigating back to dashboard");
                navigate("/dashboard");
              }}
              className="border-medical-border text-medical-primary hover:bg-medical-lighter"
            >
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
                Return to Admin Panel
              </Button>
            )}
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
        <CasesList />
      </main>
    </div>
  );
};

export default Cases;
