
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Dashboard = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Dashboard: Component mounted with userRole:", userRole);
  }, [userRole]);

  return (
    <div className="min-h-screen bg-medical-light text-medical-dark">
      <header className="bg-white shadow-sm border-b border-medical-border py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-medical-primary">Rad2B Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-medical-dark">{user?.email}</span>
            <Button variant="outline" onClick={signOut} className="border-medical-border">Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm border border-medical-border">
          <h2 className="text-xl font-semibold mb-2 text-medical-dark">
            Welcome, {userRole === "admin" ? "Admin" : userRole === "contributor" ? "Contributor" : "Trainee"}!
          </h2>
          <p className="text-medical-muted mb-4">
            You're logged in to the Rad2B platform, the advanced radiology examination simulator.
          </p>
          
          {/* Show admin panel button only for admins */}
          {userRole === "admin" && (
            <div className="mt-4 flex gap-4">
              <Button 
                onClick={() => {
                  console.log("Dashboard: Admin navigating to admin panel");
                  navigate("/admin");
                }}
                className="bg-medical-primary hover:bg-medical-primary/90 text-white"
              >
                Access Admin Panel
              </Button>
              
              <Button 
                onClick={() => {
                  console.log("Dashboard: Admin navigating to cases as an admin");
                  navigate("/cases");
                }}
                className="bg-medical-secondary hover:bg-medical-secondary/90 text-white"
              >
                Browse Cases
              </Button>
            </div>
          )}
          
          {/* Show contributor options */}
          {userRole === "contributor" && (
            <div className="mt-4 flex gap-4">
              <Button 
                onClick={() => {
                  console.log("Dashboard: Contributor navigating to cases");
                  navigate("/cases");
                }}
                className="bg-medical-primary hover:bg-medical-primary/90 text-white"
              >
                Browse Cases
              </Button>
              
              <Button 
                onClick={() => {
                  console.log("Dashboard: Contributor navigating to submit cases");
                  navigate("/cases/submit");
                }}
                className="bg-medical-secondary hover:bg-medical-secondary/90 text-white"
              >
                Submit Cases
              </Button>
            </div>
          )}
          
          {/* Show browse cases button for trainees */}
          {userRole === "trainee" && (
            <div className="mt-4">
              <Button 
                onClick={() => {
                  console.log("Dashboard: Trainee navigating to cases");
                  navigate("/cases");
                }}
                className="bg-medical-primary hover:bg-medical-primary/90 text-white"
              >
                Browse Cases
              </Button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-medical-border">
            <h3 className="text-lg font-semibold mb-2 text-medical-dark">Quick Stats</h3>
            <div className="text-medical-muted">
              <p>Coming soon...</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-medical-border">
            <h3 className="text-lg font-semibold mb-2 text-medical-dark">Recent Activity</h3>
            <div className="text-medical-muted">
              <p>Coming soon...</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-medical-border">
            <h3 className="text-lg font-semibold mb-2 text-medical-dark">Resources</h3>
            <div className="text-medical-muted">
              <p>Coming soon...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
