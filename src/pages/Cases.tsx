
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
    <div className="min-h-screen bg-radiology-dark text-radiology-light">
      <header className="bg-gray-800 shadow-md py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">RadExam Cases</h1>
            {userRole === "admin" && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  console.log("Cases: Admin returning to admin panel");
                  navigate("/admin");
                }}
              >
                Return to Admin Panel
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span>{user?.email} ({userRole})</span>
            <button 
              onClick={signOut}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition"
            >
              Sign Out
            </button>
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
