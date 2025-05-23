
import { ReactNode, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { AppHeader } from "@/components/AppHeader";
import { ArrowLeft } from "lucide-react";

interface AdminLayoutProps {
  children?: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, userRole } = useAuth();
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

  const navigation = (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => {
        console.log("AdminLayout: Navigating back to main dashboard");
        navigate("/dashboard");
      }}
      className="border-medical-border text-medical-primary hover:bg-medical-lighter"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back to Dashboard
    </Button>
  );

  return (
    <div className="min-h-screen bg-medical-light text-medical-dark">      
      <AppHeader title="Admin Panel" navigation={navigation} />
      
      <main className="container mx-auto p-6">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default AdminLayout;
