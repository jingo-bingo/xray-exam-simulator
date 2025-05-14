
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
    <div className="min-h-screen bg-radiology-dark text-radiology-light">
      <header className="bg-gray-800 shadow-md py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">RadExam Dashboard</h1>
          <div className="flex items-center gap-4">
            <span>{user?.email}</span>
            <Button variant="outline" onClick={signOut}>Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-2">Welcome, {userRole === "admin" ? "Admin" : "Trainee"}!</h2>
          <p className="text-gray-300 mb-4">
            You're logged in to the RadExam platform, the advanced radiology examination simulator.
          </p>
          
          {/* Show admin panel button only for admins */}
          {userRole === "admin" && (
            <div className="mt-4 flex gap-4">
              <Button onClick={() => {
                console.log("Dashboard: Admin navigating to admin panel");
                navigate("/admin");
              }}>
                Access Admin Panel
              </Button>
              
              <Button onClick={() => {
                console.log("Dashboard: Admin navigating to cases as an admin");
                navigate("/cases");
              }}>
                Browse Cases
              </Button>
            </div>
          )}
          
          {/* Show browse cases button for trainees */}
          {userRole === "trainee" && (
            <div className="mt-4">
              <Button onClick={() => {
                console.log("Dashboard: Trainee navigating to cases");
                navigate("/cases");
              }}>
                Browse Cases
              </Button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
            <div className="text-gray-300">
              <p>Coming soon...</p>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
            <div className="text-gray-300">
              <p>Coming soon...</p>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Resources</h3>
            <div className="text-gray-300">
              <p>Coming soon...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
