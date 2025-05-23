
import { ReactNode, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

interface AdminLayoutProps {
  children?: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AdminLayout: Checking admin access", { userRole });
    if (userRole !== "admin") {
      console.error("AdminLayout: Unauthorized access attempt, redirecting to /unauthorized");
      toast.error("You do not have administrator privileges");
      navigate("/unauthorized");
    }
  }, [userRole, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-medical-light text-medical-dark">      
      <header className="bg-white shadow-sm border-b border-medical-border py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-medical-primary">Rad2B Admin Panel</h1>
        <div className="flex items-center gap-4">
          <span className="text-medical-dark">{user.email}</span>
          <Button 
            variant="outline" 
            className="border-medical-border hover:bg-medical-lighter"
            onClick={() => {
              console.log("AdminLayout: User signed out");
              signOut();
            }}
          >
            Sign Out
          </Button>
        </div>
      </header>
      
      <main className="container mx-auto p-6">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default AdminLayout;
